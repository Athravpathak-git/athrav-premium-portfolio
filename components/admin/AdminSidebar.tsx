'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  { name: 'Technical Skills', href: '/admin/skills', icon: Cpu },
  { name: 'Projects', href: '/admin/projects', icon: Layers },
  { name: 'Certifications', href: '/admin/certifications', icon: Award },
  { name: 'Experience', href: '/admin/experience', icon: Briefcase },
  { name: 'Achievements', href: '/admin/achievements', icon: Trophy },
  { name: 'Services', href: '/admin/services', icon: Wrench },
  { name: 'Homepage Sections', href: '/admin/homepage', icon: Sliders },
  { name: 'Media Library', href: '/admin/media', icon: Image },
  { name: 'Messages', href: '/admin/messages', icon: Inbox },
  { name: 'Admin Users', href: '/admin/users', icon: Users },
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
    <aside className="w-64 bg-zinc-950 border-r border-white/10 flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto">
      <div>
        {/* Brand header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold tracking-wider text-white">ATHRAV PORTFOLIO</h2>
            <p className="text-[10px] font-mono text-zinc-400">ADMIN CONTROL CENTER</p>
          </div>
          <Link
            href="/"
            target="_blank"
            className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-900 transition-colors"
            title="View Live Website"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1 text-xs">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-white/15 text-white font-semibold border border-white/20'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0 text-silver-400" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile & Logout */}
      <div className="p-4 border-t border-white/10 bg-zinc-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden pr-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/15 flex items-center justify-center shrink-0 font-mono text-xs font-bold text-silver-300">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user.username}</p>
              <p className="text-[10px] font-mono text-zinc-400 truncate">{user.role}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-900 transition-colors disabled:opacity-50"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
