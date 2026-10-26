'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme, mounted } = useTheme();

  // Prevent hydration mismatch by rendering a stable skeleton container before mounting
  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        aria-label="Loading theme toggle"
        className={`w-9 h-9 p-2 rounded-full border border-border-soft bg-white/70 opacity-60 backdrop-blur-md cursor-default ${className}`}
      >
        <span className="w-4 h-4 block" />
      </button>
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode (Warm Cream & Burgundy)' : 'Switch to Dark Mode (Velvet Charcoal & Rose Gold)'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-pressed={isDark}
      className={`group relative p-2 rounded-full border transition-all duration-300 backdrop-blur-md focus:outline-none focus-visible:ring-2 shadow-sm ${
        isDark
          ? 'bg-charcoal-800 hover:bg-charcoal-700 border-charcoal-600 text-rosegold focus-visible:ring-rosegold shadow-[0_2px_10px_rgba(0,0,0,0.3)]'
          : 'bg-white hover:bg-cream-100 border-border-soft text-burgundy focus-visible:ring-burgundy shadow-[0_2px_8px_rgba(87,38,51,0.06)]'
      } ${className}`}
    >
      {isDark ? (
        <Sun
          className="w-4 h-4 text-rosegold transition-transform duration-500 ease-out group-hover:rotate-90 group-hover:scale-110"
          aria-hidden="true"
        />
      ) : (
        <Moon
          className="w-4 h-4 text-burgundy transition-transform duration-500 ease-out group-hover:-rotate-12 group-hover:scale-110"
          aria-hidden="true"
        />
      )}
      <span className="sr-only">
        {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      </span>
    </button>
  );
}
