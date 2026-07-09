/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Note } from '../types';
import { noteStorage } from '../services/noteStorage';

export function useNotes() {
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
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

  // Aggregate all unique tags from all notes
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    allNotes.forEach((note) => {
      if (Array.isArray(note.tags)) {
        note.tags.forEach((t) => {
          if (t && t.trim() !== '') {
            tagsSet.add(t.trim());
          }
        });
      }
    });
    return Array.from(tagsSet).sort();
  }, [allNotes]);

  // Apply search, filter, and sort logic client-side
  const filteredNotes = useMemo(() => {
    let result = [...allNotes];

    // Filter by favorites
    if (onlyFavorites) {
      result = result.filter((note) => note.isFavorite);
    }

    // Filter by tag
    if (selectedTag) {
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
  }, [allNotes, onlyFavorites, selectedTag, searchQuery, sortBy]);

  // Mutators
  const createNote = async (noteData?: Partial<Note>) => {
    const created = await noteStorage.createNote(noteData);
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
    setAllNotes((prev) => prev.filter((n) => n.id !== id));
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
    onlyFavorites,
    setOnlyFavorites,
    sortBy,
    setSortBy,
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    duplicateNote,
  };
}
