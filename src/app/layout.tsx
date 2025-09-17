import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import React from 'react'
import '@/lib/browser-fixes'
import { AuthProvider } from '@/components/AuthProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import ThemeProvider from '@/components/ThemeProvider'
import Navigation from '@/components/Navigation'
import SkipToContent from '@/components/SkipToContent'

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
        <meta name="robots" content="noindex, nofollow" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // IMMEDIATE ERROR SUPPRESSION - BEFORE ANYTHING ELSE
              (function() {
                'use strict';
                
                // IMMEDIATE CONSOLE SUPPRESSION
                const _originalError = console.error;
                const _originalWarn = console.warn;
                
                console.error = function() {
                  const msg = Array.prototype.join.call(arguments, ' ');
                  if (msg.includes('MutationObserver') || 
                      msg.includes('ResizeObserver') ||
                      msg.includes('credentials-library') ||
                      msg.includes('extension://') ||
                      msg.includes('safari-web-extension') ||
                      msg.includes('lastpass') ||
                      msg.includes('Argument 1') ||
                      msg.includes('must be an instance of Node') ||
                      msg.includes('Toegang tot de gevraagde resource')) {
                    return;
                  }
                  _originalError.apply(console, arguments);
                };
                
                console.warn = function() {
                  const msg = Array.prototype.join.call(arguments, ' ');
                  if (msg.includes('ResizeObserver') || 
                      msg.includes('MutationObserver') ||
                      msg.includes('extension://')) {
                    return;
                  }
                  _originalWarn.apply(console, arguments);
                };
                
                // MutationObserver override now handled by browser-fixes.ts import
                
                // IMMEDIATE GLOBAL ERROR SUPPRESSION
                window.addEventListener('error', function(e) {
                  if (e.filename && e.filename.includes('credentials-library')) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return false;
                  }
                  if (e.message && (e.message.includes('MutationObserver') || e.message.includes('must be an instance of Node'))) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return false;
                  }
                }, true);
                
                // IMMEDIATE RESOURCE ERROR SUPPRESSION
                window.addEventListener('error', function(e) {
                  if (e.target && e.target !== window && e.target.src) {
                    if (e.target.src.includes('extension://') || e.target.src.includes('lastpass')) {
                      e.preventDefault();
                      e.stopPropagation();
                      e.stopImmediatePropagation();
                      return false;
                    }
                  }
                }, true);
              })();
              
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
      </head>
      <body className={inter.className}>
        <SkipToContent />
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              <Navigation />
              <main id="main-content" tabIndex={-1}>
                {children}
              </main>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}