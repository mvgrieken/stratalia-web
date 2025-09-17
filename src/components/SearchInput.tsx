'use client';

import React, { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';

interface SearchInputProps {
  query: string;
  loading: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function SearchInput({ query, loading, onInputChange, onSubmit }: SearchInputProps) {
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const { isListening, isSupported, startListening, stopListening, error: voiceRecognitionError } = useVoiceRecognition(
    (transcript) => {
      onInputChange(transcript);
      setVoiceError(null);
    },
    (error) => {
      setVoiceError(error);
    }
  );

  const handleVoiceClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Zoek of vertaal
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                id="search-input"
                type="text"
                value={query}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder="Voer een woord of zin in om te zoeken of vertalen..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              {isSupported && (
                <button
                  type="button"
                  onClick={handleVoiceClick}
                  disabled={loading}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors ${
                    isListening
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={isListening ? 'Stop spraakherkenning' : 'Start spraakherkenning'}
                >
                  {isListening ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v4a1 1 0 11-2 0V7zM12 7a1 1 0 012 0v4a1 1 0 11-2 0V7z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              )}
            </div>
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
        
        {/* Voice recognition error */}
        {(voiceError || voiceRecognitionError) && (
          <div className="text-sm text-red-600 dark:text-red-400">
            {voiceError || voiceRecognitionError}
          </div>
        )}
        
        {/* Voice recognition status */}
        {isListening && (
          <div className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            Luisteren naar spraak...
          </div>
        )}
      </form>
    </div>
  );
}
