
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, AuthUser } from './auth/types';
import { useProfileFetcher } from './auth/useProfileFetcher';
import { useSessionManager } from './auth/useSessionManager';
import { useAuthOperations } from './auth/useAuthOperations';

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // State
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [authStateChangeCount, setAuthStateChangeCount] = useState(0);

  // Custom hooks
  const { fetchUserProfile } = useProfileFetcher();
  const { processSession, refreshSession } = useSessionManager();
  const { login: authLogin, logout: authLogout, register: authRegister } = useAuthOperations();

  // Wrap the refreshSession function to provide state setters
  const handleRefreshSession = async () => {
    await refreshSession(setUser, setIsLoading, setSessionChecked);
  };

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await authLogin(email, password);
      // The auth state change listener will handle updating the user
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authLogout();
      setUser(null);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
      setSessionChecked(true);
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      await authRegister(email, password, name);
      // The auth state change listener will handle updating the user
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  useEffect(() => {
    // Get the current session
    const getSession = async () => {
      setIsLoading(true);
      try {
        console.log("AuthContext: Fetching initial session");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("AuthContext: Error fetching session", error);
          throw error;
        }

        console.log("AuthContext: Session retrieved", session ? "Session exists" : "No session");
        await processSession(session, setUser, setIsLoading, setSessionChecked);
      } catch (error) {
        console.error('AuthContext: Error fetching session:', error);
        setUser(null);
        setIsLoading(false);
        setSessionChecked(true);
      }
    };

    // Initialize by getting the current session
    getSession();

    // Listen for auth changes
    console.log("AuthContext: Setting up auth state change listener");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      // Increment the auth state change counter to track changes
      setAuthStateChangeCount(prev => prev + 1);
      
      console.log(`AuthContext: Auth state changed (#${authStateChangeCount + 1}), event:`, event, "session:", newSession ? "exists" : "null");
      
      setIsLoading(true);
      await processSession(newSession, setUser, setIsLoading, setSessionChecked);
    });

    return () => {
      console.log("AuthContext: Cleaning up auth state change listener");
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    isAuthenticated: !!user && sessionChecked,
    isLoading,
    sessionChecked,
    login,
    logout,
    register,
    refreshSession: handleRefreshSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
