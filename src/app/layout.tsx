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
              // COMPREHENSIVE ERROR SUPPRESSION - must run IMMEDIATELY
              (function() {
                'use strict';
                
                // 1. MUTATIONOBSERVER PROTECTION
                const OriginalMutationObserver = window.MutationObserver;
                
                if (!OriginalMutationObserver) {
                  window.MutationObserver = function() {
                    return {
                      observe: function() { return; },
                      disconnect: function() { return; },
                      takeRecords: function() { return []; }
                    };
                  };
                } else {
                  function SafeMutationObserver(callback) {
                    const safeCallback = function(mutations, observer) {
                      try {
                        if (typeof callback === 'function') {
                          callback(mutations, observer);
                        }
                      } catch (error) {
                        // Completely suppress all errors
                        return;
                      }
                    };
                    
                    const observer = new OriginalMutationObserver(safeCallback);
                    
                    // Ultra-safe observe method
                    observer.observe = function(target, options) {
                      try {
                        // Extensive validation
                        if (!target) return;
                        if (typeof target !== 'object') return;
                        if (!target.nodeType) return;
                        if (target.nodeType !== Node.ELEMENT_NODE && target.nodeType !== Node.DOCUMENT_NODE) return;
                        if (!target.ownerDocument && target !== document) return;
                        if (target.ownerDocument && target.ownerDocument !== document) return;
                        if (!document.contains(target) && target !== document) return;
                        
                        // Additional safety checks
                        if (target.tagName && target.tagName.toLowerCase() === 'script') return;
                        if (target.src && target.src.includes('extension://')) return;
                        if (target.src && target.src.includes('safari-web-extension://')) return;
                        
                        return OriginalMutationObserver.prototype.observe.call(this, target, options);
                      } catch (error) {
                        return; // Completely suppress
                      }
                    };
                    
                    return observer;
                  }
                  
                  // Copy all static properties
                  Object.setPrototypeOf(SafeMutationObserver, OriginalMutationObserver);
                  Object.assign(SafeMutationObserver, OriginalMutationObserver);
                  SafeMutationObserver.prototype = OriginalMutationObserver.prototype;
                  
                  window.MutationObserver = SafeMutationObserver;
                }
                
                // 2. RESIZEOBSERVER PROTECTION
                const OriginalResizeObserver = window.ResizeObserver;
                if (OriginalResizeObserver) {
                  window.ResizeObserver = function(callback) {
                    const safeCallback = function(entries, observer) {
                      try {
                        callback(entries, observer);
                      } catch (error) {
                        return; // Suppress all ResizeObserver errors
                      }
                    };
                    return new OriginalResizeObserver(safeCallback);
                  };
                  Object.setPrototypeOf(window.ResizeObserver, OriginalResizeObserver);
                  Object.assign(window.ResizeObserver, OriginalResizeObserver);
                }
                
                // 3. FETCH API PROTECTION (for extension errors)
                const originalFetch = window.fetch;
                window.fetch = function(...args) {
                  try {
                    const url = args[0];
                    if (typeof url === 'string') {
                      // Block extension URLs
                      if (url.includes('extension://') || 
                          url.includes('safari-web-extension://') ||
                          url.includes('lastpass.com') ||
                          url.includes('geticon.php')) {
                        return Promise.reject(new Error('Blocked extension request'));
                      }
                    }
                    return originalFetch.apply(this, args);
                  } catch (error) {
                    return Promise.reject(error);
                  }
                };
              })();
              
              // COMPREHENSIVE GLOBAL ERROR SUPPRESSION
              window.addEventListener('error', function(event) {
                // Suppress all errors from third-party scripts and extensions
                if (event.filename && (
                    event.filename.includes('credentials-library.js') ||
                    event.filename.includes('extension://') ||
                    event.filename.includes('safari-web-extension://') ||
                    event.filename.includes('lastpass.com')
                  )) {
                  event.preventDefault();
                  event.stopPropagation();
                  return false;
                }
                
                // Suppress all resource loading errors
                if (event.target && event.target !== window) {
                  const target = event.target;
                  if (target.src && (
                      target.src.includes('extension://') ||
                      target.src.includes('safari-web-extension://') ||
                      target.src.includes('lastpass.com') ||
                      target.src.includes('geticon.php')
                    )) {
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                  }
                }
                
                // Suppress MutationObserver errors
                if (event.message && (
                    event.message.includes('MutationObserver') ||
                    event.message.includes('must be an instance of Node') ||
                    event.message.includes('Argument 1')
                  )) {
                  event.preventDefault();
                  event.stopPropagation();
                  return false;
                }
              }, true);
              
              // Suppress unhandled promise rejections from extensions
              window.addEventListener('unhandledrejection', function(event) {
                const reason = event.reason;
                if (reason && typeof reason === 'object' && reason.message) {
                  if (reason.message.includes('extension://') ||
                      reason.message.includes('safari-web-extension://') ||
                      reason.message.includes('lastpass.com') ||
                      reason.message.includes('Access-Control-Allow-Origin') ||
                      reason.message.includes('Blocked extension request')) {
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                  }
                }
                // Also suppress generic fetch errors that might be extension-related
                if (reason && reason.toString().includes('Failed to fetch')) {
                  event.preventDefault();
                  event.stopPropagation();
                  return false;
                }
              });
              
              // COMPREHENSIVE CONSOLE ERROR SUPPRESSION
              const originalConsoleError = console.error;
              console.error = function(...args) {
                const message = args.join(' ');
                // Suppress all problematic errors
                if (message.includes('credentials-library.js') || 
                    message.includes('MutationObserver') ||
                    message.includes('Argument 1') ||
                    message.includes('must be an instance of Node') ||
                    message.includes('ResizeObserver loop completed') ||
                    message.includes('ResizeObserver loop limit exceeded') ||
                    message.includes('safari-web-extension://') ||
                    message.includes('extension://') ||
                    message.includes('lastpass.com') ||
                    message.includes('geticon.php') ||
                    message.includes('Access-Control-Allow-Origin') ||
                    message.includes('Toegang tot de gevraagde resource') ||
                    message.includes('is not allowed by Access-Control-Allow-Origin')) {
                  return; // Suppress these errors completely
                }
                originalConsoleError.apply(console, args);
              };
              
              // Also suppress console.warn for these issues
              const originalConsoleWarn = console.warn;
              console.warn = function(...args) {
                const message = args.join(' ');
                if (message.includes('ResizeObserver') ||
                    message.includes('MutationObserver') ||
                    message.includes('extension://') ||
                    message.includes('safari-web-extension://')) {
                  return; // Suppress these warnings
                }
                originalConsoleWarn.apply(console, args);
              };
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