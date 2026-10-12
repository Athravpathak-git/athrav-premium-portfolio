'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  User,
  FolderGit2,
  Award,
  Briefcase,
  Wrench,
  GraduationCap,
  Trophy,
  Mail,
  ShieldAlert,
  LogOut,
  ExternalLink,
  KeyRound,
  Menu,
  X,
} from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal.jsx';

const ADMIN_NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/profile', label: 'Profile', icon: User },
  { href: '/admin/projects', label: 'Projects', icon: FolderGit2 },
  { href: '/admin/certifications', label: 'Certifications', icon: Award },
  { href: '/admin/experience', label: 'Experience', icon: Briefcase },
  { href: '/admin/skills', label: 'Skills', icon: Wrench },
  { href: '/admin/education', label: 'Education', icon: GraduationCap },
  { href: '/admin/achievements', label: 'Achievements', icon: Trophy },
  { href: '/admin/messages', label: 'Messages', icon: Mail },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: ShieldAlert },
];

export default function AdminSidebar({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      router.push('/admin/login');
      router.refresh();
    } catch (e) {
      router.push('/admin/login');
    }
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-[#0a0b12] border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-slate-800 border border-white/20 flex items-center justify-center font-semibold text-xs text-white">
            AP
          </div>
          <span className="font-medium text-xs text-slate-200">Admin Console</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#08090f] border-r border-white/[0.08] flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 space-y-6 overflow-y-auto flex-1">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-800 to-slate-600 border border-white/20 flex items-center justify-center font-bold text-xs text-white">
                AP
              </div>
              <div>
                <p className="text-xs font-semibold text-white tracking-tight">ATHRAV PORTFOLIO</p>
                <p className="text-[10px] text-slate-400 font-mono">admin: {user?.username}</p>
              </div>
            </div>
            <Link
              href="/"
              target="_blank"
              title="View Public Site"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-white/[0.08] space-y-2 bg-[#06070a]">
          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          >
            <KeyRound className="w-4 h-4 text-slate-500" />
            <span>Update Password</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* On-demand password modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        mustChange={false}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={() => setShowPasswordModal(false)}
      />
    </>
  );
}
