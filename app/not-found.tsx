import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[85vh] pt-32 pb-20 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto text-silver-300">
          <Compass className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
            HTTP 404 — Not Found
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Page Not Located
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            The requested portfolio path does not exist or may have been updated.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-silver-100 text-zinc-950 font-semibold text-xs transition-colors shadow-lg shadow-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Athrav&apos;s Portfolio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
