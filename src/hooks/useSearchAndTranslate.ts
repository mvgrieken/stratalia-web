import { useState, useCallback } from 'react';
import type { SearchResult } from '@/types/api';

export interface TranslateResult {
  original_text: string;
  translated_text: string;
  confidence: number;
  source_language: string;
  target_language: string;
  alternatives?: string[];
}

export type ResultType = 'search' | 'translate' | null;

export function useSearchAndTranslate() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [translateResult, setTranslateResult] = useState<TranslateResult | null>(null);
  const [resultType, setResultType] = useState<ResultType>(null);

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

  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setTranslateResult(null);
    setResultType(null);
    setError(null);
  }, []);

  return {
    // State
    query,
    loading,
    error,
    results,
    translateResult,
    resultType,
    
    // Actions
    handleSearch,
    handleInputChange,
    clearResults,
    
    // Utilities
    isSingleWord,
  };
}
