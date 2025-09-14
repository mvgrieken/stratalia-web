'use client';

import { useState, useEffect } from 'react';

interface UserStats {
  total_points: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  words_learned: number;
  quizzes_completed: number;
  average_score: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points_reward: number;
  rarity: string;
  is_earned: boolean;
}

export default function ProfilePage() {
  const [stats, setStats] = useState<UserStats>({
    total_points: 0,
    current_level: 1,
    current_streak: 0,
    longest_streak: 0,
    words_learned: 0,
    quizzes_completed: 0,
    average_score: 0
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
    fetchAchievements();
  }, []);

  const fetchUserStats = async () => {
    try {
      // For demo purposes, we'll use mock data
      // In a real app, this would fetch from the user's profile
      setStats({
        total_points: 1250,
        current_level: 5,
        current_streak: 7,
        longest_streak: 15,
        words_learned: 45,
        quizzes_completed: 12,
        average_score: 78
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchAchievements = async () => {
    try {
      // Mock achievements data
      const mockAchievements: Achievement[] = [
        {
          id: '1',
          name: 'Eerste Stappen',
          description: 'Voltooi je eerste quiz',
          icon: '🎯',
          category: 'learning',
          points_reward: 50,
          rarity: 'common',
          is_earned: true
        },
        {
          id: '2',
          name: 'Woordkenner',
          description: 'Leer 25 woorden',
          icon: '📚',
          category: 'learning',
          points_reward: 100,
          rarity: 'common',
          is_earned: true
        },
        {
          id: '3',
          name: 'Streak Master',
          description: 'Houd een streak van 7 dagen',
          icon: '🔥',
          category: 'streak',
          points_reward: 200,
          rarity: 'rare',
          is_earned: true
        },
        {
          id: '4',
          name: 'Quiz Champion',
          description: 'Behaal 90% of hoger in een quiz',
          icon: '🏆',
          category: 'achievement',
          points_reward: 300,
          rarity: 'epic',
          is_earned: false
        },
        {
          id: '5',
          name: 'Straattaal Expert',
          description: 'Leer 100 woorden',
          icon: '👑',
          category: 'achievement',
          points_reward: 500,
          rarity: 'legendary',
          is_earned: false
        }
      ];
      setAchievements(mockAchievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelProgress = () => {
    const pointsForCurrentLevel = (stats.current_level - 1) * 250;
    const pointsForNextLevel = stats.current_level * 250;
    const progress = ((stats.total_points - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel)) * 100;
    return Math.min(progress, 100);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 border-gray-300';
      case 'rare': return 'bg-blue-100 border-blue-300';
      case 'epic': return 'bg-purple-100 border-purple-300';
      case 'legendary': return 'bg-yellow-100 border-yellow-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Profiel wordt geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Mijn Profiel</h1>

          {/* User Stats Overview */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {stats.current_level}
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-900">Level {stats.current_level}</h2>
                <p className="text-gray-600">{stats.total_points} punten</p>
              </div>
            </div>

            {/* Level Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Vooruitgang naar Level {stats.current_level + 1}</span>
                <span className="text-sm text-gray-600">{Math.round(getLevelProgress())}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${getLevelProgress()}%` }}
                ></div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.current_streak}</div>
                <div className="text-sm text-gray-600">Dagen Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.words_learned}</div>
                <div className="text-sm text-gray-600">Woorden Geleerd</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.quizzes_completed}</div>
                <div className="text-sm text-gray-600">Quizzen Voltooid</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.average_score}%</div>
                <div className="text-sm text-gray-600">Gemiddelde Score</div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">🏆 Prestaties</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 ${
                    achievement.is_earned 
                      ? getRarityColor(achievement.rarity)
                      : 'bg-gray-50 border-gray-200 opacity-50'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-3">{achievement.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{achievement.name}</h4>
                      <p className="text-sm text-gray-600">+{achievement.points_reward} punten</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{achievement.description}</p>
                  {achievement.is_earned && (
                    <div className="mt-2">
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Behaald
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={() => window.location.href = '/quiz'}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Start Quiz
            </button>
            <button
              onClick={() => window.location.href = '/search'}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50"
            >
              Zoek Woorden
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50"
            >
              Woord van de Dag
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
