import React from 'react';

export function HeroFallback() {
  return (
    <div className="relative w-full h-[400px] sm:h-[480px] flex items-center justify-center select-none pointer-events-none">
      {/* Soft natural contact shadow on the floor */}
      <div className="absolute bottom-10 w-44 h-8 rounded-full bg-forest-900/10 blur-xl" />

      {/* Orbital Ring 1: Champagne Gold */}
      <div className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-champagne-400/50 [transform:rotateX(66deg)_rotateY(18deg)] animate-spin-slow" />

      {/* Orbital Ring 2: Muted Sage */}
      <div
        className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full border border-sage-500/40 [transform:rotateX(58deg)_rotateY(-32deg)]"
        style={{ animation: 'spin 18s linear infinite reverse' }}
      />

      {/* Orbital Ring 3: Delicate Champagne Accent */}
      <div
        className="absolute w-52 h-52 sm:w-60 sm:h-60 rounded-full border border-champagne-300/30 [transform:rotateX(42deg)_rotateY(40deg)]"
        style={{ animation: 'spin 26s linear infinite' }}
      />

      {/* Translucent Emerald Glass Orb */}
      <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-forest-500/80 via-forest-700/90 to-forest-900/95 p-[1px] shadow-[0_20px_45px_-12px_rgba(24,61,50,0.35)] flex items-center justify-center border border-sage-300/30 backdrop-blur-md">
        <div className="w-full h-full rounded-full bg-gradient-to-tr from-forest-800 via-forest-700/90 to-forest-600/80 flex items-center justify-center overflow-hidden relative">
          {/* Subtle studio specular highlight */}
          <div className="absolute top-3 left-6 w-12 h-6 bg-ivory/40 rounded-full blur-[2px] transform -rotate-45" />
          <div className="absolute bottom-3 right-6 w-10 h-4 bg-sage-300/25 rounded-full blur-[3px]" />
          {/* Internal golden core hint */}
          <div className="w-10 h-10 rounded-full border border-champagne-400/40 bg-champagne-500/15" />
        </div>
      </div>
    </div>
  );
}
