'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommunitySubmissionCard from '@/components/CommunitySubmissionCard';
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
  like_count?: number;
  user_has_liked?: boolean;
}

export default function CommunitySubmissionsPage() {
  const [submissions, setSubmissions] = useState<CommunitySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter, sortBy]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (sortBy) {
        params.append('sort', sortBy);
      }
      
      const response = await fetch(`/api/community/submit?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      } else {
        const errorData = await response.json();
        setError(errorData.details || 'Kon inzendingen niet ophalen');
      }
    } catch (err) {
      logger.error('Error fetching submissions:', err);
      setError('Er is een fout opgetreden bij het ophalen van de inzendingen');
    } finally {
      setLoading(false);
    }
  };

  const handleLikeChange = (submissionId: string, newLikeCount: number, hasLiked: boolean) => {
    setSubmissions(prev => prev.map(submission => 
      submission.id === submissionId 
        ? { ...submission, like_count: newLikeCount, user_has_liked: hasLiked }
        : submission
    ));
  };

  const getStatusStats = () => {
    const stats = {
      total: submissions.length,
      pending: submissions.filter(s => s.status === 'pending').length,
      approved: submissions.filter(s => s.status === 'approved').length,
      rejected: submissions.filter(s => s.status === 'rejected').length,
    };
    return stats;
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Inzendingen worden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Community Inzendingen
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Bekijk en like alle ingediende straattaalwoorden
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

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex flex-wrap gap-4">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="all">Alle statussen</option>
                <option value="pending">In behandeling</option>
                <option value="approved">Goedgekeurd</option>
                <option value="rejected">Afgewezen</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="sort-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sorteren op
              </label>
              <select
                id="sort-filter"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="newest">Nieuwste eerst</option>
                <option value="oldest">Oudste eerst</option>
                <option value="most_liked">Meest geliked</option>
                <option value="alphabetical">Alfabetisch</option>
              </select>
            </div>
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
              Geen inzendingen gevonden
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {statusFilter === 'all' 
                ? 'Er zijn nog geen woorden ingediend. Wees de eerste!'
                : `Geen inzendingen gevonden met status "${statusFilter}".`
              }
            </p>
            <Link
              href="/community"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Eerste Woord Indienen
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {submissions.map((submission) => (
              <CommunitySubmissionCard
                key={submission.id}
                submission={submission}
                showStatus={true}
                onLikeChange={handleLikeChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
