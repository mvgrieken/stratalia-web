'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className={`relative inline-flex items-center justify-center p-2 rounded-lg transition-colors duration-200 hover:bg-white hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 ${className}`}
        aria-label="Thema wisselen"
        title="Thema wisselen"
      >
        <div className="w-5 h-5 flex items-center justify-center">
          <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
        </div>
        {showLabel && <span className="ml-2 text-sm">Thema</span>}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center p-2 rounded-lg transition-colors duration-200 hover:bg-white hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 ${className}`}
      aria-label={`Schakel naar ${theme === 'light' ? 'donker' : 'licht'} thema`}
      title={`Schakel naar ${theme === 'light' ? 'donker' : 'licht'} thema`}
    >
      {/* Sun icon for light mode */}
      <svg
        className={`w-5 h-5 transition-all duration-300 ${
          theme === 'light' 
            ? 'opacity-100 rotate-0 scale-100' 
            : 'opacity-0 rotate-90 scale-75'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>

      {/* Moon icon for dark mode */}
      <svg
        className={`absolute w-5 h-5 transition-all duration-300 ${
          theme === 'dark' 
            ? 'opacity-100 rotate-0 scale-100' 
            : 'opacity-0 -rotate-90 scale-75'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>

      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {theme === 'light' ? 'Donker' : 'Licht'}
        </span>
      )}
    </button>
  );
}
