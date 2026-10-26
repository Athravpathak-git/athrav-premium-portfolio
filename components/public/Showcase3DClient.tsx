'use client';

import dynamic from 'next/dynamic';

const DynamicShowcase3D = dynamic(
  () => import('./Showcase3D').then((mod) => mod.Showcase3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-80 rounded-2xl bg-cream-50 dark:bg-charcoal-800 border border-border-soft dark:border-charcoal-700 flex items-center justify-center text-charcoal/70 dark:text-cream/70 font-mono text-sm">
        Initializing 3D Visualizer...
      </div>
    ),
  }
);

export function Showcase3DClient() {
  return <DynamicShowcase3D />;
}
