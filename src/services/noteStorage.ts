/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Note, NoteVersion } from '../types';
import { generateId } from '../utils/idGenerator';
import { calculateTaskStats, parseTasks, toggleTaskInContent } from '../utils/taskParser';
import { extractWikiLinks } from '../utils/wikiLinkParser';

const DB_NAME = 'LinkNoteStudioDB';
const DB_VERSION = 2; // Incremented DB_VERSION to accommodate version snapshots
const STORE_NAME = 'notes';
const VERSION_STORE_NAME = 'versions';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open database. Please enable browser storage.'));
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(VERSION_STORE_NAME)) {
        const vStore = db.createObjectStore(VERSION_STORE_NAME, { keyPath: 'id' });
        vStore.createIndex('noteId', 'noteId', { unique: false });
      }
    };
  });
}

// Normalize notes loaded from IndexedDB to ensure backward compatibility
const normalizeNote = (note: any): Note => {
  const content = note.content || '';
  const calculatedStats = calculateTaskStats(content);
  return {
    ...note,
    folder: note.folder || 'Personal',
    isDeleted: !!note.isDeleted,
    isFavorite: !!note.isFavorite,
    tags: Array.isArray(note.tags) ? note.tags : [],
    isCode: !!note.isCode,
    codeLanguage: note.codeLanguage || 'javascript',
    type: note.type || 'note',
    dailyDate: note.dailyDate || undefined,
    linkedNoteTitles: note.linkedNoteTitles || extractWikiLinks(content),
    taskStats: note.taskStats || calculatedStats,
  };
};

