
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, AuthUser } from './auth/types';
import { useSessionManager } from './auth/useSessionManager';
import { useAuthOperations } from './auth/useAuthOperations';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';

// Default context
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  sessionChecked: false,
  login: async () => { throw new Error('Not implemented'); },
  logout: async () => { throw new Error('Not implemented'); },
  register: async () => { throw new Error('Not implemented'); },
  refreshSession: async () => { throw new Error('Not implemented'); }
});

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
  const { toast } = useToast();
  
  const { getCurrentSession, processSession } = useSessionManager();
  const { login: authLogin, logout: authLogout, register: authRegister } = useAuthOperations();

  // Get cached user on first render for immediate UI display
  useEffect(() => {
    try {
      const cachedUserData = localStorage.getItem('user_data');
      const userTimestamp = localStorage.getItem('user_timestamp');
      const now = Date.now();
      
      if (cachedUserData && userTimestamp && (now - Number(userTimestamp)) < 300000) {
        try {
          const parsedUserData = JSON.parse(cachedUserData);
          if (parsedUserData && parsedUserData.id) {
            console.log("AuthContext: Using cached user data on first render");
            setUser(parsedUserData);
          }
        } catch (e) {
          console.log("AuthContext: Error parsing cached user data");
        }
      }
    } catch (e) {
      console.error("AuthContext: Error checking user cache", e);
    }
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log("AuthContext: Attempting login with email:", email);
      const result = await authLogin(email, password);
      if (!result?.session) {
        throw new Error("Login successful but no session returned");
      }
      await processSession(result.session, setUser);
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur Ma P'tite Salle",
      });
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
      
      // Clear all auth caches on logout
      localStorage.removeItem('recent_session');
      localStorage.removeItem('session_timestamp');
      localStorage.removeItem('user_data');
      localStorage.removeItem('user_timestamp');
      
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

  // Refresh session function with visual notification
  const refreshSession = async (): Promise<void> => {
    setIsLoading(true);
    sonnerToast.loading("Vérification de la session...");
    
    try {
      const session = await getCurrentSession(setUser);
      if (session) {
        console.log("Session refreshed successfully");
        sonnerToast.success("Session restaurée");
      } else {
        console.log("No active session found during refresh");
        sonnerToast.error("Aucune session trouvée");
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
      sonnerToast.error("Erreur lors du rafraîchissement de la session");
    } finally {
      setIsLoading(false);
      setSessionChecked(true);
    }
  };

  // Initialize auth state with fast cache first approach
  useEffect(() => {
    let isMounted = true;
    console.log("AuthContext: Getting current session");
    
    const initAuth = async () => {
      if (!isMounted) return;
      
      try {
        setIsLoading(true);
        
        // Try optimized session check
        await getCurrentSession(setUser);
      } catch (error) {
        console.error('Error in initial session fetch:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setSessionChecked(true);
        }
      }
    };

    // Initialize auth immediately
    initAuth();
    
    // Set up listener for auth state changes
    console.log("AuthContext: Setting up auth state change listener");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`AuthContext: Auth state changed, event: ${event}`);
      
      if (!isMounted) return;
      
      try {
        if (session) {
          console.log("AuthContext: Processing valid session for user:", session.user.id);
          
          // Update cache
          localStorage.setItem('recent_session', JSON.stringify(session));
          localStorage.setItem('session_timestamp', Date.now().toString());
          
          await processSession(session, setUser);
        } else if (event === 'SIGNED_OUT') {
          console.log("AuthContext: User signed out, clearing user data");
          setUser(null);
          
          // Clear all auth caches on signout
          localStorage.removeItem('recent_session');
          localStorage.removeItem('session_timestamp');
          localStorage.removeItem('user_data');
          localStorage.removeItem('user_timestamp');
        }
      } catch (error) {
        console.error("Error processing auth state change:", error);
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
    sessionChecked,
    login,
    logout,
    register,
    refreshSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
