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
import { FilePlus, NotebookPen, Sparkles, Inbox, SearchSlash, Ban } from 'lucide-react';
import { AppLayout } from '../components/AppLayout';

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
    loadNotes,
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
    <AppLayout onRefreshNotes={loadNotes}>
      <div className="space-y-8 pb-16">
        {/* Title / Hero Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-900">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-slate-950 dark:text-slate-50">
              My Workspace
            </h1>
            <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Create, encrypt, format, and share your notes. Kept 100% locally in your browser.
            </p>
          </div>

          <button
            onClick={handleCreateNote}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 transition duration-200 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 cursor-pointer w-full md:w-auto shrink-0 select-none self-start md:self-auto"
            aria-label="Create New Note"
          >
            <FilePlus className="h-5 w-5" />
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
          <div className="py-24 text-center flex flex-col items-center justify-center gap-4">
            <div className="h-10 w-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 animate-pulse uppercase tracking-wider">
              Loading notes from storage...
            </span>
          </div>
        ) : filteredNotes.length === 0 ? (
          /* Polished Empty State Layouts */
          <div className="py-16 border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-2xl mx-auto mt-6 shadow-xs">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400 mb-6 border border-indigo-100/50 dark:border-indigo-900/30">
              {searchQuery || selectedTag || onlyFavorites ? (
                <SearchSlash className="h-7 w-7" />
              ) : (
                <Inbox className="h-7 w-7" />
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-display">
              {searchQuery || selectedTag || onlyFavorites ? 'No matching notes found' : 'Your Workspace is Empty'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mt-3 mb-8 leading-relaxed">
              {searchQuery || selectedTag || onlyFavorites
                ? 'Try modifying your search keywords, clear active tag filters, or toggle off the starred filter option.'
                : 'Create your very first note to get started! Notes are automatically encrypted and auto-saved locally.'}
            </p>
            {searchQuery || selectedTag || onlyFavorites ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTag(null);
                  setOnlyFavorites(false);
                }}
                className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs select-none"
              >
                Clear Active Filters
              </button>
            ) : (
              <button
                onClick={handleCreateNote}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm shadow-md transition-all duration-200 cursor-pointer select-none"
              >
                <NotebookPen className="h-4 w-4" />
                Write Your First Note
              </button>
            )}
          </div>
        ) : (
          /* Notes grid */
          <motion.div
            layout
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 pt-2"
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
    </AppLayout>
  );
}
