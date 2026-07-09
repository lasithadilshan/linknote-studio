/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { AISettingsModal } from '../components/ai/AISettingsModal';
import { ImportExportPanel } from '../components/ImportExportPanel';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useTheme } from '../hooks/useTheme';
import { noteStorage } from '../services/noteStorage';
import { useToast } from '../hooks/useToast';
import { 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Laptop, 
  Trash2, 
  Database, 
  Layers, 
  CheckCircle2, 
  FileJson, 
  Cpu,
  RefreshCw
} from 'lucide-react';

export function SettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  // State
  const [activeTab, setActiveTab] = useState<'ai' | 'appearance' | 'storage'>('ai');
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [stats, setStats] = useState({ count: 0, sizeKb: 0, lastUpdated: 'Never' });
  const [loadingStats, setLoadingStats] = useState(false);

  // Load storage stats
  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const allNotes = await noteStorage.getAllNotes();
      let totalChars = 0;
      let newestDate = 0;
      
      allNotes.forEach(n => {
        totalChars += (n.content || '').length;
        totalChars += (n.title || '').length;
        if (n.tags) totalChars += n.tags.join('').length;
        
        const updateTime = new Date(n.updatedAt).getTime();
        if (updateTime > newestDate) newestDate = updateTime;
      });

      const sizeKb = Math.round((totalChars * 2) / 1024 * 10) / 10; // estimate 2 bytes per char
      
      setStats({
        count: allNotes.length,
        sizeKb,
        lastUpdated: newestDate > 0 ? new Date(newestDate).toLocaleDateString() : 'Never'
      });
    } catch (err) {
      console.error('Failed to load storage stats', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleClearAllNotes = async () => {
    try {
      await noteStorage.clearAllNotes();
      toast('All notes have been cleared successfully.', 'success');
      setIsConfirmClearOpen(false);
      loadStats();
    } catch (err) {
      toast('Failed to clear notes.', 'error');
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation / Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="p-2 border border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold uppercase"
          >
            <ArrowLeft className="h-4 w-4" />
            Workspace
          </button>
          
          <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-3.5 py-1.5 rounded-full select-none">
            <Layers className="h-3.5 w-3.5 text-indigo-500" />
            System Control Panel
          </span>
        </div>

        {/* Page Title Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl space-y-2 shadow-sm">
          <h1 className="text-2xl font-extrabold tracking-tight font-display text-slate-950 dark:text-slate-50">
            System Settings
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Configure system capabilities, custom AI providers, visual styling themes, and local browser data backups.
          </p>
        </div>

        {/* Segmented Navigation Tabs */}
        <div className="flex border border-slate-200 dark:border-slate-800 gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl max-w-md">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-2 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            AI Copilot
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex-1 py-2 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer ${
              activeTab === 'appearance'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Appearance
          </button>
          <button
            onClick={() => setActiveTab('storage')}
            className={`flex-1 py-2 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer ${
              activeTab === 'storage'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Storage & Data
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl min-h-[300px] shadow-sm">
          
          {/* AI Tab */}
          {activeTab === 'ai' && (
            <div className="space-y-4 animate-fade-in">
              <div className="pb-4 border-b border-slate-200/50 dark:border-white/10">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-display flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-indigo-500" />
                  AI Settings
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Connect your notepad directly to Google Gemini, Groq, OpenRouter, or a custom local Ollama API server.
                </p>
              </div>
              <AISettingsModal embedMode={true} />
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-fade-in">
              <div className="pb-4 border-b border-slate-200/50 dark:border-white/10">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-display flex items-center gap-2">
                  <Sun className="h-5 w-5 text-indigo-500" />
                  Appearance & Themes
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Adjust visual styles and interface themes for LinkNote Studio.
                </p>
              </div>

              {/* Theme Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Light Option */}
                <button
                  onClick={() => {
                    setTheme('light');
                    toast('Light theme enabled!', 'success');
                  }}
                  className={`flex flex-col items-start p-5 border rounded-2xl transition-all cursor-pointer text-left ${
                    theme === 'light'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-indigo-500/30 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl mb-3">
                    <Sun className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Light Mode</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                    Crisp off-whites and dark charcoal typography. Optimal for sunny environments.
                  </p>
                </button>

                {/* Dark Option */}
                <button
                  onClick={() => {
                    setTheme('dark');
                    toast('Dark theme enabled!', 'success');
                  }}
                  className={`flex flex-col items-start p-5 border rounded-2xl transition-all cursor-pointer text-left ${
                    theme === 'dark'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-indigo-500/30 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="p-2 bg-indigo-500/15 text-indigo-400 rounded-xl mb-3">
                    <Moon className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Dark Mode</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                    Deep slate tones and ambient visual highlights. Smooth on the eyes during late-night hacking.
                  </p>
                </button>

                {/* System Option */}
                <button
                  onClick={() => {
                    setTheme('system');
                    toast('System theme preference enabled!', 'success');
                  }}
                  className={`flex flex-col items-start p-5 border rounded-2xl transition-all cursor-pointer text-left ${
                    theme === 'system'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-indigo-500/30 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="p-2 bg-slate-500/15 text-slate-500 rounded-xl mb-3">
                    <Laptop className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">System Preference</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                    Synchronize theme with your operating system or browser level developer overrides.
                  </p>
                </button>

              </div>
            </div>
          )}

          {/* Storage & Data Tab */}
          {activeTab === 'storage' && (
            <div className="space-y-6 animate-fade-in">
              <div className="pb-4 border-b border-slate-200/50 dark:border-white/10 flex justify-between items-end">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-display flex items-center gap-2">
                    <Database className="h-5 w-5 text-indigo-500" />
                    Storage & Backups
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Manage your offline-first IndexedDB database data packages and local storage assets.
                  </p>
                </div>
                <button
                  onClick={loadStats}
                  disabled={loadingStats}
                  className="p-2 border border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-white/5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title="Reload storage stats"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingStats ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Stats Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                    Note Count
                  </div>
                  <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-display mt-1">
                    {stats.count}
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1">
                    Total saved items in IndexDB
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                    Estimated Size
                  </div>
                  <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-display mt-1">
                    {stats.sizeKb} <span className="text-xs font-normal text-slate-400">KB</span>
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1">
                    Calculated payload size
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                    Last Modified
                  </div>
                  <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-display mt-1 truncate text-lg sm:text-2xl">
                    {stats.lastUpdated}
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1">
                    Newest update time stamp
                  </div>
                </div>
              </div>

              {/* Import/Export embedded */}
              <div className="pt-2">
                <ImportExportPanel onImportComplete={loadStats} />
              </div>

              {/* Reset Section */}
              <div className="p-5 border border-rose-500/15 bg-rose-500/[0.02] rounded-3xl space-y-3">
                <div className="flex gap-3.5 items-start">
                  <Trash2 className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 flex-1">
                    <h5 className="font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide text-xs">
                      Danger Zone: Permanent Reset
                    </h5>
                    <p className="mt-1">
                      Wipe the local LinkNote database completely. This action cannot be undone, and will permanently destroy all text notes, encryption salts, password configurations, and metadata.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsConfirmClearOpen(true)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wide rounded-xl shadow-lg shadow-rose-600/10 transition-all hover:scale-[1.01] cursor-pointer"
                  >
                    Clear All Notes
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Confirmation Dialog for Clearing All Notes */}
      <ConfirmDialog
        isOpen={isConfirmClearOpen}
        title="Wipe Entire Database?"
        message="Are you absolutely sure you want to delete ALL notes? This action is completely irreversible and will permanently wipe your IndexedDB local note workspace. Please download a backup first if you have any important information."
        confirmText="Yes, Wipe Database"
        cancelText="Cancel"
        onConfirm={handleClearAllNotes}
        onCancel={() => setIsConfirmClearOpen(false)}
      />
    </AppLayout>
  );
}
