'use client';

import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface RequireAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function RequireAuth({ children, fallback, redirectTo }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show fallback or default message
  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Get current path for redirect after login
    const currentPath = redirectTo || window.location.pathname;
    const loginUrl = `/login?redirect_to=${encodeURIComponent(currentPath)}`;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Inloggen vereist
            </h2>
            <p className="text-gray-600 mb-6">
              Je moet ingelogd zijn om deze pagina te bekijken. Maak een account aan of log in om verder te gaan.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href={loginUrl}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block"
            >
              Inloggen
            </Link>
            <Link
              href="/register"
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors inline-block"
            >
              Account aanmaken
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Nog geen account? Registratie is gratis en duurt slechts een minuut.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
}

export default RequireAuth;
