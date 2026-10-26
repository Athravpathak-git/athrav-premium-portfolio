import React from 'react';
import { isDatabaseConfigured } from '@/lib/db';
import { Database, ShieldCheck } from 'lucide-react';

export function DevModeBanner() {
  const isDbReady = isDatabaseConfigured();

  if (isDbReady) {
    return null;
  }

  return (
    <div className="bg-burgundy border-b border-burgundy-800 text-xs text-cream py-1.5 px-4 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rosegold opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rosegold"></span>
          </span>
          <span className="font-mono text-rosegold font-bold">DEV MOCK MODE</span>
          <span className="hidden sm:inline text-burgundy-400">|</span>
          <span className="hidden sm:inline text-blush-100">
            Database unconfigured. Safe local JSON store active. Neon PostgreSQL connection deferred for manual setup.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:inline-flex items-center gap-1 text-blush-200">
            <ShieldCheck className="w-3.5 h-3.5 text-rosegold" /> Security Hardened
          </span>
          <span className="inline-flex items-center gap-1 text-rosegold font-mono font-medium">
            <Database className="w-3.5 h-3.5" /> Ready for Neon
          </span>
        </div>
      </div>
    </div>
  );
}
