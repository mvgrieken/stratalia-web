/**
 * Browser compatibility fixes
 * Fixes for common browser API issues
 */

// Fix MutationObserver error
if (typeof window !== 'undefined') {
  // Ensure MutationObserver is available
  if (!window.MutationObserver) {
    console.warn('MutationObserver not available, using fallback');
  }

  // Fix for credentials-library.js MutationObserver error
  const originalObserve = MutationObserver.prototype.observe;
  MutationObserver.prototype.observe = function(target: Node, options?: MutationObserverInit) {
    if (!target || !(target instanceof Node)) {
      console.warn('MutationObserver.observe called with invalid target:', target);
      return;
    }
    return originalObserve.call(this, target, options);
  };
}

export {};
