
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
        console.log("AuthContext: Processing valid session for user:", newSession.user.id);
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
      console.log("AuthContext: No valid session found");
      setUser(null);
      setIsLoading(false);
      setSessionChecked(true);
    }
  };

  // Function to refresh the session with improved reliability
  const refreshSession = async (
    setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setSessionChecked: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setIsLoading(true);
    setSessionError(null);
    
    try {
      console.log("AuthContext: Refreshing session");
      
      // Try to get the existing session first
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("AuthContext: Error getting session:", sessionError);
        throw sessionError;
      }
      
      if (sessionData.session) {
        console.log("AuthContext: Using existing session");
        await processSession(sessionData.session, setUser, setIsLoading, setSessionChecked);
        return;
      }
      
      console.log("AuthContext: No existing session, attempting refresh");
      
      try {
        // Try to refresh the session with error handling
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error("AuthContext: Session refresh failed:", refreshError);
          
          // Handle the "Auth session missing" error gracefully
          if (refreshError.message?.includes('Auth session missing')) {
            console.log("AuthContext: No session to refresh, this is expected behavior");
            await processSession(null, setUser, setIsLoading, setSessionChecked);
            return;
          }
          
          throw refreshError;
        }
        
        await processSession(refreshData.session, setUser, setIsLoading, setSessionChecked);
      } catch (refreshErr: any) {
        // Handle "Auth session missing" error gracefully
        if (refreshErr.message?.includes('Auth session missing')) {
          console.log("AuthContext: No session to refresh, this is expected behavior");
          await processSession(null, setUser, setIsLoading, setSessionChecked);
        } else {
          throw refreshErr;
        }
      }
      
    } catch (error) {
      console.error("AuthContext: Complete session refresh failure:", error);
      setSessionError(error as Error);
      setUser(null);
      setSession(null);
      setIsLoading(false);
      setSessionChecked(true);
    }
  };

  return {
    session,
    sessionError,
    processSession,
    refreshSession
  };
};
