import { useState, useCallback, useEffect } from 'react';
import { logger } from '@/lib/logger';

interface SpeechSynthesisOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
  voice?: SpeechSynthesisVoice;
}

interface UseSpeechSynthesisReturn {
  speak: (text: string, options?: SpeechSynthesisOptions) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isSupported: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  voices: SpeechSynthesisVoice[];
  currentVoice: SpeechSynthesisVoice | null;
  setVoice: (voice: SpeechSynthesisVoice) => void;
  error: string | null;
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  // Check for speech synthesis support
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      
      // Load voices
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        
        // Set default Dutch voice if available
        const dutchVoice = availableVoices.find(voice => 
          voice.lang.startsWith('nl') || 
          voice.name.toLowerCase().includes('dutch') ||
          voice.name.toLowerCase().includes('nederlands')
        );
        
        if (dutchVoice) {
          setCurrentVoice(dutchVoice);
        } else if (availableVoices.length > 0) {
          setCurrentVoice(availableVoices[0]);
        }
      };

      // Load voices immediately
      loadVoices();
      
      // Load voices when they become available (some browsers load them asynchronously)
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
      }

      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    } else {
      setIsSupported(false);
    }
  }, []);

  const speak = useCallback((text: string, options: SpeechSynthesisOptions = {}) => {
    if (!isSupported || !text.trim()) {
      setError('Speech synthesis not supported or no text provided');
      return;
    }

    try {
      // Stop any current speech
      window.speechSynthesis.cancel();
      setError(null);

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice
      if (options.voice) {
        utterance.voice = options.voice;
      } else if (currentVoice) {
        utterance.voice = currentVoice;
      }
      
      // Set options
      utterance.rate = options.rate ?? 0.8;
      utterance.pitch = options.pitch ?? 1.0;
      utterance.volume = options.volume ?? 1.0;
      utterance.lang = options.lang ?? 'nl-NL';

      // Event handlers
      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
        setError(null);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };

      utterance.onerror = (event) => {
        const errorMessage = `Speech synthesis error: ${event.error}`;
        logger.error(errorMessage);
        setError(errorMessage);
        setIsPlaying(false);
        setIsPaused(false);
      };

      utterance.onpause = () => {
        setIsPaused(true);
      };

      utterance.onresume = () => {
        setIsPaused(false);
      };

      // Speak the text
      window.speechSynthesis.speak(utterance);
      
    } catch (err) {
      const errorMessage = `Failed to speak text: ${err instanceof Error ? err.message : String(err)}`;
      logger.error(errorMessage);
      setError(errorMessage);
    }
  }, [isSupported, currentVoice]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (isSupported && isPlaying && !isPaused) {
      window.speechSynthesis.pause();
    }
  }, [isSupported, isPlaying, isPaused]);

  const resume = useCallback(() => {
    if (isSupported && isPlaying && isPaused) {
      window.speechSynthesis.resume();
    }
  }, [isSupported, isPlaying, isPaused]);

  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setCurrentVoice(voice);
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    isSupported,
    isPlaying,
    isPaused,
    voices,
    currentVoice,
    setVoice,
    error
  };
}
