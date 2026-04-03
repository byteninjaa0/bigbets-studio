'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app error boundary]', error.message, error.digest ?? '');
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center animated-bg">
      <p className="text-white/80 text-sm max-w-md">
        Something went wrong. You can try again or go back to the home page.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl px-4 py-2 border border-white/20 text-white/90 hover:bg-white/5 text-sm"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-xl px-4 py-2 border border-zinc-500/30 text-zinc-400 hover:bg-zinc-500/10 text-sm"
        >
          Home
        </a>
      </div>
    </div>
  );
}
