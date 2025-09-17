'use client';

import React from 'react';
import { ErrorMessage } from './ErrorMessage';
import { useSearchAndTranslate } from '@/hooks/useSearchAndTranslate';
import SearchInput from './SearchInput';
import SearchResults from './SearchResults';
import TranslateResults from './TranslateResults';
import NoResults from './NoResults';

interface SearchAndTranslateProps {
  onWordClick?: (word: string) => void;
  className?: string;
}

export default function SearchAndTranslate({ onWordClick, className = '' }: SearchAndTranslateProps) {
  const {
    query,
    loading,
    error,
    results,
    translateResult,
    resultType,
    handleSearch,
    handleInputChange,
  } = useSearchAndTranslate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <SearchInput
        query={query}
        loading={loading}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
      />

      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <ErrorMessage message={error} />
        </div>
      )}

      <SearchResults
        results={results}
        query={query}
        onWordClick={onWordClick}
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
