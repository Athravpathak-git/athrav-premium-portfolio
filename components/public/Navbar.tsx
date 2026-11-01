'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import NextLink from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { Menu, X, Shield, ArrowRight } from 'lucide-react';
import { SocialIcon } from '@/components/common/SocialIcon';

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
  const [headerLinks, setHeaderLinks] = useState<any[]>([]);
  const [headerHeight, setHeaderHeight] = useState(64);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/social-links?placement=header')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.links)) {
          setHeaderLinks(data.links);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Measure dynamic header height accurately
  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, [scrolled, mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open to prevent unwanted background scrolling
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

  // Keyboard accessibility: Escape key closes the mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Omit public navbar completely on admin routes so the Admin header and sidebar are never masked
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          mobileMenuOpen
            ? 'bg-cream dark:bg-[#141113] border-b border-border-soft dark:border-charcoal-800 py-3.5 shadow-md'
            : scrolled
            ? 'bg-cream/95 dark:bg-charcoal-900/95 backdrop-blur-md border-b border-border-soft dark:border-charcoal-800 shadow-[0_4px_20px_-4px_rgba(87,38,51,0.06)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] py-3.5'
            : 'bg-cream/90 dark:bg-charcoal-900/90 backdrop-blur-sm border-b border-border-soft/60 dark:border-charcoal-800/60 py-4.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Brand Wordmark */}
            <NextLink
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="group flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy rounded-lg py-1 min-w-0"
              aria-label="Athrav Pathak Homepage"
            >
              <div className="flex flex-col min-w-0">
                <span className="text-base sm:text-lg font-serif font-bold tracking-tight text-burgundy dark:text-cream group-hover:text-burgundy-500 dark:group-hover:text-rosegold transition-colors truncate">
                  ATHRAV PATHAK
                </span>
                <span className="text-[10px] tracking-widest text-rosegold-700 dark:text-rosegold uppercase font-mono font-medium truncate">
                  Creative Developer · AI & ML
                </span>
              </div>
            </NextLink>

            {/* Desktop Navigation Links (Preserved layout) */}
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

            {/* Right Action Icons & Mobile Controls */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {/* Dynamic Header Social Links */}
              {headerLinks.map((link) => {
                const isEmail = link.platform === 'email';
                const href = isEmail
                  ? link.url.startsWith('mailto:')
                    ? link.url
                    : `mailto:${link.url}`
                  : link.url;
                return (
                  <a
                    key={link.id}
                    href={href}
                    target={isEmail ? undefined : '_blank'}
                    rel={isEmail ? undefined : 'noopener noreferrer'}
                    className="hidden md:inline-flex p-2 rounded-full text-charcoal/70 dark:text-cream/70 hover:text-burgundy dark:hover:text-rosegold hover:bg-cream-200/70 dark:hover:bg-charcoal-700/60 transition-colors"
                    title={link.label}
                    aria-label={link.label}
                  >
                    <SocialIcon platform={link.platform} iconName={link.icon} className="w-4 h-4" />
                  </a>
                );
              })}

              <ThemeToggle />

              {/* Admin Portal Shortcut (Visible across desktop & accessible on mobile) */}
              <NextLink
                href="/admin/login"
                className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-mono font-medium text-burgundy dark:text-cream bg-white dark:bg-charcoal-800 hover:bg-cream-200 dark:hover:bg-charcoal-700 border border-border-soft dark:border-charcoal-700 px-2.5 sm:px-3.5 py-1.5 rounded-full transition-all shadow-sm"
                title="Admin CMS Portal"
                aria-label="Admin Access"
              >
                <Shield className="w-3 h-3 text-rosegold-700 dark:text-rosegold" />
                <span>Admin</span>
              </NextLink>

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-burgundy dark:text-cream hover:bg-cream-200 dark:hover:bg-charcoal-700 border border-border-soft dark:border-charcoal-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation-drawer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu & Solid Stacking Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          {/* 1. Backdrop Overlay (Blocks interactions and outside clicks) */}
          <div
            className="fixed inset-0 bg-black/75 z-[98] transition-opacity animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* 2. Solid Fully Opaque Drawer (Extends to bottom of screen with zero bleed-through) */}
          <div
            id="mobile-navigation-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Drawer"
            style={{ top: `${headerHeight}px` }}
            className="fixed inset-x-0 bottom-0 z-[99] bg-[#FAF6F1] dark:bg-[#141113] border-b border-border-soft dark:border-charcoal-800 flex flex-col justify-between shadow-2xl transition-all duration-200 animate-fade-in select-none"
          >
            {/* Scrollable Navigation Items */}
            <nav
              className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 space-y-1.5"
              aria-label="Mobile Navigation Links"
            >
              {ALL_NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <NextLink
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                      isActive
                        ? 'bg-burgundy text-white font-bold shadow-md'
                        : 'text-charcoal-900 dark:text-cream hover:bg-cream-200 dark:hover:bg-charcoal-800 hover:text-burgundy dark:hover:text-rosegold active:bg-cream-300 font-semibold'
                    }`}
                  >
                    <span className="text-[14px]">{link.name}</span>
                    {isActive ? (
                      <span className="w-2 h-2 rounded-full bg-rosegold shadow-sm" />
                    ) : (
                      <span className="text-charcoal/30 dark:text-cream/30 text-xs">→</span>
                    )}
                  </NextLink>
                );
              })}

              {/* Dynamic Header Channels */}
              {headerLinks.length > 0 && (
                <div className="pt-4 mt-2 border-t border-border-soft dark:border-charcoal-800">
                  <p className="text-[11px] font-mono text-rosegold-700 dark:text-rosegold uppercase font-semibold px-2 mb-2 tracking-wider">
                    Direct Channels
                  </p>
                  <div className="flex flex-wrap items-center gap-2 px-1">
                    {headerLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.platform === 'email' && !link.url.startsWith('mailto:') ? `mailto:${link.url}` : link.url}
                        target={link.platform === 'email' ? undefined : '_blank'}
                        rel={link.platform === 'email' ? undefined : 'noopener noreferrer'}
                        className="p-2.5 rounded-xl bg-white dark:bg-charcoal-800 border border-border-soft dark:border-charcoal-700 text-charcoal dark:text-cream hover:text-burgundy dark:hover:text-rosegold transition-colors flex items-center gap-2 text-xs font-mono shadow-xs min-h-[40px]"
                        aria-label={link.label}
                      >
                        <SocialIcon platform={link.platform} iconName={link.icon} className="w-4 h-4 text-rosegold" />
                        <span className="font-medium">{link.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Administrative Console Entry Card */}
              <div className="pt-4 mt-2 border-t border-border-soft dark:border-charcoal-800">
                <div className="p-4 rounded-xl bg-white dark:bg-charcoal-800/90 border border-border-soft dark:border-charcoal-700 flex items-center justify-between gap-3 shadow-sm">
                  <div className="min-w-0">
                    <p className="text-[11px] font-mono text-rosegold-700 dark:text-rosegold font-bold uppercase tracking-wider">
                      Administrative Portal
                    </p>
                    <p className="text-xs text-charcoal/80 dark:text-cream/80 truncate">
                      Manage portfolio content & security
                    </p>
                  </div>
                  <NextLink
                    href="/admin/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white text-xs font-mono font-bold shadow-sm transition-colors shrink-0 min-h-[40px]"
                  >
                    <span>Login</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </NextLink>
                </div>
              </div>
            </nav>

            {/* Bottom Dismissal Bar */}
            <div className="p-3.5 border-t border-border-soft dark:border-charcoal-800 bg-[#F4E8EA]/60 dark:bg-[#100D0F] flex items-center justify-between text-xs font-mono text-charcoal/70 dark:text-cream/70">
              <span>Tap backdrop to dismiss</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-border-soft dark:border-charcoal-700 text-burgundy dark:text-rosegold font-semibold hover:bg-cream-200 dark:hover:bg-charcoal-800 transition-colors min-h-[36px]"
              >
                Close Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
