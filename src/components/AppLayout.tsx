/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { 
  NotebookText, 
  Settings, 
  X, 
  Sparkles, 
  BookOpen, 
  Wifi, 
  WifiOff, 
  Database,
  ListTodo,
  Calendar,
  Network,
  BarChart4,
  Lock,
  Compass,
  Menu
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ImportExportPanel } from './ImportExportPanel';
import { CommandPalette } from './CommandPalette';
import { useTranslation } from '../i18n/i18n';
import { AnimatePresence, motion } from 'motion/react';

interface AppLayoutProps {
  children: React.ReactNode;
  onRefreshNotes?: () => void;
}

export function AppLayout({ children, onRefreshNotes }: AppLayoutProps) {
  const { t, lang, setLanguage } = useTranslation();
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const currentPath = location.pathname;

  // Check if App Lock is enabled to render quick lock button
  const isLockConfigured = localStorage.getItem('linknote-applock-enabled') === 'true' && 
                           !!localStorage.getItem('linknote-applock-password-hash');

  const handleManualLock = () => {
    window.dispatchEvent(new Event('linknote-lock-app'));
  };

  const navItems = [
    { path: '/', label: t('dashboard'), icon: Compass },
    { path: '/tasks', label: t('tasks'), icon: ListTodo },
    { path: '/daily', label: t('daily'), icon: Calendar },
    { path: '/graph', label: t('graph'), icon: Network },
    { path: '/analytics', label: t('analytics'), icon: BarChart4 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 flex flex-col font-sans transition-colors duration-200 relative overflow-x-hidden pb-20 md:pb-0">
      {/* Global Command Palette listener */}
      <CommandPalette />

      {/* Premium frosted ambient background glows in dark mode */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[50%] rounded-full bg-indigo-600/5 blur-[130px] pointer-events-none hidden dark:block animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[60%] h-[50%] rounded-full bg-emerald-500/3 blur-[130px] pointer-events-none hidden dark:block animate-pulse" />

      {/* Top Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md border-b border-slate-200/50 dark:border-white/5 shadow-xs shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-all">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <NotebookText className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-base font-extrabold tracking-tight font-display bg-linear-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                LinkNote Studio
              </span>
            </Link>
            <span className="hidden sm:inline-block text-[9px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-md border border-slate-200/40 dark:border-white/5 backdrop-blur-xs select-none">
              v2.0
            </span>

            {/* Offline/Local-First Status Indicators */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 rounded-md select-none" title="All data is secured locally via Web Crypto.">
              <Database className="h-2.5 w-2.5" />
              <span>Local-First</span>
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {isOnline ? (
              <div className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100/50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-md select-none" title="Connected to network">
                <Wifi className="h-2.5 w-2.5" />
                <span>Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/15 rounded-md select-none animate-pulse" title="Offline mode active">
                <WifiOff className="h-2.5 w-2.5" />
                <span>Offline</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Minimal Language Toggle */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-100/50 dark:bg-white/5 border border-slate-200/30 dark:border-white/5 p-1 rounded-lg">
              <button
                onClick={() => setLanguage('en')}
                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md cursor-pointer transition-all ${
                  lang === 'en' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('si')}
                className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md cursor-pointer transition-all ${
                  lang === 'si' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                සිං
              </button>
            </div>

            <Link
              to="/about"
              className="p-1.5 border border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 backdrop-blur-xs rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer shadow-xs"
              title="About & Documentation"
            >
              <BookOpen className="h-4 w-4" />
            </Link>
            <Link
              to="/settings"
              className="p-1.5 border border-indigo-500/15 dark:border-indigo-400/15 bg-indigo-500/5 hover:bg-indigo-500/10 backdrop-blur-xs rounded-lg text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all cursor-pointer shadow-xs"
              title="Workspace Settings"
            >
              <Settings className="h-4 w-4" />
            </Link>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 border border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 backdrop-blur-xs rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer shadow-xs"
              title="Backup Operations"
            >
              <Database className="h-4 w-4 animate-spin-hover" />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Structural Wrapper (Desktop Left Sidebar + Center Stage) */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        
        {/* Left Desktop Sidebar Panel */}
        <aside className="hidden md:flex flex-col w-56 border-r border-slate-200/50 dark:border-white/5 py-8 px-4 shrink-0 justify-between">
          <div className="space-y-6">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block px-3">
              Workspace Nav
            </span>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = item.path === '/' 
                  ? currentPath === '/' 
                  : currentPath.startsWith(item.path);
                
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer group ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? '' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="space-y-4">
            {/* Quick Manual Locker action */}
            {isLockConfigured && (
              <button
                onClick={handleManualLock}
                className="w-full flex items-center gap-3 px-3 py-2.5 border border-rose-500/10 hover:border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all"
                title="Lock your local productivity workspace immediately."
              >
                <Lock className="h-4.5 w-4.5 text-rose-500 shrink-0" />
                <span>{t('appLock')}</span>
              </button>
            )}

            {/* Quick Sinhala/English translation at bottom of sidebar */}
            <div className="pt-4 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span>Database Sync</span>
              <span className="text-emerald-500">Secure</span>
            </div>
          </div>
        </aside>

        {/* Center Main Stage Content */}
        <main className="flex-1 min-w-0 w-full px-4 py-6 sm:px-6 sm:py-8 md:px-8 flex flex-col z-10">
          {children}
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation Menu Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-slate-900/90 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-around z-45 backdrop-blur-md md:hidden px-4 shadow-lg">
        {navItems.map((item) => {
          const isActive = item.path === '/' 
            ? currentPath === '/' 
            : currentPath.startsWith(item.path);
          
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 cursor-pointer ${
                isActive 
                  ? 'text-indigo-600 dark:text-indigo-400' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="text-[9px] font-black uppercase tracking-wider scale-90">
                {item.label.split(' ')[0]} {/* shortened */}
              </span>
            </Link>
          );
        })}
        {/* Mobile Settings Icon */}
        <Link
          to="/settings"
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 cursor-pointer ${
            currentPath.startsWith('/settings') ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
          }`}
        >
          <Sparkles className="h-5 w-5" />
          <span className="text-[9px] font-black uppercase tracking-wider scale-90">AI</span>
        </Link>
      </nav>

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
                className="w-screen max-w-md bg-white/95 dark:bg-slate-900/90 border-l border-slate-200/50 dark:border-white/10 h-full flex flex-col shadow-2xl overflow-y-auto p-6 backdrop-blur-lg"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/10 mb-6 shrink-0">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-indigo-500" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-display uppercase tracking-wider">
                      Storage & Backups
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
