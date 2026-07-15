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
    <div id="dashboard-search-bar" className="space-y-5">
      {/* Search Input and Filters Subgrid */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto] items-stretch">
        {/* Search Input Box */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by title, tag, or content..."
            className="w-full h-12 sm:h-14 pl-12 pr-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              aria-label="Clear Search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Favorite & Sort Panel Stack */}
        <div className="grid grid-cols-2 gap-3 lg:flex lg:items-center">
          {/* Favorite toggle filter */}
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`inline-flex h-12 sm:h-14 items-center justify-center lg:justify-start gap-2.5 px-5 rounded-2xl text-sm font-semibold border transition-all duration-200 cursor-pointer shadow-xs w-full lg:w-auto select-none ${
              onlyFavorites
                ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 hover:border-slate-300 dark:hover:bg-slate-800 dark:hover:border-slate-700'
            }`}
            aria-label="Filter Starred"
          >
            <Star className={`h-4.5 w-4.5 ${onlyFavorites ? 'fill-amber-500 text-amber-500 dark:text-amber-300' : 'text-slate-400'}`} />
            <span>Starred</span>
          </button>

          {/* Sort order options dropdown container */}
          <div className="relative inline-flex h-12 sm:h-14 items-center gap-2.5 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-xs w-full lg:w-auto hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <SortAsc className="h-4.5 w-4.5 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-700 dark:text-slate-200 focus:outline-hidden pr-2 text-xs font-bold uppercase tracking-wide cursor-pointer w-full h-full appearance-none select-none"
              aria-label="Sort notes"
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
        <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-2 scrollbar-thin select-none">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 shrink-0 flex items-center gap-1.5 uppercase tracking-wider">
            <Tag className="h-3.5 w-3.5" />
            Tags:
          </span>

          <button
            onClick={() => setSelectedTag(null)}
            className={`px-4 py-2 text-xs font-bold rounded-full border transition-all cursor-pointer shrink-0 ${
              selectedTag === null
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/10'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:border-slate-700'
            }`}
          >
            All Notes
          </button>

          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-4 py-2 text-xs font-bold rounded-full border transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                selectedTag === tag
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/10'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:border-slate-700'
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
