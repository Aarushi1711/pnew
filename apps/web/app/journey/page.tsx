'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../auth-context';
import { API_BASE_URL } from '../../lib/api';
import { bricolage, geist } from '../../lib/fonts';
import type { JourneyMap } from '../../lib/journey-types';
import { Button } from '@/components/ui/button';
import { TrackSection } from '@/components/journey/track-section';

interface LevelChoiceResponse {
  available: boolean;
  message?: string;
  moduleId?: string;
  problem?: { id: string; slug: string; title: string; description: string };
}

export default function JourneyPage() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<JourneyMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStageId, setExpandedStageId] = useState<string | null>(null);
  const [pendingModuleId, setPendingModuleId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) {
      router.push('/login');
      return;
    }

    fetch(`${API_BASE_URL}/journey/map`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(async (response) => {
        const json = await response.json();
        if (!response.ok) {
          throw new Error(json.message ?? 'Failed to load journey map');
        }
        setData(json);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [accessToken, router]);

  function toggleStage(stageId: string) {
    setActionError(null);
    setExpandedStageId((current) => (current === stageId ? null : stageId));
  }

  async function handleLevelClick(moduleId: string) {
    if (!accessToken || pendingModuleId) return;

    setActionError(null);
    setPendingModuleId(moduleId);
    try {
      const response = await fetch(`${API_BASE_URL}/levels/${moduleId}/choice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ choice: 'practice_more' }),
      });
      const result: LevelChoiceResponse = await response.json();

      if (!response.ok) {
        throw new Error((result as unknown as { message?: string }).message ?? 'Could not open this level');
      }
      if (!result.available || !result.problem) {
        setActionError(result.message ?? 'No problem is available in this level right now.');
        return;
      }

      router.push(`/problem/${result.problem.id}`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not reach the server');
    } finally {
      setPendingModuleId(null);
    }
  }

  if (!accessToken) {
    return null;
  }

  const trackPositionById = new Map((data?.tracks ?? []).map((track, i) => [track.id, i + 1]));

  return (
    <div className={`landing-root ${bricolage.variable} ${geist.variable} font-sans`}>
      <main className="min-h-screen bg-background px-5 py-12 font-sans text-foreground">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-3xl font-bold text-foreground">Journey</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled className="rounded-lg font-semibold">
                Squad
              </Button>
              <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground">
                Coming soon
              </span>
            </div>
          </div>

          {loading && <p className="mt-8 text-sm text-muted-foreground">Loading your journey...</p>}
          {error && <p className="mt-8 text-sm text-destructive">{error}</p>}

          {actionError && (
            <p className="mt-6 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{actionError}</p>
          )}

          {data && (
            <div className="mt-8">
              {data.tracks.map((track, i) => (
                <TrackSection
                  key={track.id}
                  track={track}
                  trackIndex={i + 1}
                  trackPositionById={trackPositionById}
                  expandedStageId={expandedStageId}
                  onToggleStage={toggleStage}
                  onLevelClick={handleLevelClick}
                  pendingModuleId={pendingModuleId}
                />
              ))}
              {data.tracks.length === 0 && (
                <p className="text-sm text-muted-foreground">No tracks are available yet.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
