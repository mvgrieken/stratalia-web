'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Navigation() {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-white">Stratalia</span>
            </Link>
            
            <div className="hidden lg:ml-6 lg:flex lg:space-x-4">
              <Link href="/search" className="text-white hover:text-blue-200 px-2 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap">
                🔍 Zoek & Vertaal
              </Link>
              <Link href="/word-of-the-day" className="text-white hover:text-blue-200 px-2 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap">
                📅 Woord v/d Dag
              </Link>
              
              {/* Protected items - show with lock icon if not logged in */}
              {user ? (
                <Link href="/quiz" className="text-white hover:text-blue-200 px-2 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap">
                  🧠 Quiz
                </Link>
              ) : (
                <span className="text-white text-opacity-60 px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap cursor-not-allowed flex items-center">
                  🧠 Quiz 🔒
                </span>
              )}
              
              {user ? (
                <Link href="/knowledge" className="text-white hover:text-blue-200 px-2 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap">
                  📚 Kennisbank
                </Link>
              ) : (
                <span className="text-white text-opacity-60 px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap cursor-not-allowed flex items-center">
                  📚 Kennisbank 🔒
                </span>
              )}
              
              {user ? (
                <Link href="/community" className="text-white hover:text-blue-200 px-2 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap">
                  👥 Community
                </Link>
              ) : (
                <span className="text-white text-opacity-60 px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap cursor-not-allowed flex items-center">
                  👥 Community 🔒
                </span>
              )}
              
              {user ? (
                <Link href="/leaderboard" className="text-white hover:text-blue-200 px-2 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap">
                  🏆 Ranking
                </Link>
              ) : (
                <span className="text-white text-opacity-60 px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap cursor-not-allowed flex items-center">
                  🏆 Ranking 🔒
                </span>
              )}
              
              {user ? (
                <Link href="/challenges" className="text-white hover:text-blue-200 px-2 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap">
                  🎯 Challenges
                </Link>
              ) : (
                <span className="text-white text-opacity-60 px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap cursor-not-allowed flex items-center">
                  🎯 Challenges 🔒
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Theme Toggle */}
                <ThemeToggle />
                
                {/* CMS-knop voor admin */}
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                  >
                    CMS
                  </Link>
                )}
                
                <Link href="/notifications" className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  🔔
                </Link>
                
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.full_name?.charAt(0) || user.email.charAt(0)}
                      </span>
                    </div>
                  </button>

                  {isMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profiel
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          setIsMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Uitloggen
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Theme Toggle */}
                <ThemeToggle />
                
                <Link
                  href="/login"
                  className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Inloggen
                </Link>
                <Link
                  href="/register"
                  className="bg-white bg-opacity-20 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-opacity-30 transition-colors"
                >
                  Registreren
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white hover:text-blue-200 p-2 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white bg-opacity-10 backdrop-blur-sm">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {/* Theme Toggle in Mobile Menu */}
              <div className="px-3 py-2">
                <ThemeToggle showLabel={true} className="text-white hover:text-blue-200" />
              </div>
              
              <Link href="/search" className="text-white hover:text-blue-200 block px-3 py-2 rounded-md text-base font-medium transition-colors">
                🔍 Zoek & Vertaal
              </Link>
              <Link href="/word-of-the-day" className="text-white hover:text-blue-200 block px-3 py-2 rounded-md text-base font-medium transition-colors">
                📅 Woord van de Dag
              </Link>
              
              {/* Protected items in mobile menu */}
              {user ? (
                <Link href="/quiz" className="text-white hover:text-blue-200 block px-3 py-2 rounded-md text-base font-medium transition-colors">
                  🧠 Quiz
                </Link>
              ) : (
                <span className="text-white text-opacity-60 block px-3 py-2 rounded-md text-base font-medium cursor-not-allowed">
                  🧠 Quiz 🔒
                </span>
              )}
              
              {user ? (
                <Link href="/knowledge" className="text-white hover:text-blue-200 block px-3 py-2 rounded-md text-base font-medium transition-colors">
                  📚 Kennisbank
                </Link>
              ) : (
                <span className="text-white text-opacity-60 block px-3 py-2 rounded-md text-base font-medium cursor-not-allowed">
                  📚 Kennisbank 🔒
                </span>
              )}
              
              {user ? (
                <Link href="/community" className="text-white hover:text-blue-200 block px-3 py-2 rounded-md text-base font-medium transition-colors">
                  👥 Community
                </Link>
              ) : (
                <span className="text-white text-opacity-60 block px-3 py-2 rounded-md text-base font-medium cursor-not-allowed">
                  👥 Community 🔒
                </span>
              )}
              
              {user ? (
                <Link href="/leaderboard" className="text-white hover:text-blue-200 block px-3 py-2 rounded-md text-base font-medium transition-colors">
                  🏆 Leaderboard
                </Link>
              ) : (
                <span className="text-white text-opacity-60 block px-3 py-2 rounded-md text-base font-medium cursor-not-allowed">
                  🏆 Leaderboard 🔒
                </span>
              )}
              
              {user ? (
                <Link href="/challenges" className="text-white hover:text-blue-200 block px-3 py-2 rounded-md text-base font-medium transition-colors">
                  🎯 Challenges
                </Link>
              ) : (
                <span className="text-white text-opacity-60 block px-3 py-2 rounded-md text-base font-medium cursor-not-allowed">
                  🎯 Challenges 🔒
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
