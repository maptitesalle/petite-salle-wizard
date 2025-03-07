
import { supabase } from '@/integrations/supabase/client';

export const useAuthOperations = () => {
  const login = async (email: string, password: string) => {
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
      
      return data;
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
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
      return;
    } catch (error) {
      console.error('AuthContext: Logout failed:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
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
      
      return data;
    } catch (error) {
      console.error('AuthContext: Registration failed:', error);
      throw error;
    }
  };

  return {
    login,
    logout,
    register
  };
};
