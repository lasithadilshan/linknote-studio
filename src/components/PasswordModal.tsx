/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Lock, Unlock, Eye, EyeOff, AlertCircle, X } from 'lucide-react';

interface PasswordModalProps {
  isOpen: boolean;
  mode: 'lock' | 'unlock' | 'remove'; // lock = set password, unlock = decrypt, remove = remove password
  onClose: () => void;
  onSubmit: (password: string) => Promise<void>;
  title?: string;
  errorText?: string;
}

export function PasswordModal({
  isOpen,
  mode,
  onClose,
  onSubmit,
  title,
  errorText: externalErrorText,
}: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!password) {
      setLocalError('Password is required.');
      return;
    }

    if (mode === 'lock') {
      if (password.length < 4) {
        setLocalError('Password must be at least 4 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      await onSubmit(password);
      setPassword('');
      setConfirmPassword('');
      setLocalError('');
    } catch (err: any) {
      setLocalError(err.message || 'Incorrect password.');
    } finally {
      setLoading(false);
    }
  };

  const currentTitle = title || (
    mode === 'lock' 
      ? 'Lock with Password' 
      : mode === 'unlock' 
        ? 'Enter Password to Decrypt' 
        : 'Remove Password Protection'
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="password-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={mode === 'unlock' ? undefined : onClose} // force unlock password to remain open
            className="absolute inset-0 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative bg-white/90 dark:bg-slate-900/80 border border-slate-200/50 dark:border-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Close Button */}
            {mode !== 'unlock' && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2.5 rounded-xl ${mode === 'lock' ? 'bg-indigo-500/10 text-indigo-600' : 'bg-amber-500/10 text-amber-600'}`}>
                {mode === 'lock' ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 font-display">
                {currentTitle}
              </h3>
            </div>

            {mode === 'lock' && (
              <div className="mb-4 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex gap-2.5">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 dark:text-amber-400 leading-normal">
                  <strong>Warning:</strong> Password encryption is local to this browser using Web Crypto AES-GCM. If you forget this password, this note <strong>cannot be recovered</strong>. There is no password reset.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  {mode === 'lock' ? 'Choose Password' : 'Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-slate-100/40 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                    autoFocus
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {mode === 'lock' && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-slate-100/40 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                    disabled={loading}
                  />
                </div>
              )}

              {(localError || externalErrorText) && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{localError || externalErrorText}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                {mode !== 'unlock' && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-400 text-sm font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className={`flex-1 py-2.5 text-white text-sm font-medium rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                    mode === 'lock' 
                      ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/10' 
                      : 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/10'
                  }`}
                  disabled={loading}
                >
                  {loading 
                    ? 'Processing...' 
                    : mode === 'lock' 
                      ? 'Lock Note' 
                      : mode === 'unlock' 
                        ? 'Unlock Note' 
                        : 'Remove Protection'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
