'use client';

import { useState, useEffect } from 'react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  difficulty: 'easy' | 'medium' | 'hard';
  reward_points: number;
  reward_badge?: string;
  requirements: {
    type: 'quiz_score' | 'streak' | 'words_learned' | 'community_contributions' | 'time_spent';
    target: number;
    current?: number;
  }[];
  start_date: string;
  end_date: string;
  is_completed: boolean;
  progress_percentage: number;
  participants_count: number;
}

interface ChallengesData {
  active_challenges: Challenge[];
  completed_challenges: Challenge[];
  upcoming_challenges: Challenge[];
  user_stats: {
    total_challenges_completed: number;
    total_rewards_earned: number;
    current_streak: number;
  };
}

export default function ChallengesPage() {
  const [challengesData, setChallengesData] = useState<ChallengesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'upcoming'>('active');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gamification/challenges');
      if (response.ok) {
        const data = await response.json();
        setChallengesData(data);
      } else {
        setError('Fout bij het laden van challenges');
      }
    } catch (err) {
      console.error('Error fetching challenges:', err);
      setError('Fout bij het laden van challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeAction = async (challengeId: string, action: string) => {
    try {
      const response = await fetch('/api/gamification/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challenge_id: challengeId,
          user_id: 'current_user', // In production, get from auth
          action: action
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Challenge action result:', result);
        // Refresh challenges data
        fetchChallenges();
      }
    } catch (error) {
      console.error('Error handling challenge action:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'daily': return '📅';
      case 'weekly': return '📆';
      case 'monthly': return '🗓️';
      case 'special': return '⭐';
      default: return '🎯';
    }
  };

  const getRequirementIcon = (type: string) => {
    switch (type) {
      case 'quiz_score': return '🧠';
      case 'streak': return '🔥';
      case 'words_learned': return '📚';
      case 'community_contributions': return '👥';
      case 'time_spent': return '⏰';
      default: return '🎯';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderChallengeCard = (challenge: Challenge) => (
    <div key={challenge.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getTypeIcon(challenge.type)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{challenge.title}</h3>
            <p className="text-sm text-gray-600">{challenge.description}</p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
            {challenge.difficulty}
          </span>
          {challenge.reward_badge && (
            <span className="text-2xl">{challenge.reward_badge}</span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Voortgang</span>
          <span>{challenge.progress_percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${challenge.progress_percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Requirements */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Vereisten:</h4>
        <div className="space-y-1">
          {challenge.requirements.map((req, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <span>{getRequirementIcon(req.type)}</span>
                <span className="text-gray-600">
                  {req.type === 'quiz_score' && 'Quiz score'}
                  {req.type === 'streak' && 'Streak'}
                  {req.type === 'words_learned' && 'Woorden geleerd'}
                  {req.type === 'community_contributions' && 'Community bijdragen'}
                  {req.type === 'time_spent' && 'Tijd besteed'}
                </span>
              </div>
              <span className="font-medium">
                {req.current || 0} / {req.target}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards and Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Beloning</p>
            <p className="font-semibold text-blue-600">{challenge.reward_points} punten</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Deelnemers</p>
            <p className="font-semibold text-gray-700">{challenge.participants_count}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {!challenge.is_completed && (
            <button
              onClick={() => handleChallengeAction(challenge.id, 'join')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Deelnemen
            </button>
          )}
          {challenge.is_completed && (
            <button
              onClick={() => handleChallengeAction(challenge.id, 'claim_reward')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Beloning Opeisen
            </button>
          )}
        </div>
      </div>

      {/* Date Range */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          {formatDate(challenge.start_date)} - {formatDate(challenge.end_date)}
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Laden van challenges...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <p className="text-xl text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchChallenges}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Opnieuw proberen
        </button>
      </div>
    );
  }

  if (!challengesData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600">Geen challenges data beschikbaar</p>
      </div>
    );
  }

  const currentChallenges = activeTab === 'active' ? challengesData.active_challenges :
                           activeTab === 'completed' ? challengesData.completed_challenges :
                           challengesData.upcoming_challenges;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🎯 Challenges
          </h1>

          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Voltooid</h3>
              <p className="text-3xl font-bold text-green-600">{challengesData.user_stats.total_challenges_completed}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Beloningen Verdiend</h3>
              <p className="text-3xl font-bold text-blue-600">{challengesData.user_stats.total_rewards_earned}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Huidige Streak</h3>
              <p className="text-3xl font-bold text-orange-600">{challengesData.user_stats.current_streak} 🔥</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg shadow-md p-1 flex">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-6 py-2 rounded-md transition-colors ${
                  activeTab === 'active'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Actieve Challenges ({challengesData.active_challenges.length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-6 py-2 rounded-md transition-colors ${
                  activeTab === 'completed'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Voltooid ({challengesData.completed_challenges.length})
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-6 py-2 rounded-md transition-colors ${
                  activeTab === 'upcoming'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Binnenkort ({challengesData.upcoming_challenges.length})
              </button>
            </div>
          </div>

          {/* Challenges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentChallenges.length > 0 ? (
              currentChallenges.map(renderChallengeCard)
            ) : (
              <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-md">
                <p className="text-gray-500 text-lg">
                  {activeTab === 'active' && 'Geen actieve challenges beschikbaar'}
                  {activeTab === 'completed' && 'Nog geen challenges voltooid'}
                  {activeTab === 'upcoming' && 'Geen upcoming challenges'}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  {activeTab === 'active' && 'Check later voor nieuwe challenges!'}
                  {activeTab === 'completed' && 'Start met het voltooien van challenges!'}
                  {activeTab === 'upcoming' && 'Nieuwe challenges komen binnenkort beschikbaar!'}
                </p>
              </div>
            )}
          </div>

          {/* Call to Action */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Klaar voor een uitdaging? Start met het voltooien van challenges!
            </p>
            <div className="flex justify-center space-x-4">
              <a
                href="/quiz"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Quiz
              </a>
              <a
                href="/leaderboard"
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Bekijk Leaderboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
