/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ParsedTask {
  noteId: string;
  noteTitle: string;
  text: string;
  completed: boolean;
  index: number; // 0-based position in the note's list of tasks
  folder: string;
  tags: string[];
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
}

/**
 * Calculates task statistics for a note's content.
 */
export function calculateTaskStats(content: string): TaskStats {
  if (!content) return { total: 0, completed: 0, pending: 0 };
  
  const regex = /^\s*[-*+]\s+\[([ xX])\]\s+(.+)$/gm;
  let total = 0;
  let completed = 0;
  let match;
  
  // Clean up any code blocks to avoid counting tasks inside code blocks
  const cleanContent = content.replace(/```[\s\S]*?```/g, '');
  
  while ((match = regex.exec(cleanContent)) !== null) {
    total++;
    if (match[1].toLowerCase() === 'x') {
      completed++;
    }
  }
  
  return {
    total,
    completed,
    pending: total - completed,
  };
}

/**
 * Parses all tasks from a note's content.
 */
export function parseTasks(noteId: string, noteTitle: string, content: string, folder: string, tags: string[]): ParsedTask[] {
  if (!content) return [];
  
  const regex = /^\s*[-*+]\s+\[([ xX])\]\s+(.+)$/gm;
  const tasks: ParsedTask[] = [];
  let index = 0;
  let match;
  
  // We do NOT strip code blocks here, but we should be careful. To be safe, we scan the whole text line by line.
  const lines = content.split('\n');
  let insideCodeBlock = false;
  
  lines.forEach((line) => {
    if (line.trim().startsWith('```')) {
      insideCodeBlock = !insideCodeBlock;
      return;
    }
    
    if (insideCodeBlock) return;
    
    const taskRegex = /^\s*[-*+]\s+\[([ xX])\]\s+(.+)$/;
    const m = line.match(taskRegex);
    if (m) {
      tasks.push({
        noteId,
        noteTitle,
        text: m[2].trim(),
        completed: m[1].toLowerCase() === 'x',
        index,
        folder,
        tags,
      });
      index++;
    }
  });
  
  return tasks;
}

/**
 * Updates a specific task's completion status inside a note's markdown content.
 */
export function toggleTaskInContent(content: string, taskIndex: number, completed: boolean): string {
  if (!content) return content;
  
  const lines = content.split('\n');
  let currentIndex = 0;
  let insideCodeBlock = false;
  
  const updatedLines = lines.map((line) => {
    if (line.trim().startsWith('```')) {
      insideCodeBlock = !insideCodeBlock;
      return line;
    }
    
    if (insideCodeBlock) return line;
    
    const taskRegex = /^(\s*[-*+]\s+\[)([ xX])(\]\s+.+)$/;
    const m = line.match(taskRegex);
    if (m) {
      if (currentIndex === taskIndex) {
        currentIndex++;
        const replacementChar = completed ? 'x' : ' ';
        return `${m[1]}${replacementChar}${m[3]}`;
      }
      currentIndex++;
    }
    return line;
  });
  
  return updatedLines.join('\n');
}
