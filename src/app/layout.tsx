import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import React from 'react'
import '@/lib/browser-fixes'
import { AuthProvider } from '@/components/AuthProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import ThemeProvider from '@/components/ThemeProvider'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Stratalia - Leer straattaal',
  description: 'Leer straattaal met onze interactieve app. Vertaal woorden, doe quizzen en draag bij aan de community.',
  keywords: 'straattaal, nederlands, vertalen, quiz, community',
  authors: [{ name: 'Stratalia Team' }],
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ]
  },
  other: {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; worker-src 'self'; manifest-src 'self';",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
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
              // Theme initialization - must run before React hydration
              (function() {
                try {
                  const savedTheme = localStorage.getItem('stratalia-theme');
                  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  const theme = savedTheme || systemTheme;
                  
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  // Fallback to light theme if localStorage fails
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // AGGRESSIVE MutationObserver fix - must run IMMEDIATELY
              (function() {
                'use strict';
                
                // Store original before anything can modify it
                const OriginalMutationObserver = window.MutationObserver;
                
                if (!OriginalMutationObserver) {
                  // Create a mock if MutationObserver doesn't exist
                  window.MutationObserver = function() {
                    return {
                      observe: function() { return; },
                      disconnect: function() { return; },
                      takeRecords: function() { return []; }
                    };
                  };
                  return;
                }
                
                // Create bulletproof wrapper
                function createSafeMutationObserver(callback) {
                  const safeCallback = function(mutations, observer) {
                    try {
                      if (typeof callback === 'function') {
                        callback(mutations, observer);
                      }
                    } catch (error) {
                      // Silently ignore all callback errors
                    }
                  };
                  
                  const observer = new OriginalMutationObserver(safeCallback);
                  
                  // Override observe method
                  const originalObserve = observer.observe;
                  observer.observe = function(target, options) {
                    try {
                      // Validate target
                      if (!target) return;
                      if (typeof target !== 'object') return;
                      if (!target.nodeType) return;
                      if (!target.ownerDocument) return;
                      if (target.ownerDocument !== document) return;
                      
                      // Check if target is still in document
                      if (!document.contains(target)) return;
                      
                      return originalObserve.call(this, target, options);
                    } catch (error) {
                      // Silently ignore all observe errors
                    }
                  };
                  
                  // Override disconnect method
                  const originalDisconnect = observer.disconnect;
                  observer.disconnect = function() {
                    try {
                      return originalDisconnect.call(this);
                    } catch (error) {
                      // Silently ignore disconnect errors
                    }
                  };
                  
                  // Override takeRecords method
                  const originalTakeRecords = observer.takeRecords;
                  observer.takeRecords = function() {
                    try {
                      return originalTakeRecords.call(this);
                    } catch (error) {
                      return [];
                    }
                  };
                  
                  return observer;
                }
                
                // Replace the global constructor
                window.MutationObserver = createSafeMutationObserver;
                
                // Copy static properties
                Object.setPrototypeOf(createSafeMutationObserver, OriginalMutationObserver);
                Object.assign(createSafeMutationObserver, OriginalMutationObserver);
                
                // Also replace any existing instances
                const originalCreateElement = document.createElement;
                document.createElement = function(tagName) {
                  const element = originalCreateElement.call(this, tagName);
                  
                  // Add safety to any MutationObserver that might be created
                  const originalAddEventListener = element.addEventListener;
                  element.addEventListener = function(type, listener, options) {
                    try {
                      return originalAddEventListener.call(this, type, listener, options);
                    } catch (error) {
                      // Silently ignore event listener errors
                    }
                  };
                  
                  return element;
                };
              })();
              
              // Global error suppression
              window.addEventListener('error', function(event) {
                // Suppress all errors from third-party scripts
                if (event.filename && event.filename.includes('credentials-library.js')) {
                  event.preventDefault();
                  event.stopPropagation();
                  return false;
                }
                
                // Suppress resource loading errors
                if (event.target !== window) {
                  event.preventDefault();
                  event.stopPropagation();
                  return false;
                }
              }, true);
              
              // Suppress unhandled promise rejections
              window.addEventListener('unhandledrejection', function(event) {
                event.preventDefault();
                event.stopPropagation();
                return false;
              });
              
              // Override console.error to suppress third-party errors
              const originalConsoleError = console.error;
              console.error = function(...args) {
                const message = args.join(' ');
                if (message.includes('credentials-library.js') || 
                    message.includes('MutationObserver') ||
                    message.includes('Argument 1') ||
                    message.includes('must be an instance of Node') ||
                    message.includes('ResizeObserver loop completed') ||
                    message.includes('ResizeObserver loop limit exceeded')) {
                  return; // Suppress these errors
                }
                originalConsoleError.apply(console, args);
              };
              
              // Suppress ResizeObserver errors globally
              const originalResizeObserver = window.ResizeObserver;
              if (originalResizeObserver) {
                window.ResizeObserver = class extends originalResizeObserver {
                  constructor(callback) {
                    const wrappedCallback = (entries, observer) => {
                      try {
                        callback(entries, observer);
                      } catch (error) {
                        // Suppress ResizeObserver errors
                        if (!error.message.includes('ResizeObserver loop')) {
                          throw error;
                        }
                      }
                    };
                    super(wrappedCallback);
                  }
                };
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              <Navigation />
              {children}
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}