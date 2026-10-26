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
    <aside className="w-64 bg-forest dark:bg-forest-950 border-r border-forest-800 text-cream-100 flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto">
      <div>
        {/* Brand header */}
        <div className="p-5 border-b border-forest-700/60 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold tracking-wider text-ivory">ATHRAV PORTFOLIO</h2>
            <p className="text-[10px] font-mono text-champagne-300">ADMIN CONTROL CENTER</p>
          </div>
          <Link
            href="/"
            target="_blank"
            className="text-sage-300 hover:text-ivory p-1 rounded hover:bg-forest-700 transition-colors"
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-ivory text-forest font-bold shadow-sm'
                    : 'text-sage-200 hover:text-ivory hover:bg-forest-600/70 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-forest' : 'text-champagne-300'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile & Logout */}
      <div className="p-4 border-t border-forest-700/60 bg-forest-900/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden pr-2">
            <div className="w-8 h-8 rounded-lg bg-forest-800 border border-forest-600 flex items-center justify-center shrink-0 font-mono text-xs font-bold text-champagne-300 shadow-inner">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-ivory truncate">{user.username}</p>
              <p className="text-[10px] font-mono text-sage-300 truncate">{user.role}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="p-1.5 rounded-lg text-sage-300 hover:text-red-300 hover:bg-forest-800 transition-colors disabled:opacity-50"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
