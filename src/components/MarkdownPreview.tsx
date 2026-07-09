/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Markdown from 'react-markdown';

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  if (!content) {
    return (
      <div className="text-zinc-400 dark:text-zinc-500 italic text-sm p-4 select-none">
        Empty note. Start typing in the editor...
      </div>
    );
  }

  return (
    <div className="markdown-body p-6 select-text overflow-y-auto max-w-none h-full bg-white dark:bg-zinc-900/40 text-zinc-800 dark:text-zinc-200">
      <Markdown>{content}</Markdown>
    </div>
  );
}
