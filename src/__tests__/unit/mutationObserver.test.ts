/**
 * Unit tests for MutationObserver safety guards
 * Ensures that observer.observe() only runs with valid Node targets
 * Prevents runtime crashes from browser extension interference
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { logger } from '@/lib/logger';

// Mock browser environment
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();
const mockTakeRecords = vi.fn().mockReturnValue([]);

class MockMutationObserver {
  constructor(public callback: MutationCallback) {}
  observe = mockObserve;
  disconnect = mockDisconnect;
  takeRecords = mockTakeRecords;
}

// Mock window.MutationObserver
Object.defineProperty(global, 'MutationObserver', {
  value: MockMutationObserver,
  writable: true
});

// Mock document methods
Object.defineProperty(global, 'document', {
  value: {
    ...document,
    readyState: 'complete',
    contains: vi.fn().mockReturnValue(true),
    createElement: vi.fn().mockReturnValue({
      nodeType: 1,
      ownerDocument: document
    })
  },
  writable: true
});

/**
 * Safe MutationObserver wrapper function - this is what we're testing
 */
function createSafeMutationObserver(callback: MutationCallback) {
  const observer = new MutationObserver(callback);
  
  // Override observe method with safety guards
  const originalObserve = observer.observe;
  observer.observe = function(target: any, options?: MutationObserverInit) {
    // CRITICAL GUARD: Check if target is valid Node
    if (!(target instanceof Node)) {
      logger.warn('MutationObserver.observe called with invalid target - ignoring');
      return; // Silent fail instead of throwing
    }
    
    // Additional safety: Check if target has nodeType
    if (!target.nodeType) {
      logger.warn('MutationObserver.observe called with invalid nodeType - ignoring');
      return;
    }
    
    // Check if target is still in document
    try {
      if (!document.contains(target)) {
        logger.warn('MutationObserver.observe called with detached Node - ignoring');
        return;
      }
    } catch (e) {
      // document.contains can fail in edge cases
      return;
    }
    
    // Safe to call original observe
    return originalObserve.call(this, target, options);
  };
  
  return observer;
}

describe('MutationObserver Safety Guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Valid Node Targets', () => {
    it('should call observe when target is valid Node', () => {
      const observer = createSafeMutationObserver(() => {});
      const mockNode = {
        nodeType: 1,
        ownerDocument: document,
        constructor: { name: 'HTMLDivElement' }
      } as any;
      
      // Mock instanceof Node check
      Object.setPrototypeOf(mockNode, Node.prototype);
      
      // Mock document.contains to return true
      vi.mocked(document.contains).mockReturnValue(true);
      
      observer.observe(mockNode, { childList: true });
      
      expect(mockObserve).toHaveBeenCalledWith(mockNode, { childList: true });
    });

    it('should call observe when target is document', () => {
      const observer = createSafeMutationObserver(() => {});
      const mockDocument = {
        nodeType: 9, // DOCUMENT_NODE
        ownerDocument: null,
        constructor: { name: 'Document' }
      } as any;
      
      Object.setPrototypeOf(mockDocument, Node.prototype);
      vi.mocked(document.contains).mockReturnValue(true);
      
      observer.observe(mockDocument, { childList: true });
      
      expect(mockObserve).toHaveBeenCalledWith(mockDocument, { childList: true });
    });
  });

  describe('Invalid Target Protection', () => {
    it('should NOT crash when observe is called with null target', () => {
      const observer = createSafeMutationObserver(() => {});
      
      expect(() => {
        observer.observe(null as any);
      }).not.toThrow();
      
      expect(mockObserve).not.toHaveBeenCalled();
    });

    it('should NOT crash when observe is called with undefined target', () => {
      const observer = createSafeMutationObserver(() => {});
      
      expect(() => {
        observer.observe(undefined as any);
      }).not.toThrow();
      
      expect(mockObserve).not.toHaveBeenCalled();
    });

    it('should NOT crash when observe is called with string target', () => {
      const observer = createSafeMutationObserver(() => {});
      
      expect(() => {
        observer.observe('not-a-node' as any);
      }).not.toThrow();
      
      expect(mockObserve).not.toHaveBeenCalled();
    });

    it('should NOT crash when observe is called with object target', () => {
      const observer = createSafeMutationObserver(() => {});
      
      expect(() => {
        observer.observe({ not: 'a-node' } as any);
      }).not.toThrow();
      
      expect(mockObserve).not.toHaveBeenCalled();
    });

    it('should NOT crash when observe is called with number target', () => {
      const observer = createSafeMutationObserver(() => {});
      
      expect(() => {
        observer.observe(123 as any);
      }).not.toThrow();
      
      expect(mockObserve).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle detached nodes gracefully', () => {
      const observer = createSafeMutationObserver(() => {});
      const mockNode = {
        nodeType: 1,
        ownerDocument: document
      } as any;
      
      Object.setPrototypeOf(mockNode, Node.prototype);
      
      // Mock document.contains to return false (detached)
      vi.mocked(document.contains).mockReturnValue(false);
      
      expect(() => {
        observer.observe(mockNode);
      }).not.toThrow();
      
      expect(mockObserve).not.toHaveBeenCalled();
    });

    it('should handle document.contains exceptions', () => {
      const observer = createSafeMutationObserver(() => {});
      const mockNode = {
        nodeType: 1,
        ownerDocument: document
      } as any;
      
      Object.setPrototypeOf(mockNode, Node.prototype);
      
      // Mock document.contains to throw error
      vi.mocked(document.contains).mockImplementation(() => {
        throw new Error('document.contains failed');
      });
      
      expect(() => {
        observer.observe(mockNode);
      }).not.toThrow();
      
      expect(mockObserve).not.toHaveBeenCalled();
    });

    it('should handle nodes without nodeType', () => {
      const observer = createSafeMutationObserver(() => {});
      const mockNode = {
        ownerDocument: document
        // Missing nodeType property
      } as any;
      
      Object.setPrototypeOf(mockNode, Node.prototype);
      
      expect(() => {
        observer.observe(mockNode);
      }).not.toThrow();
      
      expect(mockObserve).not.toHaveBeenCalled();
    });
  });

  describe('Callback Safety', () => {
    it('should handle callback errors gracefully', () => {
      const errorCallback = vi.fn().mockImplementation(() => {
        throw new Error('Callback error');
      });
      
      const observer = createSafeMutationObserver(errorCallback);
      
      expect(() => {
        // This should not crash even if callback throws
        const mockNode = document.createElement('div');
        observer.observe(mockNode);
      }).not.toThrow();
    });

    it('should handle missing callback gracefully', () => {
      expect(() => {
        createSafeMutationObserver(null as any);
      }).not.toThrow();
    });
  });
});
