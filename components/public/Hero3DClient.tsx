'use client';

import dynamic from 'next/dynamic';
import { HeroFallback } from './HeroFallback';

const DynamicHero3D = dynamic(
  () => import('./Hero3DScene').then((mod) => mod.Hero3DScene),
  {
    ssr: false,
    loading: () => <HeroFallback />,
  }
);

export function Hero3DClient() {
  return <DynamicHero3D />;
}
