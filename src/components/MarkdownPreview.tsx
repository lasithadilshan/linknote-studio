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
    <div className="markdown-body p-6 select-text max-w-none h-full bg-white dark:bg-zinc-900/40 text-zinc-800 dark:text-zinc-200 overflow-x-hidden">
      <Markdown
        components={{
          table: ({ children }) => (
            <div className="overflow-x-auto w-full max-w-full my-4 border border-zinc-250 dark:border-zinc-800 rounded-xl">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 m-0 border-none">{children}</table>
            </div>
          ),
          img: ({ src, alt }) => (
            <img src={src} alt={alt} className="max-w-full h-auto rounded-xl shadow-xs my-4" referrerPolicy="no-referrer" />
          )
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
