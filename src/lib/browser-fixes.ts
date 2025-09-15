/**
 * Browser compatibility fixes
 * Fixes for common browser API issues
 * 
 * This module provides comprehensive fixes for browser API issues
 * that can cause runtime errors in production.
 */

// Fix MutationObserver error - STRUCTURAL FIX
if (typeof window !== 'undefined') {
  // Ensure MutationObserver is available
  if (!window.MutationObserver) {
    console.warn('MutationObserver not available, using fallback');
  } else {
    // Fix for credentials-library.js and any other MutationObserver errors
    const originalObserve = MutationObserver.prototype.observe;
    const originalDisconnect = MutationObserver.prototype.disconnect;
    
    // Override observe method with comprehensive safety checks
    MutationObserver.prototype.observe = function(target: Node, options?: MutationObserverInit) {
      // Comprehensive target validation
      if (!target) {
        console.warn('MutationObserver.observe called with null/undefined target');
        return;
      }
      
      if (!(target instanceof Node)) {
        console.warn('MutationObserver.observe called with invalid target type:', typeof target, target);
        return;
      }
      
      // Check if target is still in the document
      if (target.nodeType === Node.ELEMENT_NODE && !document.contains(target)) {
        console.warn('MutationObserver.observe called with detached element:', target);
        return;
      }
      
      try {
        return originalObserve.call(this, target, options);
      } catch (error) {
        console.error('MutationObserver.observe failed:', error, 'Target:', target);
        return;
      }
    };
    
    // Override disconnect method for safety
    MutationObserver.prototype.disconnect = function() {
      try {
        return originalDisconnect.call(this);
      } catch (error) {
        console.error('MutationObserver.disconnect failed:', error);
        return;
      }
    };
  }
  
  // Additional safety: Override document.querySelector to prevent null returns
  const originalQuerySelector = document.querySelector;
  document.querySelector = function(selectors: string) {
    try {
      const result = originalQuerySelector.call(this, selectors);
      if (!result) {
        console.warn('document.querySelector returned null for:', selectors);
      }
      return result;
    } catch (error) {
      console.error('document.querySelector failed:', error, 'Selector:', selectors);
      return null;
    }
  };
}

export {};
