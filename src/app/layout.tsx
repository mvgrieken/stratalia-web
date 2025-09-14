import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import React from 'react'
import '@/lib/browser-fixes'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Straatpraat - Leer Straattaal',
  description: 'Leer straattaal met onze interactieve app. Vertaal woorden, doe quizzen en draag bij aan de community.',
  keywords: 'straattaal, nederlands, vertalen, quiz, community',
  authors: [{ name: 'Straatpraat Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body className={inter.className}>{children}</body>
    </html>
  )
}