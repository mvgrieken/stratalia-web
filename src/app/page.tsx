'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

interface DailyWord {
  id: string;
  word: string;
  meaning: string;
  example: string;
  date: string;
}

export default function HomePage() {
  const [dailyWord, setDailyWord] = useState<DailyWord | null>(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyWord();
  }, []);

  const fetchDailyWord = async () => {
    try {
      const response = await fetch('/api/words/daily');
      if (response.ok) {
        const data = await response.json();
        setDailyWord(data);
      }
    } catch (error) {
      console.error('Error fetching daily word:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Stratalia
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Leer straattaal op een leuke en interactieve manier
          </p>
        </div>

        {/* Daily Word Section */}
        {dailyWord && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white mb-8 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">📅 Woord van de Dag</h2>
            <div className="text-center">
              <h3 className="text-3xl font-bold mb-2">{dailyWord.word}</h3>
              <p className="text-lg mb-3">{dailyWord.meaning}</p>
              {dailyWord.example && (
                <p className="text-sm italic opacity-90">"{dailyWord.example}"</p>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-4">🔤</div>
            <h3 className="text-xl font-semibold mb-2">Zoeken</h3>
            <p className="mb-4 text-gray-600">
              Zoek straattaalwoorden in onze database
            </p>
            <Link
              href="/search"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
            >
              Zoeken
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">straattaal Zoeken</h3>
            <p className="mb-4 text-gray-600">
              Zoek straattaalwoorden en vind hun betekenis
            </p>
            <Link
              href="/translate"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
            >
              Zoeken
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">Woord van de Dag</h3>
            <p className="mb-4 text-gray-600">
              Leer elke dag een nieuw straattaalwoord
            </p>
            <Link
              href="/word-of-the-day"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
            >
              Bekijk
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-semibold mb-2">Quiz</h3>
            <p className="mb-4 text-gray-600">
              Test je kennis en verdien punten
            </p>
            <Link
              href="/quiz"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
            >
              Start Quiz
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">Kennisbank</h3>
            <p className="mb-4 text-gray-600">
              Verdiep je kennis met artikelen en podcasts
            </p>
            <Link
              href="/knowledge"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
            >
              Verken
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">Community</h3>
            <p className="mb-4 text-gray-600">
              Draag bij aan de straattaal database
            </p>
            <Link
              href="/community"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
            >
              Doe mee
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Dashboard</h3>
            <p className="mb-4 text-gray-600">
              Bekijk je voortgang en prestaties
            </p>
            <Link
              href="/dashboard"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
            >
              Bekijk Dashboard
            </Link>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <Link
            href="/leaderboard"
            className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-lg font-semibold mb-2">Leaderboard</h3>
            <p className="text-gray-600 text-sm">
              Bekijk de top spelers en je ranking
            </p>
          </Link>

          <Link
            href="/challenges"
            className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold mb-2">Challenges</h3>
            <p className="text-gray-600 text-sm">
              Neem deel aan dagelijkse en wekelijkse uitdagingen
            </p>
          </Link>

          <Link
            href="/notifications"
            className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">🔔</div>
            <h3 className="text-lg font-semibold mb-2">Notificaties</h3>
            <p className="text-gray-600 text-sm">
              Ontvang meldingen voor nieuwe woorden en prestaties
            </p>
          </Link>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-lg font-semibold mb-2">Download App</h3>
            <p className="text-gray-600 text-sm">
              Krijg de volledige ervaring op je telefoon
            </p>
            <button
              className="mt-3 border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50 text-sm"
              onClick={() => {/* Download functionality to be implemented */}}
            >
              Binnenkort beschikbaar
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500">
            Beschikbaar voor iOS, Android en Web
          </p>
        </div>
      </div>
    </div>
  )
}
