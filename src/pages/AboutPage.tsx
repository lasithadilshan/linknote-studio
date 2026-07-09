/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { 
  ArrowLeft, 
  BookOpen, 
  Database, 
  Link2, 
  Cpu, 
  ShieldCheck, 
  Share2, 
  Zap 
} from 'lucide-react';

export function AboutPage() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Navigation / Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="p-2 border border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold uppercase"
          >
            <ArrowLeft className="h-4 w-4" />
            Workspace
          </button>
          
          <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-3.5 py-1.5 rounded-full select-none">
            <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
            Documentation
          </span>
        </div>

        {/* Page Title Card */}
        <div className="bg-white/60 dark:bg-slate-900/30 border border-slate-200/50 dark:border-white/10 backdrop-blur-md p-6 sm:p-8 rounded-3xl space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight font-display bg-linear-to-r from-indigo-600 via-indigo-500 to-indigo-400 dark:from-white dark:to-slate-300 bg-clip-text text-transparent flex items-center gap-2">
            About LinkNote Studio
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            A secure, serverless, and highly polished markdown notepad designed for direct developer productivity and local data ownership.
          </p>
        </div>

        {/* Informative Cards Section - Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card 1: Local-first Storage */}
          <div className="bg-white/60 dark:bg-slate-900/30 border border-slate-200/50 dark:border-white/10 p-6 rounded-3xl space-y-3">
            <div className="p-2.5 bg-indigo-500/15 text-indigo-500 rounded-2xl w-10 h-10 flex items-center justify-center">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Local-First Database (IndexedDB)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Notes are stored directly in your browser using <strong>IndexedDB</strong>. Because we do not run secondary databases, serverless functions, or cloud backups, your notes are completely private and load instantaneously offline.
            </p>
          </div>

          {/* Card 2: Note Linking */}
          <div className="bg-white/60 dark:bg-slate-900/30 border border-slate-200/50 dark:border-white/10 p-6 rounded-3xl space-y-3">
            <div className="p-2.5 bg-emerald-500/15 text-emerald-500 rounded-2xl w-10 h-10 flex items-center justify-center">
              <Link2 className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Inter-Note Links (WikiLinks)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Easily connect ideas together by typing double brackets (e.g. <code>[[Note Title]]</code>) or adding local note-specific paths. Because links refer to IDs, they work seamlessly inside this browser session.
            </p>
          </div>

          {/* Card 3: Compression Sharing */}
          <div className="bg-white/60 dark:bg-slate-900/30 border border-slate-200/50 dark:border-white/10 p-6 rounded-3xl space-y-3">
            <div className="p-2.5 bg-indigo-500/15 text-indigo-500 rounded-2xl w-10 h-10 flex items-center justify-center">
              <Share2 className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Zero-Server Share Links
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Generating share snapshots works by compressing your note data with <strong>LZ-String</strong> and packing it into the URL's hash fragment. Anyone who clicks the link can open your note without any backend server ever seeing the content. Very large notes may not be suitable for share links due to browser URL length limits.
            </p>
          </div>

          {/* Card 4: Optional Copilot AI */}
          <div className="bg-white/60 dark:bg-slate-900/30 border border-slate-200/50 dark:border-white/10 p-6 rounded-3xl space-y-3">
            <div className="p-2.5 bg-indigo-500/15 text-indigo-500 rounded-2xl w-10 h-10 flex items-center justify-center">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Optional Copilot AI Systems
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Use Gemini, Groq, or OpenRouter for outlines, translations, or code polishes. Selected text is sent directly from your browser to the chosen API provider. Stored keys are kept strictly in-memory or saved unencrypted in your local storage based on your security configuration. Never share or hardcode keys.
            </p>
          </div>

        </div>

        {/* Security & Offline Policy */}
        <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-200/60 dark:border-white/10 p-6 rounded-3xl space-y-3">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wide">
            <ShieldCheck className="h-4.5 w-4.5 text-indigo-500" />
            Technical Architecture & Privacy Policy
          </h3>
          <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed list-disc list-inside">
            <li><strong>Frontend-only:</strong> The application runs strictly inside your web browser. There is no custom backend, database API, telemetry client, or server hosting your notes.</li>
            <li><strong>Data Ownership:</strong> You have absolute ownership of your notes. Clearing your browser data (site data) will wipe the IndexedDB unless exported first.</li>
            <li><strong>Import/Export:</strong> Keep periodic backup files of your notes. You can export all note packages as a standard JSON file and restore them on any device.</li>
            <li><strong>Military-grade encryption:</strong> Encrypted notes utilize PBKDF2 for password key derivation and AES-GCM (256-bit) to encrypt note content before write-out to IndexedDB. Content remains unreadable to any other browser program or debugger.</li>
          </ul>
        </div>

        {/* Launch pad action */}
        <div className="flex items-center justify-center pt-2">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold uppercase tracking-wide transition-all shadow-md flex items-center gap-1.5 hover:scale-[1.01]"
          >
            <Zap className="h-4 w-4 animate-bounce" />
            Launch LinkNote Workspace
          </button>
        </div>

      </div>
    </AppLayout>
  );
}
