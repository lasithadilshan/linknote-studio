/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { NotebookText, Download, FileJson, X, Settings, Sparkles, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ImportExportPanel } from './ImportExportPanel';
import { AnimatePresence, motion } from 'motion/react';

interface AppLayoutProps {
  children: React.ReactNode;
  onRefreshNotes?: () => void;
}

export function AppLayout({ children, onRefreshNotes }: AppLayoutProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 flex flex-col font-sans transition-colors duration-200 relative overflow-x-hidden">
      {/* Premium frosted ambient background glows in dark mode */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[50%] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none hidden dark:block" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[60%] h-[50%] rounded-full bg-emerald-500/5 blur-[130px] pointer-events-none hidden dark:block" />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border-b border-slate-200/50 dark:border-white/10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <NotebookText className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight font-display bg-linear-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                LinkNote Studio
              </span>
            </Link>
            <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-0.5 bg-white/10 text-slate-500 dark:text-slate-400 rounded-full border border-slate-200/30 dark:border-white/5 backdrop-blur-xs select-none">
              v1.0 (Web Crypto GCM)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/about"
              className="p-2 border border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 backdrop-blur-xs rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer shadow-xs"
              title="About & Documentation"
            >
              <BookOpen className="h-4.5 w-4.5" />
            </Link>
            <Link
              to="/settings"
              className="p-2 border border-indigo-500/20 dark:border-indigo-400/20 bg-indigo-500/5 hover:bg-indigo-500/10 backdrop-blur-xs rounded-full text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all cursor-pointer shadow-xs"
              title="AI Assistant Settings"
            >
              <Sparkles className="h-4.5 w-4.5" />
            </Link>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 border border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 backdrop-blur-xs rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer shadow-xs"
              title="Backup & Import Settings"
            >
              <Settings className="h-4.5 w-4.5 animate-spin-hover" />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Body Stage */}
      <main className="flex-1 w-full mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-10 flex flex-col z-10">
        {children}
      </main>

      {/* Backup Settings Modal Slide-Over */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div id="settings-panel" className="fixed inset-0 z-50 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-xs"
            />
            
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="w-screen max-w-md bg-white/90 dark:bg-slate-900/80 border-l border-slate-200/50 dark:border-white/10 h-full flex flex-col shadow-2xl overflow-y-auto p-6 backdrop-blur-lg"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/10 mb-6">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-indigo-500 animate-spin-hover" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 font-display">
                      LinkNote Settings
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1">
                  <ImportExportPanel
                    onImportComplete={() => {
                      if (onRefreshNotes) {
                        onRefreshNotes();
                      }
                    }}
                    onClose={() => setIsSettingsOpen(false)}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
