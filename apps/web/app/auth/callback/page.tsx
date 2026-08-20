'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/auth-context';
import { bricolage, geist } from '@/lib/fonts';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAccessToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');

    // Deferred via a microtask so this stays a scheduled update rather than
    // a synchronous setState during the effect (same pattern used elsewhere
    // in this app, e.g. reveal.tsx's reduced-motion branch).
    queueMicrotask(() => {
      if (token) {
        setAccessToken(token);
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    });
  }, [searchParams, setAccessToken, router]);

  return (
    <div className={`landing-root ${bricolage.variable} ${geist.variable} font-sans`}>
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-16 font-sans text-foreground">
        <p className="text-sm text-muted-foreground">Signing you in...</p>
      </main>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackContent />
    </Suspense>
  );
}
