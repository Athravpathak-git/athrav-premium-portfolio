import React from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminLoading() {
  return (
    <div className="space-y-8 max-w-5xl animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-soft">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-cream-200 rounded-xl" />
          <div className="h-4 w-96 bg-cream-100 rounded-lg" />
        </div>
        <div className="h-9 w-32 bg-cream-200 rounded-xl" />
      </div>

      {/* Main content skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="h-32 bg-white border border-border-soft rounded-2xl p-5 space-y-3">
          <div className="h-4 w-24 bg-cream-200 rounded" />
          <div className="h-8 w-16 bg-cream-300 rounded" />
        </div>
        <div className="h-32 bg-white border border-border-soft rounded-2xl p-5 space-y-3">
          <div className="h-4 w-24 bg-cream-200 rounded" />
          <div className="h-8 w-16 bg-cream-300 rounded" />
        </div>
        <div className="h-32 bg-white border border-border-soft rounded-2xl p-5 space-y-3">
          <div className="h-4 w-24 bg-cream-200 rounded" />
          <div className="h-8 w-16 bg-cream-300 rounded" />
        </div>
      </div>

      {/* Card skeleton */}
      <div className="rounded-2xl border border-border-soft bg-white p-6 sm:p-8 space-y-4">
        <div className="h-6 w-48 bg-cream-200 rounded" />
        <div className="h-24 bg-cream-100 rounded-xl" />
        <div className="h-10 w-full bg-cream-100 rounded-xl" />
      </div>

      {/* Subtle indicator */}
      <div className="flex items-center justify-center gap-2 pt-6 text-charcoal/60 font-mono text-xs">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-burgundy" />
        <span>Loading Control Panel Data...</span>
      </div>
    </div>
  );
}
