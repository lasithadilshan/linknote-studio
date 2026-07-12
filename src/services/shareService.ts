/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import LZString from 'lz-string';
import { Note } from '../types';

/**
 * EXPLANATION / DESIGN NOTE:
 * Frontend-only applications cannot create truly tiny permanent links
 * because the entire note content must be stored and encoded directly inside the URL.
 * True short links (e.g., bit.ly/abcde) require a backend server or a URL shortener
 * service with database storage to map a short ID to the full content payload.
 * To optimize this for our serverless setup, we use an ultra-compact JSON representation
 * with single-character keys and compress it using LZ-String's base61/URI encoder.
 */

export interface CompactPayload {
  v: number;       // version (1)
  t: string;       // title
  c: string;       // content
  g: string[];     // tags
}

export interface LegacyPayload {
  t?: string;       // title
  c?: string;       // content
  tg?: string[];    // tags
  ic?: boolean;     // isCode
  lang?: string;    // codeLanguage
  d?: string;       // shared date
}

export const shareService = {
  /**
   * Generates an ultra-compact compressed URL segment for a note snapshot
   */
  createShareLink(note: Note): string {
    const payload: CompactPayload = {
      v: 1,
      t: note.title || 'Untitled Shared Note',
      c: note.content || '',
      g: note.tags || [],
    };

    const jsonString = JSON.stringify(payload);
    const compressed = LZString.compressToEncodedURIComponent(jsonString);
    
    const origin = window.location.origin;
    const baseUrl = (import.meta as any).env?.BASE_URL || '/';
    
    // Normalize path to avoid double slashes and ensure compatibility
    const cleanBaseUrl = baseUrl.startsWith('/') ? baseUrl : '/' + baseUrl;
    const normalizedBaseUrl = cleanBaseUrl.endsWith('/') ? cleanBaseUrl : `${cleanBaseUrl}/`;
    
    return `${origin}${normalizedBaseUrl}#/s?d=${compressed}`;
  },

  /**
   * Decodes a compressed URL segment or legacy URL into a note object
   */
  parseShareLink(inputString: string): Partial<Note> & { sharedAt?: string } {
    try {
      let compressedData = '';

      // 1. Try modern path: #/s?d=... or #/s#d=...
      if (inputString.includes('d=')) {
        const dIndex = inputString.indexOf('d=');
        if (dIndex !== -1) {
          const temp = inputString.substring(dIndex + 2);
          compressedData = temp.split(/[&#]/)[0];
        }
      }

      // 2. Try legacy fallback: #/share?data=... or #/share#data=...
      if (!compressedData && inputString.includes('data=')) {
        const dataIndex = inputString.indexOf('data=');
        if (dataIndex !== -1) {
          const temp = inputString.substring(dataIndex + 5);
          compressedData = temp.split(/[&#]/)[0];
        }
      }

      if (!compressedData) {
        throw new Error('No shared note data payload found in the link.');
      }

      const decompressed = LZString.decompressFromEncodedURIComponent(compressedData);
      
      if (!decompressed) {
        throw new Error('Decompression failed. The shared link is invalid, corrupted, or truncated.');
      }

      let payload: any;
      try {
        payload = JSON.parse(decompressed);
      } catch (jsonErr) {
        throw new Error('Failed to parse share link payload. The data is corrupted.');
      }

      // If version is specified, check compatibility
      if (payload && typeof payload === 'object' && payload.v !== undefined) {
        if (payload.v !== 1) {
          throw new Error(`Unsupported payload version (v: ${payload.v}). Your application may need an update.`);
        }
        
        // Compact v1 Payload
        const compact = payload as CompactPayload;
        if (compact.t === undefined || compact.c === undefined) {
          throw new Error('Corrupted snapshot link: missing title or content properties.');
        }

        return {
          title: compact.t || 'Untitled Shared Note',
          content: compact.c || '',
          tags: compact.g || [],
          isCode: false,
          codeLanguage: 'markdown',
          isEncrypted: false,
          isFavorite: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sharedAt: new Date().toISOString(),
        };
      } else if (payload && typeof payload === 'object') {
        // Legacy Payload format (unversioned/v0)
        const legacy = payload as LegacyPayload;
        return {
          title: legacy.t || 'Untitled Shared Note',
          content: legacy.c || '',
          tags: legacy.tg || [],
          isCode: !!legacy.ic,
          codeLanguage: legacy.lang || 'javascript',
          isEncrypted: false,
          isFavorite: false,
          createdAt: legacy.d || new Date().toISOString(),
          updatedAt: legacy.d || new Date().toISOString(),
          sharedAt: legacy.d || new Date().toISOString(),
        };
      } else {
        throw new Error('Invalid share payload structure.');
      }
    } catch (err: any) {
      throw new Error(err.message || 'The shared note link is invalid or has been truncated.');
    }
  }
};
