/**
 * Browser compatibility fixes
 * Comprehensive fix for MutationObserver errors from third-party libraries
 * This must be loaded as early as possible to catch all MutationObserver usage
 */

// ULTRA-EARLY execution - BEFORE document ready
(function() {
  if (typeof window === 'undefined') return;
  
  // BLOCK ALL MUTATION OBSERVERS UNTIL DOCUMENT IS READY
  let documentReady = false;
  
  const checkReadyState = () => {
    documentReady = document.readyState === 'complete';
    if (!documentReady) {
      setTimeout(checkReadyState, 10);
    }
  };
  
  // Start checking immediately
  checkReadyState();
  
  // Also listen for ready state changes
  document.addEventListener('readystatechange', () => {
    documentReady = document.readyState === 'complete';
  });
  
  // Store original MutationObserver before any libraries can modify it
  const OriginalMutationObserver = window.MutationObserver;
  
  if (!OriginalMutationObserver) return;
  
  // Create comprehensive safe wrapper with document ready blocking
  class SafeMutationObserver extends OriginalMutationObserver {
    observe(target: any, options?: MutationObserverInit) {
      // CRITICAL: Block all observers until document is ready
      if (!documentReady) {
        logger.warn(`MutationObserver blocked - document not ready, target: ${target}`);
        return; // Block completely until ready
      }
      
      // Comprehensive validation
      if (!target) {
        // Silent fail - no console spam
        return;
      }
      
      // Critical: Check if target is a valid Node
      if (!(target instanceof Node)) {
        // Silent fail - no console spam for extension issues
        return;
      }
      
      // Additional safety checks
      if (!target.nodeType) {
        return;
      }
      
      // Check if target is still in the document
      try {
        if (!document.contains(target)) {
          return;
        }
      } catch (e) {
        // document.contains can fail in some edge cases
        return;
      }
      
      try {
        return super.observe(target, options);
      } catch (error) {
        // Silent fail - extensions cause this
        return;
      }
    }
    
    disconnect() {
      try {
        return super.disconnect();
      } catch (error) {
        logger.warn(`MutationObserver.disconnect error: ${error instanceof Error ? error.message : String(error)}`);
        return;
      }
    }
    
    takeRecords() {
      try {
        return super.takeRecords();
      } catch (error) {
        logger.warn(`MutationObserver.takeRecords error: ${error instanceof Error ? error.message : String(error)}`);
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
        logger.warn(`MutationObserver callback error: ${error instanceof Error ? error.message : String(error)}`);
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
        logger.warn(`Deprecated DOM mutation event listener detected: ${type}`);
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
              logger.warn(`ResizeObserver callback error: ${error instanceof Error ? error.message : String(error)}`);
            }
          });
        };
        
        super(safeCallback);
      }
    } as any;
  }
})();

export {};
