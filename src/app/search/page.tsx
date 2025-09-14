'use client';

import { useState } from 'react';

interface WordSearchResult {
  id: string;
  word: string;
  meaning: string;
  example: string;
  match_type?: string;
  similarity_score?: number;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WordSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/words/search?query=${encodeURIComponent(searchQuery)}&limit=10`);
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      alert('Er is een fout opgetreden bij het zoeken. Probeer het opnieuw.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Straattaal Zoeken
        </h1>
        
        <div className="mb-8">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Zoek een woord..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Zoeken..." : "Zoeken"}
            </button>
          </div>
        </div>

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
      </div>
    </div>
  );
}
