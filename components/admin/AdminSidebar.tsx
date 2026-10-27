'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  User,
  GraduationCap,
  Cpu,
  Layers,
  Award,
  Briefcase,
  Trophy,
  Wrench,
  Sliders,
  Image,
  Inbox,
  Users,
  BarChart3,
  ShieldAlert,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Share2,
} from 'lucide-react';

const ADMIN_NAV = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Profile & Bio', href: '/admin/profile', icon: User },
  { name: 'Social & Contact', href: '/admin/social-links', icon: Share2 },
  { name: 'Education', href: '/admin/education', icon: GraduationCap },
  { name: 'Technical Stack', href: '/admin/skills', icon: Cpu },
  { name: 'Projects', href: '/admin/projects', icon: Layers },
  { name: 'Certifications', href: '/admin/certifications', icon: Award },
  { name: 'Experience', href: '/admin/experience', icon: Briefcase },
  { name: 'Achievements', href: '/admin/achievements', icon: Trophy },
  { name: 'Services', href: '/admin/services', icon: Wrench },
  { name: 'Homepage Sections', href: '/admin/homepage', icon: Sliders },
  { name: 'Media Library', href: '/admin/media', icon: Image },
  { name: 'Messages', href: '/admin/messages', icon: Inbox },
  { name: 'Admin Management', href: '/admin/users', icon: Users },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Security Audit', href: '/admin/security', icon: ShieldAlert },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar({ user }: { user: { username: string; email: string; role: string } }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);

  // Close mobile drawer on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Handle Escape key to close mobile drawer
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  // Lock body scroll when mobile drawer is open
  React.useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/admin/login';
    } catch (err) {
      console.error('Logout error:', err);
      window.location.href = '/admin/login';
    }
  };

  const navContent = (isMobile = false) => (
    <>
      {/* Brand header */}
      <div className="p-4 sm:p-5 border-b border-burgundy-700/60 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-serif font-bold tracking-tight text-cream">ATHRAV PORTFOLIO</h2>
          <p className="text-[10px] font-mono text-rosegold tracking-wider">ADMIN CONTROL CENTER</p>
        </div>
        {isMobile ? (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="text-blush-200 hover:text-cream p-2 rounded-xl hover:bg-burgundy-700/80 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-rosegold"
            aria-label="Close admin navigation menu"
          >
            <X className="w-5 h-5 text-cream" />
          </button>
        ) : (
          <Link
            href="/"
            target="_blank"
            className="text-blush-200 hover:text-cream p-1.5 rounded-lg hover:bg-burgundy-700 transition-colors focus:outline-none focus:ring-2 focus:ring-rosegold"
            title="View Live Website"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Navigation list */}
      <nav className="p-3 space-y-1 text-xs overflow-y-auto flex-1 overscroll-contain" aria-label="Admin Navigation">
        {ADMIN_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && setMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all min-h-[44px] focus:outline-none focus:ring-2 focus:ring-rosegold ${
                isActive
                  ? 'bg-cream text-burgundy font-bold shadow-sm'
                  : 'text-blush-100 hover:text-cream hover:bg-burgundy-700/70 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-burgundy' : 'text-rosegold'}`} />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User profile & Logout */}
      <div className="p-4 border-t border-burgundy-700/60 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-cream text-burgundy flex items-center justify-center font-bold text-xs uppercase shadow-sm shrink-0">
            {user.username.slice(0, 2)}
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-cream truncate">{user.username}</p>
            <p className="text-[10px] font-mono text-rosegold-200 truncate capitalize">{user.role}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-burgundy-700/80 hover:bg-burgundy-800 border border-burgundy-600/70 text-cream text-xs font-medium transition-colors disabled:opacity-50 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-rosegold"
        >
          <LogOut className="w-3.5 h-3.5 text-rosegold" />
          <span>{loggingOut ? 'Signing Out...' : 'Sign Out'}</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* 1. Mobile Top Navigation Bar (Visible only on < lg screens) */}
      <header className="lg:hidden sticky top-0 z-30 bg-burgundy border-b border-burgundy-800 text-cream px-4 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-xl text-cream hover:bg-burgundy-700/80 active:bg-burgundy-800 transition-colors flex items-center justify-center min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-rosegold"
            aria-label="Open admin navigation menu"
            aria-expanded={mobileOpen}
          >
            <Menu className="w-6 h-6 text-cream" />
          </button>
          <div>
            <h2 className="text-xs sm:text-sm font-serif font-bold tracking-tight text-cream leading-tight">
              ATHRAV PORTFOLIO
            </h2>
            <p className="text-[9px] sm:text-[10px] font-mono text-rosegold tracking-wider leading-none">
              ADMIN CONTROL
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="p-2 text-blush-200 hover:text-cream rounded-xl hover:bg-burgundy-700/80 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-rosegold"
            title="View Live Website"
          >
            <ExternalLink className="w-4 h-4 text-rosegold" />
          </Link>
          <div className="w-8 h-8 rounded-full bg-cream text-burgundy flex items-center justify-center font-bold text-xs uppercase shadow-xs">
            {user.username.slice(0, 2)}
          </div>
        </div>
      </header>

      {/* 2. Mobile Slide-in Drawer with Backdrop (Visible only when mobileOpen is true on < lg screens) */}
      {mobileOpen && (
        <div className="lg:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity animate-fade-in"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-in drawer container */}
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Admin Navigation Drawer"
            className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-burgundy border-r border-burgundy-800 text-cream flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out transform translate-x-0"
          >
            {navContent(true)}
          </aside>
        </div>
      )}

      {/* 3. Desktop Persistent Sidebar (Visible only on lg+ screens) */}
      <aside className="hidden lg:flex w-64 bg-burgundy border-r border-burgundy-800 text-cream flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto">
        {navContent(false)}
      </aside>
    </>
  );
}
