import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[85vh] pt-32 pb-20 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-cream dark:bg-charcoal-900 text-charcoal dark:text-cream transition-colors duration-200">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-cream-100 dark:bg-charcoal-800 border border-border-soft dark:border-charcoal-700 flex items-center justify-center mx-auto text-burgundy dark:text-rosegold shadow-sm">
          <Compass className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono text-rosegold uppercase tracking-widest font-semibold">
            HTTP 404 — Not Found
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-extrabold tracking-tight text-burgundy dark:text-cream">
            Page Not Located
          </h1>
          <p className="text-sm text-charcoal/80 dark:text-cream/80 leading-relaxed">
            The requested portfolio path does not exist or may have been updated.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Athrav&apos;s Portfolio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
