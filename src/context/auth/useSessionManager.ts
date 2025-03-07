
import { Session } from '@supabase/supabase-js';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfileFetcher } from './useProfileFetcher';
import { AuthUser } from './types';

export const useSessionManager = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionError, setSessionError] = useState<Error | null>(null);
  const { fetchUserProfile } = useProfileFetcher();

  // Process session data and update state
  const processSession = async (
    newSession: Session | null,
    setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setSessionChecked: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setSession(newSession);
    
    if (newSession?.user) {
      try {
        const userData = await fetchUserProfile(newSession.user);
        setUser(userData);
        setIsLoading(false);
        setSessionChecked(true);
      } catch (error) {
        console.error("AuthContext: Error processing session user:", error);
        setUser(null);
        setIsLoading(false);
        setSessionChecked(true);
      }
    } else {
      setUser(null);
      setIsLoading(false);
      setSessionChecked(true);
    }
  };

  // Function to refresh the session
  const refreshSession = async (
    setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setSessionChecked: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setIsLoading(true);
    setSessionError(null);
    
    try {
      console.log("AuthContext: Manually refreshing session");
      
      // First try to refresh the session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error("AuthContext: Session refresh failed:", refreshError);
        throw refreshError;
      }
      
      await processSession(refreshData.session, setUser, setIsLoading, setSessionChecked);
    } catch (error) {
      console.error("AuthContext: Error refreshing session:", error);
      // If refresh fails, try to get fresh session
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        await processSession(sessionData.session, setUser, setIsLoading, setSessionChecked);
      } catch (finalError) {
        console.error("AuthContext: Complete session refresh failure:", finalError);
        setSessionError(finalError as Error);
        setUser(null);
        setSession(null);
        setIsLoading(false);
        setSessionChecked(true);
      }
    }
  };

  return {
    session,
    sessionError,
    processSession,
    refreshSession
  };
};
