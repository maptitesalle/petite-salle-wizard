
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

  // Get current session with timeout protection
  const getCurrentSession = async (
    setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>,
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error("Session check timed out"));
        }, 5000); // 5 second timeout
        return () => clearTimeout(timeoutId);
      });
      
      // Attempt to get the session
      const sessionPromise = supabase.auth.getSession();
      
      // Race them
      const result = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]) as { data: any, error: any };
      
      if (result.error) {
        throw result.error;
      }
      
      await processSession(result.data.session, setUser);
      return result.data.session;
    } catch (error) {
      console.error("Error getting session:", error);
      setError(error as Error);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    getCurrentSession,
    processSession
  };
};
