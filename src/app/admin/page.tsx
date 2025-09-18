'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import RequireAdmin from '@/components/RequireAdmin';
import { logger } from '@/lib/logger';

interface AdminStats {
  totalUsers: number;
  totalWords: number;
  totalKnowledgeItems: number;
  totalQuizzes: number;
  lastRefresh: string | null;
}

export default function AdminPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/monitoring');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      logger.error(`Failed to load stats: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleCrawlContent = async () => {
    setIsRefreshing(true);
    setRefreshStatus('Zoeken naar nieuwe content...');
    
    try {
      const response = await fetch('/api/admin/crawl-content', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_types: ['rss', 'youtube_channel', 'podcast_feed'],
          force_update: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        setRefreshStatus(`Content crawl voltooid! ${data.results.new_proposals} nieuwe voorstellen gevonden uit ${data.results.sources_successful} bronnen.`);
        await loadStats();
      } else {
        const errorData = await response.json();
        setRefreshStatus(`Fout: ${errorData.error || 'Content crawl mislukt'}`);
      }
    } catch (error) {
      setRefreshStatus('Er is een fout opgetreden bij het zoeken naar content');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshKnowledge = async () => {
    setIsRefreshing(true);
    setRefreshStatus('Bezig met verversen...');
    
    try {
      const response = await fetch('/api/admin/refresh-knowledge', {
        method: 'POST',
        headers: {
          'Authorization': process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin-token',
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRefreshStatus(`Kennisbank succesvol ververst! ${data.itemsInserted || 0} items toegevoegd.`);
        // Reload stats after successful refresh
        await loadStats();
      } else {
        const errorData = await response.json();
        setRefreshStatus(`Fout: ${errorData.error || 'Onbekende fout'}`);
      }
    } catch (error) {
      setRefreshStatus('Er is een fout opgetreden bij het verversen');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshWords = async () => {
    setIsRefreshing(true);
    setRefreshStatus('Bezig met verversen van woordenlijst...');
    
    try {
      const response = await fetch('/api/admin/words', {
        method: 'POST',
        headers: {
          'Authorization': process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin-token',
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setRefreshStatus('Woordenlijst succesvol ververst!');
        await loadStats();
      } else {
        const errorData = await response.json();
        setRefreshStatus(`Fout: ${errorData.error || 'Onbekende fout'}`);
      }
    } catch (error) {
      setRefreshStatus('Er is een fout opgetreden bij het verversen');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <RequireAdmin>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Beheer de Stratalia applicatie
            </p>
          </div>

          {/* Stats Overview */}
          {loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Overzicht
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats?.totalUsers || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Gebruikers</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats?.totalWords || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Woorden</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {stats?.totalKnowledgeItems || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Kennis Items</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {stats?.totalQuizzes || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Quizzen</div>
                </div>
              </div>
            </div>
          )}

          {/* Admin Actions */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Content Management
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Beheer automatische content updates en moderatie
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleCrawlContent}
                  disabled={isRefreshing}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isRefreshing ? 'Content zoeken...' : '🔍 Update Content Nu'}
                </button>
                
                <button
                  onClick={handleRefreshKnowledge}
                  disabled={isRefreshing}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isRefreshing ? 'Verversen...' : '📚 Ververs Kennisbank'}
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Woordenlijst
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Ververs de straattaal woordenlijst met nieuwe woorden
              </p>
              <button
                onClick={handleRefreshWords}
                disabled={isRefreshing}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isRefreshing ? 'Verversen...' : 'Ververs Woordenlijst'}
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Systeem Status
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Controleer de status van alle services
              </p>
              <Link
                href="/api/health"
                target="_blank"
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors inline-block text-center"
              >
                Bekijk Status
              </Link>
            </div>
          </div>

          {/* Status Messages */}
          {refreshStatus && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200">{refreshStatus}</p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Admin Modules
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/admin/content"
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">📝 Content Moderatie</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Goedkeuren content voorstellen</div>
              </Link>
              <Link
                href="/admin/users"
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">👥 Gebruikersbeheer</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Rollen en accounts beheren</div>
              </Link>
              <Link
                href="/admin/community"
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">💬 Community Moderatie</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Woord inzendingen beheren</div>
              </Link>
              <Link
                href="/admin/monitoring"
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">📊 Monitoring</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Systeem logs en metrics</div>
              </Link>
              <Link
                href="/dashboard"
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">🏠 Dashboard</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Terug naar gebruikers app</div>
              </Link>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              ← Terug naar Home
            </Link>
          </div>
        </div>
      </div>
    </RequireAdmin>
  );
}