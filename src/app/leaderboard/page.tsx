'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url?: string;
  total_points: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  rank: number;
  badges_count: number;
  quiz_completed: number;
  words_learned: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  user_rank?: LeaderboardEntry;
  total_users: number;
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
}

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all_time'>('all_time');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/gamification/leaderboard?period=${selectedPeriod}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data);
      } else {
        setError('Fout bij het laden van de leaderboard');
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Fout bij het laden van de leaderboard');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 border-yellow-300';
    if (rank === 2) return 'bg-gray-100 border-gray-300';
    if (rank === 3) return 'bg-orange-100 border-orange-300';
    return 'bg-white border-gray-200';
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'daily': return 'Vandaag';
      case 'weekly': return 'Deze Week';
      case 'monthly': return 'Deze Maand';
      case 'all_time': return 'Aller Tijden';
      default: return 'Aller Tijden';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Laden van leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <p className="text-xl text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchLeaderboard}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Opnieuw proberen
        </button>
      </div>
    );
  }

  if (!leaderboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600">Geen leaderboard data beschikbaar</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🏆 Leaderboard
          </h1>

          {/* Period Selector */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg shadow-md p-1 flex">
              {(['daily', 'weekly', 'monthly', 'all_time'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-6 py-2 rounded-md transition-colors ${
                    selectedPeriod === period
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {getPeriodLabel(period)}
                </button>
              ))}
            </div>
          </div>

          {/* User Rank Card */}
          {leaderboardData.user_rank && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 mb-8 text-white">
              <h2 className="text-xl font-semibold mb-4">Jouw Positie</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Image
                    src={leaderboardData.user_rank.avatar_url || '/default-avatar.png'}
                    alt="Avatar"
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full border-2 border-white"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{leaderboardData.user_rank.display_name}</h3>
                    <p className="text-sm opacity-90">Level {leaderboardData.user_rank.level}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{leaderboardData.user_rank.total_points} punten</p>
                  <p className="text-sm opacity-90">Positie #{leaderboardData.user_rank.rank}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Totaal Gebruikers</h3>
              <p className="text-3xl font-bold text-blue-600">{leaderboardData.total_users.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Actieve Spelers</h3>
              <p className="text-3xl font-bold text-green-600">{leaderboardData.leaderboard.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Periode</h3>
              <p className="text-3xl font-bold text-purple-600">{getPeriodLabel(selectedPeriod)}</p>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Top {leaderboardData.leaderboard.length}</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {leaderboardData.leaderboard.map((entry, _index) => (
                <div
                  key={entry.user_id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${getRankColor(entry.rank)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <span className="text-2xl font-bold text-gray-700">
                          {getRankIcon(entry.rank)}
                        </span>
                      </div>
                      <Image
                        src={entry.avatar_url || '/default-avatar.png'}
                        alt={entry.display_name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full border-2 border-gray-200"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{entry.display_name}</h3>
                        <p className="text-sm text-gray-600">Level {entry.level}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-8">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Punten</p>
                        <p className="text-xl font-bold text-blue-600">{entry.total_points.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Streak</p>
                        <p className="text-xl font-bold text-orange-600">{entry.current_streak} 🔥</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Badges</p>
                        <p className="text-xl font-bold text-purple-600">{entry.badges_count}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Quizzen</p>
                        <p className="text-xl font-bold text-green-600">{entry.quiz_completed}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Wil je hoger op de leaderboard? Speel meer quizzen en leer nieuwe woorden!
            </p>
            <div className="flex justify-center space-x-4">
              <a
                href="/quiz"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Quiz
              </a>
              <a
                href="/search"
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Zoek Woorden
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
