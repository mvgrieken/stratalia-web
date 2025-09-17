/**
 * Lazy Page Wrapper Component
 * Provides lazy loading with loading states and error boundaries for heavy pages
 */

import React, { Suspense, lazy, ComponentType } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

interface LazyPageWrapperProps {
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

// Default loading fallback
const DefaultLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner />
      <p className="mt-4 text-gray-600">Pagina wordt geladen...</p>
    </div>
  </div>
);

// Default error fallback
const DefaultErrorFallback = ({ error }: { error: Error }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center max-w-md mx-auto">
      <ErrorMessage message="Er is een fout opgetreden bij het laden van de pagina" />
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Pagina opnieuw laden
      </button>
    </div>
  </div>
);

// Error Boundary for lazy loaded components
class LazyErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorFallback error={this.state.error!} />;
    }

    return this.props.children;
  }
}

/**
 * Higher-order component for lazy loading pages
 */
export function withLazyLoading<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  options: LazyPageWrapperProps = {}
) {
  const LazyComponent = lazy(importFunc);
  
  return function LazyPageComponent(props: P) {
    return (
      <LazyErrorBoundary fallback={options.errorFallback}>
        <Suspense fallback={options.fallback || <DefaultLoadingFallback />}>
          <LazyComponent {...(props as any)} />
        </Suspense>
      </LazyErrorBoundary>
    );
  };
}

/**
 * Hook for lazy loading with loading states
 */
export function useLazyLoading<T>(
  importFunc: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [Component, setComponent] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    
    setLoading(true);
    setError(null);
    
    importFunc()
      .then((component) => {
        if (!cancelled) {
          setComponent(component);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [importFunc, ...deps]);

  return { Component, loading, error };
}

export default withLazyLoading;
