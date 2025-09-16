'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  full_name: string;
  total_points: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  avatar_url?: string;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  user_rank?: LeaderboardEntry;
  total_users: number;
  period: string;
  source?: string;
}

export default function LazyLeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all_time'>('all_time');
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/gamification/leaderboard?period=${selectedPeriod}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Fout bij het laden van de leaderboard');
        
        // Set fallback data so the page is still usable
        setLeaderboardData({
          leaderboard: [],
          total_users: 0,
          period: selectedPeriod,
          source: 'error-fallback'
        });
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Fout bij het laden van de leaderboard');
      
      // Set fallback data so the page is still usable
      setLeaderboardData({
        leaderboard: [],
        total_users: 0,
        period: selectedPeriod,
        source: 'error-fallback'
      });
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handlePeriodChange = (period: 'daily' | 'weekly' | 'monthly' | 'all_time') => {
    setSelectedPeriod(period);
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'daily': return 'Vandaag';
      case 'weekly': return 'Deze week';
      case 'monthly': return 'Deze maand';
      case 'all_time': return 'Aller tijden';
      default: return period;
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getLevelColor = (level: number) => {
    if (level >= 20) return 'text-purple-600 bg-purple-100';
    if (level >= 15) return 'text-blue-600 bg-blue-100';
    if (level >= 10) return 'text-green-600 bg-green-100';
    if (level >= 5) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Leaderboard wordt geladen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Fout bij laden</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchLeaderboard}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  if (!leaderboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Geen leaderboard data beschikbaar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏆 Leaderboard
          </h1>
          <p className="text-lg text-gray-600">
            Bekijk wie de beste straattaal leerling is!
          </p>
        </div>

        {/* Period Selector */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {(['daily', 'weekly', 'monthly', 'all_time'] as const).map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getPeriodLabel(period)}
              </button>
            ))}
          </div>
        </div>

        {/* User's Rank (if available) */}
        {leaderboardData.user_rank && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 mb-8 text-white">
            <h2 className="text-xl font-semibold mb-4">Jouw positie</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold">
                  {getRankIcon(leaderboardData.user_rank.rank)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{leaderboardData.user_rank.full_name}</h3>
                  <p className="text-blue-100">
                    {leaderboardData.user_rank.total_points} punten • Level {leaderboardData.user_rank.current_level}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-100">Streak</p>
                <p className="text-lg font-semibold">{leaderboardData.user_rank.current_streak} dagen</p>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Top {leaderboardData.leaderboard.length} van {leaderboardData.total_users} gebruikers
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {leaderboardData.leaderboard.map((entry, index) => (
              <div
                key={entry.user_id}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-12 text-center">
                      <span className="text-2xl font-bold text-gray-900">
                        {getRankIcon(entry.rank)}
                      </span>
                    </div>

                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {entry.avatar_url ? (
                        <Image
                          src={entry.avatar_url}
                          alt={entry.full_name}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-semibold">
                            {entry.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {entry.full_name}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(entry.current_level)}`}>
                          Level {entry.current_level}
                        </span>
                        <span className="text-sm text-gray-500">
                          {entry.current_streak} dagen streak
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center space-x-6 text-right">
                    <div>
                      <p className="text-sm text-gray-500">Punten</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {entry.total_points.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Streak</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {entry.current_streak} dagen
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Badges</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {Math.floor(entry.current_level / 2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Leaderboard wordt elke 5 minuten bijgewerkt</p>
        </div>
      </div>
    </div>
  );
}
