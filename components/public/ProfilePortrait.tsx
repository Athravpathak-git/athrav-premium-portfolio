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
        <div className="w-full aspect-square rounded-2xl border border-white/20 bg-zinc-900 overflow-hidden relative shadow-2xl shadow-black/80 group">
          {/* Skeleton placeholder while image bytes transfer */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-zinc-800 animate-pulse flex items-center justify-center text-zinc-500">
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

          {/* Bottom subtle gradient for text readability (only bottom 28% of portrait) */}
          <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

          {/* Name & subtitle overlay */}
          <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
            <h2 className="text-xl font-bold text-white drop-shadow-md">{name}</h2>
            <p className="text-xs font-mono text-silver-300 drop-shadow">{headline}</p>
          </div>
        </div>

        {/* Status indicator below portrait */}
        {status && (
          <div className="px-3.5 py-2 rounded-xl bg-zinc-900/80 border border-white/10 flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400">Current Status:</span>
            <span className="text-xs font-mono text-emerald-400 font-medium">
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
      <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-zinc-800 via-zinc-900 to-black border border-white/15 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden shadow-inner">
        <div className="w-20 h-20 rounded-full bg-zinc-800 border border-white/20 flex items-center justify-center mb-3 text-silver-300 shadow-lg">
          <Brain className="w-10 h-10" />
        </div>
        <h2 className="text-lg font-semibold text-white">{name}</h2>
        <p className="text-xs font-mono text-zinc-400 mt-0.5">{headline}</p>
        {status && (
          <div className="mt-3 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400">
            {status}
          </div>
        )}
      </div>

      {status && (
        <div className="px-3.5 py-2 rounded-xl bg-zinc-900/80 border border-white/10 flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-400">Current Status:</span>
          <span className="text-xs font-mono text-emerald-400 font-medium">
            {status}
          </span>
        </div>
      )}
    </div>
  );
}
