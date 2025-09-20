/**
 * Optimized Word Card component with React.memo
 * Displays word information with performance optimizations
 */

import React, { memo, useCallback, useState, useEffect } from 'react';
import AudioPlayer from './AudioPlayer';

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
  enableFeedback?: boolean;
}

const WordCard = memo<WordCardProps>(({
  word,
  onWordClick,
  showCategory = false,
  showDifficulty = false,
  className = '',
  enableFeedback = false
}) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Fetch audio URL for the word
  useEffect(() => {
    const fetchAudioUrl = async () => {
      try {
        const response = await fetch(`/api/words/${encodeURIComponent(word.word)}/audio`);
        if (response.ok) {
          const data = await response.json();
          if (data.hasAudio) {
            setAudioUrl(data.audioUrl);
          }
        }
      } catch (error) {
        // Audio is optional, don't fail the component
        console.warn('Failed to fetch audio for word:', word.word, error);
      }
    };

    fetchAudioUrl();
  }, [word.word]);
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
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-gray-900">
            {word.word}
          </h3>
          <AudioPlayer
            text={word.word}
            audioUrl={audioUrl}
            size="sm"
            showText={false}
          />
        </div>
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

      {enableFeedback && (
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fetch('/api/words/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ word: word.word, meaning: word.meaning, helpful: true })
              }).then(() => {
                // Show visual feedback
                const button = e.target as HTMLButtonElement;
                const originalText = button.textContent;
                button.textContent = '✅ Nuttig';
                button.className = 'px-3 py-1 rounded bg-green-100 text-green-700 text-sm';
                setTimeout(() => {
                  button.textContent = originalText;
                  button.className = 'px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm';
                }, 2000);
              }).catch(() => {});
            }}
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm"
            aria-label="Markeer vertaling nuttig"
          >
            👍 Nuttig
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fetch('/api/words/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ word: word.word, meaning: word.meaning, helpful: false })
              }).then(() => {
                // Show visual feedback
                const button = e.target as HTMLButtonElement;
                const originalText = button.textContent;
                button.textContent = '❌ Onnauwkeurig';
                button.className = 'px-3 py-1 rounded bg-red-100 text-red-700 text-sm';
                setTimeout(() => {
                  button.textContent = originalText;
                  button.className = 'px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm';
                }, 2000);
              }).catch(() => {});
            }}
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm"
            aria-label="Markeer vertaling onnauwkeurig"
          >
            👎 Onnauwkeurig
          </button>
        </div>
      )}
    </div>
  );
});

WordCard.displayName = 'WordCard';

export default WordCard;
