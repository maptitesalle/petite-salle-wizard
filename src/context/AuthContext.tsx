
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
  const [visibilityHidden, setVisibilityHidden] = useState(false);

  const { fetchUserProfile } = useProfileFetcher();
  const { processSession, refreshSession } = useSessionManager();
  const { login: authLogin, logout: authLogout, register: authRegister } = useAuthOperations();

  // Rate limit session checks
  const shouldCheckSession = () => {
    const now = Date.now();
    const minInterval = 1000; // 1 second minimum between checks
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
      console.log('AuthContext: Manually refreshing session');
      await refreshSession(setUser, setIsLoading, setSessionChecked);
    } finally {
      setSessionCheckInProgress(false);
    }
  };

  // Login function with explicit Promise<void> return type
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await authLogin(email, password);
      if (!result?.session) {
        console.warn("AuthContext: Login successful but no session returned");
      }
      // Wait for auth state change to process the user
      return new Promise<void>(resolve => {
        const timeout = setTimeout(() => {
          setIsLoading(false);
          resolve();
        }, 1000);
        return () => clearTimeout(timeout);
      });
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  // Logout function with explicit Promise<void> return type
  const logout = async (): Promise<void> => {
    try {
      await authLogout();
      setUser(null);
      setSessionChecked(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Register function with explicit Promise<void> return type
  const register = async (email: string, password: string, name: string): Promise<void> => {
    setIsLoading(true);
    try {
      await authRegister(email, password, name);
      // Wait for auth state change to process the user
      return new Promise<void>(resolve => {
        const timeout = setTimeout(() => {
          setIsLoading(false);
          resolve();
        }, 1000);
        return () => clearTimeout(timeout);
      });
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  // Get initial session only once on mount
  useEffect(() => {
    let isMounted = true;
    
    const getInitialSession = async () => {
      if (!shouldCheckSession() || !isMounted) return;
      
      setSessionCheckInProgress(true);
      setLastSessionCheck(Date.now());
      
      try {
        console.log("AuthContext: Fetching initial session");
        const { data, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error("AuthContext: Error fetching initial session", error);
          throw error;
        }

        await processSession(data.session, setUser, setIsLoading, setSessionChecked);
      } catch (error) {
        console.error('AuthContext: Error in initial session fetch:', error);
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
          setSessionChecked(true);
        }
      } finally {
        if (isMounted) {
          setSessionCheckInProgress(false);
        }
      }
    };

    getInitialSession();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle page visibility changes to refresh session when user returns to the app
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && visibilityHidden) {
        console.log("Page visibility changed to visible after extended period, refreshing auth");
        setVisibilityHidden(false);
        handleRefreshSession();
      } else if (document.visibilityState === 'hidden') {
        setVisibilityHidden(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [visibilityHidden]);

  // Auth state change listener with improved handling
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
