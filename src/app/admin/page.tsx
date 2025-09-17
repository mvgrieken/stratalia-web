'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';

export default function AdminPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const handleRefreshKnowledge = async () => {
    setIsRefreshing(true);
    setRefreshMessage(null);
    setRefreshError(null);

    try {
      const response = await fetch('/api/admin/refresh-knowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'admin-token' // Simple auth for demo
        }
      });

      const data = await response.json();

      if (response.ok) {
        setRefreshMessage(`✅ ${data.message} (${data.itemsInserted} items)`);
        // Refresh the page to show updated content
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setRefreshError(`❌ ${data.error || 'Failed to refresh knowledge items'}`);
      }
    } catch (error) {
      setRefreshError('❌ Network error occurred while refreshing');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Admin Dashboard
            </h1>
            
            <div className="space-y-6">
              {/* Knowledge Bank Refresh */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Kennisbank Beheer
                </h2>
                <p className="text-gray-600 mb-4">
                  Ververs de kennisbank met de nieuwste content uit de mock dataset.
                  Dit zal alle bestaande items vervangen met de volledige dataset.
                </p>
                
                <button
                  onClick={handleRefreshKnowledge}
                  disabled={isRefreshing}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isRefreshing && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {isRefreshing ? 'Verversen...' : 'Kennisbank Verversen'}
                </button>

                {refreshMessage && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">{refreshMessage}</p>
                  </div>
                )}

                {refreshError && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{refreshError}</p>
                  </div>
                )}
              </div>

              {/* System Status */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Systeem Status
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Search API</span>
                    <span className="text-green-600 font-medium">✅ Actief</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Knowledge Bank</span>
                    <span className="text-green-600 font-medium">✅ Actief</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Media Support</span>
                    <span className="text-green-600 font-medium">✅ Actief</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Authentication</span>
                    <span className="text-yellow-600 font-medium">⚠️ Configuratie nodig</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Snelle Acties
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <a
                    href="/knowledge"
                    className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <h3 className="font-medium text-blue-900">Kennisbank</h3>
                    <p className="text-sm text-blue-700">Bekijk alle content</p>
                  </a>
                  <a
                    href="/search"
                    className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <h3 className="font-medium text-green-900">Zoeken</h3>
                    <p className="text-sm text-green-700">Test zoekfunctionaliteit</p>
                  </a>
                  <a
                    href="/translate"
                    className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <h3 className="font-medium text-purple-900">Vertaler</h3>
                    <p className="text-sm text-purple-700">Test AI vertaler</p>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}