/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, File, Users, BookOpen, GraduationCap, Activity, Bug, Briefcase, PieChart, FileText, CheckSquare } from 'lucide-react';
import { NOTE_TEMPLATES, NoteTemplate } from '../utils/templates';

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: NoteTemplate) => void;
}

const IconMap: { [key: string]: React.ComponentType<any> } = {
  File,
  Users,
  BookOpen,
  GraduationCap,
  Activity,
  Bug,
  Briefcase,
  PieChart,
  FileText,
  CheckSquare
};

export function TemplatePickerModal({ isOpen, onClose, onSelect }: TemplatePickerModalProps) {
  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div id="template-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-xs"
        />

        {/* Dialog Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-2xl w-full overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800 mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                Choose a Note Template
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Start with a structured outline to organize your thoughts instantly.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
              aria-label="Close template picker"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Grid of Templates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[400px] overflow-y-auto pr-1.5 scrollbar-thin">
            {NOTE_TEMPLATES.map((tpl) => {
              const IconComp = IconMap[tpl.icon] || File;
              return (
                <button
                  key={tpl.name}
                  onClick={() => onSelect(tpl)}
                  className="flex items-start gap-3.5 p-4 border border-slate-200/80 dark:border-slate-800 rounded-2xl hover:border-indigo-500/50 dark:hover:border-indigo-500/40 bg-white dark:bg-slate-950 hover:bg-indigo-50/25 dark:hover:bg-indigo-950/20 text-left transition-all duration-150 cursor-pointer group focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-500/25 transition-all">
                    <IconComp className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {tpl.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      Auto-populates to folder <strong>{tpl.folder}</strong>. Tags: {tpl.tags.join(', ') || 'None'}.
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end pt-5 mt-4 border-t border-slate-200/60 dark:border-slate-800 gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-xs uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
