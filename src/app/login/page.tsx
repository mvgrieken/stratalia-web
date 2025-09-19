'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import AppleAuthButton from '@/components/auth/AppleAuthButton';
import PinLoginForm from '@/components/auth/PinLoginForm';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginMethod, setLoginMethod] = useState<'password' | 'pin'>('password');
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect_to') || '/dashboard';
  const showGoogle = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === 'true';
  const showApple = process.env.NEXT_PUBLIC_APPLE_OAUTH_ENABLED === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn(email, password);
      if (result.error) {
        const lower = result.error.toLowerCase();
        if (lower.includes('email') && (lower.includes('verify') || lower.includes('bevestig'))) {
          setError('Je e-mailadres is nog niet bevestigd. Check je e-mail voor de verificatielink.');
        } else if (lower.includes('invalid') || lower.includes('ongeldig')) {
          setError('Onjuiste inloggegevens. Probeer het opnieuw.');
        } else if (lower.includes('rate') || lower.includes('te veel')) {
          setError('Te veel pogingen. Wacht even en probeer later opnieuw.');
        } else {
          setError(result.error);
        }
      } else {
        router.push(redirectTo);
      }
    } catch (err) {
      setError('Er is een onverwachte fout opgetreden');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Inloggen bij Stratalia
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Of{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            maak een nieuw account aan
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Password Login Form */}
          {loginMethod === 'password' && (
            <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email adres
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Wachtwoord
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            {/* Optionally hint about email verification */}
            {error && error.toLowerCase().includes('bevestig') && (
              <p className="mt-2 text-xs text-gray-600">Geen mail ontvangen? Controleer je spamfolder of vraag een nieuwe verificatiemail aan.</p>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Inloggen...' : 'Inloggen'}
              </button>
            </div>
          </form>
          )}

          {/* Login Method Tabs */}
          <div className="mt-6">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setLoginMethod('password')}
                className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 ${
                  loginMethod === 'password'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Wachtwoord
              </button>
              <button
                onClick={() => setLoginMethod('pin')}
                className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 ${
                  loginMethod === 'pin'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                PIN-code
              </button>
            </div>
          </div>

          {/* PIN Login Form */}
          {loginMethod === 'pin' && (
            <div className="mt-6">
              <PinLoginForm
                onSuccess={() => {
                  router.push(redirectTo);
                }}
                onError={(error) => setError(error)}
                onSwitchToPassword={() => setLoginMethod('password')}
              />
            </div>
          )}

          {/* Social Login Options */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Of inloggen met</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {showGoogle && (
                <GoogleAuthButton
                  onSuccess={() => {
                    router.push(redirectTo);
                  }}
                  onError={(error) => setError(error)}
                />
              )}
              {showApple && (
                <AppleAuthButton
                  onSuccess={() => {
                    router.push(redirectTo);
                  }}
                  onError={(error) => setError(error)}
                />
              )}
              {!showGoogle && !showApple && (
                <p className="text-xs text-gray-500 text-center">Social logins zijn nog niet geconfigureerd.</p>
              )}
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              Terug naar home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
