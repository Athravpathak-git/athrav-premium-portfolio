'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/navigation';
import { usePathname } from 'next/navigation';
import NextLink from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { Menu, X, ArrowUpRight, Cpu } from 'lucide-react';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Education', href: '/education' },
  { name: 'Skills', href: '/skills' },
  { name: 'Projects', href: '/projects' },
  { name: 'Certifications', href: '/certifications' },
  { name: 'Experience', href: '/experience' },
  { name: 'Achievements', href: '/achievements' },
  { name: 'Services', href: '/services' },
  { name: 'Contact', href: '/contact' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-black/75 dark:bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/40 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <NextLink
            href="/"
            className="group flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-silver-400 rounded-lg py-1 px-1.5"
            aria-label="Athrav Pathak Homepage"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 via-zinc-900 to-black border border-white/20 flex items-center justify-center shadow-inner group-hover:border-white/50 transition-colors">
              <Cpu className="w-4 h-4 text-silver-300 group-hover:text-white transition-colors" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-wider text-white group-hover:text-silver-200 transition-colors">
                ATHRAV PATHAK
              </span>
              <span className="text-[10px] tracking-widest text-zinc-400 uppercase font-mono">
                Aspiring AI Engineer
              </span>
            </div>
          </NextLink>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden lg:flex items-center gap-1 bg-zinc-900/40 dark:bg-zinc-900/40 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md"
            aria-label="Main Navigation"
          >
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <NextLink
                  key={link.href}
                  href={link.href}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-silver-400 ${
                    isActive
                      ? 'text-white bg-white/15 shadow-sm font-semibold'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </NextLink>
              );
            })}
          </nav>

          {/* Right Action Icons & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Admin Portal Shortcut */}
            <NextLink
              href="/admin/login"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-mono text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-800/80 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-full transition-all backdrop-blur-sm"
              title="Admin Portal"
            >
              <span>Admin</span>
              <ArrowUpRight className="w-3 h-3 opacity-70" />
            </NextLink>

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg border border-white/10 bg-zinc-900/60 text-zinc-300 hover:text-white hover:border-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-silver-400"
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-zinc-950/95 dark:bg-black/95 border-b border-white/15 px-4 pt-4 pb-6 mt-3 backdrop-blur-2xl animate-fade-in shadow-2xl">
          <nav className="grid grid-cols-2 gap-2" aria-label="Mobile Navigation">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <NextLink
                  key={link.href}
                  href={link.href}
                  className={`text-sm px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                    isActive
                      ? 'bg-white/15 text-white font-semibold border border-white/20'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
                  }`}
                >
                  {link.name}
                </NextLink>
              );
            })}
            <NextLink
              href="/admin/login"
              className="col-span-2 text-center text-xs font-mono text-zinc-400 hover:text-white bg-zinc-900 border border-white/10 py-2.5 rounded-xl mt-2 flex items-center justify-center gap-1.5"
            >
              <span>Admin Dashboard Portal</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </NextLink>
          </nav>
        </div>
      )}
    </header>
  );
}
