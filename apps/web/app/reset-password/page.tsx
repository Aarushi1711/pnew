'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { API_BASE_URL } from '../../lib/api';
import { bricolage, geist } from '../../lib/fonts';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';

// Mirrors the backend's actual rule (apps/api/src/auth/dto/reset-password.dto.ts,
// itself mirroring register.dto.ts): at least 8 characters, at least one
// letter, at least one digit.
const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError('This reset link is missing its token');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!PASSWORD_RULE.test(newPassword)) {
      setError('Password must be at least 8 characters and contain at least one letter and one number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? 'Could not reset password');
        return;
      }

      router.push('/login?reset=success');
    } catch {
      setError('Could not reach the server');
    } finally {
      setLoading(false);
    }
  }

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
          <h1 className="text-pretty font-display text-2xl font-bold text-foreground">Reset password</h1>
          <p className="mt-1 text-sm text-muted-foreground">Choose a new password for your account.</p>

          {!token && (
            <p className="mt-4 text-sm text-destructive">
              This link is missing its reset token. Request a new one from the{' '}
              <Link href="/forgot-password" className="font-medium underline">
                forgot password
              </Link>{' '}
              page.
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-foreground">
                New password
              </label>
              <PasswordInput
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-foreground">
                Confirm new password
              </label>
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !token}
              className="mt-2 h-10 w-full rounded-lg font-semibold"
            >
              {loading ? 'Resetting...' : 'Reset password'}
            </Button>
          </form>

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/login" className="font-medium text-primary hover:underline">
              Back to log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
