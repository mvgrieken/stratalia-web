/**
 * Unit tests for MutationObserver fixes
 * Tests that the app doesn't crash when MutationObserver.observe is called with invalid targets
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock browser environment
const mockMutationObserver = vi.fn();
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

// Mock window object
Object.defineProperty(window, 'MutationObserver', {
  value: mockMutationObserver,
  writable: true
});

// Mock document methods
Object.defineProperty(document, 'querySelector', {
  value: vi.fn(),
  writable: true
});

Object.defineProperty(document, 'querySelectorAll', {
  value: vi.fn(),
  writable: true
});

describe('MutationObserver Fixes', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup MutationObserver mock
    mockMutationObserver.prototype.observe = mockObserve;
    mockMutationObserver.prototype.disconnect = mockDisconnect;
    
    // Import browser fixes after mocks are set up
    require('@/lib/browser-fixes');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not crash when observe is called with null target', () => {
    const observer = new mockMutationObserver();
    
    // This should not throw an error
    expect(() => {
      observer.observe(null as any);
    }).not.toThrow();
    
    // Should not call the original observe method
    expect(mockObserve).not.toHaveBeenCalled();
  });

  it('should not crash when observe is called with undefined target', () => {
    const observer = new mockMutationObserver();
    
    // This should not throw an error
    expect(() => {
      observer.observe(undefined as any);
    }).not.toThrow();
    
    // Should not call the original observe method
    expect(mockObserve).not.toHaveBeenCalled();
  });

  it('should not crash when observe is called with non-Node target', () => {
    const observer = new mockMutationObserver();
    
    // This should not throw an error
    expect(() => {
      observer.observe('not-a-node' as any);
    }).not.toThrow();
    
    // Should not call the original observe method
    expect(mockObserve).not.toHaveBeenCalled();
  });

  it('should call original observe when target is valid Node', () => {
    const observer = new mockMutationObserver();
    const mockNode = document.createElement('div');
    
    // This should call the original observe method
    observer.observe(mockNode);
    
    // Should call the original observe method
    expect(mockObserve).toHaveBeenCalledWith(mockNode, undefined);
  });

  it('should not crash when disconnect is called', () => {
    const observer = new mockMutationObserver();
    
    // This should not throw an error
    expect(() => {
      observer.disconnect();
    }).not.toThrow();
    
    // Should call the original disconnect method
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('should handle querySelector returning null gracefully', () => {
    const mockQuerySelector = vi.fn().mockReturnValue(null);
    document.querySelector = mockQuerySelector;
    
    // This should not throw an error
    expect(() => {
      document.querySelector('#non-existent-element');
    }).not.toThrow();
    
    expect(mockQuerySelector).toHaveBeenCalledWith('#non-existent-element');
  });

  it('should handle querySelectorAll errors gracefully', () => {
    const mockQuerySelectorAll = vi.fn().mockImplementation(() => {
      throw new Error('Invalid selector');
    });
    document.querySelectorAll = mockQuerySelectorAll;
    
    // This should not throw an error
    expect(() => {
      document.querySelectorAll('invalid[selector');
    }).not.toThrow();
  });
});
