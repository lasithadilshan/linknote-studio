/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Note, EditorMode } from '../types';
import {
  ArrowLeft,
  CloudLightning,
  Cloud,
  FileDown,
  FileText,
  Upload,
  Lock,
  Unlock,
  Sparkles,
  Printer,
  Copy,
  Link2,
  Share2,
  Trash2,
  Monitor,
  Eye,
  Columns,
  Maximize2,
  Minimize2,
  Plus,
  Code2,
  MoreVertical,
  ChevronDown,
  History
} from 'lucide-react';

interface EditorToolbarProps {
  note: Note;
  saveStatus: 'saving' | 'saved' | 'error' | 'idle';
  editorMode: EditorMode;
  setEditorMode: (mode: EditorMode) => void;
  isFocusMode: boolean;
  setIsFocusMode: (focus: boolean) => void;
  onLockToggle: () => void;
  onClearContent: () => void;
  onDuplicate: () => void;
  onToggleCode: () => void;
  onCodeLanguageChange: (lang: string) => void;
  onExportMarkdown: () => void;
  onExportTxt: () => void;
  onImportFile: (file: File) => void;
  onCopyLocalLink: () => void;
  onGenerateShareLink: () => void;
  onPrint: () => void;
  onCreateNewNote: () => void;
  isAiOpen: boolean;
  setIsAiOpen: (open: boolean) => void;
  isHistoryOpen?: boolean;
  onToggleHistory?: () => void;
}

const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML/CSS' },
  { value: 'python', label: 'Python' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
  { value: 'cpp', label: 'C++' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'json', label: 'JSON' },
];

