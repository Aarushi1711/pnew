'use client';

import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../auth-context';
import { API_BASE_URL } from '../../lib/api';
import { bricolage, geist } from '../../lib/fonts';
import { Button } from '@/components/ui/button';
import { GoogleSignInButton } from '@/components/ui/google-sign-in-button';
import { PasswordInput } from '@/components/ui/password-input';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { accessToken, setAccessToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetSucceeded = searchParams.get('reset') === 'success';

  useEffect(() => {
    if (accessToken) {
      router.push('/dashboard');
    }
  }, [accessToken, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? 'Login failed');
        return;
      }

      setAccessToken(data.accessToken);
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
          <h1 className="text-pretty font-display text-2xl font-bold text-foreground">Log in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Welcome back — pick up your journey.</p>

          {resetSucceeded && (
            <p className="mt-4 rounded-lg bg-success/15 px-3 py-2 text-sm font-medium text-success">
              Password updated — log in with your new password.
            </p>
          )}

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
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
                  Password
                </label>
                <Link href="/forgot-password" className="mb-1.5 text-sm font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" disabled={loading} className="mt-2 h-10 w-full rounded-lg font-semibold">
              {loading ? 'Logging in...' : 'Log in'}
            </Button>
          </form>

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <GoogleSignInButton />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Register
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
