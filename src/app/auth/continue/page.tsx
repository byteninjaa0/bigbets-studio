'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Post-login landing (e.g. OAuth): session cookie is set, then we route by role.
 * Refetches session once before deciding, so we don’t bounce to sign-in on a stale client cache.
 */
function AuthContinueInner() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const nextRaw = params.get('next');
  const [refetchDone, setRefetchDone] = useState(false);

  useEffect(() => {
    void update().finally(() => setRefetchDone(true));
  }, [update]);

  useEffect(() => {
    if (!refetchDone || status === 'loading') return;

    if (process.env.NODE_ENV === 'development') {
      console.log('[auth/continue]', { status, hasSession: Boolean(session?.user), isAdmin: session?.user?.isAdmin });
    }

    if (status === 'unauthenticated') {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[auth/continue] unauthenticated → /auth/signin');
      }
      router.replace('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      const isAdmin = Boolean(session.user.isAdmin);
      let dest = isAdmin ? '/admin' : '/dashboard';

      if (!isAdmin && nextRaw && nextRaw.startsWith('/') && !nextRaw.startsWith('//')) {
        if (!nextRaw.startsWith('/admin')) {
          dest = nextRaw;
        }
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[auth/continue] redirect →', dest);
      }
      router.replace(dest);
    }
  }, [refetchDone, status, session, router, nextRaw]);

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-white/60">
        <Loader2 className="w-10 h-10 animate-spin text-zinc-400" />
        <p className="text-sm">Signing you in…</p>
      </div>
    </div>
  );
}

export default function AuthContinuePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen animated-bg flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-zinc-400" />
        </div>
      }
    >
      <AuthContinueInner />
    </Suspense>
  );
}
