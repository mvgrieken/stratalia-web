'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import NavItem from './NavItem';

interface MenuItem {
  label: string;
  href: string;
  icon: string;
  requiresAuth: boolean;
  requiresAdmin?: boolean;
}

const menuItems: MenuItem[] = [
  { label: 'Zoek & Vertaal', href: '/search', icon: '🔍', requiresAuth: false },
  { label: 'Woord v/d Dag', href: '/word-of-the-day', icon: '📅', requiresAuth: false },
  { label: 'Quiz', href: '/quiz', icon: '🧠', requiresAuth: true },
  { label: 'Kennisbank', href: '/knowledge', icon: '📚', requiresAuth: true },
  { label: 'Community', href: '/community', icon: '👥', requiresAuth: true },
  { label: 'Ranking', href: '/leaderboard', icon: '🏆', requiresAuth: true },
  { label: 'Challenges', href: '/challenges', icon: '🎯', requiresAuth: true },
];

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
              {menuItems.map((item) => (
                <NavItem
                  key={item.href}
                  label={item.label}
                  href={item.href}
                  icon={item.icon}
                  requiresAuth={item.requiresAuth}
                  requiresAdmin={item.requiresAdmin}
                  user={user}
                />
              ))}
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
              
              {menuItems.map((item) => (
                <NavItem
                  key={item.href}
                  label={item.label}
                  href={item.href}
                  icon={item.icon}
                  requiresAuth={item.requiresAuth}
                  requiresAdmin={item.requiresAdmin}
                  user={user}
                  isMobile={true}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
