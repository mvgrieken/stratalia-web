'use client';

import { useState, useEffect } from 'react';

interface UserStats {
  total_points: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  words_learned: number;
  quiz_completed: number;
  challenges_completed: number;
  badges_earned: number;
  rank: number;
  total_users: number;
}

interface RecentActivity {
  id: string;
  type: 'quiz' | 'word_learned' | 'challenge' | 'badge' | 'streak';
  title: string;
  description: string;
  points_earned?: number;
  timestamp: string;
  icon: string;
}

interface LearningProgress {
  category: string;
  words_learned: number;
  total_words: number;
  mastery_percentage: number;
  last_activity: string;
}

export default function DashboardPage() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [learningProgress, setLearningProgress] = useState<LearningProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Mock data - in production this would come from API calls
      const mockStats: UserStats = {
        total_points: 1847,
        level: 19,
        current_streak: 12,
        longest_streak: 28,
        words_learned: 89,
        quiz_completed: 34,
        challenges_completed: 8,
        badges_earned: 6,
        rank: 47,
        total_users: 1247
      };

      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'quiz',
          title: 'Quiz Voltooid',
          description: 'Je hebt een quiz voltooid met 80% score',
          points_earned: 120,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          icon: '🧠'
        },
        {
          id: '2',
          type: 'word_learned',
          title: 'Nieuw Woord Geleerd',
          description: 'Je hebt het woord "skeer" geleerd',
          points_earned: 50,
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          icon: '📚'
        },
        {
          id: '3',
          type: 'challenge',
          title: 'Challenge Voltooid',
          description: 'Dagelijkse Quiz Master challenge voltooid',
          points_earned: 150,
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          icon: '🎯'
        },
        {
          id: '4',
          type: 'badge',
          title: 'Badge Verdiend',
          description: 'Je hebt de "Streak Master" badge verdiend',
          points_earned: 100,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          icon: '🏆'
        },
        {
          id: '5',
          type: 'streak',
          title: 'Streak Verlengd',
          description: 'Je streak is nu 12 dagen!',
          points_earned: 60,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          icon: '🔥'
        }
      ];

      const mockProgress: LearningProgress[] = [
        {
          category: 'Basis Woorden',
          words_learned: 25,
          total_words: 30,
          mastery_percentage: 83,
          last_activity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          category: 'Middelmatige Woorden',
          words_learned: 18,
          total_words: 25,
          mastery_percentage: 72,
          last_activity: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          category: 'Geavanceerde Woorden',
          words_learned: 12,
          total_words: 20,
          mastery_percentage: 60,
          last_activity: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        },
        {
          category: 'Slang & Jargon',
          words_learned: 8,
          total_words: 15,
          mastery_percentage: 53,
          last_activity: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
        }
      ];

      setUserStats(mockStats);
      setRecentActivity(mockActivity);
      setLearningProgress(mockProgress);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Fout bij het laden van dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Net geleden';
    if (diffInHours < 24) return `${diffInHours} uur geleden`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} dag${diffInDays > 1 ? 'en' : ''} geleden`;
  };

  const getLevelProgress = () => {
    if (!userStats) return 0;
    const currentLevelPoints = userStats.level * 100;
    const nextLevelPoints = (userStats.level + 1) * 100;
    const progress = ((userStats.total_points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Laden van dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <p className="text-xl text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Opnieuw proberen
        </button>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600">Geen dashboard data beschikbaar</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            📊 Mijn Dashboard
          </h1>

          {/* User Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Totaal Punten</p>
                  <p className="text-3xl font-bold">{userStats.total_points.toLocaleString()}</p>
                </div>
                <div className="text-4xl">⭐</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Level</p>
                  <p className="text-3xl font-bold">{userStats.level}</p>
                </div>
                <div className="text-4xl">🎖️</div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-purple-300 rounded-full h-2">
                  <div
                    className="bg-white h-2 rounded-full"
                    style={{ width: `${getLevelProgress()}%` }}
                  ></div>
                </div>
                <p className="text-xs text-purple-100 mt-1">
                  {Math.round(getLevelProgress())}% naar level {userStats.level + 1}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Huidige Streak</p>
                  <p className="text-3xl font-bold">{userStats.current_streak}</p>
                </div>
                <div className="text-4xl">🔥</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Ranking</p>
                  <p className="text-3xl font-bold">#{userStats.rank}</p>
                </div>
                <div className="text-4xl">🏆</div>
              </div>
              <p className="text-xs text-green-100 mt-1">
                van {userStats.total_users.toLocaleString()} gebruikers
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Learning Progress */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">📈 Leervoortgang</h2>
                <div className="space-y-4">
                  {learningProgress.map((progress, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-gray-900">{progress.category}</h3>
                        <span className="text-sm text-gray-600">
                          {progress.words_learned}/{progress.total_words} woorden
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress.mastery_percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{progress.mastery_percentage}% beheersing</span>
                        <span>Laatste activiteit: {formatTimeAgo(progress.last_activity)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">⚡ Recente Activiteit</h2>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 text-2xl">{activity.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                          {activity.points_earned && (
                            <span className="text-xs font-medium text-green-600">
                              +{activity.points_earned} punten
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">🚀 Snelle Acties</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <a
                  href="/quiz"
                  className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  <div className="text-2xl mb-2">🧠</div>
                  <p className="font-medium">Start Quiz</p>
                </a>
                <a
                  href="/search"
                  className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-center"
                >
                  <div className="text-2xl mb-2">🔍</div>
                  <p className="font-medium">Zoek Woorden</p>
                </a>
                <a
                  href="/challenges"
                  className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors text-center"
                >
                  <div className="text-2xl mb-2">🎯</div>
                  <p className="font-medium">Challenges</p>
                </a>
                <a
                  href="/leaderboard"
                  className="bg-orange-600 text-white p-4 rounded-lg hover:bg-orange-700 transition-colors text-center"
                >
                  <div className="text-2xl mb-2">🏆</div>
                  <p className="font-medium">Leaderboard</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
