/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { noteStorage } from '../services/noteStorage';
import { useTranslation } from '../i18n/i18n';
import { useToast } from '../hooks/useToast';
import { 
  BarChart4, 
  Files, 
  Trash2, 
  Star, 
  Lock, 
  Type, 
  CheckSquare, 
  Folder, 
  Tag, 
  Calendar, 
  Flame, 
  HardDrive, 
  ChevronRight,
  RefreshCw,
  Archive
} from 'lucide-react';
import { motion } from 'motion/react';

export function AnalyticsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const calculateStats = async () => {
    setLoading(true);
    try {
      const results = await noteStorage.getAnalyticsStats();
      setStats(results);
    } catch (err) {
      toast('Failed to compute stats', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateStats();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
          <span className="text-xs uppercase font-bold tracking-widest text-slate-500 font-mono">
            Compiling Local Analytics...
          </span>
        </div>
      </AppLayout>
    );
  }

  if (!stats) return null;

  // Max counts for folder and tag bar ratio calculations
  const maxFolderCount = Math.max(...Object.values(stats.notesByFolder || {}).map(v => Number(v)), 1);
  const maxTagCount = Math.max(...Object.values(stats.notesByTag || {}).map(v => Number(v)), 1);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/60 dark:border-slate-850">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white flex items-center gap-2.5">
              <BarChart4 className="h-8 w-8 text-indigo-500" />
              <span>{t('analytics')}</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg leading-relaxed">
              Real-time insights of your LinkNote Studio productivity. Calculated strictly client-side on device.
            </p>
          </div>

          <button
            onClick={calculateStats}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 rounded-xl cursor-pointer"
          >
            <RefreshCw className="h-4 w-4 animate-spin-hover" />
            <span>Recalculate</span>
          </button>
        </div>

        {/* Bento Grid: Basic Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/50 dark:border-white/5 shadow-xs">
            <div className="flex justify-between items-start text-indigo-500">
              <Files className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Active
              </span>
            </div>
            <span className="text-2xl font-black font-display text-slate-900 dark:text-white mt-4 block">
              {stats.activeNotes}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/50 dark:border-white/5 shadow-xs">
            <div className="flex justify-between items-start text-amber-500">
              <Star className="h-4 w-4 fill-amber-500/20" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Starred
              </span>
            </div>
            <span className="text-2xl font-black font-display text-slate-900 dark:text-white mt-4 block">
              {stats.starredNotes}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/50 dark:border-white/5 shadow-xs">
            <div className="flex justify-between items-start text-emerald-500">
              <Lock className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Encrypted
              </span>
            </div>
            <span className="text-2xl font-black font-display text-slate-900 dark:text-white mt-4 block">
              {stats.encryptedNotes}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/50 dark:border-white/5 shadow-xs">
            <div className="flex justify-between items-start text-slate-400">
              <Trash2 className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Deleted
              </span>
            </div>
            <span className="text-2xl font-black font-display text-slate-900 dark:text-white mt-4 block">
              {stats.deletedNotes}
            </span>
          </div>

          <div className="col-span-2 lg:col-span-1 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/50 dark:border-white/5 shadow-xs">
            <div className="flex justify-between items-start text-pink-500">
              <Calendar className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Daily Entries
              </span>
            </div>
            <span className="text-2xl font-black font-display text-slate-900 dark:text-white mt-4 block">
              {stats.dailyNotesCount}
            </span>
          </div>
        </div>

        {/* Bento Grid Row 2: Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Content Writing metrics */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/50 dark:border-white/5 space-y-6">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-1.5">
              <Type className="h-4 w-4 text-indigo-500" />
              <span>Writing Volumes</span>
            </h3>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {t('totalWords')}
                </span>
                <span className="text-2xl font-black font-display text-slate-900 dark:text-white block mt-0.5">
                  {stats.totalWords.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {t('totalChars')}
                </span>
                <span className="text-2xl font-black font-display text-slate-900 dark:text-white block mt-0.5">
                  {stats.totalChars.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Task Metrics */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/50 dark:border-white/5 space-y-6">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-1.5">
              <CheckSquare className="h-4 w-4 text-indigo-500" />
              <span>{t('taskStats')}</span>
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {t('totalTasks')}
                  </span>
                  <span className="text-xl font-bold font-display text-slate-900 dark:text-white block">
                    {stats.totalTasks}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                    Completed
                  </span>
                  <span className="text-xl font-bold font-display text-emerald-600 dark:text-emerald-400 block">
                    {stats.completedTasks}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                    Pending
                  </span>
                  <span className="text-xl font-bold font-display text-amber-600 dark:text-amber-400 block">
                    {stats.pendingTasks}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  <span>{t('completionRate')}</span>
                  <span>{stats.completionRate}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-950 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Streak & Storage */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/50 dark:border-white/5 space-y-6">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-1.5">
              <HardDrive className="h-4 w-4 text-indigo-500" />
              <span>Storage & Backup</span>
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {t('storageUsed')}
                  </span>
                  <span className="text-md font-bold font-display text-slate-900 dark:text-white block mt-0.5">
                    {stats.storageUsedKB} KB
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                    {t('streakDays')}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5 text-slate-900 dark:text-white">
                    <Flame className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0" />
                    <span className="text-md font-bold font-display">{stats.writingStreak} Days</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {t('lastBackup')}
                </span>
                <span className="text-xs font-mono font-medium block mt-1 text-slate-600 dark:text-slate-300">
                  {stats.lastBackupDate 
                    ? new Date(stats.lastBackupDate).toLocaleDateString() + ' ' + new Date(stats.lastBackupDate).toLocaleTimeString()
                    : t('neverBackup')}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Folder and Tag distributions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Folders Distribution */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/50 dark:border-white/5 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-1.5">
              <Folder className="h-4 w-4 text-indigo-500" />
              <span>{t('notesByFolder')}</span>
            </h3>

            {Object.keys(stats.notesByFolder || {}).length === 0 ? (
              <span className="text-xs text-slate-400 block py-6 text-center">No folder distributions available.</span>
            ) : (
              <div className="space-y-3.5">
                {(Object.entries(stats.notesByFolder) as [string, any][]).map(([folder, count]) => {
                  const percent = Math.max(Math.round((Number(count) / maxFolderCount) * 100), 5);
                  return (
                    <div key={folder} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-300">{folder}</span>
                        <span className="font-mono text-slate-400">{count} notes</span>
                      </div>
                      <div className="w-full bg-slate-50 dark:bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-200/20 dark:border-white/5">
                        <div 
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tags Distribution */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/50 dark:border-white/5 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-indigo-500" />
              <span>{t('notesByTag')}</span>
            </h3>

            {Object.keys(stats.notesByTag || {}).length === 0 ? (
              <span className="text-xs text-slate-400 block py-6 text-center">No tags assigned yet.</span>
            ) : (
              <div className="space-y-3.5">
                {(Object.entries(stats.notesByTag) as [string, any][]).map(([tag, count]) => {
                  const percent = Math.max(Math.round((Number(count) / maxTagCount) * 100), 5);
                  return (
                    <div key={tag} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-300">#{tag}</span>
                        <span className="font-mono text-slate-400">{count} notes</span>
                      </div>
                      <div className="w-full bg-slate-50 dark:bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-200/20 dark:border-white/5">
                        <div 
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Most recently edited */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/50 dark:border-white/5 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-1.5">
            <Archive className="h-4 w-4 text-indigo-500" />
            <span>Recently Active Workspace Documents</span>
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {stats.recentNotes.map((note: any) => (
              <div 
                key={note.id} 
                onClick={() => navigate(`/note/${note.id}`)}
                className="py-3.5 flex items-center justify-between group cursor-pointer transition-colors"
              >
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {note.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span className="bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded-md border border-slate-100 dark:border-white/5">
                      {note.folder || 'Personal'}
                    </span>
                    <span>•</span>
                    <span>Edited {new Date(note.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
