'use client';

import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface SearchInputProps {
  query: string;
  loading: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function SearchInput({ query, loading, onInputChange, onSubmit }: SearchInputProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Zoek of vertaal
          </label>
          <div className="flex gap-2">
            <input
              id="search-input"
              type="text"
              value={query}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="Voer een woord of zin in om te zoeken of vertalen..."
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner />
                  <span>Zoeken...</span>
                </div>
              ) : (
                'Zoek & Vertaal'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
