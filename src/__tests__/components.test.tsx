import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import ErrorMessage from '@/components/ErrorMessage';

// Mock component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('Component Tests', () => {
  describe('ErrorBoundary', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('should render error fallback when error occurs', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Oeps! Er is iets misgegaan')).toBeInTheDocument();
      expect(screen.getByText('Opnieuw proberen')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('LoadingSpinner', () => {
    it('should render with default props', () => {
      render(<LoadingSpinner />);
      
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should render with custom text', () => {
      render(<LoadingSpinner text="Loading..." />);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render with different sizes', () => {
      const { rerender } = render(<LoadingSpinner size="sm" />);
      expect(document.querySelector('.w-4.h-4')).toBeInTheDocument();
      
      rerender(<LoadingSpinner size="lg" />);
      expect(document.querySelector('.w-12.h-12')).toBeInTheDocument();
    });
  });

  describe('EmptyState', () => {
    it('should render with title and description', () => {
      render(
        <EmptyState
          title="No data"
          description="There is no data to display"
        />
      );
      
      expect(screen.getByText('No data')).toBeInTheDocument();
      expect(screen.getByText('There is no data to display')).toBeInTheDocument();
    });

    it('should render with action button', () => {
      const mockAction = vi.fn();
      
      render(
        <EmptyState
          title="No data"
          description="There is no data to display"
          action={{
            label: 'Add data',
            onClick: mockAction
          }}
        />
      );
      
      const button = screen.getByText('Add data');
      expect(button).toBeInTheDocument();
      
      fireEvent.click(button);
      expect(mockAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('ErrorMessage', () => {
    it('should render error message with default props', () => {
      render(<ErrorMessage message="Something went wrong" />);
      
      expect(screen.getByText('Er is een fout opgetreden')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should render with custom title', () => {
      render(
        <ErrorMessage
          title="Custom Error"
          message="Something went wrong"
        />
      );
      
      expect(screen.getByText('Custom Error')).toBeInTheDocument();
    });

    it('should render with retry button', () => {
      const mockRetry = vi.fn();
      
      render(
        <ErrorMessage
          message="Something went wrong"
          onRetry={mockRetry}
        />
      );
      
      const retryButton = screen.getByText('Opnieuw proberen');
      expect(retryButton).toBeInTheDocument();
      
      fireEvent.click(retryButton);
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it('should render different variants', () => {
      const { rerender } = render(
        <ErrorMessage message="Error" variant="error" />
      );
      expect(document.querySelector('.bg-red-50')).toBeInTheDocument();
      
      rerender(<ErrorMessage message="Warning" variant="warning" />);
      expect(document.querySelector('.bg-yellow-50')).toBeInTheDocument();
      
      rerender(<ErrorMessage message="Info" variant="info" />);
      expect(document.querySelector('.bg-blue-50')).toBeInTheDocument();
    });
  });
});
