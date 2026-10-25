import React from 'react';

export function HeroFallback() {
  return (
    <div className="relative w-full h-[450px] sm:h-[550px] flex items-center justify-center pointer-events-none select-none">
      {/* Outer ambient blur */}
      <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-silver-400/10 via-zinc-500/10 to-transparent blur-3xl animate-pulse-glow" />

      {/* Outer orbital ring 1 */}
      <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-silver-400/20 [transform:rotateX(68deg)_rotateY(15deg)] animate-spin-slow" />

      {/* Orbital ring 2 */}
      <div
        className="absolute w-52 h-52 sm:w-64 sm:h-64 rounded-full border border-silver-300/25 [transform:rotateX(60deg)_rotateY(-30deg)]"
        style={{ animation: 'spin 18s linear infinite reverse' }}
      />

      {/* Orbital ring 3 */}
      <div
        className="absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full border border-white/20 [transform:rotateX(45deg)_rotateY(45deg)]"
        style={{ animation: 'spin 28s linear infinite' }}
      />

      {/* Central Metallic Core Sphere */}
      <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-silver-100 via-zinc-400 to-zinc-950 p-[1px] shadow-[0_0_50px_rgba(255,255,255,0.15)] flex items-center justify-center">
        <div className="w-full h-full rounded-full bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-950 flex items-center justify-center overflow-hidden relative">
          {/* Specular sheen reflection */}
          <div className="absolute top-2 left-4 w-12 h-6 bg-white/30 rounded-full blur-[2px] transform -rotate-45" />
          <div className="w-12 h-12 rounded-full border border-silver-300/30 bg-silver-400/10 backdrop-blur-sm" />
        </div>
      </div>
    </div>
  );
}
