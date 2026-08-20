'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../auth-context';
import { API_BASE_URL } from '../../../lib/api';
import { bricolage, geist } from '../../../lib/fonts';
import { Button } from '@/components/ui/button';
import { CodeEditor } from '@/components/problem/code-editor';
import { VerdictBadge } from '@/components/problem/verdict-badge';
import { HintPanel, type UnlockedHint } from '@/components/problem/hint-panel';

interface Problem {
  id: string;
  slug: string;
  title: string;
  description: string;
}

interface Submission {
  id: string;
  status: 'QUEUED' | 'GRADED';
  verdict: string | null;
  runtimeMs: number | null;
  memoryKb: number | null;
}

const LANGUAGE = 'javascript';
const STARTER_TEMPLATE = `function solve(input) {
  // Write your solution here

}
`;
const POLL_INTERVAL_MS = 800;
const MAX_POLL_ATTEMPTS = 20;

export default function ProblemPage() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState(STARTER_TEMPLATE);
  const [running, setRunning] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  const [hints, setHints] = useState<UnlockedHint[]>([]);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintError, setHintError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) {
      router.push('/login');
      return;
    }

    const headers = { Authorization: `Bearer ${accessToken}` };

    Promise.all([
      fetch(`${API_BASE_URL}/problems/${params.id}`, { headers }).then(async (response) => {
        const json = await response.json();
        if (!response.ok) throw new Error(json.message ?? 'Failed to load problem');
        setProblem(json);
      }),
      fetch(`${API_BASE_URL}/ai/hints/${params.id}`, { headers }).then(async (response) => {
        const json = await response.json();
        if (!response.ok) throw new Error(json.message ?? 'Failed to load hints');
        setHints(json.hints);
      }),
    ])
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [accessToken, router, params.id]);

  async function pollSubmission(submissionId: string): Promise<Submission> {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.message ?? 'Failed to fetch submission result');
      }
      if (json.status === 'GRADED') {
        return json;
      }
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
    throw new Error('Grading is taking longer than expected. Try again in a moment.');
  }

  async function handleRun() {
    if (!accessToken || running) return;

    setRunError(null);
    setSubmission(null);
    setRunning(true);
    try {
      const response = await fetch(`${API_BASE_URL}/submissions/${params.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ sourceCode: code, language: LANGUAGE }),
      });
      const created = await response.json();
      if (!response.ok) {
        throw new Error(created.message ?? 'Failed to submit');
      }

      const graded = await pollSubmission(created.id);
      setSubmission(graded);
    } catch (err) {
      setRunError(err instanceof Error ? err.message : 'Could not reach the server');
    } finally {
      setRunning(false);
    }
  }

  async function handleRequestHint() {
    if (!accessToken || hintLoading) return;

    setHintError(null);
    setHintLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ai/hint/${params.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message ?? 'Failed to get hint');
      }

      if (result.available === false) {
        setHintError(result.message ?? 'No more hints available.');
        return;
      }

      setHints((current) => [...current, { level: result.level, hintText: result.hintText }]);
    } catch (err) {
      setHintError(err instanceof Error ? err.message : 'Could not reach the server');
    } finally {
      setHintLoading(false);
    }
  }

  if (!accessToken) {
    return null;
  }

  const accepted = submission?.verdict === 'Accepted';

  return (
    <div className={`landing-root ${bricolage.variable} ${geist.variable} font-sans`}>
      <main className="min-h-screen bg-background px-5 py-12 font-sans text-foreground">
        <div className="mx-auto max-w-3xl">
          <Link href="/journey" className="text-sm font-medium text-primary hover:underline">
            Back to Journey
          </Link>

          {loading && <p className="mt-8 text-sm text-muted-foreground">Loading problem...</p>}
          {error && <p className="mt-8 text-sm text-destructive">{error}</p>}

          {problem && (
            <div className="mt-6 flex flex-col gap-6">
              <article className="rounded-3xl border border-border bg-card p-8">
                <h1 className="font-display text-2xl font-bold text-foreground">{problem.title}</h1>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {problem.description}
                </p>
              </article>

              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-display text-lg font-semibold text-foreground">Your solution</h2>
                <div className="mt-4">
                  <CodeEditor value={code} onChange={setCode} disabled={running} />
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <Button onClick={handleRun} disabled={running} className="rounded-lg font-semibold">
                    {running ? 'Grading...' : 'Run'}
                  </Button>
                  {submission && <VerdictBadge verdict={submission.verdict ?? 'Unknown'} />}
                </div>

                {runError && <p className="mt-3 text-sm text-destructive">{runError}</p>}

                {submission && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Runtime: {submission.runtimeMs} ms &middot; Memory: {submission.memoryKb} KB
                  </p>
                )}

                {accepted && (
                  <div className="mt-5 rounded-xl bg-success/10 p-4">
                    <p className="text-sm font-semibold text-success">
                      Accepted! This level&apos;s star count has been updated.
                    </p>
                    <Button
                      className="mt-3 rounded-lg font-semibold"
                      nativeButton={false}
                      render={<Link href="/journey">Back to Journey</Link>}
                    />
                  </div>
                )}
              </div>

              <HintPanel hints={hints} onRequestHint={handleRequestHint} loading={hintLoading} error={hintError} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
