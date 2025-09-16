/**
 * Optimized Word Card component with React.memo
 * Displays word information with performance optimizations
 */

import React, { memo, useCallback } from 'react';

interface WordCardProps {
  word: {
    id: string;
    word: string;
    meaning: string;
    example?: string;
    category?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
  };
  onWordClick?: (word: string) => void;
  showCategory?: boolean;
  showDifficulty?: boolean;
  className?: string;
}

const WordCard = memo<WordCardProps>(({
  word,
  onWordClick,
  showCategory = false,
  showDifficulty = false,
  className = ''
}) => {
  const handleClick = useCallback(() => {
    onWordClick?.(word.word);
  }, [onWordClick, word.word]);

  const getDifficultyColor = useCallback((difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getDifficultyLabel = useCallback((difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'Makkelijk';
      case 'medium': return 'Gemiddeld';
      case 'hard': return 'Moeilijk';
      default: return 'Onbekend';
    }
  }, []);

  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200 ${className}`}
      onClick={handleClick}
      role={onWordClick ? 'button' : undefined}
      tabIndex={onWordClick ? 0 : undefined}
      onKeyDown={onWordClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
    >
      {/* Word Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-bold text-gray-900">
          {word.word}
        </h3>
        <div className="flex gap-2">
          {showDifficulty && word.difficulty && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(word.difficulty)}`}>
              {getDifficultyLabel(word.difficulty)}
            </span>
          )}
          {showCategory && word.category && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {word.category}
            </span>
          )}
        </div>
      </div>

      {/* Meaning */}
      <p className="text-gray-700 mb-3">
        {word.meaning}
      </p>

      {/* Example */}
      {word.example && (
        <div className="bg-gray-50 rounded-md p-3">
          <p className="text-sm text-gray-600 italic">
            "{word.example}"
          </p>
        </div>
      )}
    </div>
  );
});

WordCard.displayName = 'WordCard';

export default WordCard;
