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
      <div className="py-24 text-center flex flex-col items-center justify-center max-w-md mx-auto">
        <div className="p-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 rounded-full mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white font-display">Page Not Found</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 mb-6">
          The requested page route doesn't exist, has been removed, or is private to another system layout.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    </AppLayout>
  );
}
