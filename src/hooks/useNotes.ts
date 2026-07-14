/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Note, NoteVersion } from '../types';
import { noteStorage } from '../services/noteStorage';

export const DEFAULT_FOLDERS = ['All Notes', 'Personal', 'Work', 'Study', 'Projects', 'Ideas', 'Archive'];

export function useNotes() {
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter, Search, Trash, and Folder states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>('All Notes');
  const [showTrash, setShowTrash] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');

  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      const storedNotes = await noteStorage.getAllNotes();
      setAllNotes(storedNotes);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Aggregate all unique tags from active notes
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    allNotes.forEach((note) => {
      // Only extract tags from non-deleted notes
      if (!note.isDeleted && Array.isArray(note.tags)) {
        note.tags.forEach((t) => {
          if (t && t.trim() !== '') {
            tagsSet.add(t.trim());
          }
        });
      }
    });
    return Array.from(tagsSet).sort();
  }, [allNotes]);

  // Apply search, folder, trash, filter, and sort logic client-side
  const filteredNotes = useMemo(() => {
    let result = [...allNotes];

    // Filter by trash state
    if (showTrash) {
      result = result.filter((note) => note.isDeleted);
    } else {
      result = result.filter((note) => !note.isDeleted);
    }

    // Filter by folder (ignore filter if "All Notes" is selected)
    if (selectedFolder !== 'All Notes' && !showTrash) {
      result = result.filter((note) => note.folder === selectedFolder);
    }

    // Filter by favorites
    if (onlyFavorites && !showTrash) {
      result = result.filter((note) => note.isFavorite);
    }

    // Filter by tag
    if (selectedTag && !showTrash) {
      result = result.filter((note) => note.tags.includes(selectedTag));
    }

    // Filter by search query (checks Title, Content, and Tags)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((note) => {
        const titleMatch = note.title.toLowerCase().includes(q);
        const contentMatch = note.content.toLowerCase().includes(q);
        const tagsMatch = note.tags.some((tag) => tag.toLowerCase().includes(q));
        return titleMatch || contentMatch || tagsMatch;
      });
    }

    // Apply Sorting
    result.sort((a, b) => {
      if (sortBy === 'created') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else {
        // default: updated
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return result;
  }, [allNotes, showTrash, selectedFolder, onlyFavorites, selectedTag, searchQuery, sortBy]);

  // Mutators
  const createNote = async (noteData?: Partial<Note>) => {
    // If we're inside a folder, default the new note to that folder
    const folderToUse = selectedFolder !== 'All Notes' ? selectedFolder : 'Personal';
    const created = await noteStorage.createNote({
      folder: folderToUse,
      ...noteData,
    });
    setAllNotes((prev) => [created, ...prev]);
    return created;
  };

  const updateNoteInState = useCallback((updated: Note) => {
    setAllNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
  }, []);

  const updateNote = async (id: string, data: Partial<Note>) => {
    const updated = await noteStorage.updateNote(id, data);
    updateNoteInState(updated);
    return updated;
  };

  const deleteNote = async (id: string) => {
    await noteStorage.deleteNote(id);
    // Refresh list from storage to get the updated status
    await loadNotes();
  };

  const restoreNote = async (id: string) => {
    await noteStorage.restoreNote(id);
    await loadNotes();
  };

  const permanentlyDeleteNote = async (id: string) => {
    await noteStorage.permanentlyDeleteNote(id);
    setAllNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const emptyTrash = async () => {
    await noteStorage.emptyTrash();
    await loadNotes();
  };

  const duplicateNote = async (id: string) => {
    const duplicated = await noteStorage.duplicateNote(id);
    setAllNotes((prev) => [duplicated, ...prev]);
    return duplicated;
  };

  return {
    allNotes,
    filteredNotes,
    allTags,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
    selectedFolder,
    setSelectedFolder,
    showTrash,
    setShowTrash,
    onlyFavorites,
    setOnlyFavorites,
    sortBy,
    setSortBy,
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    restoreNote,
    permanentlyDeleteNote,
    emptyTrash,
    duplicateNote,
  };
}
