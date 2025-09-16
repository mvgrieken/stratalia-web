'use client';

import { withLazyLoading } from '@/components/LazyPageWrapper';

// Lazy load the heavy quiz component
const LazyQuizPage = withLazyLoading(
  () => import('./LazyQuizPage'),
  {
    fallback: (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Quiz wordt geladen...</p>
        </div>
      </div>
    )
  }
);

export default function QuizPage() {
  return <LazyQuizPage />;
}