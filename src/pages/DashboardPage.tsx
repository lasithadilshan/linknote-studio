/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNotes } from '../hooks/useNotes';
import { Note } from '../types';
import { NoteCard } from '../components/NoteCard';
import { SearchBar } from '../components/SearchBar';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { FilePlus, NotebookPen, Sparkles, FolderDown, Inbox } from 'lucide-react';

export function DashboardPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    filteredNotes,
    allTags,
    loading,
    createNote,
    updateNote,
    deleteNote,
    duplicateNote,
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
    onlyFavorites,
    setOnlyFavorites,
    sortBy,
    setSortBy,
  } = useNotes();

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreateNote = async () => {
    try {
      const created = await createNote({
        title: 'Untitled Note',
        content: '',
        tags: [],
      });
      toast('New note created successfully!', 'success');
      navigate(`/note/${created.id}`);
    } catch (err: any) {
      toast(`Failed to create note: ${err.message}`, 'error');
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      const note = filteredNotes.find((n) => n.id === id);
      if (note) {
        await updateNote(id, { isFavorite: !note.isFavorite });
        toast(note.isFavorite ? 'Removed from favorites' : 'Added to favorites', 'success');
      }
    } catch (err: any) {
      toast('Failed to update favorite state', 'error');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const copy = await duplicateNote(id);
      toast(`Duplicated as "${copy.title}"`, 'success');
    } catch (err: any) {
      toast('Failed to duplicate note', 'error');
    }
  };

  const handleDeleteTrigger = (id: string) => {
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      try {
        await deleteNote(deleteId);
        toast('Note deleted successfully', 'success');
      } catch (err: any) {
        toast('Failed to delete note', 'error');
      } finally {
        setDeleteId(null);
      }
    }
  };

  // Find delete note title
  const noteToDelete = filteredNotes.find((n) => n.id === deleteId);

  return (
    <div className="space-y-6">
      {/* Title / Hero Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-display bg-linear-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            My Workspace
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create, encrypt, format, and share your notes. Kept 100% locally in your browser.
          </p>
        </div>

        <button
          onClick={handleCreateNote}
          className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer text-center"
        >
          <FilePlus className="h-4.5 w-4.5" />
          Create New Note
        </button>
      </div>

      {/* Search and Filters panel */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        onlyFavorites={onlyFavorites}
        setOnlyFavorites={setOnlyFavorites}
        sortBy={sortBy}
        setSortBy={setSortBy}
        allTags={allTags}
      />

      {/* Grid stage area */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse">Loading notes from storage...</span>
        </div>
      ) : filteredNotes.length === 0 ? (
        /* Empty State */
        <div className="py-20 border border-slate-200/50 dark:border-white/10 rounded-3xl bg-white/40 dark:bg-slate-900/10 backdrop-blur-md p-8 text-center flex flex-col items-center justify-center max-w-xl mx-auto mt-6">
          <div className="p-4 bg-slate-100 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 rounded-2xl text-slate-400 dark:text-slate-500 mb-4">
            <Inbox className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-display">
            {searchQuery || selectedTag || onlyFavorites ? 'No Matching Notes Found' : 'Your Workspace is Empty'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mt-2 mb-6">
            {searchQuery || selectedTag || onlyFavorites
              ? 'Try modifying your search keywords, clear active tag filters, or toggle off the starred filter.'
              : 'Create your very first note to get started! Notes are automatically auto-saved to IndexedDB.'}
          </p>
          {searchQuery || selectedTag || onlyFavorites ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTag(null);
                setOnlyFavorites(false);
              }}
              className="px-4 py-2 border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-semibold uppercase cursor-pointer"
            >
              Clear Filters
            </button>
          ) : (
            <button
              onClick={handleCreateNote}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-lg shadow-indigo-500/10"
            >
              <NotebookPen className="h-4 w-4" />
              Write First Note
            </button>
          )}
        </div>
      ) : (
        /* Notes grid */
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2"
        >
          {filteredNotes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="flex"
            >
              <NoteCard
                note={note}
                onDelete={handleDeleteTrigger}
                onDuplicate={handleDuplicate}
                onToggleFavorite={handleToggleFavorite}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Delete Note Permanent"
        message={`Are you sure you want to permanently delete "${noteToDelete?.title || 'this note'}"? This operation cannot be undone and local browser data will be removed.`}
        confirmText="Permanently Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
