/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Shield, NotebookText, Database, Share2, HelpCircle, ArrowRight, Upload } from 'lucide-react';
import { createDemoNotes } from '../utils/demoNotes';

interface OnboardingModalProps {
  onComplete: () => void;
  onImportTrigger: () => void;
  onCreateFirstNote: () => void;
}

export function OnboardingModal({ onComplete, onImportTrigger, onCreateFirstNote }: OnboardingModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const isCompleted = localStorage.getItem('linknote-onboarding-completed');
    if (!isCompleted) {
      setIsOpen(true);
    }
  }, []);

  const handleSkip = () => {
    localStorage.setItem('linknote-onboarding-completed', 'true');
    setIsOpen(false);
    onComplete();
  };

  const handleCreateNote = () => {
    localStorage.setItem('linknote-onboarding-completed', 'true');
    setIsOpen(false);
    onComplete();
    onCreateFirstNote();
  };

  const handleLoadDemo = async () => {
    localStorage.setItem('linknote-onboarding-completed', 'true');
    await createDemoNotes();
    setIsOpen(false);
    onComplete();
  };

  const handleImport = () => {
    localStorage.setItem('linknote-onboarding-completed', 'true');
    setIsOpen(false);
    onComplete();
    onImportTrigger();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div id="onboarding-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleSkip}
          className="absolute inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 210 }}
          className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl overflow-hidden z-10"
        >
          {/* Subtle design gradient accent */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500" />

          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-4 mb-8">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30">
              <NotebookText className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                Welcome to LinkNote Studio
              </h2>
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1 uppercase tracking-wider">
                Your private local-first note workspace.
              </p>
            </div>
          </div>

          {/* Explanations grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="flex gap-3 p-3.5 border border-slate-100 dark:border-slate-800/40 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
              <Shield className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Zero Cloud Accounts</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  No login required. Notes are written and managed completely offline within your browser sandboxed sandbox.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-3.5 border border-slate-100 dark:border-slate-800/40 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
              <Database className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">IndexedDB Persistence</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Stored locally using industry-grade browser databases. Remember to export regular backups to avoid accidental loss!
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-3.5 border border-slate-100 dark:border-slate-800/40 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
              <Share2 className="h-5 w-5 text-pink-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Compressed Snapshots</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Sharing a note creates compressed URI payloads inside the link. No server storage needed — the payload is the URL!
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-3.5 border border-slate-100 dark:border-slate-800/40 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
              <Sparkles className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Optional AI Assistance</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Connect your personal Gemini API key safely inside Settings for smart summaries, styling assistance, and translating.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
            <button
              onClick={handleCreateNote}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/25 transition-all"
            >
              <span>Create First Note</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleLoadDemo}
              className="px-5 py-3 border border-indigo-500/20 dark:border-indigo-400/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Load Interactive Demo Notes</span>
            </button>
            <button
              onClick={handleImport}
              className="px-5 py-3 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <Upload className="h-3.5 w-3.5 text-slate-400" />
              <span>Import Existing Backup</span>
            </button>
            <button
              onClick={handleSkip}
              className="px-5 py-3 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <span>Skip Workspace Onboarding</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
