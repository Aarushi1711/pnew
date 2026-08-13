'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { API_BASE_URL } from '../lib/api';

const TOKEN_STORAGE_KEY = 'accessToken';

interface AuthContextValue {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

    async function validateStoredSession(token: string) {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Session expired');
      }
      setAccessTokenState(token);
    }

    const validation = storedToken
      ? validateStoredSession(storedToken).catch(() => {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        })
      : Promise.resolve();

    validation.finally(() => setIsCheckingSession(false));
  }, []);

  function setAccessToken(token: string | null) {
    setAccessTokenState(token);
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }

  if (isCheckingSession) {
    return (
      <main className="p-6">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
