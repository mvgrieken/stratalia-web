'use client';

import React from 'react';

interface ApiErrorHandlerProps {
  error: string | null;
  onRetry?: () => void;
  onClear?: () => void;
  className?: string;
}

export function ApiErrorHandler({ 
  error, 
  onRetry, 
  onClear, 
  className = '' 
}: ApiErrorHandlerProps) {
  if (!error) return null;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Er is een fout opgetreden
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{error}</p>
          </div>
          {(onRetry || onClear) && (
            <div className="mt-4">
              <div className="-mx-2 -my-1.5 flex">
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                  >
                    Opnieuw proberen
                  </button>
                )}
                {onClear && (
                  <button
                    type="button"
                    onClick={onClear}
                    className="ml-3 bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                  >
                    Sluiten
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ApiSuccessHandlerProps {
  message: string;
  onClear?: () => void;
  className?: string;
}

export function ApiSuccessHandler({ 
  message, 
  onClear, 
  className = '' 
}: ApiSuccessHandlerProps) {
  return (
    <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-green-800">
            Succesvol
          </h3>
          <div className="mt-2 text-sm text-green-700">
            <p>{message}</p>
          </div>
          {onClear && (
            <div className="mt-4">
              <div className="-mx-2 -my-1.5 flex">
                <button
                  type="button"
                  onClick={onClear}
                  className="bg-green-50 px-2 py-1.5 rounded-md text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
                >
                  Sluiten
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ApiLoadingHandlerProps {
  message?: string;
  className?: string;
}

export function ApiLoadingHandler({ 
  message = 'Laden...', 
  className = '' 
}: ApiLoadingHandlerProps) {
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-blue-800">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
