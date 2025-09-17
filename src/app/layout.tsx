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
                    if (!target || !(target instanceof Node) || !target.nodeType || !target.ownerDocument) {
                      console.warn('MutationObserver.observe called with invalid target - ignoring');
                      return;
                    }
                    
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
                
                window.MutationObserver = SafeMutationObserver;
              })();
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