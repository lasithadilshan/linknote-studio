/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIProviderInstance, AISettings, AIError } from './aiTypes';

export const customOpenAIProvider: AIProviderInstance = {
  async generateCompletion(
    prompt: string,
    settings: AISettings,
    systemInstruction?: string
  ): Promise<string> {
    const apiKey = settings.customKey?.trim();
    let baseUrl = settings.customBaseUrl?.trim();
    const model = settings.customModel?.trim();

    if (!prompt.trim()) {
      const err: AIError = new Error('Prompt cannot be empty');
      err.code = 'EMPTY_CONTENT';
      throw err;
    }

    if (!baseUrl) {
      const err: AIError = new Error('Custom Base URL is required for custom OpenAI-compatible providers');
      err.code = 'NETWORK_ERROR';
      throw err;
    }

    if (!model) {
      const err: AIError = new Error('Model name is required');
      err.code = 'MISSING_MODEL';
      throw err;
    }

    // Clean base URL and ensure it has chat/completions
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    const endpointUrl = baseUrl.includes('/chat/completions') 
      ? baseUrl 
      : `${baseUrl}/chat/completions`;

    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    try {
      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages,
          temperature: settings.temperature ?? 0.7,
          max_tokens: settings.maxTokens ?? 2048
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Custom OpenAI API error (Status ${response.status})`;
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
        throw new Error('Received empty response or unexpected data format from custom endpoint.');
      }

      return text;
    } catch (e: any) {
      if (e.code) throw e;

      const err: AIError = new Error(e.message || 'Network request failed');
      if (!navigator.onLine) {
        err.code = 'NETWORK_ERROR';
      } else {
        err.code = 'CORS_BLOCKED';
        err.message = `${e.message || 'CORS or Network error.'} Make sure your custom endpoint allows requests from this origin (CORS headers enabled on your server, e.g. Access-Control-Allow-Origin: *).`;
      }
      throw err;
    }
  },

  async testConnection(settings: AISettings): Promise<boolean> {
    let baseUrl = settings.customBaseUrl?.trim();
    const apiKey = settings.customKey?.trim();
    const model = settings.customModel?.trim();

    if (!baseUrl) {
      throw new Error('Missing Base URL');
    }
    if (!model) {
      throw new Error('Missing Model Name');
    }

    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    const endpointUrl = baseUrl.includes('/chat/completions') 
      ? baseUrl 
      : `${baseUrl}/chat/completions`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Ping' }],
        max_tokens: 5
      })
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        const err: AIError = new Error('Invalid or unauthorized API key');
        err.code = 'INVALID_API_KEY';
        throw err;
      }
      throw new Error(`Connection test failed with status ${response.status}`);
    }

    return true;
  }
};
