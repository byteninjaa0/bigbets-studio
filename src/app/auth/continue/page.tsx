'use client';

import { Suspense, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Post-login landing: OAuth returns here with session cookie set, then we route by role.
 * Avoids relying on OAuth callbackUrl alone (admin vs user).
 */
function AuthContinueInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const nextRaw = params.get('next');

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[auth/continue]', { status, hasSession: !!session, isAdmin: session?.user?.isAdmin });
    }

    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[auth/continue] unauthenticated → /auth/signin');
      }
      router.replace('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      const isAdmin = Boolean(session.user.isAdmin);
      // Admins always land on /admin; users default to /dashboard or safe ?next= path
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
  }, [status, session, router, nextRaw]);

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
