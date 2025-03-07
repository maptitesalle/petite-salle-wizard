
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfileFetcher } from './useProfileFetcher';
import { AuthUser } from './types';

export const useSessionManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { fetchUserProfile } = useProfileFetcher();

  // Process session data and retrieve user profile
  const processSession = async (
    session: any,
    setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>,
  ) => {
    if (!session?.user) {
      setUser(null);
      return;
    }
    
    try {
      console.log("Processing session for user:", session.user.id);
      const userData = await fetchUserProfile(session.user);
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUser(null);
    }
  };

  // Get current session safely without timeouts
  const getCurrentSession = async (
    setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>,
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw sessionError;
      }
      
      // Process session if we have one
      if (data && data.session) {
        console.log("Valid session found:", data.session.user.id);
        await processSession(data.session, setUser);
      } else {
        // No session found
        console.log("No session found");
        setUser(null);
      }
      
      return data.session;
    } catch (error) {
      console.error("Error getting session:", error);
      setError(error as Error);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Direct session check without user profile retrieval
  const checkSessionOnly = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (error) {
      console.error("Direct session check error:", error);
      return null;
    }
  };

  return {
    isLoading,
    error,
    getCurrentSession,
    processSession,
    checkSessionOnly
  };
};
