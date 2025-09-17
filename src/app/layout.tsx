import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import React from 'react'
import '@/lib/browser-fixes'
import { AuthProvider } from '@/components/AuthProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Stratalia - Leer straattaal',
  description: 'Leer straattaal met onze interactieve app. Vertaal woorden, doe quizzen en draag bij aan de community.',
  keywords: 'straattaal, nederlands, vertalen, quiz, community',
  authors: [{ name: 'Stratalia Team' }],
  viewport: 'width=device-width, initial-scale=1',
  other: {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co; frame-ancestors 'none';",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Immediate MutationObserver fix - must run before any other scripts
              (function() {
                if (typeof window === 'undefined') return;
                
                const OriginalMutationObserver = window.MutationObserver;
                if (!OriginalMutationObserver) return;
                
                class SafeMutationObserver extends OriginalMutationObserver {
                  observe(target, options) {
                    // More comprehensive validation
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
                      console.warn('MutationObserver.observe error - ignoring:', error);
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
                window.MutationObserver = SafeMutationObserver;
                
                // Also patch the constructor to handle edge cases
                const SafeMutationObserverConstructor = function(callback) {
                  const safeCallback = (mutations, observer) => {
                    try {
                      callback(mutations, observer);
                    } catch (error) {
                      console.warn('MutationObserver callback error:', error);
                    }
                  };
                  
                  return new SafeMutationObserver(safeCallback);
                };
                
                // Copy static properties
                Object.setPrototypeOf(SafeMutationObserverConstructor, OriginalMutationObserver);
                Object.assign(SafeMutationObserverConstructor, OriginalMutationObserver);
                
                // Replace the constructor
                window.MutationObserver = SafeMutationObserverConstructor;
              })();
              
              // Global error handler for resource loading errors
              window.addEventListener('error', function(event) {
                if (event.target !== window) {
                  // Resource loading error
                  console.warn('Resource loading error:', event.target.src || event.target.href, event.error);
                  // Prevent the error from showing in console
                  event.preventDefault();
                }
              });
              
              // Handle unhandled promise rejections
              window.addEventListener('unhandledrejection', function(event) {
                console.warn('Unhandled promise rejection:', event.reason);
                // Prevent the error from showing in console
                event.preventDefault();
              });
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}