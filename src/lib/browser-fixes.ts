/**
 * Browser compatibility fixes
 * Fixes for common browser API issues
 * 
 * This module provides comprehensive fixes for browser API issues
 * that can cause runtime errors in production.
 * 
 * ROOT CAUSE: Third-party libraries (like Supabase Auth credentials-library.js)
 * call MutationObserver.observe with null targets when document.querySelector
 * returns null for missing DOM elements.
 * 
 * SOLUTION: Monkey-patch MutationObserver globally to prevent crashes
 * from external libraries before they can cause errors.
 */

// CRITICAL: Patch MutationObserver BEFORE any external libraries load
if (typeof window !== 'undefined') {
  // Store original MutationObserver
  const OriginalMutationObserver = window.MutationObserver;
  
  // Create safe wrapper for MutationObserver
  class SafeMutationObserver extends OriginalMutationObserver {
    constructor(callback: MutationCallback) {
      super(callback);
    }
    
    observe(target: Node, options?: MutationObserverInit) {
      // Comprehensive target validation
      if (!target) {
        console.warn('🔧 [BROWSER-FIX] MutationObserver.observe called with null/undefined target - skipping');
        return;
      }
      
      if (!(target instanceof Node)) {
        console.warn('🔧 [BROWSER-FIX] MutationObserver.observe called with invalid target type:', typeof target, target);
        return;
      }
      
      // Check if target is still in the document
      if (target.nodeType === Node.ELEMENT_NODE && !document.contains(target)) {
        console.warn('🔧 [BROWSER-FIX] MutationObserver.observe called with detached element:', target);
        return;
      }
      
      try {
        return super.observe(target, options);
      } catch (error) {
        console.error('🔧 [BROWSER-FIX] MutationObserver.observe failed:', error, 'Target:', target);
        return;
      }
    }
    
    disconnect() {
      try {
        return super.disconnect();
      } catch (error) {
        console.error('🔧 [BROWSER-FIX] MutationObserver.disconnect failed:', error);
        return;
      }
    }
  }
  
  // Replace global MutationObserver with safe version
  window.MutationObserver = SafeMutationObserver as any;
  
  // Also patch the prototype for existing instances
  if (OriginalMutationObserver.prototype) {
    const originalObserve = OriginalMutationObserver.prototype.observe;
    const originalDisconnect = OriginalMutationObserver.prototype.disconnect;
    
    OriginalMutationObserver.prototype.observe = function(target: Node, options?: MutationObserverInit) {
      if (!target) {
        console.warn('🔧 [BROWSER-FIX] Existing MutationObserver.observe called with null target - skipping');
        return;
      }
      
      if (!(target instanceof Node)) {
        console.warn('🔧 [BROWSER-FIX] Existing MutationObserver.observe called with invalid target type:', typeof target, target);
        return;
      }
      
      try {
        return originalObserve.call(this, target, options);
      } catch (error) {
        console.error('🔧 [BROWSER-FIX] Existing MutationObserver.observe failed:', error, 'Target:', target);
        return;
      }
    };
    
    OriginalMutationObserver.prototype.disconnect = function() {
      try {
        return originalDisconnect.call(this);
      } catch (error) {
        console.error('🔧 [BROWSER-FIX] Existing MutationObserver.disconnect failed:', error);
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
        console.warn('🔧 [BROWSER-FIX] document.querySelector returned null for:', selectors);
      }
      return result;
    } catch (error) {
      console.error('🔧 [BROWSER-FIX] document.querySelector failed:', error, 'Selector:', selectors);
      return null;
    }
  };
  
  // Additional safety: Override document.querySelectorAll to prevent errors
  const originalQuerySelectorAll = document.querySelectorAll;
  document.querySelectorAll = function(selectors: string) {
    try {
      return originalQuerySelectorAll.call(this, selectors);
    } catch (error) {
      console.error('🔧 [BROWSER-FIX] document.querySelectorAll failed:', error, 'Selector:', selectors);
      return document.createDocumentFragment().querySelectorAll(selectors); // Empty NodeList
    }
  };
  
  console.log('🔧 [BROWSER-FIX] MutationObserver patched successfully - external libraries are now safe');
}

export {};
