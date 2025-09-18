'use client';

import { createContext, useContext, useEffect, useState } from 'react';
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
      logger.debug(`🔐 Auth state changed: ${event, session?.user?.email}`);
      
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
      
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        logger.error(`❌ AuthProvider: Login failed: ${error instanceof Error ? error.message : String(error)}`);
        return { error: error.message || 'Inloggen mislukt. Probeer het opnieuw.' };
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
        logger.debug('✅ AuthProvider: Login successful, user set');
        return {};
      }
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
