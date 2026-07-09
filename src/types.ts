/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Note {
  id: string;
  title: string;
  content: string;
  encryptedContent?: string; // Base64 ciphertext of AES-GCM encryption
  salt?: string;             // Base64 salt for PBKDF2
  iv?: string;               // Base64 initialization vector for AES-GCM
  isEncrypted: boolean;
  tags: string[];
  isFavorite: boolean;
  isCode: boolean;
  codeLanguage: string;
  createdAt: string;
  updatedAt: string;
}

export type Theme = 'light' | 'dark' | 'system';

export type EditorMode = 'edit' | 'preview' | 'split';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export interface NoteStats {
  words: number;
  chars: number;
  lines: number;
  readingTime: number; // in minutes
}

declare module 'lz-string' {
  export function compressToEncodedURIComponent(input: string): string;
  export function decompressFromEncodedURIComponent(input: string): string;
  export function compressToBase64(input: string): string;
  export function decompressFromBase64(input: string): string;
  export function compress(input: string): string;
  export function decompress(input: string): string;
}

