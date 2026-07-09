/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import * as LucideIcons from 'lucide-react';
import { PromptTemplate } from '../../services/ai/aiTypes';

interface AIActionButtonProps {
  template: PromptTemplate;
  onClick: (templateId: string, templateName: string) => void;
  disabled?: boolean;
}

export function AIActionButton({ template, onClick, disabled = false }: AIActionButtonProps) {
  // Dynamically map icon name to Lucide Icon component
  const IconComponent = (LucideIcons as any)[template.icon] || LucideIcons.Sparkles;

  return (
    <button
      onClick={() => onClick(template.id, template.name)}
      disabled={disabled}
      className="w-full text-left p-3.5 bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 hover:border-indigo-500/30 hover:bg-indigo-500/5 dark:hover:bg-indigo-500/10 rounded-2xl transition-all cursor-pointer flex gap-3 group disabled:opacity-50 disabled:pointer-events-none disabled:border-slate-200 dark:disabled:border-white/5"
    >
      <div className="p-2.5 bg-slate-100 dark:bg-white/5 group-hover:bg-indigo-500/15 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 rounded-xl transition-colors shrink-0">
        <IconComponent className="h-4.5 w-4.5 group-hover:scale-110 transition-transform" />
      </div>
      
      <div className="space-y-0.5 min-w-0">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
          {template.name}
        </h4>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal line-clamp-2">
          {template.description}
        </p>
      </div>
    </button>
  );
}
