'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '../../lib/api';
import { bricolage, geist } from '../../lib/fonts';
import { Button } from '@/components/ui/button';

const RESEND_COOLDOWN_SECONDS = 60;
const SENT_CONFIRMATION_MS = 2000;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [resending, setResending] = useState(false);
  const [justResent, setJustResent] = useState(false);

  // Ticks the cooldown down once a second; re-registers itself via the
  // secondsLeft dependency instead of a persistent setInterval.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  async function sendResetEmail() {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message ?? 'Something went wrong');
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await sendResetEmail();
      setSubmitted(true);
      setSecondsLeft(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reach the server');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (secondsLeft > 0 || resending) return;

    setError(null);
    setResending(true);
    try {
      await sendResetEmail();
      setJustResent(true);
      setSecondsLeft(RESEND_COOLDOWN_SECONDS);
      setTimeout(() => setJustResent(false), SENT_CONFIRMATION_MS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reach the server');
    } finally {
      setResending(false);
    }
  }

  const resendLabel = justResent
    ? 'Sent!'
    : resending
      ? 'Sending...'
      : secondsLeft > 0
        ? `Resend in ${secondsLeft}s`
        : 'Resend';

  return (
    <div className={`landing-root ${bricolage.variable} ${geist.variable} font-sans`}>
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-16 font-sans text-foreground">
        <Link href="/" className="mb-8 flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-primary font-display text-lg font-extrabold text-primary-foreground">
            {'{'}
          </span>
          <span className="font-display text-lg font-bold text-foreground">Traverse</span>
        </Link>

        <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8">
          {submitted ? (
            <>
              <h1 className="text-pretty font-display text-2xl font-bold text-foreground">Check your email</h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                If an account exists for <span className="font-medium text-foreground">{email}</span>, we&apos;ve
                sent a link to reset your password. It expires in 15 minutes.
              </p>

              <p className="mt-4 text-center text-sm text-muted-foreground">
                Didn&apos;t get the email?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={secondsLeft > 0 || resending}
                  className="font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
                >
                  {resendLabel}
                </button>
              </p>

              {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

              <p className="mt-6 text-center text-sm text-muted-foreground">
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Back to log in
                </Link>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-pretty font-display text-2xl font-bold text-foreground">Forgot password?</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter your email and we&apos;ll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/50"
                  />
                </div>

                <Button type="submit" disabled={loading} className="mt-2 h-10 w-full rounded-lg font-semibold">
                  {loading ? 'Sending...' : 'Send reset link'}
                </Button>
              </form>

              {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Remembered it?{' '}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Log in
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
