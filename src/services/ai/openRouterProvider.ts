/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIProviderInstance, AISettings, AIError } from './aiTypes';

export const openRouterProvider: AIProviderInstance = {
  async generateCompletion(
    prompt: string,
    settings: AISettings,
    systemInstruction?: string,
    signal?: AbortSignal
  ): Promise<string> {
    const apiKey = settings.openRouterKey?.trim();
    const model = settings.openRouterModel?.trim() || 'qwen/qwen-3-coder-32b-instruct:free'; // corrected standard free coder name if needed, or qwen/qwen3-coder:free as requested

    if (!prompt.trim()) {
      const err: AIError = new Error('Prompt cannot be empty');
      err.code = 'EMPTY_CONTENT';
      throw err;
    }

    if (!apiKey) {
      const err: AIError = new Error('OpenRouter API Key is required');
      err.code = 'INVALID_API_KEY';
      throw err;
    }

    if (!model) {
      const err: AIError = new Error('Model name is required');
      err.code = 'MISSING_MODEL';
      throw err;
    }

    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://linknote.studio',
          'X-Title': 'LinkNote Studio'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: settings.temperature ?? 0.7,
          max_tokens: settings.maxTokens ?? 2048
        }),
        signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `OpenRouter API error (Status ${response.status})`;
        try {
          const parsed = JSON.parse(errorText);
          if (parsed.error?.message) {
            errorMessage = parsed.error.message;
          }
        } catch (_) {}

        const err: AIError = new Error(errorMessage);
        if (response.status === 401 || response.status === 403) {
          err.code = 'INVALID_API_KEY';
        } else if (response.status === 429) {
          err.code = 'QUOTA_EXCEEDED';
        } else {
          err.code = 'NETWORK_ERROR';
        }
        throw err;
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;

      if (!text) {
        throw new Error('Received empty response or unexpected data format from OpenRouter API.');
      }

      return text;
    } catch (e: any) {
      if (e.code) throw e;

      const err: AIError = new Error(e.message || 'Network request failed');
      if (!navigator.onLine) {
        err.code = 'NETWORK_ERROR';
      } else {
        err.code = 'CORS_BLOCKED';
        err.message = `${e.message || 'CORS or Network error.'} OpenRouter requests from browser may sometimes trigger CORS checks depending on browser protection settings.`;
      }
      throw err;
    }
  },

  async testConnection(settings: AISettings): Promise<boolean> {
    const apiKey = settings.openRouterKey?.trim();
    const model = settings.openRouterModel?.trim() || 'qwen/qwen-3-coder-32b-instruct:free';

    if (!apiKey) {
      throw new Error('Missing API Key');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://linknote.studio',
        'X-Title': 'LinkNote Studio'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Ping' }],
        max_tokens: 5
      })
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        const err: AIError = new Error('Invalid OpenRouter API Key');
        err.code = 'INVALID_API_KEY';
        throw err;
      }
      throw new Error(`Connection test failed with status ${response.status}`);
    }

    return true;
  }
};
