'use client';

import React, { useState, useCallback } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import WordCard from './WordCard';

interface SearchResult {
  id: string;
  word: string;
  meaning: string;
  example: string;
  match_type: 'exact' | 'partial' | 'fallback';
  similarity_score: number;
}

interface TranslateResult {
  original_text: string;
  translated_text: string;
  confidence: number;
  source_language: string;
  target_language: string;
  alternatives?: string[];
}

interface SearchAndTranslateProps {
  onWordClick?: (word: string) => void;
  className?: string;
}

export default function SearchAndTranslate({ onWordClick, className = '' }: SearchAndTranslateProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [translateResult, setTranslateResult] = useState<TranslateResult | null>(null);
  const [resultType, setResultType] = useState<'search' | 'translate' | null>(null);

  const isSingleWord = useCallback((text: string) => {
    const trimmed = text.trim();
    return trimmed.split(/\s+/).length === 1 && trimmed.length > 0;
  }, []);

  const performSearch = useCallback(async (searchQuery: string): Promise<SearchResult[]> => {
    const response = await fetch(`/api/words/search?query=${encodeURIComponent(searchQuery)}&limit=10`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Search failed');
    }
    
    return data.results || [];
  }, []);

  const performTranslate = useCallback(async (text: string): Promise<TranslateResult> => {
    const response = await fetch('/api/ai/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Translation failed');
    }
    
    return data;
  }, []);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setTranslateResult(null);
      setResultType(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setTranslateResult(null);
    setResultType(null);

    try {
      const trimmedQuery = searchQuery.trim();
      
      if (isSingleWord(trimmedQuery)) {
        // For single words, try search first
        try {
          const searchResults = await performSearch(trimmedQuery);
          
          if (searchResults.length > 0) {
            setResults(searchResults);
            setResultType('search');
            return;
          }
          
          // No search results, try translation
          const translateData = await performTranslate(trimmedQuery);
          setTranslateResult(translateData);
          setResultType('translate');
          
        } catch (searchError) {
          // Search failed, try translation as fallback
          try {
            const translateData = await performTranslate(trimmedQuery);
            setTranslateResult(translateData);
            setResultType('translate');
          } catch (translateError) {
            throw new Error('Zowel zoeken als vertalen is mislukt. Probeer het opnieuw.');
          }
        }
      } else {
        // For multiple words or sentences, try translation first
        try {
          const translateData = await performTranslate(trimmedQuery);
          setTranslateResult(translateData);
          setResultType('translate');
        } catch (translateError) {
          // Translation failed, try to search individual words
          const words = trimmedQuery.split(/\s+/);
          const allResults: SearchResult[] = [];
          
          for (const word of words) {
            try {
              const wordResults = await performSearch(word);
              allResults.push(...wordResults);
            } catch (searchError) {
              // Ignore individual word search failures
            }
          }
          
          if (allResults.length > 0) {
            setResults(allResults);
            setResultType('search');
          } else {
            throw new Error('Vertaling mislukt en geen woorden gevonden in de database.');
          }
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Er is een onverwachte fout opgetreden');
    } finally {
      setLoading(false);
    }
  }, [isSingleWord, performSearch, performTranslate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search/Translate Input */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Zoek of vertaal
            </label>
            <div className="flex gap-2">
              <input
                id="search-input"
                type="text"
                value={query}
                onChange={handleInputChange}
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

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Results Display */}
      {resultType === 'search' && results.length > 0 && (
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
      )}

      {resultType === 'translate' && translateResult && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-600 dark:text-blue-400">🤖</span>
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                AI Vertaling
              </h3>
            </div>
            <p className="text-blue-700 dark:text-blue-300">
              {results.length === 0 
                ? `Niet gevonden in de database, automatisch vertaald`
                : `Vertaling van "${query}"`
              }
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Origineel
                </label>
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  {translateResult.original_text}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Vertaling
                </label>
                <p className="text-gray-900 dark:text-gray-100 text-lg">
                  {translateResult.translated_text}
                </p>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>
                  Betrouwbaarheid: {Math.round(translateResult.confidence * 100)}%
                </span>
                <span>
                  {translateResult.source_language} → {translateResult.target_language}
                </span>
              </div>
              
              {translateResult.alternatives && translateResult.alternatives.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alternatieven
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {translateResult.alternatives.map((alt, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                      >
                        {alt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {resultType && results.length === 0 && !translateResult && !loading && !error && (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Geen resultaten gevonden
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Probeer een ander woord of controleer je spelling.
          </p>
        </div>
      )}
    </div>
  );
}
