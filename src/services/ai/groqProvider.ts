/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIProviderInstance, AISettings, AIError } from './aiTypes';

export const groqProvider: AIProviderInstance = {
  async generateCompletion(
    prompt: string,
    settings: AISettings,
    systemInstruction?: string
  ): Promise<string> {
    const apiKey = settings.groqKey?.trim();
    const model = settings.groqModel?.trim() || 'llama-3.1-8b-instant';

    if (!prompt.trim()) {
      const err: AIError = new Error('Prompt cannot be empty');
      err.code = 'EMPTY_CONTENT';
      throw err;
    }

    if (!apiKey) {
      const err: AIError = new Error('Groq API Key is required');
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
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: settings.temperature ?? 0.7,
          max_tokens: settings.maxTokens ?? 2048
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Groq API error (Status ${response.status})`;
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
        throw new Error('Received empty response or unexpected data format from Groq API.');
      }

      return text;
    } catch (e: any) {
      if (e.code) throw e;

      const err: AIError = new Error(e.message || 'Network request failed');
      if (!navigator.onLine) {
        err.code = 'NETWORK_ERROR';
      } else {
        err.code = 'CORS_BLOCKED';
        err.message = `${e.message || 'CORS or Network error.'} Groq API calls directly from a client browser may sometimes trigger CORS policies depending on your browser security configuration.`;
      }
      throw err;
    }
  },

  async testConnection(settings: AISettings): Promise<boolean> {
    const apiKey = settings.groqKey?.trim();
    const model = settings.groqModel?.trim() || 'llama-3.1-8b-instant';

    if (!apiKey) {
      throw new Error('Missing API Key');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Ping' }],
        max_tokens: 5
      })
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        const err: AIError = new Error('Invalid Groq API Key');
        err.code = 'INVALID_API_KEY';
        throw err;
      }
      throw new Error(`Connection test failed with status ${response.status}`);
    }

    return true;
  }
};
