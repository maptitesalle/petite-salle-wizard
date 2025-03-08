
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
      
      // Cache the processed user data for quicker access
      try {
        localStorage.setItem('user_data', JSON.stringify(userData));
        localStorage.setItem('user_timestamp', Date.now().toString());
      } catch (e) {
        console.warn("Failed to cache user data:", e);
      }
      
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
      // First, check if we have cached user data
      try {
        const cachedUserData = localStorage.getItem('user_data');
        const cachedTimestamp = localStorage.getItem('user_timestamp');
        const now = Date.now();
        
        // If we have cached user data less than 5 minutes old, use it first for immediate display
        if (cachedUserData && cachedTimestamp && (now - Number(cachedTimestamp)) < 300000) {
          try {
            const parsedUserData = JSON.parse(cachedUserData);
            if (parsedUserData && parsedUserData.id) {
              console.log("Using cached user data for quick display");
              setUser(parsedUserData);
            }
          } catch (e) {
            console.log("Error parsing cached user data, will fetch fresh one");
          }
        }
      } catch (e) {
        console.warn("Error accessing localStorage for user data:", e);
      }
      
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
        localStorage.removeItem('user_data');
        localStorage.removeItem('user_timestamp');
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
      
      // Use preflight check to avoid full session fetch if possible
      const cachedUserData = localStorage.getItem('user_data');
      if (cachedUserData) {
        try {
          // Try a lightweight RPC call to verify active session
          const { data, error } = await supabase.rpc('get_auth_status');
          if (!error && data === true) {
            console.log("Session verified via lightweight check");
            return JSON.parse(cachedSession || '{}');
          }
        } catch (e) {
          console.log("Error with preflight check, falling back to full session fetch");
        }
      }
      
      // Fall back to full session fetch
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      if (data.session) {
        localStorage.setItem('recent_session', JSON.stringify(data.session));
        localStorage.setItem('session_timestamp', now.toString());
      } else {
        localStorage.removeItem('recent_session');
        localStorage.removeItem('session_timestamp');
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
