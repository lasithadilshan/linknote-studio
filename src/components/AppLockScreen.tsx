/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { noteStorage } from '../services/noteStorage';
import { useTranslation } from '../i18n/i18n';
import { useToast } from '../hooks/useToast';
import { Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

interface AppLockScreenProps {
  onUnlock: () => void;
}

export function AppLockScreen({ onUnlock }: AppLockScreenProps) {
  const { t, lang, setLanguage } = useTranslation();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    try {
      const isValid = await noteStorage.verifyAppLockPassword(password);
      if (isValid) {
        toast('Workspace unlocked!', 'success');
        onUnlock();
      } else {
        setIsError(true);
        toast(t('appLockIncorrect'), 'error');
        setTimeout(() => setIsError(false), 500);
      }
    } catch (err) {
      toast('Error verifying password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-200">
      {/* Decorative ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Floating Language Selector */}
      <div className="absolute top-6 right-6 flex items-center gap-2 bg-white/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 px-2.5 py-1.5 rounded-xl backdrop-blur-xs">
        <button
          onClick={() => setLanguage('en')}
          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md transition-all cursor-pointer ${
            lang === 'en'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-950 dark:hover:text-slate-200'
          }`}
        >
          English
        </button>
        <button
          onClick={() => setLanguage('si')}
          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md transition-all cursor-pointer ${
            lang === 'si'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-950 dark:hover:text-slate-200'
          }`}
        >
          සිංහල
        </button>
      </div>

      <motion.div
        animate={isError ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="relative bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl max-w-md w-full overflow-hidden text-center"
      >
        <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 mb-6 border border-indigo-100/30 dark:border-indigo-900/20">
          <Lock className="h-7 w-7" />
        </div>

        <h2 className="text-2xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
          LinkNote Studio
        </h2>
        <p className="mt-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          {t('appLocked')}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('appLockPlaceholder')}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-slate-950 dark:text-white pr-10"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            {t('unlockButton')}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-850/60 flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <span className="text-[11px] font-medium leading-none">
            {t('appLockWarning')}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
