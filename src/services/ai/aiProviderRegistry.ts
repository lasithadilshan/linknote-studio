/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIProvider, AISettings, AIProviderInstance, AIError } from './aiTypes';
import { geminiProvider } from './geminiProvider';
import { openRouterProvider } from './openRouterProvider';
import { groqProvider } from './groqProvider';
import { customOpenAIProvider } from './customOpenAIProvider';

export const DEFAULT_AI_SETTINGS: AISettings = {
  enabled: false,
  provider: 'gemini',
  openRouterKey: '',
  openRouterModel: 'qwen/qwen3-coder:free',
  geminiKey: '',
  geminiModel: 'gemini-2.5-flash-lite',
  groqKey: '',
  groqModel: 'llama-3.1-8b-instant',
  customKey: '',
  customBaseUrl: 'http://localhost:11434/v1',
  customModel: 'qwen3-coder',
  temperature: 0.7,
  maxTokens: 2048,
  saveKeysInBrowser: false
};

const providers: Record<AIProvider, AIProviderInstance> = {
  'gemini': geminiProvider,
  'openrouter': openRouterProvider,
  'groq': groqProvider,
  'openai-custom': customOpenAIProvider
};

export function getAIProviderInstance(provider: AIProvider): AIProviderInstance {
  const instance = providers[provider];
  if (!instance) {
    const err: AIError = new Error(`Unsupported AI Provider: ${provider}`);
    err.code = 'UNSUPPORTED_PROVIDER';
    throw err;
  }
  return instance;
}

export function loadAISettings(): AISettings {
  const localStr = localStorage.getItem('linknote_ai_settings');
  const sessionStr = sessionStorage.getItem('linknote_ai_settings');

  let localSettings: Partial<AISettings> = {};
  let sessionSettings: Partial<AISettings> = {};

  if (localStr) {
    try {
      localSettings = JSON.parse(localStr);
    } catch (_) {}
  }

  if (sessionStr) {
    try {
      sessionSettings = JSON.parse(sessionStr);
    } catch (_) {}
  }

  const merged: AISettings = {
    ...DEFAULT_AI_SETTINGS,
    ...localSettings,
    ...sessionSettings,
  };

  // If the user does NOT want keys saved in localStorage,
  // ensure we do not grab keys from localSettings (only allow from sessionStorage or keep them empty)
  if (!merged.saveKeysInBrowser) {
    merged.openRouterKey = sessionSettings.openRouterKey || '';
    merged.geminiKey = sessionSettings.geminiKey || '';
    merged.groqKey = sessionSettings.groqKey || '';
    merged.customKey = sessionSettings.customKey || '';
  }

  return merged;
}

export function saveAISettings(settings: AISettings) {
  if (settings.saveKeysInBrowser) {
    // Save everything to localStorage
    localStorage.setItem('linknote_ai_settings', JSON.stringify(settings));
    // Clear from sessionStorage
    sessionStorage.removeItem('linknote_ai_settings');
  } else {
    // Save structural details to localStorage (so model selection, enabled flag, etc. are preserved)
    const structuralSettings = {
      ...settings,
      openRouterKey: '',
      geminiKey: '',
      groqKey: '',
      customKey: '',
    };
    localStorage.setItem('linknote_ai_settings', JSON.stringify(structuralSettings));

    // Store complete settings including keys in sessionStorage only
    sessionStorage.setItem('linknote_ai_settings', JSON.stringify(settings));
  }
}

export function clearAISettingsKeys(settings: AISettings): AISettings {
  const cleared: AISettings = {
    ...settings,
    openRouterKey: '',
    geminiKey: '',
    groqKey: '',
    customKey: '',
  };
  
  // Wipe from both stores
  localStorage.setItem('linknote_ai_settings', JSON.stringify({
    ...cleared,
    saveKeysInBrowser: false // reset toggle as well for safety
  }));
  sessionStorage.removeItem('linknote_ai_settings');
  
  return {
    ...cleared,
    saveKeysInBrowser: false
  };
}
