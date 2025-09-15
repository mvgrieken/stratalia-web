'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Navigation from '@/components/Navigation';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  difficulty: string;
  reward_points: number;
  conditions: any;
  start_date: string;
  end_date: string;
  is_active: boolean;
  user_progress?: {
    progress: number;
    completed_at: string | null;
    points_earned: number;
  };
}

export default function ChallengesPage() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'upcoming'>('active');

  const fetchChallenges = useCallback(async () => {
    try {
      const response = await fetch(`/api/gamification/challenges?user_id=${user?.id}&type=all`);
      if (response.ok) {
        const data = await response.json();
        setChallenges(data.challenges || []);
      } else {
        setError('Fout bij het laden van challenges');
      }
    } catch (err) {
      setError('Fout bij het laden van challenges');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      fetchChallenges();
    }
  }, [user, fetchChallenges]);

  const joinChallenge = async (challengeId: string) => {
    try {
      const response = await fetch('/api/gamification/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          challenge_id: challengeId,
          progress: 0
        })
      });

      if (response.ok) {
        fetchChallenges(); // Refresh challenges
      } else {
        setError('Fout bij het deelnemen aan challenge');
      }
    } catch (err) {
      setError('Fout bij het deelnemen aan challenge');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      case 'expert': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'learning': return '📚';
      case 'streak': return '🔥';
      case 'social': return '👥';
      case 'exploration': return '🔍';
      case 'mastery': return '🏆';
      default: return '🎯';
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    if (activeTab === 'active') {
      return challenge.is_active && !challenge.user_progress?.completed_at;
    } else if (activeTab === 'completed') {
      return challenge.user_progress?.completed_at;
    } else if (activeTab === 'upcoming') {
      return new Date(challenge.start_date) > new Date();
    }
    return true;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Inloggen vereist</h1>
            <p className="text-gray-600 mb-6">Je moet ingelogd zijn om challenges te bekijken.</p>
            <a href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
              Inloggen
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Challenges</h1>
          
          {/* Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'active'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Actieve Challenges
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'completed'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Voltooid
                </button>
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'upcoming'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Binnenkort
                </button>
              </nav>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Challenges laden...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChallenges.map((challenge) => (
                <div key={challenge.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{getCategoryIcon(challenge.category)}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{challenge.title}</h3>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                          {challenge.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{challenge.reward_points}</div>
                      <div className="text-xs text-gray-500">punten</div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{challenge.description}</p>

                  {/* Progress bar for joined challenges */}
                  {challenge.user_progress && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Voortgang</span>
                        <span>{challenge.user_progress.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${challenge.user_progress.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Challenge details */}
                  <div className="text-sm text-gray-500 mb-4">
                    <div>Type: {challenge.type}</div>
                    <div>Eindigt: {new Date(challenge.end_date).toLocaleDateString('nl-NL')}</div>
                  </div>

                  {/* Action button */}
                  <div className="flex justify-end">
                    {challenge.user_progress?.completed_at ? (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        ✅ Voltooid
                      </span>
                    ) : challenge.user_progress ? (
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        🎯 Actief
                      </span>
                    ) : (
                      <button
                        onClick={() => joinChallenge(challenge.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                      >
                        Deelnemen
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredChallenges.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {activeTab === 'active' && 'Geen actieve challenges'}
                {activeTab === 'completed' && 'Geen voltooide challenges'}
                {activeTab === 'upcoming' && 'Geen aankomende challenges'}
              </h3>
              <p className="text-gray-600">
                {activeTab === 'active' && 'Er zijn momenteel geen actieve challenges beschikbaar.'}
                {activeTab === 'completed' && 'Je hebt nog geen challenges voltooid.'}
                {activeTab === 'upcoming' && 'Er zijn geen nieuwe challenges gepland.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}