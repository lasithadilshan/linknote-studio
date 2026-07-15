/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { en } from './en';
import { si } from './si';

export type Language = 'en' | 'si';

const translations = { en, si };

export function getLanguage(): Language {
  const saved = localStorage.getItem('linknote-language') as Language;
  if (saved === 'en' || saved === 'si') return saved;
  return 'en';
}

export function setLanguage(lang: Language) {
  localStorage.setItem('linknote-language', lang);
  window.dispatchEvent(new Event('linknote-language-changed'));
}

export function useTranslation() {
  const [lang, setLang] = useState<Language>(getLanguage());

  useEffect(() => {
    const handleLanguageChange = () => {
      setLang(getLanguage());
    };
    window.addEventListener('linknote-language-changed', handleLanguageChange);
    return () => {
      window.removeEventListener('linknote-language-changed', handleLanguageChange);
    };
  }, []);

  const t = useCallback((key: keyof typeof en, replacements?: Record<string, string | number>): string => {
    const dict = translations[lang] || en;
    let text = dict[key] || en[key] || String(key);
    
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    
    return text;
  }, [lang]);

  return { t, lang, setLanguage: (l: Language) => {
    setLanguage(l);
    setLang(l);
  } };
}
