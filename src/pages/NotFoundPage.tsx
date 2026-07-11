/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { AlertCircle } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="py-16 border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto mt-6 shadow-xs">
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-rose-50 dark:bg-rose-950/40 text-rose-500 border border-rose-100 dark:border-rose-900/30 mb-6">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 font-display">Page Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 mb-8 leading-relaxed">
          The requested page route doesn't exist, has been removed, or is private to another system layout.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer select-none"
        >
          Return to Dashboard
        </button>
      </div>
    </AppLayout>
  );
}