export const noteStorage = {
  async getAllNotes(): Promise<Note[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const notes = (request.result as any[]).map(normalizeNote);
        // Sort by updatedAt descending by default
        notes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        resolve(notes);
      };

      request.onerror = () => {
        reject(new Error('Failed to retrieve notes from storage.'));
      };
    });
  },

  async getActiveNotes(): Promise<Note[]> {
    const notes = await this.getAllNotes();
    return notes.filter((n) => !n.isDeleted);
  },

  async getDeletedNotes(): Promise<Note[]> {
    const notes = await this.getAllNotes();
    return notes.filter((n) => n.isDeleted);
  },

  async getNote(id: string): Promise<Note | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result ? normalizeNote(request.result) : null);
      };

      request.onerror = () => {
        reject(new Error(`Failed to retrieve note with id: ${id}`));
      };
    });
  },

  async createNote(noteData?: Partial<Note>): Promise<Note> {
    const db = await openDB();
    const now = new Date().toISOString();
    const newNote: Note = {
      id: generateId(),
      title: 'Untitled Note',
      content: '',
      isEncrypted: false,
      tags: [],
      isFavorite: false,
      isCode: false,
      codeLanguage: 'javascript',
      folder: 'Personal',
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      ...noteData,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(newNote);

      request.onsuccess = () => {
        resolve(newNote);
      };

      request.onerror = () => {
        reject(new Error('Failed to create note in storage.'));
      };
    });
  },

  async updateNote(id: string, data: Partial<Note>): Promise<Note> {
    const db = await openDB();
    const existing = await this.getNote(id);
    if (!existing) {
      throw new Error(`Note with ID ${id} not found.`);
    }

    const updatedNote: Note = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(updatedNote);

      request.onsuccess = () => {
        resolve(updatedNote);
      };

      request.onerror = () => {
        reject(new Error('Failed to update note in storage.'));
      };
    });
  },

  /**
   * soft deletes note to trash
   */
  async deleteNote(id: string): Promise<void> {
    await this.updateNote(id, {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
    });
  },

  /**
   * restores note from trash
   */
  async restoreNote(id: string): Promise<void> {
    await this.updateNote(id, {
      isDeleted: false,
      deletedAt: undefined,
    });
  },

  /**
   * permanently deletes note from database
   */
  async permanentlyDeleteNote(id: string): Promise<void> {
    const db = await openDB();
    
    // First delete associated version history entries
    try {
      const versions = await this.getVersions(id);
      for (const ver of versions) {
        await this.deleteVersion(ver.id);
      }
    } catch (e) {
      console.warn('Failed to delete associated version histories', e);
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to permanently delete note: ${id}`));
      };
    });
  },

  /**
   * Empties all trashed notes
   */
  async emptyTrash(): Promise<void> {
    const deletedNotes = await this.getDeletedNotes();
    for (const note of deletedNotes) {
      await this.permanentlyDeleteNote(note.id);
    }
  },

  async duplicateNote(id: string): Promise<Note> {
    const existing = await this.getNote(id);
    if (!existing) {
      throw new Error(`Note to duplicate not found.`);
    }

    const now = new Date().toISOString();
    const duplicatedNote: Note = {
      ...existing,
      id: generateId(),
      title: `${existing.title} (Copy)`,
      isFavorite: false, // reset favorite on copy
      isDeleted: false,
      deletedAt: undefined,
      createdAt: now,
      updatedAt: now,
    };

    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(duplicatedNote);

      request.onsuccess = () => {
        resolve(duplicatedNote);
      };

      request.onerror = () => {
        reject(new Error('Failed to save duplicated note.'));
      };
    });
  },

  // --- VERSION HISTORY SNAPS ENGINE ---

  async getVersions(noteId: string): Promise<NoteVersion[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(VERSION_STORE_NAME, 'readonly');
      const store = transaction.objectStore(VERSION_STORE_NAME);
      const index = store.index('noteId');
      const request = index.getAll(noteId);

      request.onsuccess = () => {
        const results = request.result as NoteVersion[];
        // Sort descending (latest first)
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        resolve(results);
      };

      request.onerror = () => {
        reject(new Error('Failed to retrieve versions.'));
      };
    });
  },

  async saveVersion(noteId: string, force: boolean = false): Promise<void> {
    const note = await this.getNote(noteId);
    if (!note) return;

    const versions = await this.getVersions(noteId);
    versions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const latest = versions[0];
    if (latest) {
      // If content and title are identical, do not save
      if (latest.content === note.content && latest.title === note.title) {
        return;
      }
      
      // Unless forced (e.g. keybind save or pre-restore snapshot), check if 2 minutes (120,000 ms) passed
      if (!force) {
        const diffMs = Date.now() - new Date(latest.createdAt).getTime();
        if (diffMs < 2 * 60 * 1000) {
          return;
        }
      }
    }

    const db = await openDB();
    const newVersion: NoteVersion = {
      id: generateId(),
      noteId,
      title: note.title,
      content: note.content,
      createdAt: new Date().toISOString(),
    };

    // If we exceed 20, prune down the oldest ones
    if (versions.length >= 20) {
      versions.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const toDeleteCount = versions.length - 19;
      for (let i = 0; i < toDeleteCount; i++) {
        await this.deleteVersion(versions[i].id);
      }
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(VERSION_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(VERSION_STORE_NAME);
      const request = store.add(newVersion);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save version snapshot.'));
    });
  },

  async restoreVersion(noteId: string, versionId: string): Promise<Note> {
    const versions = await this.getVersions(noteId);
    const version = versions.find(v => v.id === versionId);

    if (!version) {
      throw new Error('Version history snapshot not found.');
    }

    // Save a snapshot of the current state before overriding
    await this.saveVersion(noteId, true);

    const updated = await this.updateNote(noteId, {
      title: version.title,
      content: version.content,
    });

    return updated;
  },

  async deleteVersion(versionId: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(VERSION_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(VERSION_STORE_NAME);
      const request = store.delete(versionId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete version'));
    });
  },

  // --- STORAGE STATS ---

  async getStorageStats(): Promise<{
    total: number;
    active: number;
    deleted: number;
    starred: number;
    encrypted: number;
    approxSizeKB: number;
    lastBackupDate: string | null;
    versionsCount: number;
  }> {
    const notes = await this.getAllNotes();
    const active = notes.filter(n => !n.isDeleted);
    const deleted = notes.filter(n => n.isDeleted);
    const starred = notes.filter(n => n.isFavorite);
    const encrypted = notes.filter(n => n.isEncrypted);
    
    let bytes = 0;
    notes.forEach(n => {
      bytes += (n.title?.length || 0) * 2;
      bytes += (n.content?.length || 0) * 2;
      bytes += (n.encryptedContent?.length || 0) * 2;
      bytes += (n.tags?.join(',').length || 0) * 2;
    });

    let totalVersions = 0;
    try {
      const db = await openDB();
      totalVersions = await new Promise<number>((resolve) => {
        const transaction = db.transaction(VERSION_STORE_NAME, 'readonly');
        const store = transaction.objectStore(VERSION_STORE_NAME);
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(0);
      });
    } catch {
      // ignore
    }

    const lastBackup = localStorage.getItem('linknote-last-backup-at');

    return {
      total: notes.length,
      active: active.length,
      deleted: deleted.length,
      starred: starred.length,
      encrypted: encrypted.length,
      approxSizeKB: Math.round((bytes / 1024) * 100) / 100,
      lastBackupDate: lastBackup,
      versionsCount: totalVersions,
    };
  },

  // --- COMPREHENSIVE BACKUPS ---

  async exportAllNotes(): Promise<string> {
    const notes = await this.getAllNotes();
    const allVersions: NoteVersion[] = [];
    
    for (const note of notes) {
      try {
        const versions = await this.getVersions(note.id);
        allVersions.push(...versions);
      } catch (e) {
        // ignore
      }
    }

    const backup = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      notes,
      versions: allVersions,
    };
    
    // Update local storage record of last backup date
    localStorage.setItem('linknote-last-backup-at', new Date().toISOString());
    return JSON.stringify(backup, null, 2);
  },

  async validateBackup(jsonString: string): Promise<{
    notesCount: number;
    versionsCount: number;
    duplicates: { title: string; id: string }[];
    isValid: boolean;
    error?: string;
  }> {
    try {
      const backup = JSON.parse(jsonString);
      if (!backup || !Array.isArray(backup.notes)) {
        return { notesCount: 0, versionsCount: 0, duplicates: [], isValid: false, error: 'Invalid backup format. Missing "notes" array.' };
      }
      
      const notes = backup.notes as Partial<Note>[];
      const versionsCount = Array.isArray(backup.versions) ? backup.versions.length : 0;
      
      const currentNotes = await this.getAllNotes();
      const duplicates: { title: string; id: string }[] = [];

      notes.forEach((imported) => {
        if (!imported.title) return;
        const normalizedImportedTitle = imported.title.trim().toLowerCase();
        const normalizedImportedContent = (imported.content || '').trim().toLowerCase();

        const match = currentNotes.find((curr) => {
          return curr.title.trim().toLowerCase() === normalizedImportedTitle &&
                 (curr.content || '').trim().toLowerCase() === normalizedImportedContent;
        });

        if (match) {
          duplicates.push({ title: match.title, id: match.id });
        }
      });

      return {
        notesCount: notes.length,
        versionsCount,
        duplicates,
        isValid: true,
      };
    } catch (e: any) {
      return { notesCount: 0, versionsCount: 0, duplicates: [], isValid: false, error: e.message };
    }
  },

  async importNotesWithOptions(
    jsonString: string,
    options: {
      skipDuplicates: boolean;
      importAsNewCopies: boolean;
    }
  ): Promise<{ successCount: number; errors: string[] }> {
    const db = await openDB();
    const errors: string[] = [];
    let successCount = 0;

    try {
      const backup = JSON.parse(jsonString);
      if (!backup || !Array.isArray(backup.notes)) {
        throw new Error('Invalid backup format. Missing "notes" array.');
      }

      const notesToImport = backup.notes as Partial<Note>[];
      const currentNotes = await this.getAllNotes();
      const versionsToImport = Array.isArray(backup.versions) ? (backup.versions as NoteVersion[]) : [];

      for (const note of notesToImport) {
        if (!note.title || note.content === undefined) {
          errors.push(`Skipped a note with missing title or content.`);
          continue;
        }

        const normalizedTitle = note.title.trim().toLowerCase();
        const normalizedContent = (note.content || '').trim().toLowerCase();

        const duplicate = currentNotes.find(
          (curr) =>
            curr.title.trim().toLowerCase() === normalizedTitle &&
            (curr.content || '').trim().toLowerCase() === normalizedContent
        );

        let noteIdToUse = note.id && typeof note.id === 'string' ? note.id : generateId();
        let finalTitle = String(note.title);

        if (duplicate) {
          if (options.skipDuplicates) {
            continue;
          } else if (options.importAsNewCopies) {
            noteIdToUse = generateId();
            finalTitle = `${note.title} (Imported Copy)`;
          }
        }

        const cleanNote: Note = {
          id: noteIdToUse,
          title: finalTitle,
          content: String(note.content),
          isEncrypted: !!note.isEncrypted,
          encryptedContent: note.encryptedContent ? String(note.encryptedContent) : undefined,
          salt: note.salt ? String(note.salt) : undefined,
          iv: note.iv ? String(note.iv) : undefined,
          tags: Array.isArray(note.tags) ? note.tags.map(String) : [],
          isFavorite: !!note.isFavorite,
          isCode: !!note.isCode,
          codeLanguage: note.codeLanguage ? String(note.codeLanguage) : 'javascript',
          createdAt: note.createdAt ? String(note.createdAt) : new Date().toISOString(),
          updatedAt: note.updatedAt ? String(note.updatedAt) : new Date().toISOString(),
          folder: note.folder || 'Personal',
          isDeleted: !!note.isDeleted,
          deletedAt: note.deletedAt ? String(note.deletedAt) : undefined,
        };

        await new Promise<void>((resolve) => {
          const transaction = db.transaction(STORE_NAME, 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          const request = store.put(cleanNote);

          request.onsuccess = () => {
            successCount++;
            resolve();
          };

          request.onerror = () => {
            errors.push(`Failed to import note titled: "${cleanNote.title}"`);
            resolve();
          };
        });

        const matchingVersions = versionsToImport.filter((v) => v.noteId === note.id);
        for (const ver of matchingVersions) {
          const cleanVersion: NoteVersion = {
            id: generateId(),
            noteId: noteIdToUse,
            title: ver.title || cleanNote.title,
            content: ver.content || '',
            createdAt: ver.createdAt || new Date().toISOString(),
          };

          await new Promise<void>((resolve) => {
            const transaction = db.transaction(VERSION_STORE_NAME, 'readwrite');
            const store = transaction.objectStore(VERSION_STORE_NAME);
            const request = store.put(cleanVersion);
            request.onsuccess = () => resolve();
            request.onerror = () => resolve();
          });
        }
      }

      localStorage.setItem('linknote-last-backup-at', new Date().toISOString());
      return { successCount, errors };
    } catch (err: any) {
      throw new Error(`Failed to parse backup JSON: ${err.message}`);
    }
  },

  async clearAllNotes(): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to clear notes from storage.'));
      };
    });
  },

  // --- LOCAL WORKSPACE UPGRADES ---

  async getAllActiveNotes(): Promise<Note[]> {
    return this.getActiveNotes();
  },

  async getNoteByTitle(title: string): Promise<Note | null> {
    const active = await this.getActiveNotes();
    const searchTitle = title.trim().toLowerCase();
    const found = active.find(n => n.title.trim().toLowerCase() === searchTitle);
    return found || null;
  },

  async createLinkedNote(title: string): Promise<Note> {
    const cleanTitle = title.trim();
    const existing = await this.getNoteByTitle(cleanTitle);
    if (existing) return existing;

    return this.createNote({
      title: cleanTitle,
      content: `# ${cleanTitle}\n\nStart writing here...`,
      folder: 'Personal',
      type: 'note',
      tags: [],
    });
  },

  async getBacklinks(noteTitle: string): Promise<Note[]> {
    const active = await this.getActiveNotes();
    const cleanTitle = noteTitle.trim().toLowerCase();
    
    // Find notes whose content contains [[noteTitle]] (case-insensitive)
    return active.filter(n => {
      const content = (n.content || '').toLowerCase();
      // Look for [[title]] or variations
      return content.includes(`[[${cleanTitle}]]`) || 
             extractWikiLinks(n.content).some(link => link.toLowerCase() === cleanTitle);
    });
  },

  async getOutgoingLinks(noteId: string): Promise<string[]> {
    const note = await this.getNote(noteId);
    if (!note) return [];
    return extractWikiLinks(note.content || '');
  },

  async getOrCreateDailyNote(dateStr: string): Promise<Note> {
    const active = await this.getActiveNotes();
    // Daily notes title format: Daily Note - YYYY-MM-DD
    const expectedTitle = `Daily Note - ${dateStr}`;
    const found = active.find(n => n.type === 'daily' && n.dailyDate === dateStr);
    if (found) return found;

    // Create a new daily note using template
    const template = `# Daily Note - ${dateStr}

## Priorities
- [ ] 

## Notes

## Meetings

## Reflection

## Tomorrow
- [ ] `;

    return this.createNote({
      title: expectedTitle,
      content: template,
      folder: 'Personal',
      type: 'daily',
      dailyDate: dateStr,
      tags: ['daily', 'journal'],
    });
  },

  async getDailyNotes(): Promise<Note[]> {
    const active = await this.getActiveNotes();
    return active.filter(n => n.type === 'daily').sort((a, b) => {
      const dateA = a.dailyDate || '';
      const dateB = b.dailyDate || '';
      return dateB.localeCompare(dateA); // newest first
    });
  },

  async getTaskItems() {
    const active = await this.getActiveNotes();
    const allTasks: any[] = [];
    active.forEach(n => {
      const noteTasks = parseTasks(n.id, n.title, n.content, n.folder || 'Personal', n.tags || []);
      allTasks.push(...noteTasks);
    });
    return allTasks;
  },

  async updateTaskStatus(noteId: string, taskIndex: number, completed: boolean): Promise<Note> {
    const note = await this.getNote(noteId);
    if (!note) throw new Error('Note not found');

    const updatedContent = toggleTaskInContent(note.content, taskIndex, completed);
    const updatedStats = calculateTaskStats(updatedContent);
    const updatedLinks = extractWikiLinks(updatedContent);

    return this.updateNote(noteId, {
      content: updatedContent,
      taskStats: updatedStats,
      linkedNoteTitles: updatedLinks,
    });
  },

  async getAnalyticsStats(): Promise<any> {
    const notes = await this.getAllNotes();
    const active = notes.filter(n => !n.isDeleted);
    const deleted = notes.filter(n => n.isDeleted);
    const starred = notes.filter(n => n.isFavorite);
    const encrypted = notes.filter(n => n.isEncrypted);

    let totalWords = 0;
    let totalChars = 0;
    active.forEach(n => {
      const text = n.content || '';
      totalChars += text.length;
      totalWords += text.trim().split(/\s+/).filter(Boolean).length;
    });

    // Task scanning
    const tasks = await this.getTaskItems();
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Folders
    const notesByFolder: Record<string, number> = {};
    active.forEach(n => {
      const f = n.folder || 'Personal';
      notesByFolder[f] = (notesByFolder[f] || 0) + 1;
    });

    // Tags
    const notesByTag: Record<string, number> = {};
    active.forEach(n => {
      if (Array.isArray(n.tags)) {
        n.tags.forEach(t => {
          if (t) notesByTag[t] = (notesByTag[t] || 0) + 1;
        });
      }
    });

    // Daily notes
    const dailyNotes = active.filter(n => n.type === 'daily');
    
    // Streak calculation
    let streak = 0;
    if (dailyNotes.length > 0) {
      const dates = dailyNotes
        .map(n => n.dailyDate || '')
        .filter(Boolean)
        .sort((a, b) => b.localeCompare(a)); // newest first

      // Calculate consecutive days starting from the newest journal date
      if (dates.length > 0) {
        streak = 1;
        let lastDate = new Date(dates[0]);
        for (let i = 1; i < dates.length; i++) {
          const currentDate = new Date(dates[i]);
          const diffTime = Math.abs(lastDate.getTime() - currentDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            streak++;
            lastDate = currentDate;
          } else if (diffDays > 1) {
            break; // streak broken
          }
        }
      }
    }

    // Size
    let bytes = 0;
    notes.forEach(n => {
      bytes += (n.title?.length || 0) * 2;
      bytes += (n.content?.length || 0) * 2;
      bytes += (n.encryptedContent?.length || 0) * 2;
      bytes += (n.tags?.join(',').length || 0) * 2;
    });

    const lastBackup = localStorage.getItem('linknote-last-backup-at');

    return {
      totalNotes: notes.length,
      activeNotes: active.length,
      deletedNotes: deleted.length,
      starredNotes: starred.length,
      encryptedNotes: encrypted.length,
      totalWords,
      totalChars,
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate,
      notesByFolder,
      notesByTag,
      recentNotes: active.slice(0, 5),
      dailyNotesCount: dailyNotes.length,
      writingStreak: streak,
      storageUsedKB: Math.round((bytes / 1024) * 100) / 100,
      lastBackupDate: lastBackup,
    };
  },

  async getGraphData(): Promise<{ nodes: any[]; links: any[] }> {
    const active = await this.getActiveNotes();
    const nodes = active.map(n => ({
      id: n.id,
      title: n.title,
      folder: n.folder || 'Personal',
      isFavorite: !!n.isFavorite,
    }));

    const links: any[] = [];
    const titleToIdMap: Record<string, string> = {};
    active.forEach(n => {
      titleToIdMap[n.title.trim().toLowerCase()] = n.id;
    });

    active.forEach(n => {
      const outgoing = extractWikiLinks(n.content || '');
      outgoing.forEach(title => {
        const targetId = titleToIdMap[title.trim().toLowerCase()];
        if (targetId && targetId !== n.id) {
          // Check if link already exists to avoid duplicates
          const exists = links.some(l => l.source === n.id && l.target === targetId);
          if (!exists) {
            links.push({
              source: n.id,
              target: targetId,
            });
          }
        }
      });
    });

    return { nodes, links };
  },

  async exportTasks(format: 'json' | 'md'): Promise<string> {
    const tasks = await this.getTaskItems();
    if (format === 'json') {
      return JSON.stringify(tasks, null, 2);
    } else {
      // Group by note title
      const grouped: Record<string, any[]> = {};
      tasks.forEach(t => {
        if (!grouped[t.noteTitle]) grouped[t.noteTitle] = [];
        grouped[t.noteTitle].push(t);
      });

      let md = '# Global Tasks Export\n\n';
      Object.entries(grouped).forEach(([title, items]) => {
        md += `## ${title}\n`;
        items.forEach(item => {
          md += `- [${item.completed ? 'x' : ' '}] ${item.text}\n`;
        });
        md += '\n';
      });
      return md;
    }
  },

  saveAppLockSettings(enabled: boolean, passwordHash: string, timeoutMinutes: number) {
    localStorage.setItem('linknote-applock-enabled', JSON.stringify(enabled));
    localStorage.setItem('linknote-applock-password-hash', passwordHash);
    localStorage.setItem('linknote-applock-timeout', String(timeoutMinutes));
  },

  async verifyAppLockPassword(password: string): Promise<boolean> {
    const savedHash = localStorage.getItem('linknote-applock-password-hash');
    if (!savedHash) return true;

    // Calculate sha256 of input
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const calculatedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return calculatedHash === savedHash;
  },
};
