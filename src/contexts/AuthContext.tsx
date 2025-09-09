import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, authHelpers } from '../services/supabase';
import { setAuthToken, removeAuthToken } from '../services/api';

// Simple type definitions
interface User {
  id: string;
  email?: string;
  [key: string]: any;
}

interface Session {
  access_token: string;
  refresh_token: string;
  user: User;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { session, error } = await authHelpers.getSession();
        if (error) {
          console.error('Error getting initial session:', error);
        } else {
          setSession(session);
          setUser(session?.user || null);
          if (session?.access_token) {
            setAuthToken(session.access_token);
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth state changes
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event: string, session: Session | null) => {
          console.log('Auth state changed:', event, session?.user?.email);
          
          setSession(session);
          setUser(session?.user || null);
          
          if (session?.access_token) {
            setAuthToken(session.access_token);
          } else {
            removeAuthToken();
          }
          
          setLoading(false);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await authHelpers.signIn(email, password);
      setLoading(false);
      return { error };
    } catch (error) {
      setLoading(false);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    try {
      const { error } = await authHelpers.signUp(email, password, displayName);
      setLoading(false);
      return { error };
    } catch (error) {
      setLoading(false);
      return { error };
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authHelpers.signOut();
      removeAuthToken();
    } catch (error) {
      console.error('Error signing out:', error);
    }
    setLoading(false);
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await authHelpers.resetPassword(email);
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};