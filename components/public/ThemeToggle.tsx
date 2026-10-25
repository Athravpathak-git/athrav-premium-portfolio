'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={`p-2 rounded-full border border-white/10 dark:border-white/10 hover:border-white/30 dark:hover:border-white/30 bg-zinc-900/60 dark:bg-zinc-900/60 text-zinc-300 hover:text-white transition-all backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-silver-400 ${className}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-300 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-zinc-700 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}
