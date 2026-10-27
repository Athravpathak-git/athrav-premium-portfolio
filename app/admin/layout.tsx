import React from 'react';
import { getCurrentAdmin } from '@/lib/auth-guard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminInactivityTimer } from '@/components/admin/AdminInactivityTimer';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const current = await getCurrentAdmin();

  // If unauthenticated or accessing login, just render children without sidebar or timer
  if (!current) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal-900 text-charcoal dark:text-cream flex flex-col transition-colors duration-200">
      <AdminInactivityTimer />
      <div className="flex-1 flex flex-col lg:flex-row min-w-0">
        <AdminSidebar user={current.user} />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
