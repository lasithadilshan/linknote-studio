/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AISettings, AIError } from './aiTypes';
import { getAIProviderInstance, loadAISettings } from './aiProviderRegistry';
import { getPromptTemplate } from './promptTemplates';

export const aiClient = {
  /**
   * Generates completion for a direct prompt using the configured active provider.
   */
  async generateCompletion(
    prompt: string,
    customSettings?: AISettings,
    systemInstruction?: string,
    signal?: AbortSignal
  ): Promise<string> {
    const settings = customSettings || loadAISettings();

    if (!settings.enabled) {
      const err: AIError = new Error('AI Assistant is currently disabled. Enable it in Settings.');
      err.code = 'MISSING_PROVIDER';
      throw err;
    }

    if (!prompt.trim()) {
      const err: AIError = new Error('Prompt content cannot be empty.');
      err.code = 'EMPTY_CONTENT';
      throw err;
    }

    const providerInstance = getAIProviderInstance(settings.provider);
    return (providerInstance as any).generateCompletion(prompt, settings, systemInstruction, signal);
  },

  /**
   * Generates a completion by prefixing/wrapping the note content in a pre-configured template.
   */
  async executeTemplate(
    templateId: string,
    noteContent: string,
    customSettings?: AISettings,
    signal?: AbortSignal
  ): Promise<string> {
    const template = getPromptTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    if (!noteContent.trim()) {
      const err: AIError = new Error('The note is empty. Please add some text before asking AI to process it.');
      err.code = 'EMPTY_CONTENT';
      throw err;
    }

    const prompt = `${template.prompt}${noteContent}`;
    const sysInstruction = 'You are a helpful and professional writing assistant in LinkNote Studio. Return your output cleanly formatted in markdown. Do not repeat the prompt instructions.';

    return this.generateCompletion(prompt, customSettings, sysInstruction, signal);
  },

  /**
   * Tests the connection for a given configuration.
   */
  async testConnection(settings: AISettings): Promise<boolean> {
    if (!settings.provider) {
      const err: AIError = new Error('No provider selected.');
      err.code = 'MISSING_PROVIDER';
      throw err;
    }

    const providerInstance = getAIProviderInstance(settings.provider);
    return providerInstance.testConnection(settings);
  }
};
