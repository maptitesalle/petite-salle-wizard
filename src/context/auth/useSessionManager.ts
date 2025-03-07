
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

  // Get current session with safer timeout handling
  const getCurrentSession = async (
    setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>,
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create a timeout promise
      let timeoutId: ReturnType<typeof setTimeout>;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          console.error("Session check timed out");
          reject(new Error("Session check timed out"));
        }, 5000); // 5 second timeout
      });
      
      // Attempt to get the session
      const sessionPromise = supabase.auth.getSession();
      
      // Race them
      try {
        const result = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as { data: any, error: any };
        
        clearTimeout(timeoutId);
        
        if (result.error) {
          throw result.error;
        }
        
        // If we have a session, process it
        if (result.data && result.data.session) {
          await processSession(result.data.session, setUser);
          return result.data.session;
        } else {
          // No session found
          setUser(null);
          return null;
        }
      } catch (raceError) {
        clearTimeout(timeoutId);
        throw raceError;
      }
    } catch (error) {
      console.error("Error getting session:", error);
      setError(error as Error);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Simple direct session check without user profile fetching
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
