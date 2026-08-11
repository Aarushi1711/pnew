'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-context';
import { API_BASE_URL } from './api-config';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setAccessToken } = useAuth();
  const router = useRouter();

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
      router.push('/dashboard');
    } catch {
      setError('Could not reach the server');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-bold mb-4">Log in</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label htmlFor="email">
          Email
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="block border rounded px-2 py-1 w-full mt-1"
          />
        </label>
        <label htmlFor="password">
          Password
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="block border rounded px-2 py-1 w-full mt-1"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="border rounded px-3 py-1 mt-2 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      {error && <p className="text-red-600 mt-3">{error}</p>}
    </main>
  );
}
