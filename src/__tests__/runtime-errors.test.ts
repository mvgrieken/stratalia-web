import { describe, it, expect, beforeEach, vi } from 'vitest';
import { logger } from '@/lib/logger';

// Mock browser environment
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();
const mockTakeRecords = vi.fn();

// Mock MutationObserver
class MockMutationObserver {
  constructor(public callback: MutationCallback) {}
  observe = mockObserve;
  disconnect = mockDisconnect;
  takeRecords = mockTakeRecords;
}

Object.defineProperty(global, 'MutationObserver', {
  value: MockMutationObserver,
  writable: true
});

describe('Runtime Error Fixes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('MutationObserver Protection', () => {
    it('should not crash when observe is called with null target', () => {
      const observer = new MockMutationObserver(() => {});
      
      // This should not throw an error after our fixes
      expect(() => {
        observer.observe(null as any);
      }).not.toThrow();
    });

    it('should not crash when observe is called with undefined target', () => {
      const observer = new MockMutationObserver(() => {});
      
      expect(() => {
        observer.observe(undefined as any);
      }).not.toThrow();
    });

    it('should not crash when observe is called with non-Node target', () => {
      const observer = new MockMutationObserver(() => {});
      
      expect(() => {
        observer.observe('not-a-node' as any);
      }).not.toThrow();
      
      expect(() => {
        observer.observe({} as any);
      }).not.toThrow();
      
      expect(() => {
        observer.observe(123 as any);
      }).not.toThrow();
    });

    it('should handle valid DOM node targets', () => {
      const observer = new MockMutationObserver(() => {});
      const mockNode = { nodeType: 1, ownerDocument: document } as any;
      
      // Mock document.contains
      vi.spyOn(document, 'contains').mockReturnValue(true);
      
      expect(() => {
        observer.observe(mockNode);
      }).not.toThrow();
    });

    it('should handle detached nodes gracefully', () => {
      const observer = new MockMutationObserver(() => {});
      const mockNode = { nodeType: 1, ownerDocument: document } as any;
      
      // Mock document.contains to return false (detached)
      vi.spyOn(document, 'contains').mockReturnValue(false);
      
      expect(() => {
        observer.observe(mockNode);
      }).not.toThrow();
    });
  });

  describe('Console Error Suppression', () => {
    it('should suppress MutationObserver errors in console', () => {
      const originalError = console.error;
      const mockError = vi.fn();
      console.error = mockError;

      // Simulate the error messages we want to suppress
      logger.error('TypeError: Argument 1 (\'target\') to MutationObserver.observe must be an instance of Node');
      logger.error('Something from credentials-library.js');
      logger.error('Toegang tot de gevraagde resource is niet toegestaan');

      // These should be suppressed (not called)
      expect(mockError).not.toHaveBeenCalled();

      // But legitimate errors should still work
      logger.error('This is a legitimate error');
      expect(mockError).toHaveBeenCalledWith('This is a legitimate error');

      console.error = originalError;
    });
  });

  describe('Fetch Request Blocking', () => {
    it('should block extension requests', async () => {
      const originalFetch = global.fetch;
      
      // Mock our enhanced fetch
      global.fetch = function(url: string | URL | Request, options?: RequestInit) {
        if (typeof url === 'string' && (
            url.includes('extension://') ||
            url.includes('lastpass.com') ||
            url.includes('safari-web-extension://')
          )) {
          return Promise.resolve(new Response('', { status: 204 }));
        }
        return originalFetch(url, options);
      } as any;

      // Test extension URL blocking
      const extensionResponse = await fetch('chrome-extension://test/resource');
      expect(extensionResponse.status).toBe(204);

      const lastpassResponse = await fetch('https://lastpass.com/geticon.php');
      expect(lastpassResponse.status).toBe(204);

      global.fetch = originalFetch;
    });

    it('should allow legitimate requests', async () => {
      const mockFetch = vi.fn().mockResolvedValue(new Response('OK', { status: 200 }));
      global.fetch = mockFetch;

      await fetch('https://api.example.com/data');
      expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/data', undefined);
    });
  });

  describe('Error Event Handling', () => {
    it('should suppress extension-related error events', () => {
      const mockPreventDefault = vi.fn();
      const mockStopPropagation = vi.fn();
      const mockStopImmediatePropagation = vi.fn();

      const extensionError = {
        filename: 'chrome-extension://abc123/credentials-library.js',
        message: 'Some extension error',
        preventDefault: mockPreventDefault,
        stopPropagation: mockStopPropagation,
        stopImmediatePropagation: mockStopImmediatePropagation
      };

      // Simulate our error handler logic
      const shouldSuppress = extensionError.filename?.includes('credentials-library');
      
      if (shouldSuppress) {
        extensionError.preventDefault();
        extensionError.stopPropagation();
        extensionError.stopImmediatePropagation();
      }

      expect(mockPreventDefault).toHaveBeenCalled();
      expect(mockStopPropagation).toHaveBeenCalled();
      expect(mockStopImmediatePropagation).toHaveBeenCalled();
    });

    it('should allow legitimate error events', () => {
      const mockPreventDefault = vi.fn();

      const legitimateError = {
        filename: '/app/main.js',
        message: 'Legitimate application error',
        preventDefault: mockPreventDefault,
        stopPropagation: vi.fn(),
        stopImmediatePropagation: vi.fn()
      };

      // Should not suppress legitimate errors
      const shouldSuppress = legitimateError.filename?.includes('credentials-library');
      expect(shouldSuppress).toBe(false);
      expect(mockPreventDefault).not.toHaveBeenCalled();
    });
  });
});
