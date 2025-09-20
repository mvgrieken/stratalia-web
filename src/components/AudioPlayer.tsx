'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { logger } from '@/lib/logger';

interface AudioPlayerProps {
  text: string;
  audioUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  disabled?: boolean;
}

export default function AudioPlayer({ 
  text, 
  audioUrl, 
  className = '', 
  size = 'md',
  showText = false,
  disabled = false 
}: AudioPlayerProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioSupported, setAudioSupported] = useState(false);
  
  const { 
    speak, 
    stop, 
    isPlaying: isPlayingSpeech, 
    isSupported: speechSupported,
    error: speechError 
  } = useSpeechSynthesis();

  // Check for audio support
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Audio' in window) {
      setAudioSupported(true);
    }
  }, []);

  const isPlaying = isPlayingSpeech || isPlayingAudio;

  const handlePlayAudio = useCallback(async () => {
    if (!audioUrl || !audioSupported || disabled) return;

    try {
      setAudioError(null);
      setIsPlayingAudio(true);

      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsPlayingAudio(false);
      };

      audio.onerror = (event) => {
        const errorMessage = 'Failed to play audio file';
        logger.error(errorMessage, event);
        setAudioError(errorMessage);
        setIsPlayingAudio(false);
      };

      await audio.play();
      
    } catch (err) {
      const errorMessage = `Audio playback error: ${err instanceof Error ? err.message : String(err)}`;
      logger.error(errorMessage);
      setAudioError(errorMessage);
      setIsPlayingAudio(false);
    }
  }, [audioUrl, audioSupported, disabled]);

  const handlePlaySpeech = useCallback(() => {
    if (!text || !speechSupported || disabled) return;
    
    // Stop any current audio
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
    }
    
    speak(text, {
      rate: 0.8,
      pitch: 1.0,
      lang: 'nl-NL'
    });
  }, [text, speechSupported, disabled, isPlayingAudio, speak]);

  const handleStop = useCallback(() => {
    stop();
    setIsPlayingAudio(false);
  }, [stop]);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8 text-sm';
      case 'lg':
        return 'w-12 h-12 text-lg';
      default:
        return 'w-10 h-10 text-base';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  // Determine which audio method to use
  const hasAudioFile = audioUrl && audioSupported;
  const hasSpeechSynthesis = text && speechSupported;
  const canPlayAudio = hasAudioFile || hasSpeechSynthesis;

  if (!canPlayAudio || disabled) {
    return (
      <div className={`flex items-center justify-center ${getSizeClasses()} ${className}`}>
        <div className="text-gray-400" title="Audio niet beschikbaar">
          <svg className={getIconSize()} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={isPlaying ? handleStop : (hasAudioFile ? handlePlayAudio : handlePlaySpeech)}
        disabled={disabled}
        className={`
          flex items-center justify-center rounded-full transition-colors
          ${getSizeClasses()}
          ${isPlaying 
            ? 'bg-red-500 text-white hover:bg-red-600' 
            : 'bg-blue-500 text-white hover:bg-blue-600'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        title={isPlaying ? 'Stop audio' : 'Speel audio af'}
        aria-label={isPlaying ? 'Stop audio' : 'Speel audio af'}
      >
        {isPlaying ? (
          <svg className={getIconSize()} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className={getIconSize()} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.997 9.997 0 0119 10a9.997 9.997 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.997 7.997 0 0017 10a7.997 7.997 0 00-2.343-5.657 1 1 0 010-1.414zm-2.828 2.828a1 1 0 011.414 0A5.998 5.998 0 0115 10a5.998 5.998 0 01-1.757 4.243 1 1 0 01-1.414-1.414A3.998 3.998 0 0013 10a3.998 3.998 0 00-1.172-2.828 1 1 0 010-1.414z" />
          </svg>
        )}
      </button>
      
      {showText && (
        <span className="text-sm text-gray-600">
          {hasAudioFile ? 'Audio bestand' : 'Spraak'}
        </span>
      )}

      {/* Error display */}
      {(speechError || audioError) && (
        <div className="text-xs text-red-500" title={speechError || audioError || ''}>
          ⚠️
        </div>
      )}
    </div>
  );
}
