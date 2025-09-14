'use client';

import { useState, useRef, useEffect } from 'react';

interface WordSearchResult {
  id: string;
  word: string;
  meaning: string;
  example: string;
  match_type?: string;
  similarity_score?: number;
}

export default function SearchClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WordSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech recognition and synthesis after hydration
  useEffect(() => {
    // Check for speech recognition support
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

        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    // Check for speech synthesis support
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const speakWord = (word: string) => {
    if (synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'nl-NL';
      utterance.rate = 0.8;
      synthRef.current.speak(utterance);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/words/search?query=${encodeURIComponent(searchQuery)}&limit=10`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const results = await response.json();
      setSearchResults(results);
    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden bij het zoeken. Probeer het opnieuw.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
            {isSupported && (
              <button
                type="button"
                onClick={startListening}
                disabled={isListening}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Spraak invoer"
              >
                🎤
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Zoeken..." : "Zoeken"}
          </button>
        </div>
        {isListening && (
          <div className="text-center text-blue-600 mb-4">
            <div className="animate-pulse">🎤 Luisteren... Spreek nu je zoekterm uit</div>
          </div>
        )}
      </form>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg" role="alert">
          {error}
        </div>
      )}

      {searchResults.length > 0 ? (
        <div>
          <p className="text-lg font-semibold mb-4 text-gray-900">
            Resultaten ({searchResults.length})
          </p>
          <div className="space-y-4">
            {searchResults.map((result) => (
              <div key={result.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {result.word}
                  </h3>
                  {result.match_type && (
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
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
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                    title="Uitspraak afspelen"
                  >
                    🔊 {result.word}
                  </button>
                  <button
                    type="button"
                    onClick={() => speakWord(result.meaning)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-700 text-sm"
                    title="Betekenis uitspreken"
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
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Zoek naar straattaal woorden
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Probeer woorden zoals 'skeer', 'breezy', of 'chillen'
          </p>
        </div>
      )}
    </>
  );
}
