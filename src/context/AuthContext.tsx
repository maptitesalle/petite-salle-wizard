
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [sessionCheckInProgress, setSessionCheckInProgress] = useState(false);
  const [lastSessionCheck, setLastSessionCheck] = useState<number>(0);

  const { fetchUserProfile } = useProfileFetcher();
  const { processSession, refreshSession } = useSessionManager();
  const { login: authLogin, logout: authLogout, register: authRegister } = useAuthOperations();

  // Limiter la fréquence des vérifications de session
  const shouldCheckSession = () => {
    const now = Date.now();
    const minInterval = 2000; // 2 secondes minimum entre les vérifications
    return !sessionCheckInProgress && (now - lastSessionCheck > minInterval);
  };

  const handleRefreshSession = async () => {
    if (!shouldCheckSession()) {
      console.log('AuthContext: Skipping session refresh - too frequent or check in progress');
      return;
    }

    setSessionCheckInProgress(true);
    setLastSessionCheck(Date.now());

    try {
      await refreshSession(setUser, setIsLoading, setSessionChecked);
    } finally {
      setSessionCheckInProgress(false);
    }
  };

  // Modified login to match the return type in AuthContextType (Promise<void>)
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      await authLogin(email, password);
      // Attendre explicitement la mise à jour de l'état d'authentification
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authLogout();
      setUser(null);
    } finally {
      setIsLoading(false);
      setSessionChecked(true);
    }
  };

  // Modified register to match the return type in AuthContextType (Promise<void>)
  const register = async (email: string, password: string, name: string): Promise<void> => {
    setIsLoading(true);
    try {
      await authRegister(email, password, name);
    } finally {
      setIsLoading(false);
    }
  };

  // Get initial session only once on mount
  useEffect(() => {
    const getInitialSession = async () => {
      if (!shouldCheckSession()) return;
      
      setSessionCheckInProgress(true);
      setLastSessionCheck(Date.now());
      
      try {
        console.log("AuthContext: Fetching initial session");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("AuthContext: Error fetching initial session", error);
          throw error;
        }

        await processSession(session, setUser, setIsLoading, setSessionChecked);
      } catch (error) {
        console.error('AuthContext: Error in initial session fetch:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
        setSessionChecked(true);
        setSessionCheckInProgress(false);
      }
    };

    getInitialSession();
  }, []);

  // Auth state change listener
  useEffect(() => {
    console.log("AuthContext: Setting up auth state change listener");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log(`AuthContext: Auth state changed, event: ${event}`);
      
      if (!shouldCheckSession()) {
        console.log('AuthContext: Skipping auth state change processing - too frequent');
        return;
      }
      
      setSessionCheckInProgress(true);
      setLastSessionCheck(Date.now());
      
      try {
        await processSession(newSession, setUser, setIsLoading, setSessionChecked);
      } finally {
        setSessionCheckInProgress(false);
      }
    });

    return () => {
      console.log("AuthContext: Cleaning up auth state change listener");
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
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
