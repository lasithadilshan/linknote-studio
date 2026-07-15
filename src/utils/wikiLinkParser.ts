/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Extracts unique wiki-link titles [[Like This]] from markdown content.
 */
export function extractWikiLinks(content: string): string[] {
  if (!content) return [];
  
  // Strip code blocks to avoid extracting wiki links from code snippets
  const cleanContent = content.replace(/```[\s\S]*?```/g, '');
  
  const regex = /\[\[(.*?)\]\]/g;
  const titles = new Set<string>();
  let match;
  
  while ((match = regex.exec(cleanContent)) !== null) {
    const title = match[1].trim();
    if (title) {
      titles.add(title);
    }
  }
  
  return Array.from(titles);
}

/**
 * Replaces [[Note Title]] with a standard custom anchor or format that can be rendered or hooked.
 */
export function formatWikiLinks(content: string, existingTitlesMap: Record<string, string>): string {
  if (!content) return content;
  
  // Strip code blocks first, but we want to be able to replace them back if we parse the whole markdown.
  // Actually, we can use a custom markdown parser component or hook into ReactMarkdown,
  // or simply replace wiki links in HTML / Markdown preview.
  // Let's do a replace that turns `[[Title]]` into `[Title](#/note-by-title/${encodeURIComponent(Title)})`
  // or a custom link like `[Title](#/note-title/${encodeURIComponent(Title)})`.
  // Let's see: in HashRouter, routes can handle `/#/note-title/:title` which can resolve the note and navigate to it!
  // This is extremely elegant and perfectly clean because it handles both existing and non-existing notes.
  
  return content.replace(/\[\[(.*?)\]\]/g, (match, rawTitle) => {
    const title = rawTitle.trim();
    if (!title) return match;
    return `[${title}](#/note-title/${encodeURIComponent(title)})`;
  });
}
