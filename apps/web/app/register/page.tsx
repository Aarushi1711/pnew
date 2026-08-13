'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../auth-context';
import { API_BASE_URL } from '../../lib/api';

// Mirrors the backend's actual rule (apps/api/src/auth/dto/register.dto.ts):
// at least 8 characters, at least one letter, at least one digit.
const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { accessToken, setAccessToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (accessToken) {
      router.push('/dashboard');
    }
  }, [accessToken, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!PASSWORD_RULE.test(password)) {
      setError('Password must be at least 8 characters and contain at least one letter and one number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? 'Registration failed');
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
    <main className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-bold mb-4">Register</h1>
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
        <label htmlFor="confirmPassword">
          Confirm password
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="block border rounded px-2 py-1 w-full mt-1"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="border rounded px-3 py-1 mt-2 disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      {error && <p className="text-red-600 mt-3">{error}</p>}
      <p className="mt-4 text-sm">
        Already have an account?{' '}
        <Link href="/" className="underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
