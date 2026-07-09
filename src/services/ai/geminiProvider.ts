/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIProviderInstance, AISettings, AIError } from './aiTypes';

export const geminiProvider: AIProviderInstance = {
  async generateCompletion(
    prompt: string,
    settings: AISettings,
    systemInstruction?: string,
    signal?: AbortSignal
  ): Promise<string> {
    const apiKey = settings.geminiKey?.trim();
    const model = settings.geminiModel?.trim() || 'gemini-2.5-flash-lite';

    if (!prompt.trim()) {
      const err: AIError = new Error('Prompt cannot be empty');
      err.code = 'EMPTY_CONTENT';
      throw err;
    }

    if (!apiKey) {
      const err: AIError = new Error('Google Gemini API Key is required');
      err.code = 'INVALID_API_KEY';
      throw err;
    }

    if (!model) {
      const err: AIError = new Error('Model name is required');
      err.code = 'MISSING_MODEL';
      throw err;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const requestBody: any = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: settings.temperature ?? 0.7,
        maxOutputTokens: settings.maxTokens ?? 2048
      }
    };

    if (systemInstruction) {
      requestBody.systemInstruction = {
        parts: [
          {
            text: systemInstruction
          }
        ]
      };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Gemini API error (Status ${response.status})`;
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
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('Received empty response or unexpected data format from Gemini API.');
      }

      return text;
    } catch (e: any) {
      if (e.code) throw e; // Re-throw parsed AIErrors

      const err: AIError = new Error(e.message || 'Network request failed');
      if (!navigator.onLine) {
        err.code = 'NETWORK_ERROR';
      } else {
        // Direct API request failed, could be CORS or blocked
        err.code = 'CORS_BLOCKED';
        err.message = `${e.message || 'CORS or Network error.'} If you are running locally, make sure you do not have browser extensions blocking Google APIs.`;
      }
      throw err;
    }
  },

  async testConnection(settings: AISettings): Promise<boolean> {
    const apiKey = settings.geminiKey?.trim();
    const model = settings.geminiModel?.trim() || 'gemini-2.5-flash-lite';
    
    if (!apiKey) {
      throw new Error('Missing API Key');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Ping' }] }],
        generationConfig: { maxOutputTokens: 5 }
      })
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        const err: AIError = new Error('Invalid Gemini API Key');
        err.code = 'INVALID_API_KEY';
        throw err;
      }
      throw new Error(`Connection test failed with status ${response.status}`);
    }

    return true;
  }
};
