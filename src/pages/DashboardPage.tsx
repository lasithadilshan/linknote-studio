/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNotes, DEFAULT_FOLDERS } from '../hooks/useNotes';
import { Note } from '../types';
import { NoteCard } from '../components/NoteCard';
import { SearchBar } from '../components/SearchBar';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { OnboardingModal } from '../components/OnboardingModal';
import { TemplatePickerModal } from '../components/TemplatePickerModal';
import { useToast } from '../hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FilePlus, NotebookPen, Inbox, SearchSlash, Trash2, Folder, 
  User, Briefcase, GraduationCap, Lightbulb, Archive, LayoutGrid, 
  Tag, RotateCcw, AlertTriangle, RefreshCw
} from 'lucide-react';
import { AppLayout } from '../components/AppLayout';

// Folder icons helper
const FolderIconMap: { [key: string]: React.ComponentType<any> } = {
  'All Notes': LayoutGrid,
  'Personal': User,
  'Work': Briefcase,
  'Study': GraduationCap,
  'Projects': Folder,
  'Ideas': Lightbulb,
  'Archive': Archive
};

export function DashboardPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    allNotes,
    filteredNotes,
    allTags,
    loading,
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
    deleteNote, // acts as soft-delete move to trash
    restoreNote,
    permanentlyDeleteNote,
    emptyTrash
  } = useNotes();

  // Dialog & Modal triggers
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEmptyTrashConfirmOpen, setIsEmptyTrashConfirmOpen] = useState(false);

  const getFolderCount = (folder: string) => {
    if (folder === 'All Notes') return allNotes.filter(n => !n.isDeleted).length;
    return allNotes.filter(n => !n.isDeleted && n.folder === folder).length;
  };

  const getTrashCount = () => allNotes.filter(n => n.isDeleted).length;

  const handleSelectTemplate = async (template: any) => {
    try {
      const created = await createNote({
        title: template.title,
        content: template.content,
        tags: template.tags,
        folder: template.folder,
      });
      toast(`Created from template: "${template.name}"!`, 'success');
      navigate(`/note/${created.id}`);
    } catch (err: any) {
      toast(`Failed to create note: ${err.message}`, 'error');
    } finally {
      setIsTemplateModalOpen(false);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      const note = allNotes.find((n) => n.id === id);
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
      toast('Duplicating note...', 'info');
      await loadNotes();
    } catch (err: any) {
      toast('Failed to duplicate note', 'error');
    }
  };

  const handleMoveToTrash = async (id: string) => {
    try {
      await deleteNote(id); // hook marks as deleted
      toast('Note moved to Trash/Recycle Bin', 'warning');
    } catch (err: any) {
      toast('Failed to delete note', 'error');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreNote(id);
      toast('Note restored to active workspace!', 'success');
    } catch (err: any) {
      toast('Failed to restore note', 'error');
    }
  };

  const handlePermanentDeleteConfirm = async () => {
    if (deleteId) {
      try {
        await permanentlyDeleteNote(deleteId);
        toast('Note deleted permanently.', 'success');
      } catch (err: any) {
        toast('Failed to delete note permanently', 'error');
      } finally {
        setDeleteId(null);
      }
    }
  };

  const handleEmptyTrashConfirm = async () => {
    try {
      await emptyTrash();
      toast('Trash bin emptied successfully!', 'success');
    } catch (err: any) {
      toast('Failed to empty trash', 'error');
    } finally {
      setIsEmptyTrashConfirmOpen(false);
    }
  };

  // Find note to permanently delete
  const noteToPermanentlyDelete = allNotes.find((n) => n.id === deleteId);

  return (
    <AppLayout onRefreshNotes={loadNotes}>
      {/* 1. Onboarding & 2. Template Picker Modals */}
      <OnboardingModal
        onComplete={loadNotes}
        onImportTrigger={() => {
          // Open settings panel by selecting settings element
          const btn = document.querySelector('header button[title*="Settings"]') as HTMLButtonElement;
          if (btn) btn.click();
        }}
        onCreateFirstNote={() => setIsTemplateModalOpen(true)}
      />

      <TemplatePickerModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelect={handleSelectTemplate}
      />

      <div className="space-y-6 pb-16">
        {/* Title / Hero Header Block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-5 border-b border-slate-200/50 dark:border-white/10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
              {showTrash ? 'Trash & Recycle Bin' : selectedFolder === 'All Notes' ? 'My Workspace' : selectedFolder}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {showTrash 
                ? 'Review deleted notes. You can restore them or permanently wipe them out.' 
                : `Organize, structure, and encrypt your notes. Kept 100% locally in your secure sandboxed IndexedDB.`}
            </p>
          </div>

          <div className="flex gap-2 shrink-0 self-start md:self-auto w-full md:w-auto">
            {showTrash ? (
              <button
                onClick={() => setIsEmptyTrashConfirmOpen(true)}
                disabled={getTrashCount() === 0}
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                Empty Trash Bin
              </button>
            ) : (
              <button
                onClick={() => setIsTemplateModalOpen(true)}
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider shadow-md shadow-indigo-600/15 hover:shadow-indigo-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <FilePlus className="h-4 w-4" />
                Create New Note
              </button>
            )}
          </div>
        </div>

        {/* Search Bar filter controls */}
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

        {/* Main Body Grid with Left Sidebar on Desktop */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)] items-start">
          {/* A. Responsive Sidebar Panel */}
          <aside className="min-w-0 flex flex-col gap-6 w-full">
            
            {/* Desktop-only Navigation Folder lists */}
            <div className="hidden lg:block bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 rounded-2xl p-4 shadow-xs">
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-3">
                Collections & Folders
              </h4>
              <nav className="space-y-1">
                {DEFAULT_FOLDERS.map((folder) => {
                  const IconComponent = FolderIconMap[folder] || Folder;
                  const isActive = selectedFolder === folder && !showTrash;
                  return (
                    <button
                      key={folder}
                      onClick={() => {
                        setShowTrash(false);
                        setSelectedFolder(folder);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <IconComponent className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                        <span>{folder}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-indigo-700/85 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500'
                      }`}>
                        {getFolderCount(folder)}
                      </span>
                    </button>
                  );
                })}
              </nav>

              <div className="border-t border-slate-100 dark:border-white/5 my-3 pt-3">
                <button
                  onClick={() => setShowTrash(true)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                    showTrash
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-rose-500/5 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Trash2 className="h-4.5 w-4.5" />
                    <span>Trash Bin</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    showTrash ? 'bg-rose-700 text-white' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  }`}>
                    {getTrashCount()}
                  </span>
                </button>
              </div>
            </div>

            {/* Mobile / Tablet Horizontal Scroll folders (Visible on small screens) */}
            <div className="lg:hidden w-full overflow-x-auto pb-1 scrollbar-none flex gap-2 border-b border-slate-200/50 dark:border-white/5 snap-x">
              {DEFAULT_FOLDERS.map((folder) => {
                const IconComponent = FolderIconMap[folder] || Folder;
                const isActive = selectedFolder === folder && !showTrash;
                return (
                  <button
                    key={folder}
                    onClick={() => {
                      setShowTrash(false);
                      setSelectedFolder(folder);
                    }}
                    className={`snap-center flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border shrink-0 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                        : 'bg-white dark:bg-slate-900 border-slate-200/65 dark:border-white/5 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <IconComponent className="h-3.5 w-3.5" />
                    <span>{folder}</span>
                    <span className="text-[10px] ml-1 opacity-80">({getFolderCount(folder)})</span>
                  </button>
                );
              })}
              <button
                onClick={() => setShowTrash(true)}
                className={`snap-center flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border shrink-0 transition-all cursor-pointer ${
                  showTrash
                    ? 'bg-rose-600 border-rose-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 border-rose-500/20 text-rose-600 dark:text-rose-400'
                }`}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Trash ({getTrashCount()})</span>
              </button>
            </div>

            {/* Tags Sidebar Module */}
            {allTags.length > 0 && (
              <div className="hidden lg:block bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 rounded-2xl p-4 shadow-xs">
                <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-2.5 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  Filter by Tag
                </h4>
                <div className="flex flex-wrap gap-1.5 px-1">
                  {allTags.map((tag) => {
                    const isSelected = selectedTag === tag;
                    return (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(isSelected ? null : tag)}
                        className={`text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800'
                            : 'bg-slate-50 text-slate-500 border border-transparent hover:bg-slate-100 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>

          {/* B. Grid Stage Area */}
          <div className="flex-1 min-w-0 w-full">
            {loading ? (
              <div className="py-24 text-center flex flex-col items-center justify-center gap-4">
                <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 animate-pulse uppercase tracking-wider">
                  Accessing secure indexDB store...
                </span>
              </div>
            ) : filteredNotes.length === 0 ? (
              /* High-Quality Empty State Card */
              <div className="py-16 border border-slate-200/60 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 dark:text-indigo-400 mb-5 border border-indigo-100/50 dark:border-indigo-900/30">
                  {searchQuery || selectedTag || onlyFavorites ? (
                    <SearchSlash className="h-7 w-7" />
                  ) : showTrash ? (
                    <Trash2 className="h-7 w-7 text-rose-500" />
                  ) : (
                    <Inbox className="h-7 w-7" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                  {searchQuery || selectedTag || onlyFavorites 
                    ? 'No matching notes found' 
                    : showTrash 
                      ? 'Trash Bin is Empty' 
                      : `No notes in "${selectedFolder}"`}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-2 mb-6 leading-relaxed">
                  {searchQuery || selectedTag || onlyFavorites
                    ? 'Adjust search keywords, tags, or untoggle the favorite filter to expand search scope.'
                    : showTrash 
                      ? 'Deleted notes will appear here temporarily. Wiped files cannot be recovered.'
                      : `Start creating notes or study cards. All documents default to this folder classification.`}
                </p>
                {searchQuery || selectedTag || onlyFavorites ? (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedTag(null);
                      setOnlyFavorites(false);
                    }}
                    className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Reset Filters
                  </button>
                ) : !showTrash && (
                  <button
                    onClick={() => setIsTemplateModalOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer"
                  >
                    <NotebookPen className="h-4 w-4" />
                    Write Your First Note
                  </button>
                )}
              </div>
            ) : (
              /* Interactive responsive Grid */
              <motion.div
                layout
                className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 w-full"
              >
                <AnimatePresence>
                  {filteredNotes.map((note) => (
                    <motion.div
                      key={note.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex"
                    >
                      <NoteCard
                        note={note}
                        isTrashView={showTrash}
                        onDelete={showTrash ? setDeleteId : handleMoveToTrash}
                        onDuplicate={handleDuplicate}
                        onToggleFavorite={handleToggleFavorite}
                        onRestore={handleRestore}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>

        {/* C. Permanent Delete Confirmation Modal */}
        <ConfirmDialog
          isOpen={deleteId !== null}
          title="Delete Note Permanently?"
          message={`Are you sure you want to permanently delete "${noteToPermanentlyDelete?.title || 'this note'}"? This operation is absolute, local, and cannot be undone.`}
          confirmText="Wipe Out Permanently"
          cancelText="Cancel"
          onConfirm={handlePermanentDeleteConfirm}
          onCancel={() => setDeleteId(null)}
        />

        {/* D. Empty Trash Bin Confirmation Modal */}
        <ConfirmDialog
          isOpen={isEmptyTrashConfirmOpen}
          title="Empty Trash Bin?"
          message="Are you absolutely sure you want to purge all notes in your Trash? This will permanently wipe out all deleted notes and their version histories. This is irreversible."
          confirmText="Purge Everything"
          cancelText="Cancel"
          onConfirm={handleEmptyTrashConfirm}
          onCancel={() => setIsEmptyTrashConfirmOpen(false)}
        />
      </div>
    </AppLayout>
  );
}
