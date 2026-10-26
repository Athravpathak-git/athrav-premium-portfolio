import React from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminLoading() {
  return (
    <div className="space-y-8 max-w-5xl animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-zinc-800 rounded-xl" />
          <div className="h-4 w-96 bg-zinc-900 rounded-lg" />
        </div>
        <div className="h-9 w-32 bg-zinc-800 rounded-xl" />
      </div>

      {/* Main content skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="h-32 bg-zinc-900/60 border border-white/5 rounded-2xl p-5 space-y-3">
          <div className="h-4 w-24 bg-zinc-800 rounded" />
          <div className="h-8 w-16 bg-zinc-700 rounded" />
        </div>
        <div className="h-32 bg-zinc-900/60 border border-white/5 rounded-2xl p-5 space-y-3">
          <div className="h-4 w-24 bg-zinc-800 rounded" />
          <div className="h-8 w-16 bg-zinc-700 rounded" />
        </div>
        <div className="h-32 bg-zinc-900/60 border border-white/5 rounded-2xl p-5 space-y-3">
          <div className="h-4 w-24 bg-zinc-800 rounded" />
          <div className="h-8 w-16 bg-zinc-700 rounded" />
        </div>
      </div>

      {/* Card skeleton */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-6 sm:p-8 space-y-4">
        <div className="h-6 w-48 bg-zinc-800 rounded" />
        <div className="h-24 bg-zinc-900 rounded-xl" />
        <div className="h-10 w-full bg-zinc-900 rounded-xl" />
      </div>

      {/* Subtle indicator */}
      <div className="flex items-center justify-center gap-2 pt-6 text-zinc-500 font-mono text-xs">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-silver-400" />
        <span>Loading Control Panel Data...</span>
      </div>
    </div>
  );
}
