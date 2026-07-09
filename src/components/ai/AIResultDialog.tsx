/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  CornerDownLeft, 
  Plus, 
  FileEdit, 
  FilePlus, 
  ChevronRight,
  Heading,
  Tag,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { MarkdownPreview } from '../MarkdownPreview';

interface AIResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resultText: string;
  templateId: string;
  templateName: string;
  
  // Callbacks for applying result to the current note
  onReplaceContent: (newContent: string) => void;
  onInsertAtCursor: (textToInsert: string) => void;
  onAppendContent: (textToAppend: string) => void;
  onSaveAsNewNote: (title: string, content: string, tags?: string[]) => void;
  onApplyTitleAndTags: (title?: string, tags?: string[]) => void;
}

export function AIResultDialog({
  isOpen,
  onClose,
  resultText,
  templateId,
  templateName,
  onReplaceContent,
  onInsertAtCursor,
  onAppendContent,
  onSaveAsNewNote,
  onApplyTitleAndTags
}: AIResultDialogProps) {
  const [copied, setCopied] = useState(false);
  
  // For title/tag generation state
  const [selectedTitle, setSelectedTitle] = useState('');
  const [parsedTitles, setParsedTitles] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInputText, setTagInputText] = useState('');

  const isTitleGeneration = templateId === 'generate_better_title';
  const isTagGeneration = templateId === 'suggest_tags';
  const isTitleOrTagAction = isTitleGeneration || isTagGeneration;

  // Process the result text for titles and tags
  useEffect(() => {
    if (isTitleGeneration) {
      // Extract titles. Usually numbered like 1. Title, or on separate lines
      const lines = resultText
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0)
        .map(l => {
          // Remove numbering e.g. "1. " or "1) " or "- "
          return l.replace(/^(?:\d+[\.\)]\s*|[-*+]\s*)/, '').trim().replace(/^["']|["']$/g, '');
        })
        .filter(l => l.length > 0 && !l.toLowerCase().includes('here are') && !l.toLowerCase().includes('title suggestions'));
      
      setParsedTitles(lines.slice(0, 5));
      if (lines.length > 0) {
        setSelectedTitle(lines[0]);
      }
    } else if (isTagGeneration) {
      // Extract comma-separated tags
      const cleanText = resultText.replace(/^(?:tags|suggested tags|here are some tags)[:\s]*/i, '');
      const tags = cleanText
        .split(/[\s,]+/)
        .map(t => t.trim().toLowerCase().replace(/^[#\.,\s]+|[#\.,\s]+$/g, ''))
        .filter(t => t.length > 0 && t.length < 25 && !t.includes('here') && !t.includes('suggested'));
      
      const uniqueTags = Array.from(new Set(tags)).slice(0, 10);
      setSuggestedTags(uniqueTags);
      setSelectedTags(uniqueTags);
    }
  }, [resultText, isTitleGeneration, isTagGeneration]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleApplyTitleAndTags = () => {
    if (isTitleGeneration) {
      if (!selectedTitle) return;
      onApplyTitleAndTags(selectedTitle, undefined);
    } else if (isTagGeneration) {
      onApplyTitleAndTags(undefined, selectedTags);
    }
    onClose();
  };

  const handleSaveTitleTagsAsNewNote = () => {
    if (isTitleGeneration) {
      onSaveAsNewNote(selectedTitle || 'New AI Note', '# ' + selectedTitle + '\n\nAdd content here...');
    } else if (isTagGeneration) {
      onSaveAsNewNote('Tagged Note', '# Tagged Note\n\nNote with tags: ' + selectedTags.join(', '), selectedTags);
    }
    onClose();
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = tagInputText.trim().toLowerCase();
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
      if (!suggestedTags.includes(tag)) {
        setSuggestedTags([...suggestedTags, tag]);
      }
      setTagInputText('');
    }
  };

  const toggleTagSelection = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div id="ai-result-dialog" className="fixed inset-0 z-55 overflow-hidden flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-md"
      />
      
      {/* Dialog box wrapper */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col z-50 animate-spring-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/50 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">AI Response Generated</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-display">
                {templateName}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Main customized layout for Titles and Tags */}
          {isTitleOrTagAction ? (
            <div className="space-y-6">
              
              {/* Title Generation custom UI */}
              {isTitleGeneration && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                    <Heading className="h-4.5 w-4.5 text-indigo-500" />
                    Select a Title to Apply
                  </div>
                  
                  <div className="grid gap-2.5">
                    {parsedTitles.length > 0 ? (
                      parsedTitles.map((title, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedTitle(title)}
                          className={`w-full p-4 text-left border rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3 text-sm font-medium ${
                            selectedTitle === title
                              ? 'border-indigo-500 bg-indigo-500/5 text-indigo-900 dark:text-indigo-300 ring-2 ring-indigo-500/10'
                              : 'border-slate-200/60 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-400'
                          }`}
                        >
                          <span className="line-clamp-2">{title}</span>
                          <span className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0 ${
                            selectedTitle === title 
                              ? 'border-indigo-500 bg-indigo-500 text-white' 
                              : 'border-slate-300 dark:border-slate-700'
                          }`}>
                            {selectedTitle === title && <Check className="h-3 w-3" />}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="text-xs text-slate-400 italic">No formatted title recommendations could be parsed. See raw text below.</div>
                    )}
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                      Or edit chosen title manually:
                    </label>
                    <input
                      type="text"
                      value={selectedTitle}
                      onChange={(e) => setSelectedTitle(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              )}

              {/* Tag Generation custom UI */}
              {isTagGeneration && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                    <Tag className="h-4.5 w-4.5 text-indigo-500" />
                    Select Suggested Tags to Apply
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {suggestedTags.length > 0 ? (
                      suggestedTags.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            onClick={() => toggleTagSelection(tag)}
                            className={`px-3 py-1.5 border rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                : 'bg-transparent border-slate-200/60 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/10'
                            }`}
                          >
                            <span>{tag}</span>
                            <span className={`h-3 w-3 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 dark:border-slate-700'
                            }`}>
                              {isSelected && <Check className="h-2 w-2" />}
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <div className="text-xs text-slate-400 italic">No formatted tags could be parsed. See raw text below.</div>
                    )}
                  </div>

                  {/* Add dynamic custom tags input */}
                  <form onSubmit={handleAddCustomTag} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Add custom tag..."
                      value={tagInputText}
                      onChange={(e) => setTagInputText(e.target.value)}
                      className="flex-1 max-w-xs px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl cursor-pointer"
                    >
                      Add
                    </button>
                  </form>
                </div>
              )}

              {/* Collapsible raw AI output container */}
              <details className="group border border-slate-200/50 dark:border-white/5 rounded-2xl overflow-hidden">
                <summary className="px-4 py-3 bg-slate-50/50 dark:bg-slate-900/10 hover:bg-slate-50 dark:hover:bg-white/5 text-xs text-slate-500 dark:text-slate-400 font-semibold cursor-pointer list-none flex items-center justify-between select-none">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    View Raw AI Suggestions
                  </span>
                  <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                </summary>
                <div className="p-4 border-t border-slate-200/40 dark:border-white/5 text-xs font-mono whitespace-pre-wrap text-slate-600 dark:text-slate-300 bg-slate-500/5 max-h-40 overflow-y-auto">
                  {resultText}
                </div>
              </details>

            </div>
          ) : (
            /* Normal Text generation content */
            <div className="space-y-4">
              <div className="border border-slate-200/50 dark:border-white/10 rounded-2xl bg-slate-500/5 overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-100/50 dark:bg-slate-900/30 border-b border-slate-200/50 dark:border-white/5 flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Markdown Compile Preview</span>
                  <button 
                    onClick={handleCopy}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-white/5 rounded-md cursor-pointer flex items-center gap-1 transition-colors text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-5 overflow-y-auto max-h-[50vh] prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed scrollbar-thin">
                  <MarkdownPreview content={resultText} />
                </div>
              </div>

              {/* Bottom Safety Warning Notice */}
              <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl flex items-start gap-2 text-[11px] text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>AI output can be unpredictable or inaccurate. Please review it carefully before inserting or replacing your note content.</span>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions Panel */}
        <div className="px-6 py-5 border-t border-slate-200/50 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/20 shrink-0 flex flex-wrap items-center justify-between gap-3">
          
          {/* Secondary Actions Left */}
          <div>
            <button
              onClick={onClose}
              className="px-4.5 py-2.5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-xs font-bold uppercase text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Core Action Buttons Right */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* If Title or Tag Generation */}
            {isTitleOrTagAction ? (
              <>
                <button
                  onClick={handleSaveTitleTagsAsNewNote}
                  className="px-4.5 py-2.5 border border-indigo-500/25 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <FilePlus className="h-4 w-4" />
                  Save as New Note
                </button>
                <button
                  onClick={handleApplyTitleAndTags}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 shadow-lg shadow-indigo-600/15 hover:scale-[1.01] transition-all cursor-pointer"
                >
                  <FileEdit className="h-4 w-4" />
                  Apply to Note
                </button>
              </>
            ) : (
              /* If normal text result */
              <>
                <button
                  onClick={handleCopy}
                  className="px-4.5 py-2.5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
                <button
                  onClick={() => {
                    onSaveAsNewNote('AI Result - ' + templateName, resultText);
                    onClose();
                  }}
                  className="px-4.5 py-2.5 border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <FilePlus className="h-4 w-4" />
                  Save as New Note
                </button>
                <button
                  onClick={() => {
                    onAppendContent(resultText);
                    onClose();
                  }}
                  className="px-4.5 py-2.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Append to Note
                </button>
                <button
                  onClick={() => {
                    onInsertAtCursor(resultText);
                    onClose();
                  }}
                  className="px-4.5 py-2.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <CornerDownLeft className="h-4 w-4" />
                  Insert at Cursor
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to replace your entire note content? This action cannot be easily undone.')) {
                      onReplaceContent(resultText);
                      onClose();
                    }
                  }}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 shadow-lg shadow-indigo-600/15 hover:scale-[1.01] transition-all cursor-pointer"
                >
                  <FileEdit className="h-4 w-4" />
                  Replace Content
                </button>
              </>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
