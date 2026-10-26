import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Theme System & Dark/Light Mode Integrity', () => {
  const rootDir = process.cwd();

  it('verifies tailwind.config.ts has darkMode: "class" and dynamic border variable mapping', () => {
    const tailwindConfigPath = path.join(rootDir, 'tailwind.config.ts');
    expect(fs.existsSync(tailwindConfigPath)).toBe(true);

    const content = fs.readFileSync(tailwindConfigPath, 'utf-8');
    expect(content).toContain("darkMode: 'class'");
    expect(content).toContain("soft: 'var(--border)'");
    expect(content).toContain("DEFAULT: 'var(--border)'");
  });

  it('verifies app/globals.css defines distinct luxury variables for :root and .dark', () => {
    const globalsCssPath = path.join(rootDir, 'app', 'globals.css');
    expect(fs.existsSync(globalsCssPath)).toBe(true);

    const content = fs.readFileSync(globalsCssPath, 'utf-8');
    
    // Light mode (:root) checks
    expect(content).toContain(':root {');
    expect(content).toContain('--background: #F7F2EA;');
    expect(content).toContain('--foreground: #292326;');
    expect(content).toContain('--accent-burgundy: #572633;');

    // Dark mode (.dark) checks - must NOT be identical to light mode
    expect(content).toContain('.dark {');
    expect(content).toContain('--background: #141113;');
    expect(content).toContain('--surface: #1F1A1D;');
    expect(content).toContain('--foreground: #F7F2EA;');
    expect(content).toContain('--border: #3A2D35;');
  });

  it('verifies app/layout.tsx contains zero-flash theme initializer script and localStorage key athrav_theme', () => {
    const layoutPath = path.join(rootDir, 'app', 'layout.tsx');
    expect(fs.existsSync(layoutPath)).toBe(true);

    const content = fs.readFileSync(layoutPath, 'utf-8');
    expect(content).toContain('theme-initializer');
    expect(content).toContain("localStorage.getItem('athrav_theme')");
    expect(content).toContain("classList.add('dark')");
    expect(content).toContain('suppressHydrationWarning');
    expect(content).toContain('dark:bg-charcoal-900');
    expect(content).toContain('dark:text-cream');
  });

  it('verifies ThemeProvider.tsx and ThemeToggle.tsx use the athrav_theme key and handle toggle cleanly', () => {
    const providerPath = path.join(rootDir, 'components', 'public', 'ThemeProvider.tsx');
    const togglePath = path.join(rootDir, 'components', 'public', 'ThemeToggle.tsx');

    expect(fs.existsSync(providerPath)).toBe(true);
    expect(fs.existsSync(togglePath)).toBe(true);

    const providerContent = fs.readFileSync(providerPath, 'utf-8');
    expect(providerContent).toContain("'athrav_theme'");
    expect(providerContent).toContain("classList.toggle('dark'");

    const toggleContent = fs.readFileSync(togglePath, 'utf-8');
    expect(toggleContent).toContain('useTheme');
    expect(toggleContent).toContain('toggleTheme');
    expect(toggleContent).toContain('Switch to Light Mode');
    expect(toggleContent).toContain('Switch to Dark Mode');
    expect(toggleContent).not.toContain('text-zinc-700');
    expect(toggleContent).not.toContain('bg-zinc-900');
  });

  it('verifies absence of obsolete monochrome tokens (silver, zinc, obsidian) in app/admin', () => {
    const adminDir = path.join(rootDir, 'app', 'admin');
    const files = fs.readdirSync(adminDir, { recursive: true }) as string[];

    for (const file of files) {
      if (typeof file === 'string' && (file.endsWith('.tsx') || file.endsWith('.ts'))) {
        const filePath = path.join(adminDir, file);
        if (fs.statSync(filePath).isFile()) {
          const content = fs.readFileSync(filePath, 'utf-8');
          expect(content).not.toMatch(/\btext-silver-\d+/);
          expect(content).not.toMatch(/\bbg-zinc-\d+/);
          expect(content).not.toMatch(/\btext-zinc-\d+/);
          expect(content).not.toMatch(/\btext-obsidian-\d+/);
        }
      }
    }
  });

  it('verifies contrast compliance: ensures no white text on light table cells or cards in admin', () => {
    const analyticsPath = path.join(rootDir, 'app', 'admin', 'analytics', 'page.tsx');
    const messagesPath = path.join(rootDir, 'app', 'admin', 'messages', 'page.tsx');

    const analyticsContent = fs.readFileSync(analyticsPath, 'utf-8');
    expect(analyticsContent).not.toContain('font-mono text-white');

    const messagesContent = fs.readFileSync(messagesPath, 'utf-8');
    expect(messagesContent).not.toContain('font-semibold text-white');
    expect(messagesContent).not.toContain('From: <span className="text-white">');
    expect(messagesContent).not.toContain('text-zinc-200');
  });

  it('verifies root CSS variables provide high-contrast text ratios', () => {
    const globalsCssPath = path.join(rootDir, 'app', 'globals.css');
    const content = fs.readFileSync(globalsCssPath, 'utf-8');

    // High contrast muted text
    expect(content).toContain('--text-muted: #574D54;');
    expect(content).toContain('--text-muted: #C5BDC3;');
  });
});
