'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const HINTS: Record<string, string> = {
  Configuration:
    'Check NEXTAUTH_URL and NEXTAUTH_SECRET in .env.local. Restart the dev server after changes.',
  AccessDenied: 'Sign-in was cancelled or blocked. Try again with a fresh code from your email.',
  CredentialsSignin: 'That sign-in link or code was invalid or expired. Request a new OTP.',
  SessionRequired: 'You need to sign in to view this page.',
  Default: 'Something went wrong during sign-in. Try again or request a new email code.',
};

function AuthErrorContent() {
  const params = useSearchParams();
  const error = params.get('error') || 'Default';
  const hint = HINTS[error] || HINTS.Default;

  return (
    <div className="w-full max-w-md glass border border-zinc-800 rounded-3xl p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center mx-auto mb-5">
        <AlertCircle className="w-7 h-7 text-zinc-400" />
      </div>
      <h1 className="heading-page mb-2">Sign-in problem</h1>
      {error !== 'Default' && <p className="mb-3 break-all font-sans text-sm text-zinc-400">{error}</p>}
      <p className="mb-6 text-sm leading-relaxed text-zinc-500">{hint}</p>
      <Link
        href="/auth/signin"
        className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition-colors text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to sign in
      </Link>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md glass border border-white/8 rounded-3xl p-8 text-center text-white/40 text-sm">
          Loading…
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
