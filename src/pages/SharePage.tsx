/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { shareService } from '../services/shareService';
import { noteStorage } from '../services/noteStorage';
import { Note } from '../types';
import { AppLayout } from '../components/AppLayout';
import { MarkdownPreview } from '../components/MarkdownPreview';
import { useToast } from '../hooks/useToast';
import {
  NotebookText,
  Import,
  Copy,
  Download,
  AlertCircle,
  Tag,
  ArrowLeft,
  Calendar,
  Share2,
  FileCode
} from 'lucide-react';

export function SharePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [sharedNote, setSharedNote] = useState<Partial<Note> & { sharedAt?: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const decodeLink = () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const decoded = shareService.parseShareLink(window.location.href);
        setSharedNote(decoded);
      } catch (err: any) {
        setErrorMsg(err.message || 'The snapshot note link is truncated or corrupted.');
      } finally {
        setLoading(false);
      }
    };

    decodeLink();
  }, [location.hash, location.search]);

  const handleSaveToBrowser = async () => {
    if (!sharedNote) return;

    try {
      const created = await noteStorage.createNote({
        title: sharedNote.title || 'Imported Shared Note',
        content: sharedNote.content || '',
        tags: sharedNote.tags || [],
        isCode: !!sharedNote.isCode,
        codeLanguage: sharedNote.codeLanguage || 'javascript',
      });
      toast('Saved a copy to your browser workspace successfully!', 'success');
      navigate(`/note/${created.id}`);
    } catch (err: any) {
      toast('Failed to save copy. Please enable browser storage.', 'error');
    }
  };

  const handleCopyText = () => {
    if (!sharedNote?.content) return;
    try {
      navigator.clipboard.writeText(sharedNote.content);
      toast('Plain text content copied to clipboard!', 'success');
    } catch (err) {
      toast('Failed to copy text', 'error');
    }
  };

  const handleDownloadTxt = () => {
    if (!sharedNote) return;
    try {
      const blob = new Blob([sharedNote.content || ''], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${sharedNote.title || 'shared_note'}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast('Note downloaded as text file successfully', 'success');
    } catch (err) {
      toast('Failed to download note', 'error');
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col gap-6 max-w-5xl mx-auto w-full pb-16">
        {/* Navigation line */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl transition-all cursor-pointer flex items-center gap-2 text-xs font-bold uppercase"
          >
            <ArrowLeft className="h-4 w-4" />
            Go to Dashboard
          </button>
          
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-4 py-2 rounded-full select-none">
            <Share2 className="h-3.5 w-3.5" />
            Immutable Snapshot Mode
          </span>
        </div>

        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center gap-4">
            <div className="h-10 w-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 animate-pulse uppercase tracking-wider">
              Decompressing note snapshot...
            </span>
          </div>
        ) : errorMsg ? (
          /* Error Page state */
          <div className="py-16 border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-rose-50 dark:bg-rose-950/40 text-rose-500 border border-rose-100 dark:border-rose-900/30 mb-6">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-display">
              Corrupted Share Link
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 mb-8 leading-relaxed">
              {errorMsg}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer select-none"
            >
              Back to Dashboard
            </button>
          </div>
        ) : sharedNote ? (
          /* Main viewable layout */
          <div className="space-y-6">
            {/* Action Bar Header card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-bold text-slate-950 dark:text-slate-50 font-display">
                    {sharedNote.title || 'Untitled Shared Note'}
                  </h1>
                  {sharedNote.isCode && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                      <FileCode className="h-3 w-3" />
                      {sharedNote.codeLanguage}
                    </span>
                  )}
                </div>
                
                {sharedNote.sharedAt && (
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1.5 select-none">
                    <Calendar className="h-3.5 w-3.5" />
                    Shared on: {new Date(sharedNote.sharedAt).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Operations deck */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <button
                  onClick={handleSaveToBrowser}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer select-none"
                >
                  <Import className="h-4.5 w-4.5" />
                  Save Copy to My Browser
                </button>
                <button
                  onClick={handleCopyText}
                  className="p-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-2xl transition-all cursor-pointer shadow-xs"
                  title="Copy plaintext to clipboard"
                  aria-label="Copy plaintext"
                >
                  <Copy className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={handleDownloadTxt}
                  className="p-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-2xl transition-all cursor-pointer shadow-xs"
                  title="Download as .txt"
                  aria-label="Download plain text"
                >
                  <Download className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Tags row */}
            {sharedNote.tags && sharedNote.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-xs">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5 select-none mr-1.5">
                  <Tag className="h-4 w-4" />
                  Tags:
                </span>
                {sharedNote.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center text-xs font-bold text-slate-600 dark:text-slate-400 px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Read-Only Document Paper Layout */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden min-h-[400px] flex flex-col shadow-xs">
              <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950 text-slate-400 select-none text-[10px] font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-850">
                — Document Read-Only Stage —
              </div>
              <div className="flex-1 overflow-y-auto">
                <MarkdownPreview content={sharedNote.content || ''} />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}
