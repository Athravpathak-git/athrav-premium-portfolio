'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, LayoutDashboard } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[AdminError Boundary Caught]:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-red-300 rounded-2xl p-6 sm:p-8 space-y-6 text-center shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono text-red-600 tracking-wider uppercase font-semibold">
            Administrative Runtime Exception
          </span>
          <h2 className="text-xl font-serif font-bold text-burgundy">Module Operation Failed</h2>
          <p className="text-xs text-charcoal/80 leading-relaxed">
            {error.message || 'An unexpected error occurred while loading this administrative module.'}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white font-semibold text-xs transition-colors shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <Link
            href="/admin"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-charcoal border border-border-soft font-medium text-xs transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Control Overview</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
