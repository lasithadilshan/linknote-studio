/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Note } from '../types';
import { generateId } from '../utils/idGenerator';

const DB_NAME = 'LinkNoteStudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'notes';

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
    };
  });
}

export const noteStorage = {
  async getAllNotes(): Promise<Note[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const notes = request.result as Note[];
        // Sort by updatedAt descending by default
        notes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        resolve(notes);
      };

      request.onerror = () => {
        reject(new Error('Failed to retrieve notes from storage.'));
      };
    });
  },

  async getNote(id: string): Promise<Note | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
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

  async deleteNote(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to delete note: ${id}`));
      };
    });
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

  async exportAllNotes(): Promise<string> {
    const notes = await this.getAllNotes();
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      notes,
    };
    return JSON.stringify(backup, null, 2);
  },

  async importNotes(jsonString: string): Promise<{ successCount: number; errors: string[] }> {
    const db = await openDB();
    const errors: string[] = [];
    let successCount = 0;

    try {
      const backup = JSON.parse(jsonString);
      if (!backup || !Array.isArray(backup.notes)) {
        throw new Error('Invalid backup format. Missing "notes" array.');
      }

      const notesToImport = backup.notes as Partial<Note>[];

      for (const note of notesToImport) {
        if (!note.title || note.content === undefined) {
          errors.push(`Skipped note due to missing required fields (title, content).`);
          continue;
        }

        const cleanNote: Note = {
          id: note.id && typeof note.id === 'string' ? note.id : generateId(),
          title: String(note.title),
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
      }

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
};
