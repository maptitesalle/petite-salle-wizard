
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, AuthUser } from './auth/types';
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

  const { getCurrentSession, processSession } = useSessionManager();
  const { login: authLogin, logout: authLogout, register: authRegister } = useAuthOperations();

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await authLogin(email, password);
      if (!result?.session) {
        throw new Error("Login successful but no session returned");
      }
      // Session change will be detected by the auth state listener
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authLogout();
      setUser(null);
      setSessionChecked(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string): Promise<void> => {
    setIsLoading(true);
    try {
      await authRegister(email, password, name);
      // Session change will be detected by the auth state listener
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  // Get initial session on mount
  useEffect(() => {
    let isMounted = true;
    
    const getInitialSession = async () => {
      if (!isMounted) return;
      
      try {
        await getCurrentSession(setUser, setIsLoading, setSessionChecked);
      } catch (error) {
        console.error('AuthContext: Error in initial session fetch:', error);
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
          setSessionChecked(true);
        }
      }
    };

    getInitialSession();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Auth state change listener
  useEffect(() => {
    console.log("AuthContext: Setting up auth state change listener");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log(`AuthContext: Auth state changed, event: ${event}`);
      
      try {
        await processSession(newSession, setUser, setIsLoading, setSessionChecked);
      } catch (error) {
        console.error("AuthContext: Error processing auth state change:", error);
        setUser(null);
        setIsLoading(false);
        setSessionChecked(true);
      }
    });

    return () => {
      console.log("AuthContext: Cleaning up auth state change listener");
      subscription.unsubscribe();
    };
  }, []);

  // Manual session refresh function
  const refreshSession = async (): Promise<void> => {
    try {
      console.log('AuthContext: Manually refreshing session');
      await getCurrentSession(setUser, setIsLoading, setSessionChecked);
    } catch (error) {
      console.error('AuthContext: Error refreshing session:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && sessionChecked,
    isLoading,
    sessionChecked,
    login,
    logout,
    register,
    refreshSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
