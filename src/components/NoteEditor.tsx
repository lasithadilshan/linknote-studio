/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Note, EditorMode } from '../types';
import { calculateStats } from '../utils/textStats';
import { formatDateFull } from '../utils/dateUtils';
import { MarkdownPreview } from './MarkdownPreview';
import { Tag, X, FileText, Code, Clock, AlignLeft } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

interface NoteEditorProps {
  note: Note;
  onNoteChange: (updates: Partial<Note>) => void;
  editorMode: EditorMode;
  isFocusMode: boolean;
  onSelectionChange?: (selectedText: string) => void;
  externalContentUpdate?: {
    text: string;
    mode: 'replace' | 'insert' | 'append' | 'replace-selection';
    timestamp: number;
  } | null;
}

export function NoteEditor({
  note,
  onNoteChange,
  editorMode,
  isFocusMode,
  onSelectionChange,
  externalContentUpdate
}: NoteEditorProps) {
  const [localTitle, setLocalTitle] = useState(note.title);
  const [localContent, setLocalContent] = useState(note.content);
  const [localTags, setLocalTags] = useState<string[]>(note.tags || []);
  const [newTagText, setNewTagText] = useState('');

  // Track cursor position and selection range inside the textarea
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);

  // Sync state if loading a different note
  useEffect(() => {
    setLocalTitle(note.title);
    setLocalContent(note.content);
    setLocalTags(note.tags || []);
    setNewTagText('');
    setSelectionStart(0);
    setSelectionEnd(0);
    if (onSelectionChange) {
      onSelectionChange('');
    }
  }, [note.id]);

  // Handle incoming AI changes (replace, insert, append)
  useEffect(() => {
    if (!externalContentUpdate) return;

    const { text, mode } = externalContentUpdate;
    let newContent = localContent;

    if (mode === 'replace') {
      newContent = text;
    } else if (mode === 'insert' || mode === 'replace-selection') {
      newContent = localContent.substring(0, selectionStart) + text + localContent.substring(selectionEnd);
    } else if (mode === 'append') {
      newContent = localContent + (localContent ? '\n\n' : '') + text;
    }

    setLocalContent(newContent);
    onNoteChange({ content: newContent });
    
    // Clear selection state after operation
    setSelectionStart(0);
    setSelectionEnd(0);
    if (onSelectionChange) {
      onSelectionChange('');
    }
  }, [externalContentUpdate]);

  // Create debounced values for auto-saving
  const debouncedTitle = useDebounce(localTitle, 600);
  const debouncedContent = useDebounce(localContent, 600);
  const debouncedTags = useDebounce(localTags, 600);

  // Trigger parent update when debounced values change
  useEffect(() => {
    // Only trigger update if something actually changed compared to the current note in store
    const hasChanges =
      debouncedTitle !== note.title ||
      debouncedContent !== note.content ||
      JSON.stringify(debouncedTags) !== JSON.stringify(note.tags);

    if (hasChanges) {
      onNoteChange({
        title: debouncedTitle,
        content: debouncedContent,
        tags: debouncedTags,
      });
    }
  }, [debouncedTitle, debouncedContent, debouncedTags]);

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTag = newTagText.trim().toLowerCase();
    if (cleanTag && !localTags.includes(cleanTag)) {
      const updatedTags = [...localTags, cleanTag];
      setLocalTags(updatedTags);
      setNewTagText('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = localTags.filter((t) => t !== tagToRemove);
    setLocalTags(updatedTags);
  };

  // Compute stats on the current editor typing state in real-time
  const stats = calculateStats(localContent);

  return (
    <div id="note-editor-workspace" className="flex-1 flex flex-col min-h-0 bg-white/60 dark:bg-slate-900/30 border border-slate-200/50 dark:border-white/10 backdrop-blur-md rounded-3xl overflow-hidden transition-colors shadow-xs">
      
      {/* Note Metadata Header (Title, tags creation) - Hidden or minimized in focus mode */}
      {!isFocusMode && (
        <div className="p-5 border-b border-slate-200/50 dark:border-white/10 flex flex-col gap-4">
          
          {/* Note Title Input */}
          <input
            type="text"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            placeholder="Title your note..."
            className="w-full text-2xl font-bold tracking-tight font-display bg-transparent border-none focus:outline-hidden placeholder-slate-300 dark:placeholder-slate-700 text-slate-900 dark:text-slate-100"
          />

          {/* Tags management row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1 select-none">
              <Tag className="h-3 w-3" />
              Tags:
            </span>

            {localTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100/60 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}

            {/* Inline tag form */}
            <form onSubmit={handleAddTag} className="inline-flex items-center">
              <input
                type="text"
                value={newTagText}
                onChange={(e) => setNewTagText(e.target.value)}
                placeholder="Add tag..."
                className="px-2.5 py-1 border border-slate-200/60 dark:border-white/10 rounded-xl bg-transparent text-xs text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </form>
          </div>
        </div>
      )}

      {/* Main split editing workspace pane */}
      <div className="flex-1 flex min-h-0 divide-x divide-slate-200/50 dark:divide-white/10">
        
        {/* Editor Area (Visible in 'edit' or 'split') */}
        {(editorMode === 'edit' || editorMode === 'split') && (
          <div className="flex-1 flex flex-col h-full bg-transparent">
            {isFocusMode && (
              <div className="px-6 pt-5 pb-2 text-center text-xs text-slate-400 dark:text-slate-500 font-medium select-none uppercase tracking-widest border-b border-slate-200/40 dark:border-white/5">
                — Focus Mode Active —
              </div>
            )}
            
            <textarea
              value={localContent}
              onChange={(e) => {
                setLocalContent(e.target.value);
                setSelectionStart(e.target.selectionStart);
                setSelectionEnd(e.target.selectionEnd);
                if (onSelectionChange) {
                  onSelectionChange('');
                }
              }}
              onSelect={(e) => {
                const start = e.currentTarget.selectionStart;
                const end = e.currentTarget.selectionEnd;
                setSelectionStart(start);
                setSelectionEnd(end);
                if (onSelectionChange) {
                  onSelectionChange(e.currentTarget.value.substring(start, end));
                }
              }}
              onKeyUp={(e) => {
                const start = e.currentTarget.selectionStart;
                const end = e.currentTarget.selectionEnd;
                setSelectionStart(start);
                setSelectionEnd(end);
                if (onSelectionChange) {
                  onSelectionChange(e.currentTarget.value.substring(start, end));
                }
              }}
              onMouseUp={(e) => {
                const start = e.currentTarget.selectionStart;
                const end = e.currentTarget.selectionEnd;
                setSelectionStart(start);
                setSelectionEnd(end);
                if (onSelectionChange) {
                  onSelectionChange(e.currentTarget.value.substring(start, end));
                }
              }}
              placeholder="Start writing in markdown or plain text..."
              className={`w-full flex-1 p-6 bg-transparent border-none resize-none focus:outline-hidden text-slate-800 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-700 overflow-y-auto leading-relaxed ${
                note.isCode ? 'font-mono text-sm' : 'font-sans text-base'
              } ${isFocusMode ? 'max-w-3xl mx-auto text-lg' : ''}`}
            />
          </div>
        )}

        {/* Markdown compiler preview panel (Visible in 'preview' or 'split') */}
        {(editorMode === 'preview' || editorMode === 'split') && (
          <div className="flex-1 h-full overflow-y-auto bg-slate-500/5">
            {editorMode === 'split' && (
              <div className="px-5 py-3 border-b border-slate-200/50 dark:border-white/10 bg-white/30 dark:bg-slate-900/10 backdrop-blur-xs flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase select-none">
                <FileText className="h-3.5 w-3.5 text-indigo-500" />
                Live Markdown Compile View
              </div>
            )}
            <MarkdownPreview content={localContent} />
          </div>
        )}
      </div>

      {/* Editor Status/Metrics Footer */}
      <div className="px-5 py-3.5 bg-white/40 dark:bg-slate-900/40 border-t border-slate-200/50 dark:border-white/10 flex flex-wrap items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 gap-3 select-none">
        
        {/* Metric widgets */}
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5" title="Word count">
            <FileText className="h-3.5 w-3.5 text-slate-400" />
            <span>{stats.words} Words</span>
          </span>
          <span className="flex items-center gap-1.5" title="Character count">
            <AlignLeft className="h-3.5 w-3.5 text-slate-400" />
            <span>{stats.chars} Characters</span>
          </span>
          <span className="flex items-center gap-1.5" title="Line count">
            <Code className="h-3.5 w-3.5 text-slate-400" />
            <span>{stats.lines} Lines</span>
          </span>
          <span className="flex items-center gap-1.5" title="Estimated reading time">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>~{stats.readingTime} min read</span>
          </span>
        </div>

        {/* Date tracker */}
        <span className="text-[10px] uppercase text-slate-400 dark:text-slate-500 tracking-wider">
          Last Updated: {formatDateFull(note.updatedAt)}
        </span>
      </div>
    </div>
  );
}
