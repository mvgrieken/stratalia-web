'use client';

import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Submission {
  id: string;
  word: string;
  definition: string;
  example: string;
  status: 'pending' | 'approved' | 'rejected';
  points_awarded: number;
  created_at: string;
  reviewed_at?: string;
  review_notes?: string;
}

interface UserPoints {
  total_points: number;
  submissions_count: number;
  approved_count: number;
}

export default function SubmissionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect_to=/profile/submissions');
    }
  }, [user, authLoading, router]);

  // Fetch submissions
  useEffect(() => {
    if (user) {
      fetchSubmissions();
      fetchUserPoints();
    }
  }, [user]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile/submissions');
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }
      const data = await response.json();
      setSubmissions(data.submissions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPoints = async () => {
    try {
      const response = await fetch('/api/profile/points');
      if (response.ok) {
        const data = await response.json();
        setUserPoints(data);
      }
    } catch (err) {
      logger.error(`Failed to fetch user points: ${err}`);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Goedgekeurd';
      case 'rejected': return 'Afgewezen';
      default: return 'In behandeling';
    }
  };

  const filteredSubmissions = submissions.filter(submission => 
    statusFilter === 'all' || submission.status === statusFilter
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Inzendingen worden geladen...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Mijn Inzendingen
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Bekijk de status van je ingediende woorden
              </p>
            </div>
            <Link
              href="/community"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Nieuw woord indienen
            </Link>
          </div>
        </div>

        {/* Points Overview */}
        {userPoints && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Jouw Prestaties
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {userPoints.total_points}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Totaal Punten</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {userPoints.approved_count}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Goedgekeurd</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {userPoints.submissions_count}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Totaal Inzendingen</div>
              </div>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter op status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Alle status</option>
              <option value="pending">In behandeling</option>
              <option value="approved">Goedgekeurd</option>
              <option value="rejected">Afgewezen</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Fout
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submissions List */}
        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Geen inzendingen gevonden</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {statusFilter === 'all' 
                  ? 'Je hebt nog geen woorden ingediend. Dien je eerste woord in!'
                  : `Geen inzendingen met status "${getStatusText(statusFilter)}" gevonden.`
                }
              </p>
              {statusFilter === 'all' && (
                <div className="mt-6">
                  <Link
                    href="/community"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Eerste woord indienen
                  </Link>
                </div>
              )}
            </div>
          ) : (
            filteredSubmissions.map((submission) => (
              <div key={submission.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {submission.word}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(submission.status)}`}>
                        {getStatusText(submission.status)}
                      </span>
                      {submission.points_awarded > 0 && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          +{submission.points_awarded} punten
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Definitie:</span>
                        <p className="text-gray-900 dark:text-white">{submission.definition}</p>
                      </div>
                      
                      {submission.example && (
                        <div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Voorbeeld:</span>
                          <p className="text-gray-900 dark:text-white italic">"{submission.example}"</p>
                        </div>
                      )}
                      
                      {submission.review_notes && (
                        <div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Opmerkingen:</span>
                          <p className="text-gray-900 dark:text-white">{submission.review_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Ingediend op {new Date(submission.created_at).toLocaleDateString('nl-NL')}</span>
                  {submission.reviewed_at && (
                    <span>Beoordeeld op {new Date(submission.reviewed_at).toLocaleDateString('nl-NL')}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Back to Profile */}
        <div className="mt-8">
          <Link
            href="/profile"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Terug naar Profiel
          </Link>
        </div>
      </div>
    </div>
  );
}