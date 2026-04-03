'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[global error boundary]', error.message, error.digest ?? '');
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-black font-sans text-white antialiased flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-white/80 text-sm max-w-md text-center">
          Something went wrong. Please try again.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl px-4 py-2 border border-white/20 text-white/90 hover:bg-white/5 text-sm"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
