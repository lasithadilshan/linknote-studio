/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AIProvider = 'openrouter' | 'gemini' | 'groq' | 'openai-custom';

export interface AISettings {
  enabled: boolean;
  provider: AIProvider;
  openRouterKey: string;
  openRouterModel: string;
  geminiKey: string;
  geminiModel: string;
  groqKey: string;
  groqModel: string;
  customKey: string;
  customBaseUrl: string;
  customModel: string;
  temperature: number;
  maxTokens: number;
  saveKeysInBrowser: boolean; // True -> localStorage (persistent), False -> sessionStorage (session-only)
}

export interface AIProviderInstance {
  generateCompletion(
    prompt: string,
    settings: AISettings,
    systemInstruction?: string
  ): Promise<string>;
  
  testConnection(settings: AISettings): Promise<boolean>;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  prompt: string;
  category: 'summary' | 'edit' | 'translate' | 'code' | 'general';
}

export interface AIError extends Error {
  code?: 'INVALID_API_KEY' | 'MISSING_MODEL' | 'MISSING_PROVIDER' | 'CORS_BLOCKED' | 'QUOTA_EXCEEDED' | 'NETWORK_ERROR' | 'EMPTY_CONTENT' | 'UNSUPPORTED_PROVIDER';
}
