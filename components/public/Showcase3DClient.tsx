'use client';

import dynamic from 'next/dynamic';

const DynamicShowcase3D = dynamic(
  () => import('./Showcase3D').then((mod) => mod.Showcase3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-80 rounded-2xl bg-obsidian-900/60 border border-silver-500/10 flex items-center justify-center text-silver-400 font-mono text-sm">
        Initializing 3D Visualizer...
      </div>
    ),
  }
);

export function Showcase3DClient() {
  return <DynamicShowcase3D />;
}
