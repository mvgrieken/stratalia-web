/**
 * Optimized Search Results component
 * Displays search results with performance optimizations
 */

import React, { memo, useCallback, useMemo } from 'react';
import WordCard from './WordCard';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { EmptyState } from './EmptyState';

interface SearchResult {
  id: string;
  word: string;
  meaning: string;
  example: string;
  match_type: 'exact' | 'partial' | 'fallback';
  similarity_score: number;
}

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  query: string;
  onWordClick?: (word: string) => void;
  onRetry?: () => void;
}

const SearchResults = memo<SearchResultsProps>(({
  results,
  loading,
  error,
  query,
  onWordClick,
  onRetry
}) => {
  const handleWordClick = useCallback((_word: string) => {
    onWordClick?.(_word);
  }, [onWordClick]);

  const handleRetry = useCallback(() => {
    onRetry?.();
  }, [onRetry]);

  // Memoize sorted results to avoid re-sorting on every render
  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => {
      // Exact matches first
      if (a.match_type === 'exact' && b.match_type !== 'exact') return -1;
      if (b.match_type === 'exact' && a.match_type !== 'exact') return 1;
      
      // Then by similarity score
      return b.similarity_score - a.similarity_score;
    });
  }, [results]);

  // Memoize result statistics
  const stats = useMemo(() => {
    const exactMatches = results.filter(r => r.match_type === 'exact').length;
    const partialMatches = results.filter(r => r.match_type === 'partial').length;
    const fallbackResults = results.filter(r => r.match_type === 'fallback').length;
    
    return { exactMatches, partialMatches, fallbackResults };
  }, [results]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Zoeken naar "{query}"...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <ErrorMessage message={error} />
        {onRetry && (
          <button
            onClick={handleRetry}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Opnieuw proberen
          </button>
        )}
      </div>
    );
  }

  // No results
  if (results.length === 0) {
    return (
      <EmptyState
        title="Geen resultaten gevonden"
        message={`Geen woorden gevonden voor "${query}". Probeer een ander zoekterm.`}
        suggestions={[
          'Controleer de spelling',
          'Probeer een kortere zoekterm',
          'Gebruik synoniemen'
        ]}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Zoekresultaten voor "{query}"
          </h2>
          <div className="text-sm text-gray-500">
            {results.length} resultaat{results.length !== 1 ? 'en' : ''}
          </div>
        </div>
        
        {/* Result Statistics */}
        <div className="mt-2 flex gap-4 text-sm text-gray-600">
          {stats.exactMatches > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              {stats.exactMatches} exacte match{stats.exactMatches !== 1 ? 'es' : ''}
            </span>
          )}
          {stats.partialMatches > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              {stats.partialMatches} gedeeltelijke match{stats.partialMatches !== 1 ? 'es' : ''}
            </span>
          )}
          {stats.fallbackResults > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              {stats.fallbackResults} fallback resultaat{stats.fallbackResults !== 1 ? 'en' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedResults.map((result) => (
          <WordCard
            key={result.id}
            word={{
              id: result.id,
              word: result.word,
              meaning: result.meaning,
              example: result.example
            }}
            onWordClick={handleWordClick}
            showCategory={false}
            showDifficulty={false}
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

      {/* Fallback Notice */}
      {stats.fallbackResults > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Fallback resultaten
              </h3>
              <div className="mt-1 text-sm text-blue-700">
                <p>
                  Sommige resultaten komen uit onze fallback database. 
                  Dit kan gebeuren als de hoofd database tijdelijk niet beschikbaar is.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

SearchResults.displayName = 'SearchResults';

export default SearchResults;
