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
      // Try to fetch real user data
      const response = await fetch('/api/gamification/points?user_id=current');
      if (response.ok) {
        const data = await response.json();
        setUserStats(data.stats);
        setRecentActivity(data.recent_activity || []);
        setLearningProgress(data.learning_progress || []);
        return;
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }

    // Fallback to demo data
    setUserStats({
      total_points: 1250,
      level: 5,
      current_streak: 7,
      longest_streak: 15,
      words_learned: 45,
      quiz_completed: 12,
      challenges_completed: 3,
      badges_earned: 8,
      rank: 23,
      total_users: 150
    });

    setRecentActivity([
      {
        id: '1',
        type: 'quiz',
        title: 'Dagelijkse Quiz Voltooid',
        description: 'Je hebt 4/5 vragen correct beantwoord',
        points_earned: 40,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        icon: '🧠'
      },
      {
        id: '2',
        type: 'word_learned',
        title: 'Nieuw Woord Geleerd',
        description: 'Je hebt het woord "flexen" geleerd',
        points_earned: 10,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        icon: '📚'
      },
      {
        id: '3',
        type: 'streak',
        title: 'Streak Bonus',
        description: '7 dagen streak behaald!',
        points_earned: 50,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        icon: '🔥'
      }
    ]);

    setLearningProgress([
      {
        category: 'Basis Woorden',
        words_learned: 15,
        total_words: 20,
        mastery_percentage: 75,
        last_activity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        category: 'Social Media',
        words_learned: 12,
        total_words: 18,
        mastery_percentage: 67,
        last_activity: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        category: 'Muziek & Cultuur',
        words_learned: 8,
        total_words: 15,
        mastery_percentage: 53,
        last_activity: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      }
    ]);
  };

  // Check if user is logged in (simplified check)
  const isLoggedIn = false; // This would be replaced with actual auth check

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">📊 Dashboard</h1>
              <p className="text-xl text-gray-600 mb-8">
                Volg je voortgang en behaalde prestaties in één overzicht!
              </p>
            </div>

            {/* Dashboard Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="text-3xl mb-2">🏆</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Punten</h3>
                <p className="text-2xl font-bold text-blue-600">1,250</p>
                <p className="text-sm text-gray-500">Totaal verdiend</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="text-3xl mb-2">📈</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Level</h3>
                <p className="text-2xl font-bold text-green-600">5</p>
                <p className="text-sm text-gray-500">Huidig niveau</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="text-3xl mb-2">🔥</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Streak</h3>
                <p className="text-2xl font-bold text-orange-600">7</p>
                <p className="text-sm text-gray-500">Dagen op rij</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="text-3xl mb-2">📚</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Woorden</h3>
                <p className="text-2xl font-bold text-purple-600">45</p>
                <p className="text-sm text-gray-500">Geleerd</p>
              </div>
            </div>

            {/* Features Preview */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Dashboard Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">📊</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Gedetailleerde Statistieken</h3>
                    <p className="text-gray-600">Bekijk je voortgang, punten, level en prestaties.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">🎯</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Leerdoelen</h3>
                    <p className="text-gray-600">Stel doelen en volg je voortgang per categorie.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">📈</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Voortgang Tracking</h3>
                    <p className="text-gray-600">Zie hoe je verbetert over tijd met grafieken.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">🏅</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Achievements</h3>
                    <p className="text-gray-600">Ontgrendel badges en verdien erkenning.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Start je leerreis!</h2>
              <p className="text-gray-600 mb-6">
                Registreer je account en begin met het bijhouden van je voortgang.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/register" 
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Gratis Registreren
                </a>
                <a 
                  href="/login" 
                  className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Inloggen
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logged in user dashboard
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Dashboard wordt geladen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Fout bij het laden</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Geen data beschikbaar</h2>
          <p className="text-gray-600">Er zijn geen dashboard gegevens beschikbaar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">📊 Dashboard</h1>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl mb-2">🏆</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Punten</h3>
              <p className="text-2xl font-bold text-blue-600">{userStats.total_points.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Totaal verdiend</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl mb-2">📈</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Level</h3>
              <p className="text-2xl font-bold text-green-600">{userStats.level}</p>
              <p className="text-sm text-gray-500">Huidig niveau</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl mb-2">🔥</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Streak</h3>
              <p className="text-2xl font-bold text-orange-600">{userStats.current_streak}</p>
              <p className="text-sm text-gray-500">Dagen op rij</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl mb-2">📚</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Woorden</h3>
              <p className="text-2xl font-bold text-purple-600">{userStats.words_learned}</p>
              <p className="text-sm text-gray-500">Geleerd</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recente Activiteit</h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl">{activity.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{activity.title}</h3>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString('nl-NL')}
                    </p>
                  </div>
                  {activity.points_earned && (
                    <div className="text-green-600 font-semibold">
                      +{activity.points_earned} punten
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Learning Progress */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Leervoortgang</h2>
            <div className="space-y-4">
              {learningProgress.map((progress, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
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
                    <span>Laatste activiteit: {new Date(progress.last_activity).toLocaleDateString('nl-NL')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}