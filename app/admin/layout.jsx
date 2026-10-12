import React from 'react';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getCurrentAdmin } from '@/lib/session.js';
import AdminSidebar from '@/components/admin/AdminSidebar.jsx';
import ChangePasswordModal from '@/components/admin/ChangePasswordModal.jsx';

export const metadata = {
  title: 'Admin Console — Athrav Pathak',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }) {
  // Read current pathname from headers (Next.js server-side)
  const headersList = await headers();
  const headerPath = headersList.get('x-invoke-path') || '';

  // If visiting /admin/login, bypass sidebar/auth check in layout
  const current = await getCurrentAdmin();

  return (
    <div className="min-h-screen bg-[#050508] text-slate-100 flex flex-col lg:flex-row">
      {current?.user && <AdminSidebar user={current.user} />}

      <div className={`flex-1 flex flex-col min-w-0 ${current?.user ? 'lg:pl-64' : ''}`}>
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mandatory password change enforcement modal */}
      {current?.user?.mustChangePassword && (
        <ChangePasswordModal
          isOpen={true}
          mustChange={true}
        />
      )}
    </div>
  );
}
