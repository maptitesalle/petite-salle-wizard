
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User, AuthError } from '@supabase/supabase-js';

// Define the user type
interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
}

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
  const [session, setSession] = useState<Session | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Fetch the user's profile from the profiles table
  const fetchUserProfile = async (authUser: User) => {
    try {
      console.log("AuthContext: Fetching user profile for id:", authUser.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', authUser.id)
        .maybeSingle();
      
      if (error) {
        console.error("AuthContext: Error fetching user profile:", error);
        throw error;
      }

      console.log("AuthContext: Profile data retrieved:", data);
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        name: data?.name || '',
      });
    } catch (error) {
      console.error('AuthContext: Error fetching user profile:', error);
      
      // Fallback to just the auth user data
      console.log("AuthContext: Using fallback user data");
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.email?.split('@')[0] || '',
      });
    } finally {
      setIsLoading(false);
      setSessionChecked(true);
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
        setSession(session);
        
        if (session?.user) {
          console.log("AuthContext: User exists in session, fetching profile", session.user);
          await fetchUserProfile(session.user);
        } else {
          console.log("AuthContext: No user in session, setting user to null");
          setUser(null);
          setIsLoading(false);
          setSessionChecked(true);
        }
      } catch (error) {
        console.error('AuthContext: Error fetching session:', error);
        setUser(null);
        setIsLoading(false);
        setSessionChecked(true);
      }
    };

    getSession();

    // Listen for auth changes
    console.log("AuthContext: Setting up auth state change listener");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("AuthContext: Auth state changed, event:", event, "session:", session ? "exists" : "null");
      setSession(session);
      setIsLoading(true);
      
      if (session?.user) {
        console.log("AuthContext: User in session after state change, fetching profile", session.user);
        await fetchUserProfile(session.user);
      } else {
        console.log("AuthContext: No user in session after state change");
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

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("AuthContext: Attempting login with email:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("AuthContext: Login failed:", error);
        throw error;
      }
      
      console.log("AuthContext: Login successful, session:", data.session ? "Session exists" : "No session");
      
      // We don't need to manually set the user here as the auth state change listener will handle it
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("AuthContext: Attempting logout");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("AuthContext: Logout failed:", error);
        throw error;
      }
      console.log("AuthContext: Logout successful");
      setUser(null);
    } catch (error) {
      console.error('AuthContext: Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
      setSessionChecked(true);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      console.log("AuthContext: Attempting registration with email:", email, "and name:", name);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      
      if (error) {
        console.error("AuthContext: Registration failed:", error);
        throw error;
      }
      
      console.log("AuthContext: Registration successful, session:", data.session ? "Session exists" : "No session");
      
      // We don't need to manually set the user here as the auth state change listener will handle it
    } catch (error) {
      console.error('AuthContext: Registration failed:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user && sessionChecked,
    isLoading,
    login,
    logout,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
