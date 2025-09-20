'use client';

import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import DashboardStats from '@/components/DashboardStats';
import RecentActivity from '@/components/RecentActivity';
import LearningProgress from '@/components/LearningProgress';
import Achievements from '@/components/Achievements';
import SessionManager from '@/components/auth/SessionManager';
import EmailVerificationBanner from '@/components/auth/EmailVerificationBanner';

interface UserStats {
  total_points: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  words_learned: number;
  quiz_completed: number;
  average_quiz_score: number;
  challenges_completed: number;
  submissions_count: number;
  approved_submissions: number;
  total_submission_points: number;
  total_submission_likes: number;
  total_challenge_points: number;
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

interface Achievement {
  name: string;
  icon: string;
  earned_at: string;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [learningProgress, setLearningProgress] = useState<LearningProgress[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to fetch real user data from the new dashboard API
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const data = await response.json();
        setUserStats(data.stats);
        setRecentActivity(data.recent_activity || []);
        setLearningProgress(data.learning_progress || []);
        setAchievements(data.achievements?.recent_badges || []);
        return;
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Kon dashboard data niet ophalen');
      }
    } catch (err) {
      logger.error(`Error fetching dashboard data: ${err}`);
      setError('Er is een fout opgetreden bij het ophalen van de dashboard data');
    }

    // Fallback to demo data
    setUserStats({
      total_points: 1250,
      level: 5,
      current_streak: 7,
      longest_streak: 15,
      words_learned: 45,
      quiz_completed: 12,
      average_quiz_score: 78.5,
      challenges_completed: 3,
      submissions_count: 8,
      approved_submissions: 6,
      total_submission_points: 300,
      total_submission_likes: 24,
      total_challenge_points: 150,
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

    setAchievements([
      {
        name: 'Level 5 Expert',
        icon: '🏆',
        earned_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        name: 'Week Warrior',
        icon: '🔥',
        earned_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        name: 'Word Master',
        icon: '📚',
        earned_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]);
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect_to=/dashboard');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Authenticatie wordt gecontroleerd...</p>
        </div>
      </div>
    );
  }

  if (!user) {
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
          {/* Email Verification Banner */}
          <EmailVerificationBanner className="mb-6" />
          
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">📊 Dashboard</h1>
            <SessionManager showDetails={false} />
          </div>
          
          {/* Dashboard Stats */}
          <DashboardStats stats={userStats} showExtended={true} className="mb-8" />

          {/* Recent Activity */}
          <RecentActivity activities={recentActivity} maxItems={8} className="mb-8" />

          {/* Learning Progress */}
          <LearningProgress progress={learningProgress} className="mb-8" />

          {/* Achievements */}
          <Achievements achievements={achievements} maxItems={6} />
        </div>
      </div>
    </div>
  );
}