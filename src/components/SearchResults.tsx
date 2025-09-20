'use client';

import React from 'react';
import WordCard from './WordCard';
import type { SearchResult } from '@/types/api';

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  onWordClick?: (word: string) => void;
}

export default function SearchResults({ results, query, onWordClick }: SearchResultsProps) {
  if (results.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-green-600 dark:text-green-400">✅</span>
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
            Gevonden in de database
          </h3>
        </div>
        <p className="text-green-700 dark:text-green-300">
          {results.length} resultaat{results.length !== 1 ? 'en' : ''} gevonden voor "{query}"
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((result) => (
          <WordCard
            key={result.id}
            word={{
              id: result.id,
              word: result.word,
              meaning: result.meaning,
              example: result.example
            }}
            onWordClick={onWordClick}
            showCategory={false}
            showDifficulty={false}
            enableFeedback
            className={`${
              result.match_type === 'exact' 
                ? 'ring-2 ring-green-200' 
                : result.match_type === 'fallback'
                ? 'ring-2 ring-blue-200'
                : ''
            }`}
          />
        ))}
      </div>
    </div>
  );
}