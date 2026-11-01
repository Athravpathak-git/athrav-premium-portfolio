'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export function FooterWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Omit public footer on admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return <>{children}</>;
}
