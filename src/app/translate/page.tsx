'use client';

import { useState, useRef, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { ApiErrorHandler } from '@/components/ApiErrorHandler';

interface TranslationResult {
  translation: string;
  confidence: number;
  alternatives: string[];
  explanation: string;
  etymology?: string;
  source?: string;
  error?: boolean;
  message?: string;
}

export default function TranslatePage() {
  const [inputText, setInputText] = useState('');
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'to_slang' | 'to_formal'>('to_formal');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Check for speech recognition support with proper fallbacks
    if (typeof window !== 'undefined') {
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          setIsSupported(true);
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = 'nl-NL';

          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInputText(transcript);
            setIsListening(false);
          };

          recognition.onerror = () => {
            setIsListening(false);
          };

          recognition.onend = () => {
            setIsListening(false);
          };

          recognitionRef.current = recognition;
        } else {
          setIsSupported(false);
        }
      } catch (error) {
        console.warn('Speech recognition not supported:', error);
        setIsSupported(false);
      }

      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
      }
    }
  }, []);

  const startListening = () => {
    if (!isSupported || !recognitionRef.current || isListening) {
      return;
    }
    
    try {
      setIsListening(true);
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setIsListening(false);
    }
  };

  const speakWord = (word: string) => {
    if (!synthRef.current) {
      return;
    }
    
    try {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'nl-NL';
      utterance.rate = 0.8;
      synthRef.current.speak(utterance);
    } catch (error) {
      console.error('Failed to speak word:', error);
    }
  };

  const handleTranslate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          direction: activeTab,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      // Check if the result contains an error
      if (result.error) {
        setError(result.message || 'Er is een fout opgetreden bij het vertalen. Probeer het opnieuw.');
        setTranslationResult(null);
      } else {
        setTranslationResult(result);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden bij het vertalen. Probeer het opnieuw.');
      setTranslationResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearTranslation = () => {
    setInputText('');
    setTranslationResult(null);
    setError(null);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'Hoge betrouwbaarheid';
    if (confidence >= 0.5) return 'Gemiddelde betrouwbaarheid';
    return 'Lage betrouwbaarheid';
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            AI Vertalen
          </h1>

          {/* Translation Interface */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            {/* Tab Navigation */}
            <div className="flex mb-6 border-b border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab('to_formal')}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'to_formal'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Straattaal → Nederlands
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('to_slang')}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'to_slang'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Nederlands → Straattaal
              </button>
            </div>

            <form onSubmit={handleTranslate} className="mb-6">
              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      activeTab === 'to_formal' 
                        ? "Voer straattaal in om te vertalen naar Nederlands..."
                        : "Voer Nederlandse tekst in om te vertalen naar straattaal..."
                    }
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                  {isSupported ? (
                    <button
                      type="button"
                      onClick={startListening}
                      disabled={isListening}
                      className={`absolute right-2 top-2 p-2 rounded-full ${
                        isListening 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title="Spraak invoer"
                    >
                      🎤
                    </button>
                  ) : (
                    <div 
                      className="absolute right-2 top-2 p-2 rounded-full bg-gray-100 text-gray-400 cursor-not-allowed"
                      title="Spraakherkenning niet ondersteund in deze browser"
                    >
                      🎤
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading || !inputText.trim()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? "Vertalen..." : "AI Vertalen"}
                </button>
                <button
                  type="button"
                  onClick={clearTranslation}
                  className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50"
                >
                  Wissen
                </button>
              </div>
              
              {isListening && (
                <div className="text-center text-blue-600 mt-4">
                  <div className="animate-pulse">🎤 Luisteren... Spreek nu je tekst uit</div>
                </div>
              )}
            </form>

            <ApiErrorHandler 
              error={error} 
              onRetry={() => {
                if (inputText.trim()) {
                  handleTranslate();
                }
              }}
              onClear={() => setError(null)}
              className="mb-4"
            />
          </div>

          {/* Translation Results */}
          {translationResult && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">Vertaling</h2>
                <span className={`text-sm px-2 py-1 rounded ${getConfidenceColor(translationResult.confidence)}`}>
                  {getConfidenceText(translationResult.confidence)}
                </span>
              </div>
              
              <div className={`rounded-lg p-4 mb-4 ${
                translationResult.error || translationResult.confidence < 0.3
                  ? 'bg-yellow-50 border border-yellow-200'
                  : 'bg-blue-50'
              }`}>
                <p className={`text-lg font-medium ${
                  translationResult.error || translationResult.confidence < 0.3
                    ? 'text-yellow-900'
                    : 'text-blue-900'
                }`}>
                  {translationResult.translation}
                </p>
                {translationResult.error && (
                  <p className="text-sm text-yellow-700 mt-2">
                    ⚠️ Deze vertaling is mogelijk niet volledig accuraat
                  </p>
                )}
              </div>
              
              {translationResult.explanation && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Uitleg:</h3>
                  <p className="text-gray-700">{translationResult.explanation}</p>
                </div>
              )}
              
              {translationResult.etymology && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Etymologie:</h3>
                  <p className="text-gray-700 text-sm">{translationResult.etymology}</p>
                </div>
              )}
              
              {translationResult.alternatives && translationResult.alternatives.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Alternatieven:</h3>
                  <ul className="list-disc list-inside text-gray-700">
                    {translationResult.alternatives.map((alt, index) => (
                      <li key={index} className="text-sm">{alt}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => speakWord(translationResult.translation)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                  title="Vertaling uitspreken"
                >
                  🔊 Uitspreken
                </button>
                <span className="text-sm text-gray-500">
                  Betrouwbaarheid: {Math.round(translationResult.confidence * 100)}%
                </span>
              </div>
            </div>
          )}
          
          {!translationResult && !isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {activeTab === 'to_formal' 
                  ? "Voer straattaal in om te vertalen naar Nederlands"
                  : "Voer Nederlandse tekst in om te vertalen naar straattaal"
                }
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Probeer woorden zoals 'swag', 'flexen', of 'skeer'
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
