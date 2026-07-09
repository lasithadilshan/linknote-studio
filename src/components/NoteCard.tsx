/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Note } from '../types';
import { formatDate } from '../utils/dateUtils';
import { calculateStats } from '../utils/textStats';
import { Star, Trash2, Copy, Calendar, Tag, Lock, FileCode, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function NoteCard({ note, onDelete, onDuplicate, onToggleFavorite }: NoteCardProps) {
  // Compute text stats for normal notes
  const stats = calculateStats(note.content);

  return (
    <div
      id={`note-card-${note.id}`}
      className="group relative flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-indigo-500/50 dark:hover:border-slate-700 hover:shadow-md dark:hover:shadow-none transition-all duration-200 flex-1 min-w-[280px]"
    >
      {/* Top Meta info */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {note.isEncrypted && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/20 dark:border-amber-500/20 text-amber-700 dark:text-amber-400">
              <Lock className="h-3 w-3" />
              Locked
            </span>
          )}
          {note.isCode && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 dark:bg-indigo-500/10 border border-indigo-500/20 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400">
              <FileCode className="h-3 w-3" />
              {note.codeLanguage}
            </span>
          )}
        </div>

        {/* Favorite & Quick Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite(note.id);
            }}
            className={`p-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
              note.isFavorite
                ? 'bg-amber-50 border-amber-200 text-amber-500 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300'
                : 'bg-transparent border-transparent text-slate-400 hover:text-amber-500 dark:text-slate-500 dark:hover:text-amber-300'
            }`}
            title={note.isFavorite ? 'Unfavorite note' : 'Favorite note'}
          >
            <Star className={`h-4 w-4 ${note.isFavorite ? 'fill-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Title */}
      <Link to={`/note/${note.id}`} className="block focus:outline-none">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 mb-1.5 font-display pr-6">
          {note.title || 'Untitled Note'}
        </h3>
      </Link>

      {/* Note content summary preview */}
      <div className="flex-1 min-h-[50px] mb-4">
        {note.isEncrypted ? (
          <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 text-xs">
            <Lock className="h-4 w-4 shrink-0 text-amber-500" />
            <span className="italic select-none">Encrypted content. Password required to read.</span>
          </div>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed break-words font-sans">
            {note.content ? note.content.substring(0, 150) : <span className="italic text-slate-400 dark:text-slate-600">No content inside this note yet...</span>}
          </p>
        )}
      </div>

      {/* Tags section */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {note.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            >
              <Tag className="h-2.5 w-2.5 text-slate-400 dark:text-slate-500" />
              {tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 self-center">
              +{note.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Bottom info panel */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3.5 mt-auto">
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(note.updatedAt)}
        </span>

        <div className="flex items-center gap-1">
          {!note.isEncrypted && (
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 rounded-md mr-1 select-none">
              {stats.words} W
            </span>
          )}
          
          {/* Quick duplicated & deleted */}
          <button
            onClick={() => onDuplicate(note.id)}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-500/10 rounded-lg transition-all cursor-pointer"
            title="Duplicate note"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          
          <button
            onClick={() => onDelete(note.id)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
            title="Delete note"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>

          <Link
            to={`/note/${note.id}`}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-500/10 rounded-lg transition-colors focus:outline-none"
            title="Open Note"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
