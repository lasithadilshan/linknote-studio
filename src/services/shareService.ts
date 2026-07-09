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
    
    // We construct a full URL to the /share route with the compressed payload in the hash
    const origin = window.location.origin;
    return `${origin}/share#data=${compressed}`;
  },

  /**
   * Decodes a compressed URL hash segment into a readable note object
   */
  parseShareLink(hash: string): Partial<Note> & { sharedAt?: string } {
    try {
      // Find 'data=' in the hash
      const dataIndex = hash.indexOf('data=');
      if (dataIndex === -1) {
        throw new Error('No shared data payload found in link.');
      }

      const compressedData = hash.substring(dataIndex + 5);
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
