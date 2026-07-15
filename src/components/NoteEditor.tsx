/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Note, EditorMode } from '../types';
import { noteStorage } from '../services/noteStorage';
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

  // Wiki links autocomplete states
  const [allNoteTitles, setAllNoteTitles] = useState<string[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestQuery, setSuggestQuery] = useState('');
  const [suggestIndex, setSuggestIndex] = useState(0);

  // Sync state if loading a different note
  useEffect(() => {
    setLocalTitle(note.title);
    setLocalContent(note.content);
    setLocalTags(note.tags || []);
    setNewTagText('');
    setSelectionStart(0);
    setSelectionEnd(0);
    setShowSuggest(false);
    if (onSelectionChange) {
      onSelectionChange('');
    }
  }, [note.id]);

  // Load all note titles for autocompletion
  useEffect(() => {
    async function loadTitles() {
      try {
        const notes = await noteStorage.getAllNotes();
        setAllNoteTitles(notes.map(n => n.title));
      } catch (err) {
        console.error('Failed to load note titles for wiki-link autocompletion', err);
      }
    }
    loadTitles();
  }, [note.id]);

  const filteredSuggestions = allNoteTitles.filter(title =>
    title.toLowerCase().includes(suggestQuery.toLowerCase()) && title !== note.title
  );

  const handleSelectSuggestion = (selectedTitle: string) => {
    const textBeforeBracket = localContent.substring(0, localContent.substring(0, selectionStart).lastIndexOf('[[')) + '[[';
    const textAfterCursor = localContent.substring(selectionStart);
    const completedLink = textBeforeBracket + selectedTitle + ']]' + textAfterCursor;

    setLocalContent(completedLink);
    onNoteChange({ content: completedLink });
    setShowSuggest(false);

    // Refocus and place cursor after the closed brackets
    setTimeout(() => {
      const textarea = document.getElementById('note-textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
        const newCursorPos = textBeforeBracket.length + selectedTitle.length + 2;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 50);
  };

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

  const handleContentChange = (val: string, cursor: number) => {
    setLocalContent(val);

    // Check if we are typing a wiki link
    const textBeforeCursor = val.substring(0, cursor);
    const lastOpenBracket = textBeforeCursor.lastIndexOf('[[');

    if (lastOpenBracket !== -1 && lastOpenBracket >= textBeforeCursor.lastIndexOf(']]')) {
      const query = textBeforeCursor.substring(lastOpenBracket + 2);
      setSuggestQuery(query);
      setShowSuggest(true);
      setSuggestIndex(0);
    } else {
      setShowSuggest(false);
    }
  };

  // Compute stats on the current editor typing state in real-time
  const stats = calculateStats(localContent);

  return (
    <div id="note-editor-workspace" className="flex-1 flex flex-col min-h-[500px] md:h-[calc(100vh-14rem)] md:min-h-[550px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
      
      {/* Note Metadata Header (Title, tags creation) - Hidden or minimized in focus mode */}
      {!isFocusMode && (
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-850 flex flex-col gap-4">
          
          {/* Note Title Input & Folder Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <input
              type="text"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              placeholder="Title your note..."
              className="flex-1 text-2xl font-bold tracking-tight font-display bg-transparent border-none focus:outline-hidden placeholder-slate-300 dark:placeholder-slate-700 text-slate-950 dark:text-slate-50"
            />
            
            {/* Folder Dropdown Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest select-none">
                Folder:
              </span>
              <select
                value={note.folder || 'Personal'}
                onChange={(e) => onNoteChange({ folder: e.target.value })}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              >
                {['Personal', 'Work', 'Study', 'Projects', 'Ideas', 'Archive'].map((folder) => (
                  <option key={folder} value={folder}>
                    {folder}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags management row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5 select-none">
              <Tag className="h-3.5 w-3.5" />
              Tags:
            </span>

            {localTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-semibold"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-750 rounded-full transition-colors cursor-pointer"
                  aria-label={`Remove tag ${tag}`}
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
                className="px-3 py-1 border border-slate-200 dark:border-slate-800 rounded-full bg-transparent text-xs text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-colors"
              />
            </form>
          </div>
        </div>
      )}

      {/* Main split editing workspace pane */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-850">
        
        {/* Editor Area (Visible in 'edit' or 'split') */}
        {(editorMode === 'edit' || editorMode === 'split') && (
          <div className="flex-1 flex flex-col h-full bg-transparent min-w-0 relative">
            {isFocusMode && (
              <div className="px-6 pt-5 pb-2 text-center text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest border-b border-slate-100 dark:border-slate-850">
                — Focus Mode Active —
              </div>
            )}

            <textarea
              id="note-textarea"
              value={localContent}
              onChange={(e) => {
                handleContentChange(e.target.value, e.target.selectionStart);
                setSelectionStart(e.target.selectionStart);
                setSelectionEnd(e.target.selectionEnd);
                if (onSelectionChange) {
                  onSelectionChange('');
                }
              }}
              onKeyDown={(e) => {
                if (showSuggest && filteredSuggestions.length > 0) {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSuggestIndex(prev => (prev + 1) % filteredSuggestions.length);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSuggestIndex(prev => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
                  } else if (e.key === 'Enter' || e.key === 'Tab') {
                    e.preventDefault();
                    handleSelectSuggestion(filteredSuggestions[suggestIndex]);
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    setShowSuggest(false);
                  }
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
              className={`w-full flex-1 p-5 sm:p-6 bg-transparent border-none resize-none focus:outline-hidden text-slate-800 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-700 overflow-y-auto leading-relaxed ${
                note.isCode ? 'font-mono text-sm' : 'font-sans text-base'
              } ${isFocusMode ? 'max-w-3xl mx-auto text-lg' : ''}`}
            />

            {/* Wiki-links autocomplete suggestion box */}
            {showSuggest && filteredSuggestions.length > 0 && (
              <div className="absolute left-6 bottom-16 max-w-[320px] w-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 backdrop-blur-md">
                <div className="px-3 py-1.5 text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest select-none bg-slate-50/50 dark:bg-slate-950/45">
                  Wiki-Link Suggestions (Enter/Tab)
                </div>
                <div className="max-h-48 overflow-y-auto p-1 space-y-0.5">
                  {filteredSuggestions.map((title, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSuggestion(title)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                        idx === suggestIndex
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-white/5'
                      }`}
                    >
                      <span className="truncate mr-2">{title}</span>
                      <span className="text-[10px] opacity-60 font-mono shrink-0">[[...]]</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Markdown compiler preview panel (Visible in 'preview' or 'split') */}
        {(editorMode === 'preview' || editorMode === 'split') && (
          <div className="flex-1 h-full overflow-y-auto bg-slate-500/[0.02] min-w-0">
            {editorMode === 'split' && (
              <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-850 bg-white/50 dark:bg-slate-900/50 flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase select-none">
                <FileText className="h-4 w-4 text-indigo-500" />
                Live Markdown Compile View
              </div>
            )}
            <MarkdownPreview content={localContent} />
          </div>
        )}
      </div>

      {/* Editor Status/Metrics Footer */}
      <div className="px-5 py-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-850 flex flex-wrap items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 gap-4 select-none">
        
        {/* Metric widgets */}
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5" title="Word count">
            <FileText className="h-4 w-4 text-slate-400" />
            <span>{stats.words} Words</span>
          </span>
          <span className="flex items-center gap-1.5" title="Character count">
            <AlignLeft className="h-4 w-4 text-slate-400" />
            <span>{stats.chars} Characters</span>
          </span>
          <span className="flex items-center gap-1.5" title="Line count">
            <Code className="h-4 w-4 text-slate-400" />
            <span>{stats.lines} Lines</span>
          </span>
          <span className="flex items-center gap-1.5" title="Estimated reading time">
            <Clock className="h-4 w-4 text-slate-400" />
            <span>~{stats.readingTime} Min Read</span>
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
