/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { noteStorage } from '../services/noteStorage';
import { Note } from '../types';
import { useTranslation } from '../i18n/i18n';
import { useToast } from '../hooks/useToast';
import { 
  BookOpen, 
  Calendar, 
  Flame, 
  Plus, 
  ChevronRight, 
  PenTool,
  Clock,
  Trash2
} from 'lucide-react';
import { motion } from 'motion/react';

export function DailyNotesPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [dailyNotes, setDailyNotes] = useState<Note[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  // Calculate local today's date in YYYY-MM-DD
  const getTodayDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const loadDailyNotes = async () => {
    try {
      const notes = await noteStorage.getDailyNotes();
      setDailyNotes(notes);
      
      // Load streak from analytics stats
      const stats = await noteStorage.getAnalyticsStats();
      setStreak(stats.writingStreak || 0);
    } catch (err) {
      toast('Failed to load daily notes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDailyNotes();
  }, []);

  const handleOpenTodayNote = async () => {
    const todayStr = getTodayDateString();
    try {
      const note = await noteStorage.getOrCreateDailyNote(todayStr);
      toast(`Opened journal for ${todayStr}`, 'success');
      navigate(`/note/${note.id}`);
    } catch (err) {
      toast('Failed to open today\'s note', 'error');
    }
  };

  const handleDeleteNote = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Move this daily entry to Trash?')) return;
    try {
      await noteStorage.deleteNote(id);
      toast('Entry moved to trash', 'success');
      loadDailyNotes();
    } catch (err) {
      toast('Failed to delete entry', 'error');
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/60 dark:border-slate-850">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white flex items-center gap-2.5">
              <Calendar className="h-8 w-8 text-indigo-500" />
              <span>{t('daily')}</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg leading-relaxed">
              {t('dailyNotesDescription')}
            </p>
          </div>

          <button
            onClick={handleOpenTodayNote}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-indigo-600/10 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] shrink-0"
          >
            <PenTool className="h-4 w-4" />
            <span>{t('todaysNote')}</span>
          </button>
        </div>

        {/* Dashboard Streak Widget */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-linear-to-br from-indigo-500 to-violet-600 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden">
            {/* Background vector glow */}
            <div className="absolute right-[-20px] bottom-[-20px] w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-2">
              <Flame className="h-6 w-6 text-amber-300 fill-amber-300 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-100">
                {t('streakDays')}
              </span>
            </div>

            <div className="mt-8">
              <span className="text-4xl font-black font-display tracking-tight block">
                {t('streakCount', { count: streak })}
              </span>
              <p className="text-[11px] text-indigo-100/80 font-medium mt-1 leading-relaxed">
                {streak > 0 
                  ? 'Awesome! Keep your local-first writing momentum burning.' 
                  : 'Write journal entries daily to build your local writing streak.'}
              </p>
            </div>
          </div>

          <div className="md:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/50 dark:border-white/5 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block">
                Active Local Storage Sync
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                100% Cryptographically Secure Journals
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Every reflection is stored strictly in your browser. Encrypt individual daily notes to add an extra layer of AES-GCM protection.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Date format: YYYY-MM-DD</span>
              <span>Encrypted on-write</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">
            {t('recentDailyNotes')}
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-white/5">
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
              <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">
                Accessing Local Chronicle...
              </span>
            </div>
          ) : dailyNotes.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200/50 dark:border-white/5 text-center max-w-md mx-auto space-y-4">
              <div className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-md font-bold text-slate-900 dark:text-white font-display">
                {t('noDailyNotes')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                No local daily notes are currently found. Open today's note above to write your very first reflection.
              </p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200/60 dark:border-slate-850 pl-6 ml-4 space-y-6 py-2">
              {dailyNotes.map((note) => {
                const previewText = note.content 
                  ? note.content.replace(/#+\s+.*/g, '').trim().substring(0, 160) + '...'
                  : 'Empty entry...';

                return (
                  <div 
                    key={note.id} 
                    onClick={() => navigate(`/note/${note.id}`)}
                    className="relative bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-white/5 rounded-2xl p-5 hover:border-indigo-500/40 dark:hover:border-indigo-400/30 transition-all shadow-xs cursor-pointer group flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-[-32px] top-6 w-3 h-3 bg-indigo-600 dark:bg-indigo-400 rounded-full border-2 border-slate-50 dark:border-slate-950 group-hover:scale-125 transition-transform" />

                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                        <span className="text-xs font-bold font-mono text-slate-500 dark:text-slate-400">
                          {note.dailyDate}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {note.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 max-w-xl">
                        {previewText}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-white/5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteNote(e, note.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors"
                        title="Move to trash"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}
