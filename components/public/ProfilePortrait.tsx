'use client';

import React, { useState } from 'react';
import { User } from 'lucide-react';

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

  // Fallback to active uploaded file if avatarUrl is missing
  const effectiveUrl = avatarUrl || '/uploads/profile-1793013930445-d7f4837227f112de8d472f17.png';

  if (!hasError && effectiveUrl) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="relative rounded-2xl border border-border-soft bg-white p-2.5 shadow-sm overflow-hidden group">
          {/* Main portrait image container with clean editorial framing */}
          <div className="w-full aspect-[4/5] sm:aspect-square rounded-xl overflow-hidden relative bg-cream-100">
            <img
              src={effectiveUrl}
              alt={name}
              loading="eager"
              decoding="async"
              onError={() => {
                console.warn('[ProfilePortrait] Image load failed:', effectiveUrl);
                setHasError(true);
              }}
              className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />

            {/* Subtle bottom scrim only for text contrast */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-charcoal/70 to-transparent pointer-events-none" />

            {/* Overlay label */}
            <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
              <h2 className="text-lg font-serif font-bold tracking-tight drop-shadow-sm">{name}</h2>
              <p className="text-[11px] font-mono text-rosegold-100 drop-shadow-sm">{headline}</p>
            </div>
          </div>
        </div>

        {/* Status indicator below portrait */}
        {status && (
          <div className="px-4 py-2.5 rounded-xl bg-white border border-border-soft flex items-center justify-between text-xs shadow-sm">
            <span className="font-mono text-charcoal/70">Status:</span>
            <span className="font-mono font-semibold text-burgundy flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rosegold animate-pulse" />
              {status}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Graceful fallback if image is not accessible
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="w-full aspect-[4/5] sm:aspect-square rounded-2xl bg-white border border-border-soft flex flex-col items-center justify-center p-8 text-center shadow-sm">
        <div className="w-20 h-20 rounded-full bg-cream-100 border border-border-soft flex items-center justify-center mb-4 text-burgundy">
          <User className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-serif font-bold text-burgundy">{name}</h2>
        <p className="text-xs font-mono text-charcoal/70 mt-1">{headline}</p>
        {status && (
          <div className="mt-4 px-3 py-1 rounded-full bg-blush-100 border border-border-soft text-burgundy text-xs font-mono font-medium">
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
