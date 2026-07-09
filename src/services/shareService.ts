/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import LZString from 'lz-string';
import { Note } from '../types';

interface SharedNotePayload {
  t: string;       // title
  c: string;       // content
  tg: string[];    // tags
  ic: boolean;     // isCode
  lang: string;    // codeLanguage
  d: string;       // shared date
}

export const shareService = {
  /**
   * Generates a compressed URL hash segment for a note snapshot
   */
  createShareLink(note: Note): string {
    const payload: SharedNotePayload = {
      t: note.title || 'Untitled Shared Note',
      c: note.content || '',
      tg: note.tags || [],
      ic: !!note.isCode,
      lang: note.codeLanguage || 'javascript',
      d: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(payload);
    const compressed = LZString.compressToEncodedURIComponent(jsonString);
    
    // Construct the correct base path using import.meta.env.BASE_URL
    const origin = window.location.origin;
    const baseUrl = (import.meta as any).env?.BASE_URL || '/';
    // Ensure we avoid double slashes and have a trailing slash before HashRouter path
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    
    return `${origin}${normalizedBaseUrl}#/share?data=${compressed}`;
  },

  /**
   * Decodes a compressed URL hash segment into a readable note object
   */
  parseShareLink(inputString: string): Partial<Note> & { sharedAt?: string } {
    try {
      let compressedData = '';

      // 1. Try using URLSearchParams if there is a query string somewhere
      if (inputString.includes('?')) {
        const queryString = inputString.split('?')[1];
        // Clean up any hash fragments if they exist after the query string
        const cleanQueryString = queryString.split('#')[0];
        const params = new URLSearchParams(cleanQueryString);
        const dataParam = params.get('data');
        if (dataParam) {
          compressedData = dataParam;
        }
      }

      // 2. Fallback: Search for 'data=' anywhere in the input
      if (!compressedData) {
        const dataIndex = inputString.indexOf('data=');
        if (dataIndex !== -1) {
          // Extract everything after 'data='
          const temp = inputString.substring(dataIndex + 5);
          // Split at next '&' or '#' or '/' if present to avoid trailing garbage
          compressedData = temp.split(/[&#]/)[0];
        }
      }

      if (!compressedData) {
        throw new Error('No shared data payload found in link.');
      }

      const decompressed = LZString.decompressFromEncodedURIComponent(compressedData);
      
      if (!decompressed) {
        throw new Error('Failed to decompress link content. The link might be corrupted or incomplete.');
      }

      const payload = JSON.parse(decompressed) as SharedNotePayload;
      
      return {
        title: payload.t || 'Untitled Shared Note',
        content: payload.c || '',
        tags: payload.tg || [],
        isCode: !!payload.ic,
        codeLanguage: payload.lang || 'javascript',
        isEncrypted: false, // shared links are decrypted snapshots
        isFavorite: false,
        createdAt: payload.d || new Date().toISOString(),
        updatedAt: payload.d || new Date().toISOString(),
        sharedAt: payload.d,
      };
    } catch (err: any) {
      throw new Error(err.message || 'The shared note link is invalid or has been truncated.');
    }
  }
};
