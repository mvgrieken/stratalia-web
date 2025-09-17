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
              // ULTIMATE ERROR SUPPRESSION - NUCLEAR OPTION
              (function() {
                'use strict';
                
                // COMPLETE CONSOLE SUPPRESSION FIRST
                const originalError = console.error;
                const originalWarn = console.warn;
                
                console.error = function(...args) {
                  const msg = args.join(' ');
                  if (msg.includes('MutationObserver') || 
                      msg.includes('ResizeObserver') ||
                      msg.includes('credentials-library') ||
                      msg.includes('extension://') ||
                      msg.includes('safari-web-extension') ||
                      msg.includes('lastpass') ||
                      msg.includes('Argument 1') ||
                      msg.includes('must be an instance of Node') ||
                      msg.includes('Toegang tot de gevraagde resource')) {
                    return; // Complete suppression
                  }
                  originalError.apply(console, args);
                };
                
                console.warn = function(...args) {
                  const msg = args.join(' ');
                  if (msg.includes('ResizeObserver') || 
                      msg.includes('MutationObserver') ||
                      msg.includes('extension://')) {
                    return;
                  }
                  originalWarn.apply(console, args);
                };
                
                // NUCLEAR MUTATION OBSERVER REPLACEMENT
                if (window.MutationObserver) {
                  const OriginalMO = window.MutationObserver;
                  window.MutationObserver = function(callback) {
                    const safeCallback = function() {
                      try {
                        if (typeof callback === 'function') {
                          callback.apply(this, arguments);
                        }
                      } catch (e) { /* suppress all */ }
                    };
                    
                    const observer = new OriginalMO(safeCallback);
                    const originalObserve = observer.observe;
                    
                    observer.observe = function(target, options) {
                      try {
                        // Nuclear validation
                        if (!target || 
                            !target.nodeType || 
                            !document.contains(target) ||
                            (target.src && target.src.includes('extension://'))) {
                          return; // Just return, don't throw
                        }
                        return originalObserve.call(this, target, options);
                      } catch (e) { 
                        return; // Complete suppression
                      }
                    };
                    
                    return observer;
                  };
                }
                
                // NUCLEAR RESIZE OBSERVER REPLACEMENT
                if (window.ResizeObserver) {
                  const OriginalRO = window.ResizeObserver;
                  window.ResizeObserver = function(callback) {
                    const safeCallback = function() {
                      try {
                        callback.apply(this, arguments);
                      } catch (e) { /* suppress all */ }
                    };
                    return new OriginalRO(safeCallback);
                  };
                }
                
                // NUCLEAR FETCH BLOCKING
                const originalFetch = window.fetch;
                window.fetch = function(url, options) {
                  if (typeof url === 'string' && (
                      url.includes('extension://') ||
                      url.includes('safari-web-extension://') ||
                      url.includes('lastpass.com') ||
                      url.includes('geticon.php'))) {
                    return Promise.resolve(new Response('', { status: 204 }));
                  }
                  return originalFetch.call(this, url, options);
                };
              })();
              
              // NUCLEAR GLOBAL ERROR SUPPRESSION
              window.addEventListener('error', function(event) {
                // Complete suppression of all problematic errors
                const shouldSuppress = (
                  // File-based suppression
                  (event.filename && (
                    event.filename.includes('credentials-library') ||
                    event.filename.includes('extension://') ||
                    event.filename.includes('safari-web-extension') ||
                    event.filename.includes('lastpass')
                  )) ||
                  // Message-based suppression
                  (event.message && (
                    event.message.includes('MutationObserver') ||
                    event.message.includes('ResizeObserver') ||
                    event.message.includes('must be an instance of Node') ||
                    event.message.includes('Argument 1') ||
                    event.message.includes('credentials-library') ||
                    event.message.includes('Toegang tot de gevraagde resource')
                  )) ||
                  // Target-based suppression (resource loading)
                  (event.target && event.target !== window && event.target.src && (
                    event.target.src.includes('extension://') ||
                    event.target.src.includes('safari-web-extension') ||
                    event.target.src.includes('lastpass') ||
                    event.target.src.includes('geticon.php')
                  ))
                );
                
                if (shouldSuppress) {
                  event.preventDefault();
                  event.stopPropagation();
                  event.stopImmediatePropagation();
                  return false;
                }
              }, true);
              
              // NUCLEAR PROMISE REJECTION SUPPRESSION
              window.addEventListener('unhandledrejection', function(event) {
                const reason = event.reason;
                const reasonStr = reason ? reason.toString() : '';
                
                const shouldSuppress = (
                  (reason && reason.message && (
                    reason.message.includes('extension://') ||
                    reason.message.includes('safari-web-extension') ||
                    reason.message.includes('lastpass') ||
                    reason.message.includes('Access-Control-Allow-Origin') ||
                    reason.message.includes('Blocked extension request') ||
                    reason.message.includes('Toegang tot de gevraagde resource')
                  )) ||
                  reasonStr.includes('Failed to fetch') ||
                  reasonStr.includes('extension://') ||
                  reasonStr.includes('safari-web-extension') ||
                  reasonStr.includes('lastpass')
                );
                
                if (shouldSuppress) {
                  event.preventDefault();
                  event.stopPropagation();
                  event.stopImmediatePropagation();
                  return false;
                }
              });
              
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