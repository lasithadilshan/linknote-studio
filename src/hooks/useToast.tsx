/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastType } from '../types';
import { CheckCircle2, AlertTriangle, Info, X, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* Toast container */}
      <div id="toast-container" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((item) => {
            let icon = <Info className="h-5 w-5 text-sky-500 shrink-0" />;
            let bgClass = 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100';
            
            if (item.type === 'success') {
              icon = <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />;
              bgClass = 'bg-emerald-50 dark:bg-zinc-900 border-emerald-200 dark:border-emerald-950 text-emerald-900 dark:text-emerald-100';
            } else if (item.type === 'error') {
              icon = <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />;
              bgClass = 'bg-rose-50 dark:bg-zinc-900 border-rose-200 dark:border-rose-950 text-rose-900 dark:text-rose-100';
            } else if (item.type === 'warning') {
              icon = <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />;
              bgClass = 'bg-amber-50 dark:bg-zinc-900 border-amber-200 dark:border-amber-950 text-amber-900 dark:text-amber-100';
            }

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg pointer-events-auto cursor-pointer ${bgClass}`}
                onClick={() => removeToast(item.id)}
              >
                {icon}
                <div className="flex-1 text-sm font-medium leading-relaxed select-none">
                  {item.message}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeToast(item.id);
                  }}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 focus:outline-none"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
