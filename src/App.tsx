/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { ToastProvider, useToast } from './hooks/useToast';
import { DashboardPage } from './pages/DashboardPage';
import { NotePage } from './pages/NotePage';
import { SharePage } from './pages/SharePage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { CommandPalette } from './components/CommandPalette';

// Local-First Productivity Workspace Pages
import { TasksPage } from './pages/TasksPage';
import { DailyNotesPage } from './pages/DailyNotesPage';
import { GraphPage } from './pages/GraphPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { PresentationPage } from './pages/PresentationPage';
import { AppLockScreen } from './components/AppLockScreen';
import { noteStorage } from './services/noteStorage';

// App Lock gate to protect local data
function AppLockGate({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(() => {
    // If sharing links, ignore applock entirely to keep snapshot access public
    const hash = window.location.hash;
    if (hash.includes('/share') || hash.includes('/s?') || hash.includes('/s#')) {
      return false;
    }
    const enabled = localStorage.getItem('linknote-applock-enabled') === 'true';
    const hasPassword = !!localStorage.getItem('linknote-applock-password-hash');
    const sessionUnlocked = sessionStorage.getItem('linknote-unlocked') === 'true';
    return enabled && hasPassword && !sessionUnlocked;
  });

  // Listen for locking signals
  useEffect(() => {
    const handleLock = () => {
      sessionStorage.removeItem('linknote-unlocked');
      setIsLocked(true);
    };
    window.addEventListener('linknote-lock-app', handleLock);
    return () => {
      window.removeEventListener('linknote-lock-app', handleLock);
    };
  }, []);

  // Inactivity timeout handler
  useEffect(() => {
    if (isLocked) return;
    const enabled = localStorage.getItem('linknote-applock-enabled') === 'true';
    const timeoutStr = localStorage.getItem('linknote-applock-timeout');
    const timeoutMin = timeoutStr ? parseInt(timeoutStr, 10) : 0;

    if (!enabled || timeoutMin <= 0) return;

    let timer: any;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        sessionStorage.removeItem('linknote-unlocked');
        setIsLocked(true);
      }, timeoutMin * 60 * 1000);
    };

    const userEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    userEvents.forEach(evt => window.addEventListener(evt, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      userEvents.forEach(evt => window.removeEventListener(evt, resetTimer));
    };
  }, [isLocked]);

  if (isLocked) {
    return <AppLockScreen onUnlock={() => setIsLocked(false)} />;
  }

  return <>{children}</>;
}

// Redirect wrapper for Direct YYYY-MM-DD Daily Notes
function DailyDateRedirect() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    async function resolve() {
      if (!date) {
        navigate('/daily');
        return;
      }
      try {
        const note = await noteStorage.getOrCreateDailyNote(date);
        navigate(`/note/${note.id}`);
      } catch (err) {
        toast('Failed to load daily note', 'error');
        navigate('/daily');
      }
    }
    resolve();
  }, [date, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// Handler for direct wiki-link title resolution
function WikiLinkTitleRedirect() {
  const { title } = useParams<{ title: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    async function resolve() {
      if (!title) {
        navigate('/');
        return;
      }
      try {
        const decodedTitle = decodeURIComponent(title);
        const existing = await noteStorage.getNoteByTitle(decodedTitle);
        if (existing) {
          navigate(`/note/${existing.id}`);
        } else {
          // If not exists, offer to create it
          if (window.confirm(`The note "${decodedTitle}" does not exist. Would you like to create it?`)) {
            const created = await noteStorage.createLinkedNote(decodedTitle);
            toast(`Created note: "${decodedTitle}"`, 'success');
            navigate(`/note/${created.id}`);
          } else {
            navigate('/');
          }
        }
      } catch (err) {
        toast('Error resolving wiki-link title', 'error');
        navigate('/');
      }
    }
    resolve();
  }, [title, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <HashRouter>
        <AppLockGate>
          <CommandPalette />
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/note/:id" element={<NotePage />} />
            
            {/* New Productivity Workspace routes */}
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/daily" element={<DailyNotesPage />} />
            <Route path="/daily/:date" element={<DailyDateRedirect />} />
            <Route path="/graph" element={<GraphPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/present/:id" element={<PresentationPage />} />
            
            {/* Inter-Note link resolving redirects */}
            <Route path="/note-title/:title" element={<WikiLinkTitleRedirect />} />
            
            <Route path="/share" element={<SharePage />} />
            <Route path="/s" element={<SharePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AppLockGate>
      </HashRouter>
    </ToastProvider>
  );
}
