'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ApiErrorHandler } from '@/components/ApiErrorHandler';
import Navigation from '@/components/Navigation';

interface WordSearchResult {
  id: string;
  word: string;
  meaning: string;
  example: string;
  match_type?: string;
  similarity_score?: number;
}

interface SearchResponse {
  results: WordSearchResult[];
  message: string;
  suggestions: string[];
  total: number;
  source: string;
}

export default function SearchClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WordSearchResult[]>([]);
  const [searchMessage, setSearchMessage] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize speech recognition and synthesis after hydration
  useEffect(() => {
    // Check for speech recognition support with proper error handling
    if (typeof window !== 'undefined') {
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          setIsSupported(true);
          recognitionRef.current = new SpeechRecognition();
          if (recognitionRef.current) {
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'nl-NL';

            recognitionRef.current.onresult = (event) => {
              const transcript = event.results[0][0].transcript;
              setSearchQuery(transcript);
              setIsListening(false);
            };

            recognitionRef.current.onerror = (event) => {
              console.warn('Speech recognition error:', event.error);
              setIsListening(false);
            };

            recognitionRef.current.onend = () => {
              setIsListening(false);
            };
          }
        } else {
          setIsSupported(false);
        }
      } catch (error) {
        console.warn('Speech recognition not supported:', error);
        setIsSupported(false);
      }

      // Check for speech synthesis support
      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
      }
    }
  }, []);

  const startListening = () => {
    if (!isSupported || !recognitionRef.current || isListening) {
      return;
    }
    
    try {
      setIsListening(true);
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setIsListening(false);
    }
  };

  const speakWord = (word: string) => {
    try {
      if (synthRef.current) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'nl-NL';
        utterance.rate = 0.8;
        utterance.onerror = (event) => {
          console.warn('Speech synthesis error:', event.error);
        };
        synthRef.current.speak(utterance);
      } else {
        console.warn('Speech synthesis not supported in this browser');
      }
    } catch (error) {
      console.error('Error speaking word:', error);
    }
  };

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/words/search?query=${encodeURIComponent(query)}&limit=10`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data: SearchResponse = await response.json();
      setSearchResults(data.results);
      setSearchMessage(data.message);
      setSuggestions(data.suggestions);
    } catch (err: any) {
      console.error('Search error:', err);
      setError('Er is een fout opgetreden bij het zoeken. Probeer het opnieuw.');
      setSearchResults([]);
      setSearchMessage('');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Set new timeout for debounced search
    debounceTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 300); // 300ms debounce
  }, [searchQuery, performSearch]);

  // Auto-search on query change (debounced)
  useEffect(() => {
    if (searchQuery.trim()) {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      debounceTimeoutRef.current = setTimeout(() => {
        performSearch(searchQuery);
      }, 500); // 500ms debounce for auto-search
    } else {
      setSearchResults([]);
      setSearchMessage('');
      setSuggestions([]);
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery, performSearch]);

  return (
    <>
      <Navigation />
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Zoek een woord..."
              className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {isSupported ? (
              <button
                type="button"
                onClick={startListening}
                disabled={isListening}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Spraak invoer"
                aria-label="Start spraakherkenning"
              >
                🎤
              </button>
            ) : (
              <div 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-gray-100 text-gray-400 cursor-not-allowed"
                title="Spraakherkenning niet ondersteund in deze browser"
                aria-label="Spraakherkenning niet beschikbaar"
              >
                🎤
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {isLoading ? "Zoeken..." : "Zoeken"}
          </button>
        </div>
        {isListening && (
          <div className="text-center text-blue-600 mb-4">
            <div className="animate-pulse">🎤 Luisteren... Spreek nu je zoekterm uit</div>
          </div>
        )}
      </form>

      <ApiErrorHandler 
        error={error} 
        onRetry={() => {
          if (searchQuery.trim()) {
            performSearch(searchQuery);
          }
        }}
        onClear={() => setError(null)}
        className="mb-4"
      />

      {/* Search Message */}
      {searchMessage && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">{searchMessage}</p>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Probeer deze woorden:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchQuery(suggestion);
                  performSearch(suggestion);
                }}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {searchResults.length > 0 ? (
        <div>
          <div className="space-y-4">
            {searchResults.map((result) => (
              <div key={result.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {result.word}
                  </h3>
                  {result.match_type && (
                    <span className={`text-sm px-2 py-1 rounded ${
                      result.match_type === 'exact' 
                        ? 'bg-green-100 text-green-800'
                        : result.match_type === 'partial'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {result.match_type}
                    </span>
                  )}
                </div>
                
                <p className="text-gray-700 mb-3">
                  {result.meaning}
                </p>
                
                <div className="bg-gray-50 rounded-md p-3">
                  <p className="text-sm text-gray-600 mb-1">Voorbeeld:</p>
                  <p className="text-gray-800 italic">"{result.example}"</p>
                </div>
                
                {/* Audio Playback */}
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => speakWord(result.word)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm transition-colors"
                    title="Uitspraak afspelen"
                    aria-label={`Spreek ${result.word} uit`}
                  >
                    🔊 {result.word}
                  </button>
                  <button
                    type="button"
                    onClick={() => speakWord(result.meaning)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-700 text-sm transition-colors"
                    title="Betekenis uitspreken"
                    aria-label={`Spreek betekenis van ${result.word} uit`}
                  >
                    🔊 Betekenis
                  </button>
                </div>
                
                {result.similarity_score && (
                  <p className="text-sm text-gray-500 mt-2">
                    Relevancy: {Math.round(result.similarity_score * 100)}%
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : !isLoading && !error && searchQuery.trim() === '' ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Zoek naar straattaal woorden
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Probeer woorden zoals 'skeer', 'breezy', of 'chillen'
          </p>
        </div>
      ) : null}
    </>
  );
}
