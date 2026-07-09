/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Download, Upload, ShieldAlert, CheckCircle2, FileJson, ArrowRight } from 'lucide-react';
import { noteStorage } from '../services/noteStorage';
import { useToast } from '../hooks/useToast';

interface ImportExportPanelProps {
  onImportComplete?: () => void;
  onClose?: () => void;
}

export function ImportExportPanel({ onImportComplete, onClose }: ImportExportPanelProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<{ success: number; errors: string[] } | null>(null);

  const handleExport = async () => {
    try {
      const backupJson = await noteStorage.exportAllNotes();
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `linknote_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast('Backup file downloaded successfully!', 'success');
    } catch (err: any) {
      toast(`Export failed: ${err.message}`, 'error');
    }
  };

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.json')) {
      toast('Only .json backup files are supported.', 'error');
      return;
    }

    setLoading(true);
    setSummary(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      try {
        const result = await noteStorage.importNotes(content);
        setSummary({
          success: result.successCount,
          errors: result.errors,
        });

        if (result.successCount > 0) {
          toast(`Successfully imported ${result.successCount} notes!`, 'success');
          if (onImportComplete) {
            onImportComplete();
          }
        } else if (result.errors.length > 0) {
          toast('Import complete, but no notes were added.', 'warning');
        }
      } catch (err: any) {
        toast(`Import failed: ${err.message}`, 'error');
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      toast('Failed to read the selected file.', 'error');
      setLoading(false);
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div id="import-export-panel" className="space-y-6">
      {/* Export Section */}
      <div className="bg-slate-500/5 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 backdrop-blur-md p-5 rounded-2xl">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
          <Download className="h-4.5 w-4.5 text-indigo-500" />
          Export Backup
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
          Download all notes, titles, tags, custom metadata, and encrypted contents into a single portable backup file. You can import this file in any modern browser to restore your setup.
        </p>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-sm shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          <Download className="h-4 w-4" />
          Download Backup (.json)
        </button>
      </div>

      {/* Import Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Upload className="h-4.5 w-4.5 text-indigo-500" />
          Import Backup
        </h4>

        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center min-h-[140px] ${
            dragActive
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-slate-200/60 dark:border-white/10 hover:border-indigo-500/40 bg-white/40 dark:bg-white/5 backdrop-blur-md'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="p-3 bg-slate-100/60 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 rounded-2xl text-slate-600 dark:text-slate-400 mb-3 group-hover:scale-105 transition-transform">
            <FileJson className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {loading ? 'Uploading & parsing backup...' : 'Click to upload or drag & drop'}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Accepts LinkNote backup JSON files only
          </p>
        </div>

        {/* Import Summary */}
        {summary && (
          <div className="p-4 bg-slate-500/5 dark:bg-slate-950/40 border border-slate-200/50 dark:border-white/10 backdrop-blur-md rounded-xl space-y-2">
            <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Import Results
            </h5>
            <div className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>
                Successfully imported <strong>{summary.success}</strong> notes.
              </span>
            </div>
            {summary.errors.length > 0 && (
              <div className="space-y-1.5 mt-2 pt-2 border-t border-slate-200/50 dark:border-white/10">
                <p className="text-xs font-medium text-rose-500 flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Warnings ({summary.errors.length}):
                </p>
                <div className="max-h-24 overflow-y-auto text-xs text-slate-500 dark:text-slate-400 space-y-1 pr-1.5 scrollbar-thin">
                  {summary.errors.map((err, i) => (
                    <div key={i} className="flex gap-1">
                      <ArrowRight className="h-3 w-3 mt-0.5 text-slate-400 shrink-0" />
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {onClose && (
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 font-medium text-sm transition-colors cursor-pointer"
          >
            Close Settings
          </button>
        </div>
      )}
    </div>
  );
}
