import React from 'react';
import { isDatabaseConfigured } from '@/lib/db';
import { Database, ShieldCheck } from 'lucide-react';

export function DevModeBanner() {
  const isDbReady = isDatabaseConfigured();

  if (isDbReady) {
    return null;
  }

  return (
    <div className="bg-zinc-950/90 border-b border-amber-500/20 text-xs text-zinc-400 py-1.5 px-4 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="font-mono text-amber-300 font-medium">DEV MOCK MODE</span>
          <span className="hidden sm:inline text-zinc-500">|</span>
          <span className="hidden sm:inline text-zinc-400">
            Database unconfigured. Running safe local fixtures. Real Neon PostgreSQL connection deferred for later manual setup.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:inline-flex items-center gap-1 text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" /> Security Hardened
          </span>
          <span className="inline-flex items-center gap-1 text-amber-400/90 font-mono">
            <Database className="w-3.5 h-3.5" /> Ready for Neon
          </span>
        </div>
      </div>
    </div>
  );
}
