/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { Sun, Moon, Laptop } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div id="theme-toggle" className="flex items-center gap-1 p-1 bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 backdrop-blur-md rounded-full">
      <button
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded-full transition-all duration-200 cursor-pointer ${
          theme === 'light'
            ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs border border-slate-200/30 dark:border-white/5'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        title="Light Mode"
      >
        <Sun className="h-4 w-4" />
      </button>

      <button
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded-full transition-all duration-200 cursor-pointer ${
          theme === 'dark'
            ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs border border-slate-200/30 dark:border-white/5'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        title="Dark Mode"
      >
        <Moon className="h-4 w-4" />
      </button>

      <button
        onClick={() => setTheme('system')}
        className={`p-1.5 rounded-full transition-all duration-200 cursor-pointer ${
          theme === 'system'
            ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs border border-slate-200/30 dark:border-white/5'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        title="System Preference"
      >
        <Laptop className="h-4 w-4" />
      </button>
    </div>
  );
}
