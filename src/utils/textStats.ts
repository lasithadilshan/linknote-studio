/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NoteStats } from '../types';

export function calculateStats(content: string): NoteStats {
  if (!content) {
    return {
      words: 0,
      chars: 0,
      lines: 0,
      readingTime: 0,
    };
  }

  const chars = content.length;
  
  // Word count: split by whitespace but exclude empty strings
  const wordsArray = content.trim().split(/\s+/);
  const words = wordsArray[0] === '' ? 0 : wordsArray.length;

  // Line count: split by newline
  const lines = content.split('\n').length;

  // Reading time: assume 200 words per minute, output in decimal minutes
  const readingTime = Math.max(1, Math.ceil(words / 200));

  return {
    words,
    chars,
    lines,
    readingTime,
  };
}
