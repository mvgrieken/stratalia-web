'use client';

import { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';

interface AppleAuthButtonProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function AppleAuthButton({ 
  onSuccess, 
  onError, 
  className = '' 
}: AppleAuthButtonProps) {
  const [loading, setLoading] = useState(false);
  
  // Temporarily disabled - OAuth not configured yet
  const isDisabled = true;

  const handleAppleLogin = async () => {
    if (isDisabled) {
      onError?.('Apple login is nog niet geconfigureerd. Gebruik email/wachtwoord om in te loggen.');
      return;
    }
    
    setLoading(true);
    
    try {
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            response_mode: 'form_post',
          },
        },
      });

      if (error) {
        logger.error('Apple OAuth error:', error);
        onError?.(error.message || 'Apple inloggen mislukt');
        return;
      }

      logger.info('Apple OAuth initiated successfully');
      
    } catch (error) {
      logger.error('Apple login error:', error instanceof Error ? error : new Error(String(error)));
      onError?.('Er is een fout opgetreden bij Apple inloggen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAppleLogin}
      disabled={loading || isDisabled}
      className={`w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm ${
        isDisabled 
          ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
          : 'bg-black text-white hover:bg-gray-900'
      } focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      aria-label="Inloggen met Apple"
    >
      {loading ? (
        <div className="flex items-center">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-white rounded-full animate-spin mr-2"></div>
          <span>Inloggen...</span>
        </div>
      ) : (
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          <span>{isDisabled ? 'Apple login (nog niet beschikbaar)' : 'Inloggen met Apple'}</span>
        </div>
      )}
    </button>
  );
}