export function EditorToolbar({
  note,
  saveStatus,
  editorMode,
  setEditorMode,
  isFocusMode,
  setIsFocusMode,
  onLockToggle,
  onClearContent,
  onDuplicate,
  onToggleCode,
  onCodeLanguageChange,
  onExportMarkdown,
  onExportTxt,
  onImportFile,
  onCopyLocalLink,
  onGenerateShareLink,
  onPrint,
  onCreateNewNote,
  isAiOpen,
  setIsAiOpen,
  isHistoryOpen = false,
  onToggleHistory,
}: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsActionsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportFile(e.target.files[0]);
    }
  };

  return (
    <div id="editor-toolbar" className="flex flex-col gap-3 p-4 bg-white/60 dark:bg-slate-900/30 border border-slate-200/50 dark:border-white/10 backdrop-blur-md rounded-2xl shadow-xs transition-colors">
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top row: Navigation & Core status */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Link
            to="/"
            className="p-2 border border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold uppercase"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          {/* Save status notification badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200/50 dark:border-white/10 bg-white/20 dark:bg-white/5 select-none">
            {saveStatus === 'saving' && (
              <>
                <CloudLightning className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
                <span className="text-indigo-600 dark:text-indigo-400">Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <Cloud className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Saved</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <CloudLightning className="h-3.5 w-3.5 text-rose-500" />
                <span className="text-rose-600 dark:text-rose-400">Save Error</span>
              </>
            )}
            {saveStatus === 'idle' && (
              <>
                <Cloud className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-600" />
                <span className="text-zinc-500 dark:text-zinc-500">Unchanged</span>
              </>
            )}
          </div>
        </div>

        {/* Core page layouts & New buttons */}
        <div className="flex items-center gap-2">
          {/* Quick theme action layout selectors (Desktop-only) */}
          <div className="hidden lg:flex items-center gap-1 p-1 bg-white/35 dark:bg-white/5 rounded-xl border border-slate-200/40 dark:border-white/5">
            <button
              onClick={() => setEditorMode('edit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                editorMode === 'edit'
                  ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs border border-slate-200/30 dark:border-white/5'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              title="Editor View"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Write</span>
            </button>
            <button
              onClick={() => setEditorMode('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                editorMode === 'preview'
                  ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs border border-slate-200/30 dark:border-white/5'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              title="Markdown Document View"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setEditorMode('split')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                editorMode === 'split'
                  ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs border border-slate-200/30 dark:border-white/5'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              title="Split Code/Preview Layout"
            >
              <Columns className="h-3.5 w-3.5" />
              <span>Split</span>
            </button>
          </div>

          {/* Quick toggle mode for Mobile */}
          <button
            onClick={() => {
              if (editorMode === 'edit') setEditorMode('preview');
              else if (editorMode === 'preview') setEditorMode('split');
              else setEditorMode('edit');
            }}
            className="flex lg:hidden items-center gap-1 px-2.5 py-2 border border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-semibold cursor-pointer"
          >
            {editorMode === 'edit' && <FileText className="h-4 w-4 text-indigo-500" />}
            {editorMode === 'preview' && <Eye className="h-4 w-4 text-indigo-500" />}
            {editorMode === 'split' && <Columns className="h-4 w-4 text-indigo-500" />}
            <span>View</span>
          </button>

          {/* New note shortcut */}
          <button
            onClick={onCreateNewNote}
            className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer text-xs font-semibold uppercase px-3"
            title="Create brand new note"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Note</span>
          </button>
        </div>
      </div>

      {/* Second row: Rich Note Operations & file exports */}
      <div className="flex flex-wrap items-center justify-between border-t border-slate-200/50 dark:border-white/10 pt-3 gap-2">
        {/* Code View, Password Encryption, and Focus Toggles */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Encryption block */}
          <button
            onClick={onLockToggle}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
              note.isEncrypted
                ? 'bg-amber-500/10 border-amber-500/25 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/25 dark:text-amber-400'
                : 'bg-white/40 dark:bg-white/5 border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/10'
            }`}
          >
            {note.isEncrypted ? <Lock className="h-3.5 w-3.5 fill-amber-500/20" /> : <Unlock className="h-3.5 w-3.5" />}
            <span>{note.isEncrypted ? 'Note Locked' : 'Password Lock'}</span>
          </button>

          {/* Distraction free toggle */}
          <button
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
              isFocusMode
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white'
                : 'bg-white/40 dark:bg-white/5 border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/10'
            }`}
          >
            {isFocusMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            <span>Focus Mode</span>
          </button>

          {/* Version history toggle */}
          {onToggleHistory && (
            <button
              onClick={onToggleHistory}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                isHistoryOpen
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/15'
                  : 'bg-white/40 dark:bg-white/5 border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/10'
              }`}
              title="Toggle note version history snapshots"
            >
              <History className="h-3.5 w-3.5" />
              <span>History</span>
            </button>
          )}

          {/* Code switch */}
          <button
            onClick={onToggleCode}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
              note.isCode
                ? 'bg-indigo-500/10 border-indigo-500/25 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-500/25 dark:text-indigo-400'
                : 'bg-white/40 dark:bg-white/5 border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/10'
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>Developer Code</span>
          </button>

          {/* If code view, show language selection dropdown */}
          {note.isCode && (
            <div className="relative inline-flex items-center px-3 py-1 bg-white/40 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 shadow-xs">
              <span className="text-[10px] uppercase text-slate-400 dark:text-slate-500 mr-1 select-none">Lang:</span>
              <select
                value={note.codeLanguage}
                onChange={(e) => onCodeLanguageChange(e.target.value)}
                className="bg-transparent text-slate-700 dark:text-slate-200 focus:outline-hidden font-mono text-[11px] font-medium cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Share buttons, imports, and extra dropdown operations */}
        <div className="flex items-center gap-2">
          {/* Quick share snapshot */}
          <button
            onClick={onGenerateShareLink}
            className="px-3 py-1.5 bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Create offline immutable snapshot share link"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share Snapshot</span>
          </button>

          {/* AI Copilot toggle button */}
          <button
            onClick={() => setIsAiOpen(!isAiOpen)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all ${
              isAiOpen
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-500/20 hover:bg-indigo-100/60 dark:hover:bg-indigo-950/40'
            }`}
            title="Toggle AI Copilot panel (Ctrl+Shift+A)"
          >
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-indigo-500 dark:text-indigo-400" />
            <span>AI Copilot</span>
          </button>

          {/* Quick copy URL */}
          <button
            onClick={onCopyLocalLink}
            className="p-1.5 border border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl transition-all cursor-pointer"
            title="Copy local browser editable URL link"
          >
            <Link2 className="h-4 w-4" />
          </button>

          {/* Actions Dropdown for files down/import/print/etc */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsActionsDropdownOpen(!isActionsDropdownOpen)}
              className="p-1.5 border border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl transition-all flex items-center gap-0.5 cursor-pointer"
              title="More operations"
            >
              <MoreVertical className="h-4 w-4" />
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {isActionsDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white/95 dark:bg-slate-900/90 border border-slate-200/50 dark:border-white/10 backdrop-blur-lg rounded-xl shadow-xl z-50 overflow-hidden flex flex-col p-1">
                <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none">
                  File Operations
                </div>
                <button
                  onClick={() => {
                    setIsActionsDropdownOpen(false);
                    onExportMarkdown();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-white/10 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <FileDown className="h-4 w-4 text-indigo-500" />
                  Download Markdown (.md)
                </button>
                <button
                  onClick={() => {
                    setIsActionsDropdownOpen(false);
                    onExportTxt();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-white/10 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="h-4 w-4 text-emerald-500" />
                  Download Plain Text (.txt)
                </button>
                <button
                  onClick={() => {
                    setIsActionsDropdownOpen(false);
                    fileInputRef.current?.click();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-white/10 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="h-4 w-4 text-orange-500" />
                  Import Content File
                </button>

                <div className="h-px bg-slate-200/50 dark:bg-white/10 my-1" />
                <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none">
                  Note Management
                </div>
                <button
                  onClick={() => {
                    setIsActionsDropdownOpen(false);
                    onDuplicate();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-white/10 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <Copy className="h-4 w-4 text-sky-500" />
                  Duplicate Note
                </button>
                <button
                  onClick={() => {
                    setIsActionsDropdownOpen(false);
                    onPrint();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-white/10 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="h-4 w-4 text-indigo-500" />
                  Print Note
                </button>
                <button
                  onClick={() => {
                    setIsActionsDropdownOpen(false);
                    onClearContent();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 dark:hover:bg-rose-950/20 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear Note Content
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
