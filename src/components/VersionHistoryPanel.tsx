/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Note, NoteVersion } from '../types';
import { noteStorage } from '../services/noteStorage';
import { useToast } from '../hooks/useToast';
import { History, X, Copy, RotateCcw, Trash2, Eye, Calendar, Clock, EyeOff } from 'lucide-react';

interface VersionHistoryPanelProps {
  noteId: string;
  onRestoreComplete: () => void;
  onClose: () => void;
}

export function VersionHistoryPanel({ noteId, onRestoreComplete, onClose }: VersionHistoryPanelProps) {
  const { toast } = useToast();
  const [versions, setVersions] = useState<NoteVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewVersion, setPreviewVersion] = useState<NoteVersion | null>(null);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const data = await noteStorage.getVersions(noteId);
      setVersions(data);
    } catch (e: any) {
      toast('Failed to load version snapshots.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, [noteId]);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast('Version content copied to clipboard!', 'success');
  };

  const handleRestore = async (versionId: string) => {
    if (confirm('Are you sure you want to restore this version? Your current state will be saved as a snapshot first, allowing you to undo.')) {
      try {
        await noteStorage.restoreVersion(noteId, versionId);
        toast('Version restored successfully!', 'success');
        onRestoreComplete();
        fetchVersions();
      } catch (e: any) {
        toast(`Restore failed: ${e.message}`, 'error');
      }
    }
  };

  const handleDelete = async (versionId: string) => {
    if (confirm('Delete this version snapshot permanently? This action is local and irreversible.')) {
      try {
        await noteStorage.deleteVersion(versionId);
        setVersions(prev => prev.filter(v => v.id !== versionId));
        if (previewVersion?.id === versionId) {
          setPreviewVersion(null);
        }
        toast('Version deleted.', 'success');
      } catch (e: any) {
        toast('Failed to delete version', 'error');
      }
    }
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div id="versions-panel" className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <History className="h-4.5 w-4.5 text-indigo-500" />
          <h4 className="text-sm font-bold text-slate-950 dark:text-slate-50 font-display">
            Version Snapshot History
          </h4>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="text-[11px] text-slate-500 leading-normal">
        Snapshots are automatically created every 2 minutes when you make changes, up to a maximum of 20 versions.
      </p>

      {/* Main Grid: split view if previewing, else simple list */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {loading ? (
          <div className="py-12 text-center text-xs font-semibold text-slate-400">
            Scanning snapshot catalog...
          </div>
        ) : versions.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <History className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-300">
              No snapshots found
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
              Start editing to see automatic version saves. You can also force a save with Cmd/Ctrl + S.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
            {/* Active Preview Banner */}
            {previewVersion && (
              <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                    Viewing Selected Snapshot
                  </span>
                  <button
                    onClick={() => setPreviewVersion(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <EyeOff className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                  {previewVersion.title}
                </div>
                <div className="max-h-32 overflow-y-auto p-2 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-lg text-[11px] font-mono whitespace-pre-wrap leading-relaxed select-text">
                  {previewVersion.content || '(Empty content)'}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(previewVersion.content)}
                    className="flex-1 py-1 px-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copy Content</span>
                  </button>
                  <button
                    onClick={() => handleRestore(previewVersion.id)}
                    className="flex-1 py-1 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Restore This Version</span>
                  </button>
                </div>
              </div>
            )}

            {/* List */}
            <div className="space-y-2.5">
              {versions.map((ver) => {
                const isActivePreview = previewVersion?.id === ver.id;
                return (
                  <div
                    key={ver.id}
                    className={`p-3 border rounded-xl transition-all ${
                      isActivePreview
                        ? 'border-indigo-500 bg-indigo-500/5'
                        : 'border-slate-150 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/20 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                          <Calendar className="h-3 w-3" />
                          <span className="text-[10px] font-semibold">{formatDate(ver.createdAt)}</span>
                          <span className="text-slate-300 dark:text-slate-800">•</span>
                          <Clock className="h-3 w-3" />
                          <span className="text-[10px] font-semibold">{formatTime(ver.createdAt)}</span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 line-clamp-1">
                          {ver.title || 'Untitled Snapshot'}
                        </h5>
                      </div>

                      {/* Micro actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setPreviewVersion(ver)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer transition-colors"
                          title="Preview Snapshot"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleCopy(ver.content)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer transition-colors"
                          title="Copy Snapshot Content"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleRestore(ver.id)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 rounded-lg text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 cursor-pointer transition-colors"
                          title="Restore Snapshot"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(ver.id)}
                          className="p-1.5 bg-slate-50 hover:bg-rose-50 dark:bg-white/5 dark:hover:bg-rose-950/20 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer transition-colors"
                          title="Delete snapshot"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
