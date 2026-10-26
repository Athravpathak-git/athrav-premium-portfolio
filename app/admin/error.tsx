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
      <div className="max-w-md w-full bg-zinc-950 border border-red-500/30 rounded-2xl p-6 sm:p-8 space-y-6 text-center shadow-2xl shadow-red-950/20">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono text-red-400 tracking-wider uppercase">
            Administrative Runtime Exception
          </span>
          <h2 className="text-xl font-bold text-white">Module Operation Failed</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {error.message || 'An unexpected error occurred while loading this administrative module.'}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-silver-100 text-zinc-950 font-semibold text-xs transition-colors shadow-md shadow-white/10"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <Link
            href="/admin"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 font-medium text-xs transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Control Overview</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
