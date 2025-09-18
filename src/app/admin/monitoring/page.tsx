'use client';

import { useState, useEffect } from 'react';
import RequireAdmin from '@/components/RequireAdmin';
import LoadingSpinner from '@/components/LoadingSpinner';

interface MonitoringData {
  overview: {
    totalUsers: number;
    totalWords: number;
    totalKnowledgeItems: number;
    activeKnowledgeItems: number;
    totalContentProposals: number;
    totalCommunitySubmissions: number;
  };
  users: {
    total: number;
    byRole: Record<string, number>;
    newLast30Days: number;
  };
  content: {
    words: {
      total: number;
      newLast30Days: number;
    };
    knowledgeItems: {
      total: number;
      active: number;
      inactive: number;
      newLast30Days: number;
    };
    proposals: {
      total: number;
      byStatus: Record<string, number>;
      newLast30Days: number;
    };
    communitySubmissions: {
      total: number;
      byStatus: Record<string, number>;
      newLast30Days: number;
    };
  };
  activity: {
    recentAdminActions: any[];
    totalAdminActions: number;
  };
  lastRefresh: string;
}

export default function AdminMonitoringPage() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/monitoring');
      
      if (!response.ok) {
        throw new Error('Failed to load monitoring data');
      }
      
      const monitoringData = await response.json();
      setData(monitoringData);
    } catch (err) {
      console.error('Error loading monitoring data:', err);
      setError('Fout bij laden van monitoring data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('nl-NL').format(num);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 dark:text-green-400';
      case 'rejected': return 'text-red-600 dark:text-red-400';
      case 'pending': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'content_crawl': return '🔍';
      case 'refresh_knowledge': return '📚';
      case 'update_user_role': return '👤';
      case 'content_proposal_approve': return '✅';
      case 'content_proposal_reject': return '❌';
      case 'community_submission_approve': return '👍';
      case 'community_submission_reject': return '👎';
      default: return '⚙️';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Fout bij laden
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || 'Kon monitoring data niet laden'}
          </p>
          <button
            onClick={fetchMonitoringData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  return (
    <RequireAdmin>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Monitoring Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Overzicht van systeem statistieken en activiteit
                </p>
              </div>
              <button
                onClick={fetchMonitoringData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Vernieuwen
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Laatste update: {new Date(data.lastRefresh).toLocaleString('nl-NL')}
            </p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gebruikers</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatNumber(data.overview.totalUsers)}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    +{formatNumber(data.users.newLast30Days)} deze maand
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Woorden</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatNumber(data.overview.totalWords)}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    +{formatNumber(data.content.words.newLast30Days)} deze maand
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Kennis Items</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatNumber(data.overview.activeKnowledgeItems)}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    +{formatNumber(data.content.knowledgeItems.newLast30Days)} deze maand
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* User Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Gebruikers Statistieken
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Totaal gebruikers:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatNumber(data.users.total)}
                  </span>
                </div>
                {Object.entries(data.users.byRole).map(([role, count]) => (
                  <div key={role} className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400 capitalize">
                      {role === 'admin' ? 'Admins' : role === 'moderator' ? 'Moderatoren' : 'Gebruikers'}:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formatNumber(count)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Nieuwe gebruikers (30d):</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    +{formatNumber(data.users.newLast30Days)}
                  </span>
                </div>
              </div>
            </div>

            {/* Content Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Content Statistieken
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Content voorstellen:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatNumber(data.content.proposals.total)}
                  </span>
                </div>
                {Object.entries(data.content.proposals.byStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between">
                    <span className={`text-sm ${getStatusColor(status)}`}>
                      {status === 'pending' ? 'Wachtend' : status === 'approved' ? 'Goedgekeurd' : 'Afgewezen'}:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formatNumber(count)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Community inzendingen:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatNumber(data.content.communitySubmissions.total)}
                  </span>
                </div>
                {Object.entries(data.content.communitySubmissions.byStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between">
                    <span className={`text-sm ${getStatusColor(status)}`}>
                      {status === 'pending' ? 'Wachtend' : status === 'approved' ? 'Goedgekeurd' : 'Afgewezen'}:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formatNumber(count)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Recente Admin Activiteit
            </h3>
            {data.activity.recentAdminActions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Geen recente activiteit
              </p>
            ) : (
              <div className="space-y-3">
                {data.activity.recentAdminActions.map((action, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getActionIcon(action.action_type)}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {action.action_type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(action.created_at).toLocaleString('nl-NL')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {action.ip_address}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Back to Admin */}
          <div className="mt-8">
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Terug naar Admin
            </button>
          </div>
        </div>
      </div>
    </RequireAdmin>
  );
}
