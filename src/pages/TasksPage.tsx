/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { noteStorage } from '../services/noteStorage';
import { useTranslation } from '../i18n/i18n';
import { useToast } from '../hooks/useToast';
import { 
  CheckSquare, 
  Square, 
  ListTodo, 
  Filter, 
  Folder, 
  Tag, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { motion } from 'motion/react';

export function TasksPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [folderFilter, setFolderFilter] = useState<string>('All Folders');
  const [tagFilter, setTagFilter] = useState<string>('All Tags');

  // Load Tasks
  const loadTasks = async () => {
    try {
      const allTasks = await noteStorage.getTaskItems();
      setTasks(allTasks);
    } catch (err) {
      toast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Compute Folders & Tags for filtering
  const { folders, tags } = useMemo(() => {
    const foldersSet = new Set<string>();
    const tagsSet = new Set<string>();
    
    tasks.forEach(t => {
      if (t.folder) foldersSet.add(t.folder);
      if (Array.isArray(t.tags)) {
        t.tags.forEach((tag: string) => {
          if (tag) tagsSet.add(tag);
        });
      }
    });

    return {
      folders: ['All Folders', ...Array.from(foldersSet).sort()],
      tags: ['All Tags', ...Array.from(tagsSet).sort()]
    };
  }, [tasks]);

  // Apply Filtering
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // 1. Status Filter
      if (statusFilter === 'pending' && task.completed) return false;
      if (statusFilter === 'completed' && !task.completed) return false;

      // 2. Folder Filter
      if (folderFilter !== 'All Folders' && task.folder !== folderFilter) return false;

      // 3. Tag Filter
      if (tagFilter !== 'All Tags' && (!task.tags || !task.tags.includes(tagFilter))) return false;

      return true;
    });
  }, [tasks, statusFilter, folderFilter, tagFilter]);

  // Group filtered tasks by note title
  const groupedTasks = useMemo(() => {
    const groups: Record<string, { noteId: string; folder: string; tasks: any[] }> = {};
    filteredTasks.forEach(task => {
      if (!groups[task.noteTitle]) {
        groups[task.noteTitle] = {
          noteId: task.noteId,
          folder: task.folder,
          tasks: []
        };
      }
      groups[task.noteTitle].tasks.push(task);
    });
    return groups;
  }, [filteredTasks]);

  // Statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, completionRate };
  }, [tasks]);

  // Toggle Task Completion
  const handleToggleTask = async (noteId: string, taskIndex: number, currentStatus: boolean) => {
    try {
      // Update locally first for snappiness
      setTasks(prev => prev.map(t => {
        if (t.noteId === noteId && t.index === taskIndex) {
          return { ...t, completed: !currentStatus };
        }
        return t;
      }));

      await noteStorage.updateTaskStatus(noteId, taskIndex, !currentStatus);
      toast('Task updated successfully', 'success');
    } catch (err) {
      toast('Failed to update task', 'error');
      loadTasks(); // rollback
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/60 dark:border-slate-850">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white flex items-center gap-2.5">
              <ListTodo className="h-8 w-8 text-indigo-500" />
              <span>{t('tasks')}</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl leading-relaxed">
              Scan, organize, and check off actionable tasks extracted from your active notes in real-time.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/50 dark:border-white/5 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              {t('totalTasks')}
            </span>
            <span className="text-2xl font-black font-display text-slate-900 dark:text-white mt-1 block">
              {stats.total}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/50 dark:border-white/5 shadow-xs">
            <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-widest block">
              {t('completedTasks')}
            </span>
            <span className="text-2xl font-black font-display text-emerald-600 dark:text-emerald-400 mt-1 block">
              {stats.completed}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/50 dark:border-white/5 shadow-xs">
            <span className="text-[10px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-widest block">
              {t('pendingTasks')}
            </span>
            <span className="text-2xl font-black font-display text-amber-600 dark:text-amber-400 mt-1 block">
              {stats.pending}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/50 dark:border-white/5 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block">
                {t('completionRate')}
              </span>
              <span className="text-2xl font-black font-display text-indigo-600 dark:text-indigo-400 mt-1 block">
                {stats.completionRate}%
              </span>
            </div>
            {/* Simple progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden mt-3">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/50 dark:border-white/5 flex flex-wrap items-center gap-4 shadow-2xs">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
              Filter:
            </span>
          </div>

          {/* Status buttons */}
          <div className="flex gap-1.5 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl">
            {(['all', 'pending', 'completed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  statusFilter === f 
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Folder Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/30 dark:border-white/5 px-3 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-300">
            <Folder className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={folderFilter}
              onChange={(e) => setFolderFilter(e.target.value)}
              className="bg-transparent focus:outline-hidden font-medium cursor-pointer"
            >
              <option value="All Folders">All Folders</option>
              {folders.filter(f => f !== 'All Folders').map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Tag Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/30 dark:border-white/5 px-3 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-300">
            <Tag className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="bg-transparent focus:outline-hidden font-medium cursor-pointer"
            >
              <option value="All Tags">All Tags</option>
              {tags.filter(t => t !== 'All Tags').map(t => (
                <option key={t} value={t}>#{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading / Tasks Render */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-white/5">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">
              Analyzing Task List...
            </span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200/50 dark:border-white/5 text-center max-w-xl mx-auto space-y-4">
            <div className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500">
              <ClipboardList className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
              {t('noTasksFound')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('noTasksDescription')}
            </p>
          </div>
        ) : Object.keys(groupedTasks).length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 border border-slate-200/50 dark:border-white/5 text-center text-slate-500 dark:text-slate-400 text-xs">
            No matching tasks found for the current filter settings.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTasks).map(([noteTitle, group]) => (
              <motion.div 
                layout
                key={noteTitle} 
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-white/5 overflow-hidden shadow-xs"
              >
                {/* Note title group header */}
                <div 
                  onClick={() => navigate(`/note/${group.noteId}`)}
                  className="bg-slate-50 dark:bg-slate-950/50 px-6 py-4 border-b border-slate-200/50 dark:border-white/5 flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 bg-slate-200/60 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-md uppercase tracking-wider">
                      {group.folder}
                    </span>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {noteTitle}
                    </h3>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>

                {/* Checklist items list */}
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {group.tasks.map((task) => (
                    <div 
                      key={`${task.noteId}-${task.index}`} 
                      className={`px-6 py-4 flex items-start gap-3 transition-colors ${
                        task.completed ? 'bg-slate-50/30 dark:bg-slate-950/10' : 'hover:bg-slate-50/50 dark:hover:bg-white/1'
                      }`}
                    >
                      <button 
                        onClick={() => handleToggleTask(task.noteId, task.index, task.completed)}
                        className="mt-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                      >
                        {task.completed ? (
                          <CheckSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>
                      <span 
                        className={`text-sm font-medium break-words max-w-full ${
                          task.completed 
                            ? 'text-slate-400 line-through' 
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {task.text}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </AppLayout>
  );
}
