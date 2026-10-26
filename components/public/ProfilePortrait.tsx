'use client';

import React, { useState } from 'react';
import { Brain, User } from 'lucide-react';

interface ProfilePortraitProps {
  avatarUrl?: string | null;
  name: string;
  headline?: string;
  status?: string | null;
  className?: string;
  priority?: boolean;
}

export function ProfilePortrait({
  avatarUrl,
  name,
  headline = 'BCA Undergraduate • Year 2',
  status = 'Open to Opportunities',
  className = '',
}: ProfilePortraitProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // If avatarUrl exists and no error occurred, render the photo portrait
  if (avatarUrl && !hasError) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="w-full aspect-square rounded-2xl border border-cream-300 dark:border-forest-700 bg-cream-100 dark:bg-forest-900 overflow-hidden relative shadow-lg group">
          {/* Skeleton placeholder while image bytes transfer */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-cream-200 dark:bg-forest-800 animate-pulse flex items-center justify-center text-forest-500">
              <User className="w-12 h-12 opacity-40 animate-pulse" />
            </div>
          )}

          {/* Actual portrait image */}
          <img
            src={avatarUrl}
            alt={name}
            loading="eager"
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              console.warn('[ProfilePortrait] Failed to load image from URL:', avatarUrl);
              setHasError(true);
            }}
            className={`w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-105 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Bottom subtle gradient for text readability (only bottom 30% of portrait) */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-forest-950/90 via-forest-900/40 to-transparent pointer-events-none" />

          {/* Name & subtitle overlay */}
          <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
            <h2 className="text-xl font-bold text-ivory drop-shadow-sm">{name}</h2>
            <p className="text-xs font-mono text-champagne-200 drop-shadow-sm">{headline}</p>
          </div>
        </div>

        {/* Status indicator below portrait */}
        {status && (
          <div className="px-3.5 py-2 rounded-xl bg-ivory dark:bg-forest-900 border border-cream-300 dark:border-forest-700 flex items-center justify-between shadow-sm">
            <span className="text-xs font-mono text-forest-600 dark:text-sage">Current Status:</span>
            <span className="text-xs font-mono text-forest dark:text-champagne-300 font-semibold">
              {status}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Fallback when no photo is provided or image loading fails
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="w-full aspect-square rounded-2xl bg-ivory dark:bg-forest-900 border border-cream-300 dark:border-forest-700 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden shadow-sm">
        <div className="w-20 h-20 rounded-full bg-cream-200 dark:bg-forest-800 border border-cream-300 dark:border-forest-600 flex items-center justify-center mb-3 text-forest dark:text-ivory shadow-inner">
          <Brain className="w-10 h-10" />
        </div>
        <h2 className="text-lg font-bold text-forest dark:text-ivory">{name}</h2>
        <p className="text-xs font-mono text-forest-600 dark:text-sage mt-0.5">{headline}</p>
        {status && (
          <div className="mt-3 px-3 py-1 rounded-full bg-sage-100 dark:bg-forest-800 border border-sage-300 dark:border-forest-600 text-[11px] font-mono text-forest dark:text-sage-200 font-medium">
            {status}
          </div>
        )}
      </div>

      {status && (
        <div className="px-3.5 py-2 rounded-xl bg-ivory dark:bg-forest-900 border border-cream-300 dark:border-forest-700 flex items-center justify-between shadow-sm">
          <span className="text-xs font-mono text-forest-600 dark:text-sage">Current Status:</span>
          <span className="text-xs font-mono text-forest dark:text-champagne-300 font-semibold">
            {status}
          </span>
        </div>
      )}
    </div>
  );
}
