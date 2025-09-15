/**
 * Lazy-loaded components for code splitting
 * Improves initial bundle size and loading performance
 */

import { lazy, Suspense } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

// Lazy load heavy components
export const LazyAdminPage = lazy(() => import('@/app/admin/page'));
export const LazyProfilePage = lazy(() => import('@/app/profile/page'));
export const LazyLeaderboardPage = lazy(() => import('@/app/leaderboard/page'));
export const LazyKnowledgePage = lazy(() => import('@/app/knowledge/page'));
export const LazyNotificationsSettings = lazy(() => import('@/app/notifications/settings/page'));

// Lazy load quiz components
export const LazyQuizPage = lazy(() => import('@/app/quiz/page'));

// Lazy load search components
export const LazySearchPage = lazy(() => import('@/app/search/page'));

// Lazy load word components
export const LazyWordOfTheDayPage = lazy(() => import('@/app/word-of-the-day/page'));

// Lazy load translate components
export const LazyTranslatePage = lazy(() => import('@/app/translate/page'));

// Lazy load challenges components
export const LazyChallengesPage = lazy(() => import('@/app/challenges/page'));

// Lazy load dashboard components
export const LazyDashboardPage = lazy(() => import('@/app/dashboard/page'));

/**
 * Higher-order component for lazy loading with fallback
 */
export function withLazyLoading<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: React.ReactNode
) {
  return function LazyWrapper(props: T) {
    return (
      <Suspense fallback={fallback || <LoadingSpinner />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

/**
 * Lazy loading wrapper with custom fallback
 */
export function LazyWrapper({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) {
  return (
    <Suspense fallback={fallback || <LoadingSpinner />}>
      {children}
    </Suspense>
  );
}

/**
 * Preload components for better UX
 */
export const preloadComponents = {
  admin: () => import('@/app/admin/page'),
  profile: () => import('@/app/profile/page'),
  leaderboard: () => import('@/app/leaderboard/page'),
  knowledge: () => import('@/app/knowledge/page'),
  quiz: () => import('@/app/quiz/page'),
  search: () => import('@/app/search/page'),
  wordOfTheDay: () => import('@/app/word-of-the-day/page'),
  translate: () => import('@/app/translate/page'),
  challenges: () => import('@/app/challenges/page'),
  dashboard: () => import('@/app/dashboard/page'),
};
