'use client';

import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

interface UserStats {
  total_points: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  words_learned: number;
  quizzes_completed: number;
  average_score: number;
  submissions_count: number;
  approved_submissions: number;
  total_submission_points: number;
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
  progress: number;
  target: number;
}

export default function ProfilePage() {
  const [stats, setStats] = useState<UserStats>({
    total_points: 0,
    current_level: 1,
    current_streak: 0,
    longest_streak: 0,
    words_learned: 0,
    quizzes_completed: 0,
    average_score: 0,
    submissions_count: 0,
    approved_submissions: 0,
    total_submission_points: 0
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
    fetchAchievements();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/profile/stats');
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        logger.warn('Failed to fetch user stats');
      }
    } catch (error) {
      logger.error(`Error fetching user stats: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/profile/achievements');
      
      if (response.ok) {
        const data = await response.json();
        setAchievements(data.achievements);
      } else {
        logger.warn('Failed to fetch achievements');
      }
    } catch (error) {
      logger.error(`Error fetching achievements: ${error instanceof Error ? error.message : String(error)}`);
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

            {/* Community Stats */}
            {stats.submissions_count > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Bijdragen</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{stats.submissions_count}</div>
                    <div className="text-sm text-gray-600">Inzendingen</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.approved_submissions}</div>
                    <div className="text-sm text-gray-600">Goedgekeurd</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{stats.total_submission_points}</div>
                    <div className="text-sm text-gray-600">Punten Verdiend</div>
                  </div>
                </div>
              </div>
            )}
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
                  
                  {/* Progress bar for unearned achievements */}
                  {!achievement.is_earned && achievement.target > 1 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{achievement.progress}/{achievement.target}</span>
                        <span>{Math.round((achievement.progress / achievement.target) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
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
            {stats.submissions_count > 0 && (
              <button
                onClick={() => window.location.href = '/community/my-submissions'}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50"
              >
                Mijn Inzendingen
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
