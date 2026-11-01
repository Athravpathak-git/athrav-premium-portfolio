import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Mobile Responsiveness, Navbar & Admin Navigation Integrity', () => {
  const rootDir = process.cwd();

  it('verifies Navbar.tsx implements solid non-transparent background and isolates from admin routes', () => {
    const navbarPath = path.join(rootDir, 'components', 'public', 'Navbar.tsx');
    expect(fs.existsSync(navbarPath)).toBe(true);

    const content = fs.readFileSync(navbarPath, 'utf-8');

    // Admin isolation
    expect(content).toContain("pathname?.startsWith('/admin')");

    // Solid opaque background (no transparent glass bleed-through)
    expect(content).toContain('bg-[#FAF6F1] dark:bg-[#141113]');

    // Full screen drawer coverage (inset-x-0 bottom-0)
    expect(content).toContain('fixed inset-x-0 bottom-0');

    // High z-index above 3D ribbons and canvas elements
    expect(content).toContain('z-[100]');
    expect(content).toContain('z-[99]');
    expect(content).toContain('z-[98]');

    // Body scroll lock
    expect(content).toContain("document.body.style.overflow = 'hidden'");

    // Escape key listener
    expect(content).toContain("e.key === 'Escape'");

    // Touch targets >= 44px
    expect(content).toContain('min-h-[44px]');

    // Mobile Admin Access shortcut and portal card
    expect(content).toContain('/admin/login');
    expect(content).toContain('Administrative Portal');
  });

  it('verifies FooterWrapper isolates public footer from admin dashboard routes', () => {
    const wrapperPath = path.join(rootDir, 'components', 'public', 'FooterWrapper.tsx');
    expect(fs.existsSync(wrapperPath)).toBe(true);

    const content = fs.readFileSync(wrapperPath, 'utf-8');
    expect(content).toContain("pathname?.startsWith('/admin')");

    const layoutPath = path.join(rootDir, 'app', 'layout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
    expect(layoutContent).toContain('<FooterWrapper>');
    expect(layoutContent).toContain('</FooterWrapper>');
  });

  it('verifies AdminSidebar.tsx provides responsive mobile header and collapsible drawer', () => {
    const sidebarPath = path.join(rootDir, 'components', 'admin', 'AdminSidebar.tsx');
    expect(fs.existsSync(sidebarPath)).toBe(true);

    const content = fs.readFileSync(sidebarPath, 'utf-8');

    // Mobile top header with sticky positioning
    expect(content).toContain('lg:hidden sticky top-0 z-40');

    // Mobile slide-in drawer with backdrop
    expect(content).toContain('fixed inset-0 bg-black/70');
    expect(content).toContain('z-[60]');

    // Touch friendly targets
    expect(content).toContain('min-h-[44px]');
    expect(content).toContain('min-w-[44px]');

    // Scroll lock and Escape listener
    expect(content).toContain("document.body.style.overflow = 'hidden'");
    expect(content).toContain("e.key === 'Escape'");
  });

  it('verifies admin tables across all dashboard sections are wrapped with overflow-x-auto', () => {
    const tablePages = [
      'app/admin/analytics/page.tsx',
      'app/admin/security/page.tsx',
      'app/admin/services/page.tsx',
      'app/admin/achievements/page.tsx',
      'app/admin/education/page.tsx',
      'app/admin/experience/page.tsx',
      'app/admin/projects/page.tsx',
      'app/admin/skills/page.tsx',
    ];

    for (const relPath of tablePages) {
      const fullPath = path.join(rootDir, relPath);
      expect(fs.existsSync(fullPath)).toBe(true);
      const content = fs.readFileSync(fullPath, 'utf-8');
      expect(content).toContain('overflow-x-auto');
    }
  });

  it('verifies admin modals have max-h and scrollability to fit small viewport heights', () => {
    const modalPages = [
      'app/admin/social-links/page.tsx',
      'app/admin/users/page.tsx',
      'app/admin/certifications/page.tsx',
      'app/admin/media/page.tsx',
    ];

    for (const relPath of modalPages) {
      const fullPath = path.join(rootDir, relPath);
      expect(fs.existsSync(fullPath)).toBe(true);
      const content = fs.readFileSync(fullPath, 'utf-8');
      expect(content).toContain('max-h-[90vh]');
      expect(content).toContain('overflow-y-auto');
    }
  });

  it('verifies admin login form uses responsive font sizing to prevent iOS Safari auto-zoom', () => {
    const loginPath = path.join(rootDir, 'app', 'admin', 'login', 'page.tsx');
    expect(fs.existsSync(loginPath)).toBe(true);

    const content = fs.readFileSync(loginPath, 'utf-8');
    expect(content).toContain('text-base sm:text-sm');
    // Ensure intrusive autofocus that triggers unwanted mobile keyboard popups is removed
    expect(content).not.toContain('autoFocus');
  });
});
