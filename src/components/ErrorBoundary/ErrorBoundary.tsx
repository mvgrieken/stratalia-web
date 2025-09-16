/**
 * Enhanced Error Boundary Component
 * Provides comprehensive error handling with fallback UI and error reporting
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/logger';
import { monitoringService } from '@/lib/monitoring';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
  level?: 'page' | 'component' | 'feature';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, level = 'component' } = this.props;
    const { errorId } = this.state;

    // Log error
    logger.error(`Error boundary caught error: ${level}`, error);

    // Record error in monitoring
    monitoringService.recordError({
      message: error.message,
      stack: error.stack || '',
      url: window.location.href,
      userId: 'anonymous', // Would be populated from auth context
      tags: {
        level,
        errorId: errorId || 'unknown',
        component: 'ErrorBoundary',
      },
    });

    // Update state
    this.setState({
      errorInfo,
    });

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    if (hasError && resetOnPropsChange) {
      if (resetKeys) {
        const hasResetKeyChanged = resetKeys.some(
          (key, index) => key !== prevProps.resetKeys?.[index]
        );
        
        if (hasResetKeyChanged) {
          this.resetErrorBoundary();
        }
      } else {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
    });
  };

  private handleRetry = () => {
    const { retryCount } = this.state;
    const newRetryCount = retryCount + 1;

    this.setState({ retryCount: newRetryCount });

    // Auto-retry after a delay
    this.retryTimeoutId = setTimeout(() => {
      this.resetErrorBoundary();
    }, Math.min(1000 * Math.pow(2, newRetryCount), 10000)); // Exponential backoff, max 10s
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleReportError = () => {
    const { error, errorId } = this.state;
    
    if (error && errorId) {
      // In a real implementation, this would send to an error reporting service
      logger.info(`Error reported by user: ${errorId}`);
    }
  };

  render() {
    const { hasError, error, errorInfo, errorId, retryCount } = this.state;
    const { children, fallback, level = 'component' } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI based on level
      return (
        <div className={`error-boundary error-boundary--${level}`}>
          {this.renderErrorUI()}
        </div>
      );
    }

    return children;
  }

  private renderErrorUI() {
    const { error, errorId, retryCount } = this.state;
    const { level = 'component' } = this.props;

    const isPageLevel = level === 'page';
    const isComponentLevel = level === 'component';

    return (
      <div className={`error-boundary__content ${isPageLevel ? 'error-boundary__content--page' : ''}`}>
        <div className="error-boundary__icon">
          {isPageLevel ? '🚨' : '⚠️'}
        </div>
        
        <h2 className="error-boundary__title">
          {isPageLevel ? 'Er is een fout opgetreden' : 'Er ging iets mis'}
        </h2>
        
        <p className="error-boundary__message">
          {isPageLevel 
            ? 'Er is een onverwachte fout opgetreden. Probeer de pagina opnieuw te laden.'
            : 'Er is een fout opgetreden in dit onderdeel. Probeer het opnieuw.'
          }
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="error-boundary__details">
            <summary>Technische details</summary>
            <div className="error-boundary__error">
              <strong>Error ID:</strong> {errorId}
              <br />
              <strong>Message:</strong> {error.message}
              <br />
              <strong>Stack:</strong>
              <pre>{error.stack}</pre>
            </div>
          </details>
        )}

        <div className="error-boundary__actions">
          {isComponentLevel && (
            <button
              onClick={this.handleRetry}
              className="error-boundary__button error-boundary__button--primary"
              disabled={retryCount > 3}
            >
              {retryCount > 3 ? 'Te veel pogingen' : 'Opnieuw proberen'}
            </button>
          )}
          
          {isPageLevel && (
            <button
              onClick={this.handleReload}
              className="error-boundary__button error-boundary__button--primary"
            >
              Pagina opnieuw laden
            </button>
          )}
          
          <button
            onClick={this.handleReportError}
            className="error-boundary__button error-boundary__button--secondary"
          >
            Fout rapporteren
          </button>
        </div>

        {retryCount > 0 && (
          <p className="error-boundary__retry-info">
            Poging {retryCount} van 3
          </p>
        )}
      </div>
    );
  }
}

export default ErrorBoundary;
