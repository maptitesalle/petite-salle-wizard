
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfileFetcher } from './useProfileFetcher';
import { AuthUser } from './types';

export const useSessionManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { fetchUserProfile } = useProfileFetcher();

  // Process session data and retrieve user profile with caching
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

  // Get current session with optimized performance
  const getCurrentSession = async (
    setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>,
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use localStorage to check if we have a recent session first
      const cachedSession = localStorage.getItem('recent_session');
      const cachedTimestamp = localStorage.getItem('session_timestamp');
      const now = Date.now();
      
      // If we have a cached session less than 5 minutes old, use it first
      if (cachedSession && cachedTimestamp && (now - Number(cachedTimestamp)) < 300000) {
        try {
          const parsedSession = JSON.parse(cachedSession);
          if (parsedSession && parsedSession.user) {
            console.log("Using cached session for quick display");
            await processSession(parsedSession, setUser);
          }
        } catch (e) {
          console.log("Error parsing cached session, will fetch fresh one");
        }
      }
      
      // Always fetch a fresh session in parallel
      const { data, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw sessionError;
      }
      
      // Process fresh session and update cache
      if (data && data.session) {
        console.log("Valid session found:", data.session.user.id);
        // Cache the session for future quick loads
        localStorage.setItem('recent_session', JSON.stringify(data.session));
        localStorage.setItem('session_timestamp', now.toString());
        
        await processSession(data.session, setUser);
      } else {
        // No session found
        console.log("No session found");
        localStorage.removeItem('recent_session');
        localStorage.removeItem('session_timestamp');
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
      // Try to use the cached session first for super fast checking
      const cachedSession = localStorage.getItem('recent_session');
      const cachedTimestamp = localStorage.getItem('session_timestamp');
      const now = Date.now();
      
      if (cachedSession && cachedTimestamp && (now - Number(cachedTimestamp)) < 300000) {
        try {
          const parsedSession = JSON.parse(cachedSession);
          if (parsedSession && parsedSession.user) {
            console.log("Using cached session for quick check");
            return parsedSession;
          }
        } catch (e) {
          console.log("Error parsing cached session");
        }
      }
      
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      if (data.session) {
        localStorage.setItem('recent_session', JSON.stringify(data.session));
        localStorage.setItem('session_timestamp', now.toString());
      }
      
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
