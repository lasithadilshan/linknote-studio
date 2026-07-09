/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AIProvider } from '../../services/ai/aiTypes';
import { Sparkles, Globe, Cpu, Server } from 'lucide-react';

interface ProviderOption {
  id: AIProvider;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  badge?: string;
  colorClass: string;
}

const PROVIDER_OPTIONS: ProviderOption[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'High-speed intelligence directly from Google servers.',
    icon: Sparkles,
    badge: 'Recommended',
    colorClass: 'border-indigo-500/30 text-indigo-500 bg-indigo-500/5'
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Unified endpoint for access to dozens of free/paid models.',
    icon: Globe,
    badge: 'Multi-Model',
    colorClass: 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5'
  },
  {
    id: 'groq',
    name: 'Groq Cloud',
    description: 'Lightning-fast inference speeds for Llama models.',
    icon: Cpu,
    badge: 'Ultra-Fast',
    colorClass: 'border-amber-500/30 text-amber-500 bg-amber-500/5'
  },
  {
    id: 'openai-custom',
    name: 'Custom OpenAI',
    description: 'Connect to Ollama, LM Studio, or local server endpoints.',
    icon: Server,
    badge: 'Local-Friendly',
    colorClass: 'border-sky-500/30 text-sky-500 bg-sky-500/5'
  }
];

interface ProviderSelectorProps {
  selectedProvider: AIProvider;
  onChange: (provider: AIProvider) => void;
}

export function ProviderSelector({ selectedProvider, onChange }: ProviderSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
        Select AI Provider API
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PROVIDER_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedProvider === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`p-4 border text-left rounded-2xl transition-all cursor-pointer flex flex-col justify-between min-h-[110px] relative overflow-hidden group ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-500/5 shadow-md shadow-indigo-500/5'
                  : 'border-slate-200/60 dark:border-white/5 bg-white/40 dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:bg-white/60 dark:hover:bg-white/10'
              }`}
            >
              {/* Subtle accent glow on selected */}
              {isSelected && (
                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
              )}

              <div className="flex items-start justify-between gap-2 w-full">
                <div className={`p-2 rounded-xl border ${option.colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                {option.badge && (
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    isSelected 
                      ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                      : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                  }`}>
                    {option.badge}
                  </span>
                )}
              </div>

              <div className="mt-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {option.name}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                  {option.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
