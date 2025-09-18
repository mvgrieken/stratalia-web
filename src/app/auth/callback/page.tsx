'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Inloggen verwerken...');

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        const supabase = getSupabaseClient();
        
        // Handle OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.error('Auth callback error:', error);
          setStatus('error');
          setMessage('Inloggen mislukt. Probeer het opnieuw.');
          return;
        }

        if (data.session) {
          logger.info('OAuth login successful');
          
          // Ensure user profile exists
          await ensureUserProfile(data.session.user);
          
          setStatus('success');
          setMessage('Succesvol ingelogd! Je wordt doorgestuurd...');
          
          // Redirect to intended destination or dashboard
          const redirectTo = searchParams?.get('redirect_to') || '/dashboard';
          
          setTimeout(() => {
            router.replace(redirectTo);
          }, 1500);
        } else {
          setStatus('error');
          setMessage('Geen geldige sessie gevonden. Probeer opnieuw in te loggen.');
        }
      } catch (error) {
        logger.error('Auth callback processing error:', error instanceof Error ? error : new Error(String(error)));
        setStatus('error');
        setMessage('Er is een fout opgetreden bij het verwerken van je login.');
      }
    }

    handleAuthCallback();
  }, [router, searchParams]);

  async function ensureUserProfile(user: any) {
    try {
      // Check if profile exists, create if not
      const response = await fetch('/api/auth/ensure-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`
        },
        body: JSON.stringify({
          user_id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'Gebruiker',
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          auth_provider: user.app_metadata?.provider || 'email'
        })
      });

      if (!response.ok) {
        logger.warn('Failed to ensure user profile');
      }
    } catch (error) {
      logger.warn('Error ensuring user profile:', error);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
          <div className="text-center">
            <div className="mb-6">
              {status === 'loading' && (
                <div className="w-16 h-16 mx-auto mb-4">
                  <LoadingSpinner />
                </div>
              )}
              
              {status === 'success' && (
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              
              {status === 'error' && (
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {status === 'loading' && 'Inloggen verwerken'}
              {status === 'success' && 'Inloggen gelukt!'}
              {status === 'error' && 'Inloggen mislukt'}
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {message}
            </p>
            
            {status === 'error' && (
              <div className="space-y-3">
                <button
                  onClick={() => router.replace('/login')}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
                >
                  Terug naar inloggen
                </button>
                <button
                  onClick={() => router.replace('/')}
                  className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
                >
                  Naar homepage
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
