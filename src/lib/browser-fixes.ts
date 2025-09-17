/**
 * Browser compatibility fixes
 * Comprehensive fix for MutationObserver errors from third-party libraries
 * This must be loaded as early as possible to catch all MutationObserver usage
 */

// Immediate execution to catch errors as early as possible
(function() {
  if (typeof window === 'undefined') return;
  
  // Store original MutationObserver before any libraries can modify it
  const OriginalMutationObserver = window.MutationObserver;
  
  if (!OriginalMutationObserver) return;
  
  // Create comprehensive safe wrapper
  class SafeMutationObserver extends OriginalMutationObserver {
    observe(target: any, options?: MutationObserverInit) {
      // Comprehensive validation
      if (!target) {
        console.warn('MutationObserver.observe called with null/undefined target - ignoring');
        return;
      }
      
      // Check if target is a valid Node
      if (!(target instanceof Node)) {
        console.warn('MutationObserver.observe called with invalid target:', typeof target, target, '- ignoring');
        return;
      }
      
      // Additional safety checks
      if (!target.nodeType || !target.ownerDocument) {
        console.warn('MutationObserver.observe called with invalid Node:', target, '- ignoring');
        return;
      }
      
      // Check if target is still in the document
      if (!document.contains(target)) {
        console.warn('MutationObserver.observe called with detached Node - ignoring');
        return;
      }
      
      try {
        return super.observe(target, options);
      } catch (error) {
        console.warn('MutationObserver.observe error:', error, '- ignoring');
        return;
      }
    }
    
    disconnect() {
      try {
        return super.disconnect();
      } catch (error) {
        console.warn('MutationObserver.disconnect error:', error);
        return;
      }
    }
    
    takeRecords() {
      try {
        return super.takeRecords();
      } catch (error) {
        console.warn('MutationObserver.takeRecords error:', error);
        return [];
      }
    }
  }
  
  // Replace global MutationObserver immediately
  window.MutationObserver = SafeMutationObserver as any;
  
  // Also patch the constructor to handle edge cases
  const SafeMutationObserverConstructor = function(callback: MutationCallback) {
    const safeCallback = (mutations: MutationRecord[], observer: MutationObserver) => {
      try {
        callback(mutations, observer);
      } catch (error) {
        console.warn('MutationObserver callback error:', error);
      }
    };
    
    return new SafeMutationObserver(safeCallback);
  } as any;
  
  // Copy static properties
  Object.setPrototypeOf(SafeMutationObserverConstructor, OriginalMutationObserver);
  Object.assign(SafeMutationObserverConstructor, OriginalMutationObserver);
  
  // Replace the constructor
  window.MutationObserver = SafeMutationObserverConstructor;
  
  // Also patch any existing instances that might be created by other libraries
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName: string) {
    const element = originalCreateElement.call(this, tagName);
    
    // Add a safety check to any MutationObserver that might be created on this element
    const originalAddEventListener = element.addEventListener;
    element.addEventListener = function(type: string, listener: any, options?: any) {
      if (type === 'DOMNodeInserted' || type === 'DOMNodeRemoved' || type === 'DOMSubtreeModified') {
        console.warn('Deprecated DOM mutation event listener detected:', type);
        return;
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
    
    return element;
  };
  
  // Enhanced ResizeObserver protection to prevent loop warnings
  const OriginalResizeObserver = window.ResizeObserver;
  if (OriginalResizeObserver) {
    window.ResizeObserver = class extends OriginalResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        // Wrap callback to prevent infinite loops
        const safeCallback: ResizeObserverCallback = (entries, observer) => {
          // Use requestAnimationFrame to prevent loop warnings
          requestAnimationFrame(() => {
            try {
              callback(entries, observer);
            } catch (error) {
              console.warn('ResizeObserver callback error:', error);
            }
          });
        };
        
        super(safeCallback);
      }
    } as any;
  }
})();

export {};
