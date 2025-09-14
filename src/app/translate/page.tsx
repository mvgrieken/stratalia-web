'use client';

import { useState, useRef, useEffect } from 'react';

interface TranslationResult {
  translation: string;
  confidence: number;
  alternatives: string[];
  explanation: string;
  etymology?: string;
}

export default function TranslatePage() {
  const [inputText, setInputText] = useState('');
  const [translationDirection, setTranslationDirection] = useState<'to_slang' | 'to_formal'>('to_slang');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationHistory, setTranslationHistory] = useState<Array<{input: string, result: TranslationResult, direction: string}>>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Check for speech recognition support
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'nl-NL';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }

      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
      }
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const speakText = (text: string) => {
    if (synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'nl-NL';
      utterance.rate = 0.8;
      synthRef.current.speak(utterance);
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsTranslating(true);
    try {
      const response = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          direction: translationDirection,
          context: 'general'
        }),
      });

      if (response.ok) {
        const translationResult = await response.json();
        setResult(translationResult);
        
        // Add to history
        setTranslationHistory(prev => [
          { input: inputText, result: translationResult, direction: translationDirection },
          ...prev.slice(0, 9) // Keep last 10 translations
        ]);
      } else {
        console.error('Translation failed');
      }
    } catch (error) {
      console.error('Error translating:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const clearTranslation = () => {
    setInputText('');
    setResult(null);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'Hoge betrouwbaarheid';
    if (confidence >= 0.6) return 'Gemiddelde betrouwbaarheid';
    return 'Lage betrouwbaarheid';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            AI Vertaalservice
          </h1>

          {/* Translation Interface */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            {/* Direction Selector */}
            <div className="flex justify-center mb-6">
              <div className="bg-gray-100 rounded-lg p-1 flex">
                <button
                  onClick={() => setTranslationDirection('to_slang')}
                  className={`px-6 py-2 rounded-md transition-colors ${
                    translationDirection === 'to_slang'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Nederlands → Straattaal
                </button>
                <button
                  onClick={() => setTranslationDirection('to_formal')}
                  className={`px-6 py-2 rounded-md transition-colors ${
                    translationDirection === 'to_formal'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Straattaal → Nederlands
                </button>
              </div>
            </div>

            {/* Input Area */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {translationDirection === 'to_slang' ? 'Nederlandse tekst' : 'Straattaal tekst'}
              </label>
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={translationDirection === 'to_slang' 
                    ? 'Typ hier je Nederlandse tekst...' 
                    : 'Typ hier je straattaal tekst...'
                  }
                  rows={4}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                {isSupported && (
                  <button
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
                )}
              </div>
              {isListening && (
                <div className="text-center text-blue-600 mt-2">
                  <div className="animate-pulse">🎤 Luisteren... Spreek nu je tekst uit</div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleTranslate}
                disabled={isTranslating || !inputText.trim()}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isTranslating ? 'Vertalen...' : '🤖 AI Vertalen'}
              </button>
              <button
                onClick={clearTranslation}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50"
              >
                Wissen
              </button>
            </div>
          </div>

          {/* Translation Result */}
          {result && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Vertaling</h2>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${getConfidenceColor(result.confidence)}`}>
                    {getConfidenceText(result.confidence)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({Math.round(result.confidence * 100)}%)
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-lg font-medium text-blue-900 mb-2">
                  {result.translation}
                </p>
                <button
                  onClick={() => speakText(result.translation)}
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                >
                  🔊 Uitspraak
                </button>
              </div>

              {/* Alternatives */}
              {result.alternatives.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Alternatieven:</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.alternatives.map((alt, index) => (
                      <button
                        key={index}
                        onClick={() => speakText(alt)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                      >
                        {alt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Explanation */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Uitleg:</h3>
                <p className="text-gray-600 text-sm">{result.explanation}</p>
              </div>

              {/* Etymology */}
              {result.etymology && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Etymologie:</h3>
                  <p className="text-gray-600 text-sm">{result.etymology}</p>
                </div>
              )}
            </div>
          )}

          {/* Translation History */}
          {translationHistory.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Vertaald</h3>
              <div className="space-y-3">
                {translationHistory.slice(0, 5).map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-gray-500">
                        {item.direction === 'to_slang' ? 'Nederlands → Straattaal' : 'Straattaal → Nederlands'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {Math.round(item.result.confidence * 100)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>Invoer:</strong> {item.input}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Vertaling:</strong> {item.result.translation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
