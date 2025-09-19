'use client';

import React from 'react';
import { TranslateResult } from '@/hooks/useSearchAndTranslate';

interface TranslateResultsProps {
  translateResult: TranslateResult | null;
  query: string;
  hasSearchResults: boolean;
}

async function sendFeedback(payload: { phrase: string; translation: string; upvote?: boolean; downvote?: boolean }) {
  try {
    await fetch('/api/translations/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (_e) {
    // ignore network errors in UI feedback
    return;
  }
}

export default function TranslateResults({ translateResult, query, hasSearchResults }: TranslateResultsProps) {
  if (!translateResult) return null;

  const isDb = translateResult.source === 'database';

  return (
    <div className="space-y-4">
      <div className={`border rounded-lg p-4 ${isDb ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`${isDb ? 'text-green-600' : 'text-blue-600'}`}>{isDb ? '📚' : '🤖'}</span>
          <h3 className={`text-lg font-semibold ${isDb ? 'text-green-800' : 'text-blue-800'}`}>
            {isDb ? 'Database‑vertaling' : 'AI‑vertaling'}
          </h3>
        </div>
        <p className={`${isDb ? 'text-green-700' : 'text-blue-700'}`}>
          {isDb ? `Gevonden in de database` : (!hasSearchResults ? 'Niet gevonden in de database, automatisch vertaald' : `Vertaling van "${query}"`)}
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

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => sendFeedback({ phrase: translateResult.original_text, translation: translateResult.translated_text, upvote: true })}
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              👍 Nuttig
            </button>
            <button
              type="button"
              onClick={() => sendFeedback({ phrase: translateResult.original_text, translation: translateResult.translated_text, downvote: true })}
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              👎 Onnauwkeurig
            </button>
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
          
          {translateResult.confidence < 0.5 && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-yellow-600 dark:text-yellow-400 text-xl">💡</span>
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    Vertaling niet gevonden?
                  </h4>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-3">
                    Help mee door dit woord in te dienen via de community pagina. 
                    Andere gebruikers kunnen dan ook profiteren van jouw kennis!
                  </p>
                  <a
                    href={`/community?prefill=${encodeURIComponent(translateResult.original_text)}`}
                    className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Woord indienen
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
