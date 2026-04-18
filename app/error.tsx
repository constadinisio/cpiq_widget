'use client';

import { useEffect } from 'react';
import { BRANDING } from '@/lib/branding';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.parent !== window) {
      try {
        window.parent.postMessage(
          { type: 'cpiq:error', digest: error.digest, message: error.message },
          '*'
        );
      } catch {
        /* noop */
      }
    }
  }, [error]);

  return (
    <main className="flex h-full flex-col items-center justify-center gap-3 bg-slate-50 px-6 text-center">
      <div
        aria-hidden
        className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L1 21h22L12 2zm0 6l7.53 13H4.47L12 8zm-1 5v4h2v-4h-2zm0 5v2h2v-2h-2z" />
        </svg>
      </div>
      <h1 className="text-[15px] font-semibold text-slate-900">{BRANDING.errors.genericTitle}</h1>
      <p className="max-w-[260px] text-[13px] text-slate-500">{BRANDING.errors.genericBody}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-1 rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-brand-dark"
      >
        {BRANDING.errors.genericCta}
      </button>
    </main>
  );
}
