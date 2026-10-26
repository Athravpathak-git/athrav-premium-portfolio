'use client';

import React, { useState, useEffect } from 'react';
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
      setScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-cream-100/90 dark:bg-forest-950/90 backdrop-blur-xl border-b border-cream-300 dark:border-forest-800 shadow-md py-3'
          : 'bg-cream-200/70 dark:bg-forest-900/60 backdrop-blur-md border-b border-cream-300/40 dark:border-forest-800/40 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <NextLink
            href="/"
            className="group flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest rounded-lg py-1 px-1.5"
            aria-label="Athrav Pathak Homepage"
          >
            <div className="w-8 h-8 rounded-full bg-forest dark:bg-ivory border border-forest-600 dark:border-cream-300 flex items-center justify-center shadow-sm group-hover:scale-105 transition-all">
              <Cpu className="w-4 h-4 text-ivory dark:text-forest" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wider text-forest dark:text-ivory group-hover:text-forest-500 transition-colors">
                ATHRAV PATHAK
              </span>
              <span className="text-[10px] tracking-widest text-forest-600 dark:text-sage uppercase font-mono font-medium">
                Aspiring AI Engineer
              </span>
            </div>
          </NextLink>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden lg:flex items-center gap-1 bg-ivory/80 dark:bg-forest-900/80 border border-cream-300 dark:border-forest-800 rounded-full px-3 py-1.5 backdrop-blur-md shadow-sm"
            aria-label="Main Navigation"
          >
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <NextLink
                  key={link.href}
                  href={link.href}
                  className={`text-[12px] font-medium px-2.5 py-1 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest ${
                    isActive
                      ? 'text-ivory bg-forest shadow-sm font-semibold'
                      : 'text-forest-700 dark:text-sage-100 hover:text-forest dark:hover:text-ivory hover:bg-cream-200/60 dark:hover:bg-forest-800'
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
              className="hidden sm:inline-flex items-center gap-1 text-xs font-mono text-forest dark:text-ivory bg-cream-50 dark:bg-forest-800 hover:bg-cream-200 border border-cream-300 dark:border-forest-700 px-3 py-1.5 rounded-full transition-all shadow-sm"
              title="Admin Portal"
            >
              <span>Admin</span>
              <ArrowUpRight className="w-3 h-3 opacity-70" />
            </NextLink>

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg border border-cream-300 dark:border-forest-800 bg-ivory dark:bg-forest-900 text-forest dark:text-ivory focus:outline-none focus-visible:ring-2 focus-visible:ring-forest"
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
        <div className="lg:hidden bg-ivory dark:bg-forest-950 border-b border-cream-300 dark:border-forest-800 px-4 pt-4 pb-6 mt-3 shadow-xl animate-fade-in">
          <nav className="grid grid-cols-2 gap-2" aria-label="Mobile Navigation">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <NextLink
                  key={link.href}
                  href={link.href}
                  className={`text-sm px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                    isActive
                      ? 'bg-forest text-ivory font-semibold'
                      : 'text-forest-700 dark:text-sage-100 hover:text-forest hover:bg-cream-200/80 dark:hover:bg-forest-900'
                  }`}
                >
                  {link.name}
                </NextLink>
              );
            })}
            <NextLink
              href="/admin/login"
              className="col-span-2 text-center text-xs font-mono text-forest dark:text-ivory bg-cream-200 dark:bg-forest-900 border border-cream-300 dark:border-forest-800 py-2.5 rounded-xl mt-2 flex items-center justify-center gap-1.5"
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
