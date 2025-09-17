'use client';

import { useState, useEffect } from 'react';

interface DailyWord {
  id: string;
  word: string;
  meaning: string;
  example: string;
  date: string;
}

interface WeeklyProgress {
  date: string;
  completed: boolean;
  word?: string;
}

export default function WordOfTheDayPage() {
  const [dailyWord, setDailyWord] = useState<DailyWord | null>(null);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioSupported, setAudioSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetchDailyWord();
    fetchWeeklyProgress();
    
    // Check for speech synthesis support
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setAudioSupported(true);
    }
  }, []);

  const fetchDailyWord = async () => {
    try {
      const response = await fetch('/api/words/daily');
      if (response.ok) {
        const data = await response.json();
        setDailyWord(data);
        setError(null); // Clear any previous errors
      } else {
        // Even if API fails, try to get fallback data
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.details || 'Kon het woord van de dag niet ophalen');
        
        // Set a fallback word so the page is still usable
        setDailyWord({
          id: 'fallback-emergency',
          word: 'skeer',
          meaning: 'arm, weinig geld hebben',
          example: 'Ik ben helemaal skeer deze maand.',
          date: new Date().toISOString().split('T')[0]
        });
      }
    } catch (err: any) {
      setError('Er is een fout opgetreden bij het ophalen van het woord van de dag');
      
      // Set a fallback word so the page is still usable
      setDailyWord({
        id: 'fallback-emergency',
        word: 'skeer',
        meaning: 'arm, weinig geld hebben',
        example: 'Ik ben helemaal skeer deze maand.',
        date: new Date().toISOString().split('T')[0]
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyProgress = async () => {
    try {
      // Generate weekly progress for the last 7 days
      const today = new Date();
      const weekProgress: WeeklyProgress[] = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Simulate some completed days (random for demo)
        const completed = Math.random() > 0.3;
        
        weekProgress.push({
          date: dateStr,
          completed,
          word: completed ? `Woord ${i + 1}` : undefined
        });
      }
      
      setWeeklyProgress(weekProgress);
    } catch (err) {
      console.error('Error fetching weekly progress:', err);
    }
  };

  const speakWord = (word: string) => {
    if (!audioSupported || !word) return;
    
    try {
      setIsPlaying(true);
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'nl-NL';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      
      utterance.onend = () => {
        setIsPlaying(false);
      };
      
      utterance.onerror = (event) => {
        console.warn('Speech synthesis error:', event.error);
        setIsPlaying(false);
      };
      
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error speaking word:', error);
      setIsPlaying(false);
    }
  };

  const speakMeaning = (meaning: string) => {
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(meaning);
        utterance.lang = 'nl-NL';
        utterance.rate = 0.8;
        utterance.onerror = (event) => {
          console.warn('Speech synthesis error:', event.error);
        };
        window.speechSynthesis.speak(utterance);
      } else {
        console.warn('Speech synthesis not supported in this browser');
      }
    } catch (error) {
      console.error('Error speaking meaning:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Woord van de dag wordt geladen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Fout opgetreden</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            📅 Woord van de Dag
          </h1>

          {/* Daily Word Card */}
          {dailyWord && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 text-white mb-8">
              <div className="text-center">
                <h2 className="text-4xl font-bold mb-4">{dailyWord.word}</h2>
                <p className="text-xl mb-6">{dailyWord.meaning}</p>
                {dailyWord.example && (
                  <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-6">
                    <p className="text-lg italic">"{dailyWord.example}"</p>
                  </div>
                )}
                
                {/* Audio Controls */}
                <div className="flex justify-center gap-4">
                  {audioSupported ? (
                    <>
                      <button
                        onClick={() => speakWord(dailyWord.word)}
                        disabled={isPlaying}
                        className="bg-white bg-opacity-20 hover:bg-opacity-30 disabled:opacity-50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        aria-label={`Spreek het woord "${dailyWord.word}" uit`}
                      >
                        {isPlaying ? '⏸️' : '🔊'} {dailyWord.word}
                      </button>
                      <button
                        onClick={() => speakMeaning(dailyWord.meaning)}
                        disabled={isPlaying}
                        className="bg-white bg-opacity-20 hover:bg-opacity-30 disabled:opacity-50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        aria-label="Spreek de betekenis uit"
                      >
                        {isPlaying ? '⏸️' : '🔊'} Betekenis
                      </button>
                    </>
                  ) : (
                    <div className="text-white bg-opacity-20 px-4 py-2 rounded-lg text-sm">
                      🔊 Audio niet ondersteund in deze browser
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Weekly Progress */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Weekoverzicht</h3>
            <div className="grid grid-cols-7 gap-4">
              {weeklyProgress.map((day, index) => {
                const isToday = day.date === new Date().toISOString().split('T')[0];
                const isFuture = new Date(day.date) > new Date();
                
                return (
                  <div key={day.date} className="text-center">
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 transition-colors ${
                        isToday
                          ? 'bg-blue-500 text-white ring-2 ring-blue-300' // Today - highlighted
                          : day.completed 
                            ? 'bg-green-500 text-white' // Completed
                            : isFuture
                              ? 'bg-gray-100 text-gray-400' // Future - disabled
                              : 'bg-gray-200 text-gray-500' // Missed
                      }`}
                      title={
                        isToday 
                          ? 'Vandaag' 
                          : day.completed 
                            ? `Voltooid: ${day.word || 'Woord geleerd'}` 
                            : isFuture
                              ? 'Toekomstige dag'
                              : 'Gemist'
                      }
                    >
                      {day.completed ? '✓' : index + 1}
                    </div>
                    <p className={`text-sm ${
                      isToday ? 'text-blue-600 font-semibold' : 'text-gray-600'
                    }`}>
                      {new Date(day.date).toLocaleDateString('nl-NL', { weekday: 'short' })}
                    </p>
                    <p className={`text-xs ${
                      isToday ? 'text-blue-500 font-medium' : 'text-gray-500'
                    }`}>
                      {new Date(day.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Learning Tips */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">💡 Leertips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">🎯 Oefen dagelijks</h4>
                <p className="text-blue-800 text-sm">
                  Leer elke dag een nieuw straattaalwoord om je vocabulaire uit te breiden.
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">🗣️ Gebruik het woord</h4>
                <p className="text-green-800 text-sm">
                  Probeer het nieuwe woord vandaag te gebruiken in een gesprek.
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">📚 Verdiep je kennis</h4>
                <p className="text-purple-800 text-sm">
                  Bekijk de kennisbank voor meer informatie over straattaal.
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-semibold text-orange-900 mb-2">🎮 Test je kennis</h4>
                <p className="text-orange-800 text-sm">
                  Doe de quiz om te zien hoeveel woorden je al kent.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/search'}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              🔍 Zoek meer woorden
            </button>
            <button
              onClick={() => window.location.href = '/quiz'}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              🧠 Start Quiz
            </button>
            <button
              onClick={() => window.location.href = '/knowledge'}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
            >
              📚 Kennisbank
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
