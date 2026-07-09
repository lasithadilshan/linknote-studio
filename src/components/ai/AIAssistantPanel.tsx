/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Scissors, 
  Languages, 
  Check, 
  AlertTriangle, 
  Loader2, 
  HelpCircle,
  Settings,
  ArrowRight,
  Globe,
  Plus
} from 'lucide-react';
import { PromptTemplate, AISettings } from '../../services/ai/aiTypes';
import { PROMPT_TEMPLATES } from '../../services/ai/promptTemplates';
import { loadAISettings } from '../../services/ai/aiProviderRegistry';
import { aiClient } from '../../services/ai/aiClient';
import { AIActionButton } from './AIActionButton';
import { AIResultDialog } from './AIResultDialog';
import { useToast } from '../../hooks/useToast';
import { AISettingsModal } from './AISettingsModal';

interface AIAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  noteContent: string;
  selectedText: string;
  onReplaceContent: (newContent: string) => void;
  onInsertAtCursor: (textToInsert: string) => void;
  onAppendContent: (textToAppend: string) => void;
  onSaveAsNewNote: (title: string, content: string, tags?: string[]) => void;
  onApplyTitleAndTags: (title?: string, tags?: string[]) => void;
}

export function AIAssistantPanel({
  isOpen,
  onClose,
  noteContent,
  selectedText,
  onReplaceContent,
  onInsertAtCursor,
  onAppendContent,
  onSaveAsNewNote,
  onApplyTitleAndTags
}: AIAssistantPanelProps) {
  const { toast } = useToast();
  
  // Settings & Configuration states
  const [settings, setSettings] = useState<AISettings>(loadAISettings());
  const [isConfigured, setIsConfigured] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Accordion state
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    summary: true,
    edit: false,
    translate: false,
    productivity: false,
    general: false,
    code: false
  });

  // Dynamic Custom Translation Target Language
  const [customLanguage, setCustomLanguage] = useState('');

  // AI Operation Execution State
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentActionName, setCurrentActionName] = useState('');
  const [currentActionId, setCurrentActionId] = useState('');
  const [generatedResult, setGeneratedResult] = useState('');
  const [isResultOpen, setIsResultOpen] = useState(false);

  // AbortController reference for cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  // Reload settings and check if AI is correctly configured on open
  useEffect(() => {
    const activeSettings = loadAISettings();
    setSettings(activeSettings);
    
    // Check if AI is configured (enabled and possesses correct API Key or custom path)
    const hasKey = !!(
      (activeSettings.provider === 'gemini' && activeSettings.geminiKey) ||
      (activeSettings.provider === 'openrouter' && activeSettings.openRouterKey) ||
      (activeSettings.provider === 'groq' && activeSettings.groqKey) ||
      (activeSettings.provider === 'openai-custom' && activeSettings.customBaseUrl)
    );
    
    setIsConfigured(activeSettings.enabled && hasKey);
  }, [isOpen, isSettingsModalOpen]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Listen to command palette events to trigger AI actions instantly
  useEffect(() => {
    const handleRunSummary = () => {
      handleExecuteAIAction('summarize', 'Short Summary');
    };
    const handleRunImprove = () => {
      handleExecuteAIAction('improve_clarity', 'Improve Clarity');
    };
    window.addEventListener('linknote-ai-summary', handleRunSummary);
    window.addEventListener('linknote-ai-improve', handleRunImprove);
    return () => {
      window.removeEventListener('linknote-ai-summary', handleRunSummary);
      window.removeEventListener('linknote-ai-improve', handleRunImprove);
    };
  }, [isConfigured, selectedText, noteContent]);

  if (!isOpen) return null;

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsGenerating(false);
      toast('AI generation cancelled.', 'info');
    }
  };

  const handleExecuteAIAction = async (templateId: string, templateName: string, customPromptText?: string) => {
    if (!isConfigured) {
      toast('AI Assistant is not fully configured yet. Please enter an API key.', 'error');
      return;
    }

    const textToProcess = selectedText.trim() ? selectedText : noteContent;

    if (!textToProcess.trim()) {
      toast('The active note is empty. Add content or select text first.', 'error');
      return;
    }

    setIsGenerating(true);
    setCurrentActionName(templateName);
    setCurrentActionId(templateId);
    setGeneratedResult('');

    // Create abort controller for cancellation
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      let result = '';
      if (customPromptText) {
        // Handle dynamic custom prompts (like custom language translation)
        const fullPrompt = `${customPromptText}${textToProcess}`;
        const sysInstruction = 'You are a helpful translation assistant in LinkNote Studio. Return your output cleanly formatted in markdown.';
        result = await aiClient.generateCompletion(fullPrompt, settings, sysInstruction, controller.signal);
      } else {
        // Execute pre-defined template
        result = await aiClient.executeTemplate(templateId, textToProcess, settings, controller.signal);
      }

      setGeneratedResult(result);
      setIsResultOpen(true);
    } catch (err: any) {
      // Don't show toast if it was a user abort action
      if (err.name === 'AbortError' || err.message?.toLowerCase().includes('abort') || controller.signal.aborted) {
        console.log('AI Generation aborted.');
        return;
      }
      
      let errorMsg = err.message || 'Failed to complete AI request';
      if (err.code === 'INVALID_API_KEY') {
        errorMsg = 'Invalid API key credentials. Please double-check your workspace settings.';
      } else if (err.code === 'QUOTA_EXCEEDED') {
        errorMsg = 'Rate limit or billing quota exceeded on your API credentials.';
      } else if (err.code === 'CORS_BLOCKED') {
        errorMsg = 'API request blocked by browser CORS policy. Check custom gateway.';
      }
      
      toast(errorMsg, 'error');
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleCustomLanguageTranslate = (e: React.FormEvent) => {
    e.preventDefault();
    const language = customLanguage.trim();
    if (!language) {
      toast('Please input a target language (e.g. French, Japanese, Tamil)', 'error');
      return;
    }
    const customPrompt = `Please translate the following text into elegant, fluent, and grammatically correct ${language}. Keep any code segments, markups or system syntax exactly in English if appropriate:\n\n`;
    handleExecuteAIAction('custom_translate', `Translate to ${language}`, customPrompt);
  };

  // Group prompt templates by categories
  const templatesByCategory = {
    summary: PROMPT_TEMPLATES.filter(t => t.category === 'summary' && t.id !== 'action_items' && t.id !== 'extract_key_points'),
    edit: PROMPT_TEMPLATES.filter(t => t.category === 'edit' && t.id !== 'convert_markdown' && t.id !== 'generate_headings' && t.id !== 'generate_toc' && t.id !== 'format_proj_doc' && t.id !== 'format_meeting_notes'),
    markdown: PROMPT_TEMPLATES.filter(t => ['convert_markdown', 'generate_headings', 'generate_toc', 'format_proj_doc', 'format_meeting_notes'].includes(t.id)),
    productivity: PROMPT_TEMPLATES.filter(t => ['action_items', 'extract_key_points', 'create_flashcards', 'create_quiz', 'create_checklist'].includes(t.id)),
    translate: PROMPT_TEMPLATES.filter(t => t.category === 'translate'),
    general: PROMPT_TEMPLATES.filter(t => ['generate_better_title', 'suggest_tags'].includes(t.id)),
    code: PROMPT_TEMPLATES.filter(t => t.category === 'code')
  };

  // Check which source text selection state is active
  const hasSelection = selectedText.trim().length > 0;
  const selectionLength = selectedText.trim().length;

  return (
    <div id="ai-assistant-side-panel" className="w-full md:w-[380px] shrink-0 border-l border-slate-200/50 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/10 backdrop-blur-md flex flex-col h-full overflow-hidden animate-slide-left relative select-none">
      
      {/* Dynamic Overlay loading screen while active AI process is compiling */}
      {isGenerating && (
        <div className="absolute inset-0 z-40 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
          <div className="relative mb-4">
            <div className="h-12 w-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <Sparkles className="h-5 w-5 text-indigo-500 absolute top-3.5 left-3.5 animate-pulse" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-display">
            AI Assistant Compiling...
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs leading-relaxed">
            Running <strong>{currentActionName}</strong> on {hasSelection ? `${selectionLength} selected characters` : 'full note'}. This can take a few seconds...
          </p>
          
          <button
            onClick={handleCancelGeneration}
            className="mt-6 px-4 py-2 border border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl text-xs font-semibold uppercase tracking-wider cursor-pointer transition-all"
          >
            Cancel Generation
          </button>
        </div>
      )}

      {/* Header section with closing and text indicators */}
      <div className="px-5 py-4 border-b border-slate-200/50 dark:border-white/10 flex items-center justify-between bg-white/40 dark:bg-slate-900/20 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-display">
            AI Copilot Studio
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
          title="Close AI Panel (Cmd/Ctrl + Shift + A)"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Selected Text context status indicator */}
      <div className="px-5 py-3 bg-indigo-500/5 border-b border-slate-200/50 dark:border-white/10 flex items-center justify-between text-[11px] shrink-0 font-semibold">
        {hasSelection ? (
          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
            <Scissors className="h-3.5 w-3.5" />
            <span>Using Selected Text ({selectionLength} chars)</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <FileText className="h-3.5 w-3.5 text-slate-400" />
            <span>Using Full Note Content</span>
          </div>
        )}
        <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
          {hasSelection ? 'Selection' : 'Note'}
        </span>
      </div>

      {/* Scrollable list of Accordion groups */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
        
        {/* If AI is NOT configured or disabled, display friendly setup instructions card */}
        {!isConfigured ? (
          <div className="p-5 border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-slate-900/30 backdrop-blur-md rounded-2xl text-center space-y-4 animate-fade-in my-2">
            <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                Configure AI Workspace
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Connect your workspace to Google Gemini or OpenRouter to unlock smart summaries, translations, writing polishes, and code reviews.
              </p>
            </div>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-1 hover:scale-[1.01]"
            >
              <Settings className="h-3.5 w-3.5 animate-spin-slow" />
              <span>Configure API Keys</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <p className="text-[9px] text-slate-400 italic">
              AI connection is optional. Your credentials are saved directly on this browser.
            </p>
          </div>
        ) : (
          /* Render Categories */
          <div className="space-y-3 pb-8">
            
            {/* Category 1: Summarize */}
            <div className="border border-slate-200/50 dark:border-white/10 rounded-2xl overflow-hidden bg-white/20 dark:bg-slate-900/10">
              <button
                onClick={() => toggleCategory('summary')}
                className="w-full px-4 py-3 bg-white/30 dark:bg-slate-900/20 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-500" />
                  1. Summarize
                </span>
                {expandedCategories.summary ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {expandedCategories.summary && (
                <div className="p-3 bg-transparent border-t border-slate-200/40 dark:border-white/5 space-y-2 animate-fade-in">
                  {templatesByCategory.summary.map(t => (
                    <AIActionButton key={t.id} template={t} onClick={handleExecuteAIAction} />
                  ))}
                </div>
              )}
            </div>

            {/* Category 2: Improve Writing */}
            <div className="border border-slate-200/50 dark:border-white/10 rounded-2xl overflow-hidden bg-white/20 dark:bg-slate-900/10">
              <button
                onClick={() => toggleCategory('edit')}
                className="w-full px-4 py-3 bg-white/30 dark:bg-slate-900/20 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  2. Improve Writing
                </span>
                {expandedCategories.edit ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {expandedCategories.edit && (
                <div className="p-3 bg-transparent border-t border-slate-200/40 dark:border-white/5 space-y-2 animate-fade-in">
                  {templatesByCategory.edit.map(t => (
                    <AIActionButton key={t.id} template={t} onClick={handleExecuteAIAction} />
                  ))}
                </div>
              )}
            </div>

            {/* Category 3: Markdown Tools */}
            <div className="border border-slate-200/50 dark:border-white/10 rounded-2xl overflow-hidden bg-white/20 dark:bg-slate-900/10">
              <button
                onClick={() => toggleCategory('markdown')}
                className="w-full px-4 py-3 bg-white/30 dark:bg-slate-900/20 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-500" />
                  3. Markdown Tools
                </span>
                {expandedCategories.markdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {expandedCategories.markdown && (
                <div className="p-3 bg-transparent border-t border-slate-200/40 dark:border-white/5 space-y-2 animate-fade-in">
                  {templatesByCategory.markdown.map(t => (
                    <AIActionButton key={t.id} template={t} onClick={handleExecuteAIAction} />
                  ))}
                </div>
              )}
            </div>

            {/* Category 4: Productivity Tools */}
            <div className="border border-slate-200/50 dark:border-white/10 rounded-2xl overflow-hidden bg-white/20 dark:bg-slate-900/10">
              <button
                onClick={() => toggleCategory('productivity')}
                className="w-full px-4 py-3 bg-white/30 dark:bg-slate-900/20 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-indigo-500" />
                  4. Productivity Tools
                </span>
                {expandedCategories.productivity ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {expandedCategories.productivity && (
                <div className="p-3 bg-transparent border-t border-slate-200/40 dark:border-white/5 space-y-2 animate-fade-in">
                  {templatesByCategory.productivity.map(t => (
                    <AIActionButton key={t.id} template={t} onClick={handleExecuteAIAction} />
                  ))}
                </div>
              )}
            </div>

            {/* Category 5: Translation */}
            <div className="border border-slate-200/50 dark:border-white/10 rounded-2xl overflow-hidden bg-white/20 dark:bg-slate-900/10">
              <button
                onClick={() => toggleCategory('translate')}
                className="w-full px-4 py-3 bg-white/30 dark:bg-slate-900/20 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Languages className="h-4 w-4 text-indigo-500" />
                  5. Translation
                </span>
                {expandedCategories.translate ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {expandedCategories.translate && (
                <div className="p-3 bg-transparent border-t border-slate-200/40 dark:border-white/5 space-y-2 animate-fade-in">
                  {templatesByCategory.translate.map(t => (
                    <AIActionButton key={t.id} template={t} onClick={handleExecuteAIAction} />
                  ))}
                  
                  {/* Dynamic Custom Target Language Input Form */}
                  <form onSubmit={handleCustomLanguageTranslate} className="pt-2 border-t border-slate-200/40 dark:border-white/5 space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Translate to other language:
                    </label>
                    <div className="flex gap-1.5">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="French, Japanese, German..."
                          value={customLanguage}
                          onChange={(e) => setCustomLanguage(e.target.value)}
                          className="w-full px-3 py-2 pl-8 border border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-white/5 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                        />
                        <Globe className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      </div>
                      <button
                        type="submit"
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase rounded-xl cursor-pointer transition-colors shadow-xs"
                      >
                        Translate
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Category 6: Title & Tags */}
            <div className="border border-slate-200/50 dark:border-white/10 rounded-2xl overflow-hidden bg-white/20 dark:bg-slate-900/10">
              <button
                onClick={() => toggleCategory('general')}
                className="w-full px-4 py-3 bg-white/30 dark:bg-slate-900/20 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-indigo-500" />
                  6. Title and Tags
                </span>
                {expandedCategories.general ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {expandedCategories.general && (
                <div className="p-3 bg-transparent border-t border-slate-200/40 dark:border-white/5 space-y-2 animate-fade-in">
                  {templatesByCategory.general.map(t => (
                    <AIActionButton key={t.id} template={t} onClick={handleExecuteAIAction} />
                  ))}
                </div>
              )}
            </div>

            {/* Category 7: Code Tools */}
            <div className="border border-slate-200/50 dark:border-white/10 rounded-2xl overflow-hidden bg-white/20 dark:bg-slate-900/10">
              <button
                onClick={() => toggleCategory('code')}
                className="w-full px-4 py-3 bg-white/30 dark:bg-slate-900/20 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-500" />
                  7. Code Tools
                </span>
                {expandedCategories.code ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {expandedCategories.code && (
                <div className="p-3 bg-transparent border-t border-slate-200/40 dark:border-white/5 space-y-2 animate-fade-in">
                  {templatesByCategory.code.map(t => (
                    <AIActionButton key={t.id} template={t} onClick={handleExecuteAIAction} />
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* Safety Notice Footer Card */}
      <div className="p-4 border-t border-slate-200/50 dark:border-white/10 bg-white/40 dark:bg-slate-900/20 flex gap-2.5 shrink-0 items-start">
        <AlertTriangle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[10px] leading-normal text-slate-400 dark:text-slate-500">
          AI output may be inaccurate. Review before replacing your note.
        </p>
      </div>

      {/* AI Settings Modal (to open from setup screen directly inside workspace) */}
      <AISettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />

      {/* Result dialog modal overlay */}
      <AIResultDialog
        isOpen={isResultOpen}
        onClose={() => setIsResultOpen(false)}
        resultText={generatedResult}
        templateId={currentActionId}
        templateName={currentActionName}
        onReplaceContent={onReplaceContent}
        onInsertAtCursor={onInsertAtCursor}
        onAppendContent={onAppendContent}
        onSaveAsNewNote={onSaveAsNewNote}
        onApplyTitleAndTags={onApplyTitleAndTags}
      />

    </div>
  );
}
