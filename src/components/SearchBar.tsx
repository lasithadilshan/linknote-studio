/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, SortAsc, Star, X, Tag } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  onlyFavorites: boolean;
  setOnlyFavorites: (fav: boolean) => void;
  sortBy: 'updated' | 'created' | 'title';
  setSortBy: (sort: 'updated' | 'created' | 'title') => void;
  allTags: string[];
}

export function SearchBar({
  searchQuery,
  setSearchQuery,
  selectedTag,
  setSelectedTag,
  onlyFavorites,
  setOnlyFavorites,
  sortBy,
  setSortBy,
  allTags,
}: SearchBarProps) {
  return (
    <div id="dashboard-search-bar" className="space-y-4">
      {/* Input row */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by title, tag, or content..."
            className="w-full pl-11 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3.5 p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Toolbar Options */}
        <div className="flex items-center gap-3.5">
          {/* Favorite filter */}
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold border transition-all duration-200 cursor-pointer shadow-xs ${
              onlyFavorites
                ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Star className={`h-4 w-4 ${onlyFavorites ? 'fill-amber-500 text-amber-500 dark:text-amber-300' : ''}`} />
            <span>Starred</span>
          </button>

          {/* Sort selection */}
          <div className="relative inline-flex items-center gap-1.5 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-xs">
            <SortAsc className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-700 dark:text-slate-200 focus:outline-hidden pr-1.5 text-xs font-semibold uppercase cursor-pointer"
            >
              <option value="updated" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Recently Updated</option>
              <option value="created" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Date Created</option>
              <option value="title" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tags Quick Filter horizontal scrolling list */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2.5 overflow-x-auto py-1 scrollbar-none select-none">
          <span className="text-xs font-semibold text-slate-400 shrink-0 flex items-center gap-1 uppercase tracking-wider">
            <Tag className="h-3 w-3" />
            Filter Tags:
          </span>

          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
              selectedTag === null
                ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-950 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            All Notes
          </button>

          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                selectedTag === tag
                  ? 'bg-indigo-600 border-indigo-600 text-white dark:bg-indigo-600 dark:border-indigo-600 shadow-xs shadow-indigo-500/20'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tag}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
