/**
 * Browser compatibility fixes
 * Simple fix for MutationObserver errors from third-party libraries
 */

if (typeof window !== 'undefined') {
  // Store original MutationObserver
  const OriginalMutationObserver = window.MutationObserver;
  
  // Create safe wrapper
  class SafeMutationObserver extends OriginalMutationObserver {
    observe(target: any, options?: MutationObserverInit) {
      // Comprehensive null/undefined check
      if (!target) {
        console.warn('MutationObserver.observe called with null/undefined target');
        return;
      }
      
      // Check if target is a valid Node
      if (!(target instanceof Node)) {
        console.warn('MutationObserver.observe called with invalid target:', typeof target, target);
        return;
      }
      
      // Additional safety checks
      if (!target.nodeType || !target.ownerDocument) {
        console.warn('MutationObserver.observe called with invalid Node:', target);
        return;
      }
      
      try {
        return super.observe(target, options);
      } catch (error) {
        console.warn('MutationObserver.observe error:', error);
        return;
      }
    }
  }
  
  // Replace global MutationObserver
  window.MutationObserver = SafeMutationObserver as any;
  
  // Also patch the constructor to handle edge cases
  const OriginalMutationObserverConstructor = window.MutationObserver;
  window.MutationObserver = function(callback: MutationCallback) {
    const safeCallback = (mutations: MutationRecord[], observer: MutationObserver) => {
      try {
        callback(mutations, observer);
      } catch (error) {
        console.warn('MutationObserver callback error:', error);
      }
    };
    
    return new OriginalMutationObserverConstructor(safeCallback);
  } as any;
  
  // Copy static properties
  Object.setPrototypeOf(window.MutationObserver, OriginalMutationObserverConstructor);
  Object.assign(window.MutationObserver, OriginalMutationObserverConstructor);
}

export {};
