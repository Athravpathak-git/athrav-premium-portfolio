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
} from 'lucide-react';

const ADMIN_NAV = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Profile & Bio', href: '/admin/profile', icon: User },
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
  const [loggingOut, setLoggingOut] = React.useState(false);

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

  return (
    <aside className="w-64 bg-burgundy border-r border-burgundy-800 text-cream flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto">
      <div>
        {/* Brand header */}
        <div className="p-5 border-b border-burgundy-700/60 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-serif font-bold tracking-tight text-cream">ATHRAV PORTFOLIO</h2>
            <p className="text-[10px] font-mono text-rosegold tracking-wider">ADMIN CONTROL CENTER</p>
          </div>
          <Link
            href="/"
            target="_blank"
            className="text-blush-200 hover:text-cream p-1.5 rounded hover:bg-burgundy-700 transition-colors"
            title="View Live Website"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1 text-xs" aria-label="Admin Navigation">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-cream text-burgundy font-bold shadow-sm'
                    : 'text-blush-100 hover:text-cream hover:bg-burgundy-700/70 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-burgundy' : 'text-rosegold'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile & Logout */}
      <div className="p-4 border-t border-burgundy-700/60 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-cream text-burgundy flex items-center justify-center font-bold text-xs uppercase shadow-sm">
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
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-burgundy-700/80 hover:bg-burgundy-800 border border-burgundy-600/70 text-cream text-xs font-medium transition-colors disabled:opacity-50"
        >
          <LogOut className="w-3.5 h-3.5 text-rosegold" />
          <span>{loggingOut ? 'Signing Out...' : 'Sign Out'}</span>
        </button>
      </div>
    </aside>
  );
}
