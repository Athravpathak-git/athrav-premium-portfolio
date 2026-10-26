'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import NextLink from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { Menu, X } from 'lucide-react';

const PRIMARY_NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Education', href: '/education' },
  { name: 'Projects', href: '/projects' },
  { name: 'Certifications', href: '/certifications' },
  { name: 'Contact', href: '/contact' },
];

const ALL_NAV_LINKS = [
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
          ? 'bg-cream/95 dark:bg-charcoal-900/95 backdrop-blur-md border-b border-border-soft dark:border-charcoal-800 shadow-[0_4px_20px_-4px_rgba(87,38,51,0.06)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] py-3.5'
          : 'bg-cream/80 dark:bg-charcoal-900/80 backdrop-blur-sm border-b border-border-soft/60 dark:border-charcoal-800/60 py-4.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Wordmark */}
          <NextLink
            href="/"
            className="group flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy rounded-lg py-1"
            aria-label="Athrav Pathak Homepage"
          >
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-serif font-bold tracking-tight text-burgundy dark:text-cream group-hover:text-burgundy-500 dark:group-hover:text-rosegold transition-colors">
                ATHRAV PATHAK
              </span>
              <span className="text-[10px] tracking-widest text-rosegold-700 dark:text-rosegold uppercase font-mono font-medium">
                Creative Developer · AI & ML
              </span>
            </div>
          </NextLink>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden lg:flex items-center gap-1.5 bg-white/85 dark:bg-charcoal-800/90 border border-border-soft dark:border-charcoal-700 rounded-full px-3.5 py-1.5 backdrop-blur-md shadow-sm"
            aria-label="Main Navigation"
          >
            {PRIMARY_NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <NextLink
                  key={link.href}
                  href={link.href}
                  className={`text-[13px] font-medium px-3 py-1 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy ${
                    isActive
                      ? 'text-white bg-burgundy dark:bg-burgundy dark:text-cream shadow-sm font-semibold'
                      : 'text-charcoal/80 dark:text-cream/80 hover:text-burgundy dark:hover:text-rosegold hover:bg-cream-200/70 dark:hover:bg-charcoal-700/60'
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
              className="hidden sm:inline-flex items-center gap-1 text-xs font-mono font-medium text-burgundy dark:text-cream bg-white dark:bg-charcoal-800 hover:bg-cream-200 dark:hover:bg-charcoal-700 border border-border-soft dark:border-charcoal-700 px-3.5 py-1.5 rounded-full transition-all shadow-sm"
              title="Admin CMS Portal"
            >
              <span>Admin</span>
            </NextLink>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-burgundy dark:text-cream hover:bg-cream-200 dark:hover:bg-charcoal-700 border border-border-soft dark:border-charcoal-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[65px] bg-cream/98 dark:bg-charcoal-900/98 border-b border-border-soft dark:border-charcoal-800 backdrop-blur-xl px-5 py-6 shadow-xl animate-fade-in z-40">
          <nav className="flex flex-col gap-1.5" aria-label="Mobile Navigation">
            {ALL_NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <NextLink
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-burgundy text-white font-bold shadow-sm'
                      : 'text-charcoal dark:text-cream hover:bg-cream-200 dark:hover:bg-charcoal-800 hover:text-burgundy dark:hover:text-rosegold'
                  }`}
                >
                  {link.name}
                </NextLink>
              );
            })}
            <div className="pt-3 mt-2 border-t border-border-soft dark:border-charcoal-800 flex items-center justify-between px-2">
              <span className="text-xs font-mono text-rosegold-700 dark:text-rosegold">Administrative Console</span>
              <NextLink
                href="/admin/login"
                className="text-xs font-mono font-semibold text-burgundy dark:text-rosegold hover:underline"
              >
                Access Dashboard →
              </NextLink>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
