'use client';

import React from 'react';

interface NoResultsProps {
  hasResults: boolean;
  hasTranslateResult: boolean;
  loading: boolean;
  error: string | null;
}

export default function NoResults({ hasResults, hasTranslateResult, loading, error }: NoResultsProps) {
  // Don't show if there are results, loading, or errors
  if (hasResults || hasTranslateResult || loading || error) return null;

  return (
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
  );
}
