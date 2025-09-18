'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
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
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 AuthProvider: Attempting login for:', email);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      console.log('🔐 AuthProvider: Login response status:', response.status);
      
      const data = await response.json();
      console.log('🔐 AuthProvider: Login response data:', data);

      if (response.ok) {
        setUser(data.user);
        console.log('✅ AuthProvider: Login successful, user set');
        return {};
      } else {
        console.error('❌ AuthProvider: Login failed with status:', response.status, 'Error:', data.error);
        // Use the user-friendly error message from the API
        return { error: data.error || 'Inloggen mislukt. Probeer het opnieuw.' };
      }
    } catch (error) {
      console.error('💥 AuthProvider: Network error during login:', error);
      return { error: 'Verbindingsprobleem. Controleer je internetverbinding en probeer het opnieuw.' };
    }
  };

  const signUp = async (email: string, password: string, full_name: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return {};
      } else {
        // Use the user-friendly error message from the API
        return { error: data.error || 'Registratie mislukt. Probeer het opnieuw.' };
      }
    } catch (error) {
      console.error('Network error during registration:', error);
      return { error: 'Verbindingsprobleem. Controleer je internetverbinding en probeer het opnieuw.' };
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
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
