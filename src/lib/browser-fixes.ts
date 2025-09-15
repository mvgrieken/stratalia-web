/**
 * Browser compatibility fixes
 * Simple fix for MutationObserver errors from third-party libraries
 */

if (typeof window !== 'undefined') {
  // Store original MutationObserver
  const OriginalMutationObserver = window.MutationObserver;
  
  // Create safe wrapper
  class SafeMutationObserver extends OriginalMutationObserver {
    observe(target: Node, options?: MutationObserverInit) {
      // Simple null check - if target is null/undefined, just return
      if (!target) {
        return;
      }
      
      // Check if target is a valid Node
      if (!(target instanceof Node)) {
        return;
      }
      
      try {
        return super.observe(target, options);
      } catch (error) {
        // Silently ignore errors from third-party libraries
        return;
      }
    }
  }
  
  // Replace global MutationObserver
  window.MutationObserver = SafeMutationObserver as any;
}

export {};
