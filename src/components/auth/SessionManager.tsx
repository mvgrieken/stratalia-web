'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { logger } from '@/lib/logger';

interface SessionInfo {
  expires_at: string | null;
  last_activity: string | null;
  session_duration: number;
  is_expiring_soon: boolean;
}

interface SessionManagerProps {
  className?: string;
  showDetails?: boolean;
}

export default function SessionManager({ className = '', showDetails = true }: SessionManagerProps) {
  const { user, signOut } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [extending, setExtending] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSessionInfo();
    }
  }, [user]);

  const fetchSessionInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/session-info');
      if (response.ok) {
        const data = await response.json();
        setSessionInfo(data);
      }
    } catch (error) {
      logger.error('Error fetching session info:', error);
    } finally {
      setLoading(false);
    }
  };

  const extendSession = async () => {
    setExtending(true);
    try {
      const response = await fetch('/api/auth/extend-session', {
        method: 'POST',
      });
      
      if (response.ok) {
        await fetchSessionInfo(); // Refresh session info
        logger.info('Session extended successfully');
      } else {
        logger.error('Failed to extend session');
      }
    } catch (error) {
      logger.error('Error extending session:', error);
    } finally {
      setExtending(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      logger.info('User signed out successfully');
    } catch (error) {
      logger.error('Error signing out:', error);
    }
  };

  if (!user) {
    return null;
  }

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Verlopen';
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}u ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const formatLastActivity = (lastActivity: string) => {
    const now = new Date();
    const activity = new Date(lastActivity);
    const diffMs = now.getTime() - activity.getTime();
    
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} dag${days !== 1 ? 'en' : ''} geleden`;
    if (hours > 0) return `${hours} uur geleden`;
    if (minutes > 0) return `${minutes} minuten geleden`;
    return 'Net geleden';
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Sessie</h3>
        <button
          onClick={handleSignOut}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Uitloggen
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Ingelogd als:</span>
          <span className="text-sm font-medium text-gray-900">{user.name || user.email}</span>
        </div>
        
        {showDetails && sessionInfo && (
          <>
            {sessionInfo.expires_at && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sessie verloopt over:</span>
                <span className={`text-sm font-medium ${
                  sessionInfo.is_expiring_soon ? 'text-orange-600' : 'text-gray-900'
                }`}>
                  {formatTimeRemaining(sessionInfo.expires_at)}
                </span>
              </div>
            )}
            
            {sessionInfo.last_activity && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Laatste activiteit:</span>
                <span className="text-sm text-gray-900">
                  {formatLastActivity(sessionInfo.last_activity)}
                </span>
              </div>
            )}
            
            {sessionInfo.is_expiring_soon && (
              <div className="bg-orange-50 border border-orange-200 rounded p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-800 text-sm font-medium">Sessie verloopt binnenkort</p>
                    <p className="text-orange-600 text-xs">Je wordt automatisch uitgelogd</p>
                  </div>
                  <button
                    onClick={extendSession}
                    disabled={extending}
                    className="bg-orange-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors"
                  >
                    {extending ? 'Bezig...' : 'Verlengen'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        
        {loading && (
          <div className="flex items-center justify-center py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Sessie laden...</span>
          </div>
        )}
      </div>
    </div>
  );
}
