import React from 'react';
import { getCurrentAdmin } from '@/lib/auth-guard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { DevModeBanner } from '@/components/public/DevModeBanner';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const current = await getCurrentAdmin();

  // If unauthenticated or accessing login, just render children without sidebar
  if (!current) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-forest-950 text-forest dark:text-cream-100 flex flex-col transition-colors">
      <DevModeBanner />
      <div className="flex-1 flex">
        <AdminSidebar user={current.user} />
        <main className="flex-1 p-6 sm:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
