/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { noteStorage } from '../services/noteStorage';
import { useTheme } from '../hooks/useTheme';
import { useToast } from '../hooks/useToast';
import { Note } from '../types';
import { 
  Search, 
  Plus, 
  Moon, 
  Sun, 
  Cpu, 
  Download, 
  Upload, 
  FileText, 
  Eye, 
  Settings, 
  BookOpen, 
  Hash, 
  CornerDownLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export function CommandPalette() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const isNotePage = location.pathname.startsWith('/note/');

  // Toggle Command Palette with Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch notes when command palette opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
      noteStorage.getAllNotes().then(setNotes).catch(console.error);
      
      // Focus input after rendering
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Define commands
  const commands = [
    {
      id: 'create-note',
      title: 'Create New Note',
      subtitle: 'Build a fresh empty note in storage',
      icon: Plus,
      category: 'Actions',
      action: async () => {
        try {
          const created = await noteStorage.createNote();
          toast('Created new note!', 'success');
          navigate(`/note/${created.id}`);
        } catch (_) {
          toast('Failed to create note', 'error');
        }
      }
    },
    {
      id: 'toggle-theme',
      title: 'Toggle Color Theme',
      subtitle: `Switch current theme (currently ${theme})`,
      icon: theme === 'dark' ? Sun : Moon,
      category: 'Preferences',
      action: () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
        toast(`Switched theme to ${nextTheme}`, 'success');
      }
    },
    {
      id: 'open-settings',
      title: 'Open Settings Panel',
      subtitle: 'Configure visual styles and backup assets',
      icon: Settings,
      category: 'Navigation',
      action: () => navigate('/settings')
    },
    {
      id: 'open-about',
      title: 'Open About & Documentation',
      subtitle: 'Learn about serverless architecture and privacy parameters',
      icon: BookOpen,
      category: 'Navigation',
      action: () => navigate('/about')
    },
    // Note specific commands
    {
      id: 'toggle-ai',
      title: 'Toggle AI Copilot Panel',
      subtitle: 'Open AI prompts sidebar',
      icon: Cpu,
      category: 'Note Features',
      showOnlyOnNote: true,
      action: () => {
        window.dispatchEvent(new CustomEvent('linknote-toggle-ai'));
      }
    },
    {
      id: 'ai-summary',
      title: 'AI Action: Generate Summary',
      subtitle: 'Analyze note and write a short summary',
      icon: Sparkles,
      category: 'Note Features',
      showOnlyOnNote: true,
      action: () => {
        window.dispatchEvent(new CustomEvent('linknote-ai-summary'));
      }
    },
    {
      id: 'ai-improve',
      title: 'AI Action: Improve Clarity',
      subtitle: 'Rephrase sentences to maximize readability',
      icon: Sparkles,
      category: 'Note Features',
      showOnlyOnNote: true,
      action: () => {
        window.dispatchEvent(new CustomEvent('linknote-ai-improve'));
      }
    },
    {
      id: 'export-note',
      title: 'Export Current Note (.md)',
      subtitle: 'Download note content as local Markdown',
      icon: Download,
      category: 'Note Features',
      showOnlyOnNote: true,
      action: () => {
        window.dispatchEvent(new CustomEvent('linknote-export-note'));
      }
    },
    {
      id: 'toggle-preview',
      title: 'Toggle Markdown Preview',
      subtitle: 'Switch editor split / preview layouts',
      icon: Eye,
      category: 'Note Features',
      showOnlyOnNote: true,
      action: () => {
        window.dispatchEvent(new CustomEvent('linknote-toggle-preview'));
      }
    },
    {
      id: 'import-backup',
      title: 'Import Notes Backup File',
      subtitle: 'Restore note package collections',
      icon: Upload,
      category: 'Actions',
      action: () => {
        navigate('/settings');
        toast('Select "Storage & Data" tab to upload your backup.', 'info');
      }
    }
  ];

  // Filter commands and notes based on search query
  const query = searchQuery.toLowerCase().trim();

  const filteredCommands = commands.filter(cmd => {
    if (cmd.showOnlyOnNote && !isNotePage) return false;
    if (!query) return true;
    return (
      cmd.title.toLowerCase().includes(query) ||
      cmd.subtitle.toLowerCase().includes(query) ||
      cmd.category.toLowerCase().includes(query)
    );
  });

  const filteredNotes = notes.filter(note => {
    if (!query) return false; // only show notes if searching
    return (
      note.title.toLowerCase().includes(query) ||
      (note.content || '').toLowerCase().includes(query) ||
      (note.tags || []).some(t => t.toLowerCase().includes(query))
    );
  }).slice(0, 5); // limit to 5 matching notes

  // Combine items for navigation index
  const itemsList = [
    ...filteredCommands.map(c => ({ type: 'command' as const, data: c })),
    ...filteredNotes.map(n => ({ type: 'note' as const, data: n }))
  ];

  // Handle arrow key navigation and Enter selection
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, itemsList.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + itemsList.length) % Math.max(1, itemsList.length));
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (itemsList[selectedIndex]) {
          triggerAction(itemsList[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [isOpen, selectedIndex, itemsList]);

  // Ensure selected item is scrolled into view
  useEffect(() => {
    const activeEl = listRef.current?.querySelector('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const triggerAction = (item: typeof itemsList[0]) => {
    setIsOpen(false);
    if (item.type === 'command') {
      item.data.action();
    } else {
      navigate(`/note/${item.data.id}`);
      toast(`Navigated to: "${item.data.title}"`, 'success');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="command-palette-container" className="fixed inset-0 z-50 overflow-hidden flex items-start justify-center pt-[15vh] p-4">
          
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-sm"
          />

          {/* Palette Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative bg-white/95 dark:bg-slate-900/90 border border-slate-200/50 dark:border-white/10 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-xl max-h-[50vh] overflow-hidden flex flex-col z-50"
          >
            {/* Input Wrapper */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200/50 dark:border-white/10 shrink-0">
              <Search className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search notes or type commands (Ctrl+K)..."
                className="w-full bg-transparent text-slate-950 dark:text-white placeholder-slate-400 text-sm focus:outline-hidden"
              />
              <button
                onClick={() => setIsOpen(false)}
                className="px-1.5 py-0.5 border border-slate-200/50 dark:border-white/5 bg-slate-100/50 dark:bg-white/5 hover:bg-slate-150 rounded-md text-[10px] font-bold text-slate-400 dark:text-slate-500 transition-colors"
              >
                ESC
              </button>
            </div>

            {/* List results scroll container */}
            <div 
              ref={listRef}
              className="flex-1 overflow-y-auto p-2 scrollbar-thin space-y-3"
            >
              {itemsList.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                  No matching commands or notes found
                </div>
              ) : (
                <div className="space-y-1.5">
                  
                  {/* Categorized List */}
                  {/* Commands Group */}
                  {filteredCommands.length > 0 && (
                    <div className="space-y-1">
                      <div className="px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        System Commands
                      </div>
                      {filteredCommands.map((cmd, idx) => {
                        const globalIdx = idx;
                        const isActive = selectedIndex === globalIdx;
                        return (
                          <div
                            key={cmd.id}
                            onClick={() => triggerAction({ type: 'command', data: cmd })}
                            onMouseEnter={() => setSelectedIndex(globalIdx)}
                            data-active={isActive ? "true" : "false"}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                              isActive 
                                ? 'bg-indigo-600/10 dark:bg-indigo-500/15 border-l-2 border-indigo-600 text-slate-950 dark:text-white' 
                                : 'text-slate-600 dark:text-slate-400 border-l-2 border-transparent hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                            }`}
                          >
                            <div className="flex gap-3 items-center min-w-0">
                              <div className={`p-1.5 rounded-lg shrink-0 ${
                                isActive ? 'bg-indigo-500/20 text-indigo-500' : 'bg-slate-100 dark:bg-white/5 text-slate-400'
                              }`}>
                                <cmd.icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 leading-tight">
                                <h4 className="text-xs font-bold truncate">
                                  {cmd.title}
                                </h4>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                                  {cmd.subtitle}
                                </p>
                              </div>
                            </div>
                            {isActive && (
                              <div className="flex items-center gap-1 text-[10px] text-indigo-500 font-semibold animate-fade-in shrink-0">
                                <span>Run</span>
                                <CornerDownLeft className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Notes Group */}
                  {filteredNotes.length > 0 && (
                    <div className="space-y-1 pt-2">
                      <div className="px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Note Results ({filteredNotes.length})
                      </div>
                      {filteredNotes.map((note, idx) => {
                        const globalIdx = filteredCommands.length + idx;
                        const isActive = selectedIndex === globalIdx;
                        return (
                          <div
                            key={note.id}
                            onClick={() => triggerAction({ type: 'note', data: note })}
                            onMouseEnter={() => setSelectedIndex(globalIdx)}
                            data-active={isActive ? "true" : "false"}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                              isActive 
                                ? 'bg-indigo-600/10 dark:bg-indigo-500/15 border-l-2 border-indigo-600 text-slate-950 dark:text-white' 
                                : 'text-slate-600 dark:text-slate-400 border-l-2 border-transparent hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                            }`}
                          >
                            <div className="flex gap-3 items-center min-w-0">
                              <div className={`p-1.5 rounded-lg shrink-0 ${
                                isActive ? 'bg-indigo-500/20 text-indigo-500' : 'bg-slate-100 dark:bg-white/5 text-slate-400'
                              }`}>
                                <FileText className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 leading-tight">
                                <h4 className="text-xs font-bold truncate">
                                  {note.title || 'Untitled Note'}
                                </h4>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                                  {note.tags && note.tags.length > 0 
                                    ? note.tags.map(t => `#${t}`).join(' ') 
                                    : 'No tags'
                                  }
                                </p>
                              </div>
                            </div>
                            {isActive && (
                              <div className="flex items-center gap-1 text-[10px] text-indigo-500 font-semibold animate-fade-in shrink-0">
                                <span>Open</span>
                                <ChevronRight className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Footer with shortcut key references */}
            <div className="px-4 py-2 border-t border-slate-200/50 dark:border-white/10 shrink-0 bg-slate-50/50 dark:bg-slate-950/20 text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
              <div className="flex gap-3.5 select-none">
                <span><kbd className="bg-slate-100 dark:bg-white/5 px-1 py-0.5 rounded-sm border border-slate-200/50 dark:border-white/5 mr-1 font-mono">↑↓</kbd> Navigate</span>
                <span><kbd className="bg-slate-100 dark:bg-white/5 px-1 py-0.5 rounded-sm border border-slate-200/50 dark:border-white/5 mr-1 font-mono">Enter</kbd> Select</span>
                <span><kbd className="bg-slate-100 dark:bg-white/5 px-1 py-0.5 rounded-sm border border-slate-200/50 dark:border-white/5 mr-1 font-mono">Esc</kbd> Close</span>
              </div>
              <div className="font-semibold select-none">
                LinkNote Studio
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
