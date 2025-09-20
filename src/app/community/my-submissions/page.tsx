'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { logger } from '@/lib/logger';

interface CommunitySubmission {
  id: string;
  word: string;
  definition: string;
  example?: string;
  context?: string;
  source?: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_by: string | null;
  submitted_by_name: string;
  created_at: string;
  updated_at: string;
  rejection_reason?: string;
}

interface SubmissionStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function MySubmissionsPage() {
  const [submissions, setSubmissions] = useState<CommunitySubmission[]>([]);
  const [stats, setStats] = useState<SubmissionStats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMySubmissions();
  }, []);

  const fetchMySubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/community/submissions/my');
      
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions);
        setStats(data.stats);
      } else {
        const errorData = await response.json();
        setError(errorData.details || 'Kon je inzendingen niet ophalen');
      }
    } catch (err) {
      logger.error('Error fetching submissions:', err);
      setError('Er is een fout opgetreden bij het ophalen van je inzendingen');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return '✅ Goedgekeurd';
      case 'rejected':
        return '❌ Afgewezen';
      case 'pending':
      default:
        return '⏳ In behandeling';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Je inzendingen worden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Mijn Inzendingen
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Bekijk de status van je ingediende woorden
              </p>
            </div>
            <Link
              href="/community"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Nieuw Woord Indienen
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Totaal</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">In behandeling</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Goedgekeurd</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Afgewezen</div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="text-red-400 mr-3">⚠️</div>
              <div>
                <h3 className="text-red-800 dark:text-red-200 font-medium">Fout opgetreden</h3>
                <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submissions List */}
        {submissions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Nog geen inzendingen
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Je hebt nog geen woorden ingediend. Begin met het indienen van je eerste woord!
            </p>
            <Link
              href="/community"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Eerste Woord Indienen
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {submission.word}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      {submission.definition}
                    </p>
                    {submission.example && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        "{submission.example}"
                      </p>
                    )}
                  </div>
                  <div className="ml-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(submission.status)}`}>
                      {getStatusLabel(submission.status)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div>
                    <span>Ingediend op {formatDate(submission.created_at)}</span>
                    {submission.updated_at !== submission.created_at && (
                      <span className="ml-2">• Bijgewerkt op {formatDate(submission.updated_at)}</span>
                    )}
                  </div>
                  <div>
                    door {submission.submitted_by_name}
                  </div>
                </div>

                {/* Rejection Reason */}
                {submission.status === 'rejected' && submission.rejection_reason && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                      Reden voor afwijzing:
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {submission.rejection_reason}
                    </p>
                  </div>
                )}

                {/* Additional Info */}
                {(submission.context || submission.source) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {submission.context && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Context:</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300 ml-2">{submission.context}</span>
                      </div>
                    )}
                    {submission.source && (
                      <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Bron:</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300 ml-2">{submission.source}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
