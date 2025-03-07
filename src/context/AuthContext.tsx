
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, AuthUser } from './auth/types';
import { useSessionManager } from './auth/useSessionManager';
import { useAuthOperations } from './auth/useAuthOperations';
import { useToast } from '@/hooks/use-toast';

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
  const [initComplete, setInitComplete] = useState(false);
  const { toast } = useToast();
  
  const { getCurrentSession, processSession } = useSessionManager();
  const { login: authLogin, logout: authLogout, register: authRegister } = useAuthOperations();

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const result = await authLogin(email, password);
      if (!result?.session) {
        throw new Error("Login successful but no session returned");
      }
      await processSession(result.session, setUser);
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur Ma P'tite Salle",
      });
      return;
    } catch (error: any) {
      console.error("Login error:", error);
      let message = "Erreur de connexion";
      if (error.message?.includes('Invalid login credentials')) {
        message = "Identifiants invalides";
      }
      toast({
        variant: "destructive",
        title: "Erreur",
        description: message,
      });
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await authLogout();
      setUser(null);
      toast({
        title: "Déconnexion réussie",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Erreur de déconnexion",
      });
      throw error;
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string): Promise<void> => {
    try {
      await authRegister(email, password, name);
      toast({
        title: "Inscription réussie",
        description: "Veuillez vous connecter",
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      let message = "Erreur d'inscription";
      if (error.message?.includes('User already registered')) {
        message = "Cet email est déjà utilisé";
      }
      toast({
        variant: "destructive",
        title: "Erreur",
        description: message,
      });
      throw error;
    }
  };

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      
      try {
        await getCurrentSession(setUser);
      } catch (error) {
        console.error('Error in initial session fetch:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setInitComplete(true);
        }
      }
    };

    initAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth state changed: ${event}`);
      if (isMounted) {
        try {
          await processSession(session, setUser);
        } catch (error) {
          console.error("Error processing auth state change:", error);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    sessionChecked: initComplete,
    login,
    logout,
    register,
    refreshSession: async () => await getCurrentSession(setUser)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
