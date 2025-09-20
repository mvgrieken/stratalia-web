'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { logger } from '@/lib/logger';
import { getSupabaseClient } from '@/lib/supabase-client';

interface User {
  id: string;
  email: string;
  name: string;
  role?: 'user' | 'moderator' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  // eslint-disable-next-line no-unused-vars
  signIn: (_email: string, _password: string) => Promise<{ error?: string }>;
  // eslint-disable-next-line no-unused-vars
  signUp: (_email: string, _password: string, _full_name: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkSession();

    // Listen for auth state changes
    const supabase = getSupabaseClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      logger.debug(`🔐 Auth state changed: ${event} ${session?.user?.email ?? ''}`);
      
      if (event === 'SIGNED_IN' && session?.user) {
        // Get user profile from our API
        fetch('/api/auth/me')
          .then(response => response.ok ? response.json() : null)
          .then(userData => {
            if (userData?.user) {
              setUser(userData.user);
            } else {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.full_name || '',
            role: 'user'
              });
            }
          })
          .catch(() => {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.full_name || '',
              role: 'user'
            });
          });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        logger.error(`Session check failed: ${error instanceof Error ? error.message : String(error)}`);
        setUser(null);
      } else if (session?.user) {
        // Get user profile from our API
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
        } else {
          // Fallback to session user data
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || '',
            role: 'user'
          });
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      logger.error(`Session check failed: ${error instanceof Error ? error.message : String(error)}`);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      logger.debug(`🔐 AuthProvider: Attempting login for: ${email}`);

      // Primary: pages/api Node endpoint; if blocked on custom domain, proxy to Vercel subdomain
      const res = await fetch('/api/auth/login-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, redirect_to: '/dashboard' })
      });

      if (!res.ok && res.status !== 303) {
        // Try proxy as fallback (custom-domain POST may be blocked)
        const proxy = await fetch('/api/auth/proxy-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, redirect_to: '/dashboard' }),
        });
        if (!proxy.ok && proxy.status !== 303) {
          // Final fallback: client-side login, then attach session via GET
          try {
            const supabase = getSupabaseClient();
            const { data, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
            if (signInErr || !data?.session) {
              const raw = String(signInErr?.message || 'Inloggen mislukt. Probeer het opnieuw.');
              let message = 'Inloggen mislukt. Controleer je gegevens.';
              if (raw.includes('Invalid login credentials')) {
                message = 'Ongeldige inloggegevens. Controleer je e-mail en wachtwoord.';
              } else if (raw.includes('Email not confirmed') || raw.toLowerCase().includes('not confirmed')) {
                message = 'Je e-mailadres is nog niet bevestigd. Controleer je inbox.';
              } else if (raw.includes('Too many requests')) {
                message = 'Te veel pogingen. Wacht even voordat je opnieuw probeert.';
              }
              return { error: message };
            }
            // Attach session cookies to server via GET (works on POST-blocked domains)
            await fetch('/api/auth/attach-session', {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${data.session.access_token}`,
                'x-refresh-token': data.session.refresh_token ?? '',
              },
              cache: 'no-store',
            });
          } catch (fallbackErr) {
            logger.error(`AuthProvider: client fallback failed: ${fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr)}`);
            return { error: 'Inloggen mislukt. Probeer het opnieuw.' };
          }
        }
        // Proxy or client fallback succeeded; continue
      }
      
      // Success: on 303 redirect, browser will navigate. For SPA feel, also fetch user.
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
        }
      } catch (fetchError) {
        logger.error(`AuthProvider: post-login profile fetch failed: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
      }
      logger.debug('✅ AuthProvider: Login successful via server route');
      return {};
    } catch (error) {
      logger.error(`💥 AuthProvider: Network error during login: ${error instanceof Error ? error.message : String(error)}`);
      return { error: 'Verbindingsprobleem. Controleer je internetverbinding en probeer het opnieuw.' };
    }
  };

  const signUp = async (email: string, password: string, full_name: string) => {
    try {
      logger.debug(`🔐 AuthProvider: Attempting registration for: ${email}`);
      
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
          data: {
            full_name
          }
        }
      });

      if (error) {
        logger.error(`❌ AuthProvider: Registration failed: ${error instanceof Error ? error.message : String(error)}`);
        return { error: error.message || 'Registratie mislukt. Probeer het opnieuw.' };
      }

      if (data.user) {
        // Get user profile from our API
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
        } else {
          // Fallback to session user data
          setUser({
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.full_name || '',
            role: 'user'
          });
        }
        logger.debug('✅ AuthProvider: Registration successful, user set');
        return {};
      }
    } catch (error) {
      logger.error(`💥 AuthProvider: Network error during registration: ${error instanceof Error ? error.message : String(error)}`);
      return { error: 'Verbindingsprobleem. Controleer je internetverbinding en probeer het opnieuw.' };
    }
    return { error: 'Registratie mislukt. Probeer het opnieuw.' };
  };

  const signOut = async () => {
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      logger.error(`Logout failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
