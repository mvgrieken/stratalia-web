'use client';

import React, { useState } from 'react';
import { ErrorMessage } from './ErrorMessage';
import { useSearchAndTranslate } from '@/hooks/useSearchAndTranslate';
import SearchInput from './SearchInput';
import SearchResults from './SearchResults';
import TranslateResults from './TranslateResults';
import NoResults from './NoResults';
import WordDetailView from './WordDetailView';

interface SearchAndTranslateProps {
  onWordClick?: (word: string) => void;
  className?: string;
}

export default function SearchAndTranslate({ onWordClick, className = '' }: SearchAndTranslateProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  
  const {
    query,
    loading,
    error,
    results,
    translateResult,
    resultType,
    direction,
    handleSearch,
    handleInputChange,
    setDirection,
  } = useSearchAndTranslate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleWordClick = (word: string) => {
    setSelectedWord(word);
    onWordClick?.(word);
  };

  const handleBackToSearch = () => {
    setSelectedWord(null);
  };

  // Show word detail view if a word is selected
  if (selectedWord) {
    return (
      <WordDetailView
        word={selectedWord}
        onBack={handleBackToSearch}
        className={className}
      />
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <SearchInput
        query={query}
        loading={loading}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
      />

      <div className="flex items-center gap-3 text-sm">
        <span className="text-gray-600">Richting:</span>
        <button
          type="button"
          className={`px-3 py-1 rounded ${direction === 'to_formal' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setDirection('to_formal')}
        >
          Straattaal → Nederlands
        </button>
        <button
          type="button"
          className={`px-3 py-1 rounded ${direction === 'to_slang' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setDirection('to_slang')}
        >
          Nederlands → Straattaal
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <ErrorMessage message={error} />
        </div>
      )}

      <SearchResults
        results={results}
        query={query}
        onWordClick={handleWordClick}
      />

      <TranslateResults
        translateResult={translateResult}
        query={query}
        hasSearchResults={results.length > 0}
      />

      <NoResults
        hasResults={results.length > 0}
        hasTranslateResult={!!translateResult}
        loading={loading}
        error={error}
      />
    </div>
  );
}
