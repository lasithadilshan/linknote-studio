/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AISettings, AIProvider, AIError } from '../../services/ai/aiTypes';
import { loadAISettings, saveAISettings, clearAISettingsKeys } from '../../services/ai/aiProviderRegistry';
import { ProviderSelector } from './ProviderSelector';
import { aiClient } from '../../services/ai/aiClient';
import { useToast } from '../../hooks/useToast';
import { 
  Sparkles, 
  ShieldAlert, 
  Key, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  X, 
  Loader2,
  Lock,
  Unlock,
  ToggleLeft,
  ToggleRight,
  Info
} from 'lucide-react';

interface AISettingsModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  embedMode?: boolean; // If true, renders inline without modal styling
}

export function AISettingsModal({ isOpen = true, onClose, embedMode = false }: AISettingsModalProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AISettings>(loadAISettings());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [testErrorText, setTestErrorText] = useState<string>('');

  // Auto-reload settings when component is rendered/modal is opened
  useEffect(() => {
    setSettings(loadAISettings());
    setTestResult(null);
  }, [isOpen]);

  const updateSetting = <K extends keyof AISettings>(key: K, value: AISettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveAISettings(updated);
    setTestResult(null); // clear test results on any change
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    setTestErrorText('');

    try {
      await aiClient.testConnection(settings);
      setTestResult('success');
      toast('AI connection successfully verified!', 'success');
    } catch (err: any) {
      setTestResult('error');
      
      let errorMsg = err.message || 'Connection test failed';
      if (err.code === 'INVALID_API_KEY') {
        errorMsg = 'Invalid API key. Please check your credentials and try again.';
      } else if (err.code === 'CORS_BLOCKED') {
        errorMsg = 'Request blocked by CORS policy. Ensure your custom API endpoint supports browser origin requests.';
      }
      
      setTestErrorText(errorMsg);
      toast(errorMsg, 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleClearKeys = () => {
    if (window.confirm('Are you sure you want to clear all local API keys? This action will permanently remove stored keys from your browser.')) {
      const cleared = clearAISettingsKeys(settings);
      setSettings(cleared);
      setTestResult(null);
      toast('Stored API keys cleared successfully', 'success');
    }
  };

  const handleToggleEnable = (e: React.MouseEvent) => {
    e.preventDefault();
    const newEnabled = !settings.enabled;
    updateSetting('enabled', newEnabled);
    toast(newEnabled ? 'AI Assistant Enabled!' : 'AI Assistant Disabled.', newEnabled ? 'success' : 'info');
  };

  const renderActiveProviderSettings = () => {
    switch (settings.provider) {
      case 'gemini':
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                Google Gemini API Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={settings.geminiKey}
                  onChange={(e) => updateSetting('geminiKey', e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-2.5 pl-10 bg-white/40 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-xl text-slate-950 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-mono"
                />
                <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Generate a key for free in Google AI Studio.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                Model Name
              </label>
              <input
                type="text"
                value={settings.geminiModel}
                onChange={(e) => updateSetting('geminiModel', e.target.value)}
                placeholder="gemini-2.5-flash-lite"
                className="w-full px-4 py-2.5 bg-white/40 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-xl text-slate-950 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-mono"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 flex items-center mr-1">Suggestions:</span>
                {['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.5-pro'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => updateSetting('geminiModel', m)}
                    className="text-[9px] font-semibold bg-slate-100/60 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/25 transition-all cursor-pointer"
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'openrouter':
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                OpenRouter API Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={settings.openRouterKey}
                  onChange={(e) => updateSetting('openRouterKey', e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full px-4 py-2.5 pl-10 bg-white/40 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-xl text-slate-950 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-mono"
                />
                <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                Model Name
              </label>
              <input
                type="text"
                value={settings.openRouterModel}
                onChange={(e) => updateSetting('openRouterModel', e.target.value)}
                placeholder="qwen/qwen3-coder:free"
                className="w-full px-4 py-2.5 bg-white/40 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-xl text-slate-950 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-mono"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 flex items-center mr-1">Suggestions:</span>
                {['qwen/qwen-3-coder-32b-instruct:free', 'google/gemini-2.5-flash:free', 'deepseek/deepseek-chat:free', 'meta-llama/llama-3.3-70b-instruct:free'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => updateSetting('openRouterModel', m)}
                    className="text-[9px] font-semibold bg-slate-100/60 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/25 transition-all cursor-pointer"
                  >
                    {m.split('/').pop()?.split(':')[0] || m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'groq':
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                Groq Cloud API Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={settings.groqKey}
                  onChange={(e) => updateSetting('groqKey', e.target.value)}
                  placeholder="gsk_..."
                  className="w-full px-4 py-2.5 pl-10 bg-white/40 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-xl text-slate-950 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-mono"
                />
                <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                Model Name
              </label>
              <input
                type="text"
                value={settings.groqModel}
                onChange={(e) => updateSetting('groqModel', e.target.value)}
                placeholder="llama-3.1-8b-instant"
                className="w-full px-4 py-2.5 bg-white/40 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-xl text-slate-950 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-mono"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 flex items-center mr-1">Suggestions:</span>
                {['llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => updateSetting('groqModel', m)}
                    className="text-[9px] font-semibold bg-slate-100/60 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/25 transition-all cursor-pointer"
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'openai-custom':
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                Custom API Base URL
              </label>
              <input
                type="text"
                value={settings.customBaseUrl}
                onChange={(e) => updateSetting('customBaseUrl', e.target.value)}
                placeholder="http://localhost:11434/v1"
                className="w-full px-4 py-2.5 bg-white/40 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-xl text-slate-950 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-mono"
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Ensure this is correct (e.g., Local Ollama path: http://localhost:11434/v1).
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                Model Name
              </label>
              <input
                type="text"
                value={settings.customModel}
                onChange={(e) => updateSetting('customModel', e.target.value)}
                placeholder="qwen3-coder"
                className="w-full px-4 py-2.5 bg-white/40 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-xl text-slate-950 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                Custom API Key (Optional)
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={settings.customKey}
                  onChange={(e) => updateSetting('customKey', e.target.value)}
                  placeholder="Optional auth token..."
                  className="w-full px-4 py-2.5 pl-10 bg-white/40 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-xl text-slate-950 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-mono"
                />
                <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>
        );
    }
  };

  const hasAnyKeySet = !!(
    settings.geminiKey || 
    settings.openRouterKey || 
    settings.groqKey || 
    settings.customKey
  );

  const mainFormContent = (
    <div className="space-y-6">
      {/* Privacy Alert Panel */}
      <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl flex gap-3.5 items-start">
        <ShieldAlert className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 space-y-1.5">
          <p className="font-bold text-slate-800 dark:text-slate-200">
            Privacy & Security Notice
          </p>
          <p>
            This is a frontend-only GitHub Pages app. Your notes are stored locally in your browser. If you enable AI, selected note content will be sent directly from your browser to the selected AI provider. Do not send private or sensitive notes unless you trust the provider and understand their data policy.
          </p>
        </div>
      </div>

      {/* Enable / Disable AI Assistant Toggle */}
      <div className="flex items-center justify-between p-4 bg-white/40 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 backdrop-blur-md rounded-2xl">
        <div className="flex gap-3 items-center">
          <div className={`p-2 rounded-xl ${settings.enabled ? 'bg-indigo-500/15 text-indigo-500' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Enable AI Assistant
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Activate prompt templates and markdown processing.
            </p>
          </div>
        </div>
        <button
          onClick={handleToggleEnable}
          className="text-indigo-600 dark:text-indigo-400 hover:opacity-80 transition-opacity cursor-pointer p-1"
          title={settings.enabled ? 'Disable AI' : 'Enable AI'}
        >
          {settings.enabled ? (
            <ToggleRight className="h-9 w-9 text-indigo-500" />
          ) : (
            <ToggleLeft className="h-9 w-9 text-slate-400 dark:text-slate-600" />
          )}
        </button>
      </div>

      {/* Settings inputs shown only when enabled (or show dimmed state to incentivize configuration) */}
      <div className={`space-y-6 transition-all duration-300 ${settings.enabled ? 'opacity-100 pointer-events-auto' : 'opacity-55 pointer-events-none select-none'}`}>
        
        {/* Provider Select Grid */}
        <ProviderSelector
          selectedProvider={settings.provider}
          onChange={(p) => updateSetting('provider', p)}
        />

        {/* Dynamic credentials fields */}
        <div className="p-5 border border-slate-200/50 dark:border-white/10 bg-white/20 dark:bg-white/5 rounded-3xl space-y-4">
          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Key className="h-4 w-4 text-indigo-500" />
            API Authentication Credentials
          </div>
          {renderActiveProviderSettings()}
        </div>

        {/* Temperature & Token Hyperparameters */}
        <div className="p-5 border border-slate-200/50 dark:border-white/10 bg-white/20 dark:bg-white/5 rounded-3xl space-y-5">
          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="h-4 w-4 text-indigo-500" />
            Model Hyperparameters
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Temperature</span>
              <span className="font-mono bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md font-bold">
                {settings.temperature}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={settings.temperature}
              onChange={(e) => updateSetting('temperature', parseFloat(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-white/15 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>Precise / Factual (0.0)</span>
              <span>Balanced (0.7)</span>
              <span>Creative / Abstract (2.0)</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Max Tokens</span>
              <input
                type="number"
                min="10"
                max="32000"
                value={settings.maxTokens}
                onChange={(e) => updateSetting('maxTokens', parseInt(e.target.value) || 2048)}
                className="w-20 text-center font-mono bg-white/50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-lg px-2 py-0.5 text-xs font-bold focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Maximum output token generation cutoff per response.
            </p>
          </div>
        </div>

        {/* Security & LocalStorage preference options */}
        <div className="p-5 border border-slate-200/50 dark:border-white/10 bg-white/20 dark:bg-white/5 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 pr-4">
              <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                {settings.saveKeysInBrowser ? (
                  <Lock className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Unlock className="h-4 w-4 text-amber-500 animate-pulse" />
                )}
                Save Key in this Browser
              </h5>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
                {settings.saveKeysInBrowser 
                  ? 'Key is saved persistently in localStorage. You do not need to re-enter it next time.' 
                  : 'Key is saved in-session only. Closing the tab will immediately delete the key from memory.'
                }
              </p>
            </div>
            
            <button
              onClick={() => {
                const newValue = !settings.saveKeysInBrowser;
                if (newValue) {
                  const confirmed = window.confirm(
                    'SECURITY WARNING: Saving your API keys in this browser stores them unencrypted in your local storage. Make sure this is a personal, trusted device before enabling.'
                  );
                  if (!confirmed) return;
                }
                updateSetting('saveKeysInBrowser', newValue);
              }}
              className="text-indigo-600 dark:text-indigo-400 cursor-pointer p-1 shrink-0"
            >
              {settings.saveKeysInBrowser ? (
                <ToggleRight className="h-8 w-8 text-emerald-500" />
              ) : (
                <ToggleLeft className="h-8 w-8 text-slate-400 dark:text-slate-600" />
              )}
            </button>
          </div>

          {/* Warnings and key deletion option */}
          {hasAnyKeySet && (
            <div className="pt-2 flex justify-between items-center border-t border-slate-200/50 dark:border-white/10">
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                Credentials exist in current session
              </span>
              <button
                type="button"
                onClick={handleClearKeys}
                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-500 hover:text-rose-600 px-3 py-1.5 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-xl transition-all cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear Local Key API Data
              </button>
            </div>
          )}
        </div>

        {/* Action Testing connection */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <button
              type="button"
              disabled={testing}
              onClick={handleTestConnection}
              className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-sm rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-100 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying API Key...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Test Connection Setup</span>
                </>
              )}
            </button>
          </div>

          {/* Render Test result outputs */}
          {testResult === 'success' && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs flex items-center gap-2 animate-pulse">
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
              <span className="font-semibold">Successfully connected to provider! Your API Key is fully authenticated and ready.</span>
            </div>
          )}

          {testResult === 'error' && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs space-y-1.5 animate-pulse">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-rose-500" />
                <span className="font-bold">Authentication Test Failed</span>
              </div>
              <p className="leading-relaxed pl-6 text-[11px] text-rose-500/95">
                {testErrorText}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );

  if (embedMode) {
    return (
      <div id="ai-settings-panel" className="pb-10">
        {mainFormContent}
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div id="ai-settings-modal" className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-md"
      />
      
      {/* Dialog box wrapper */}
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white/95 dark:bg-slate-900/90 border border-slate-200/50 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-lg flex flex-col mx-4 z-50 animate-spring-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/10 mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-display">
              Configure LinkNote AI Assistant
            </h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content body */}
        <div className="flex-1 pr-1.5 scrollbar-thin">
          {mainFormContent}
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 pt-5 border-t border-slate-200/50 dark:border-white/10 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer"
          >
            Done Configuring
          </button>
        </div>
      </div>
    </div>
  );
}
