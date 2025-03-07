
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
      } catch (error) {
        console.error("AuthContext: Error processing session user:", error);
        setUser(null);
        // Tentative de récupération en cas d'erreur de profil
        try {
          await supabase.auth.refreshSession();
        } catch (refreshError) {
          console.error("AuthContext: Failed to refresh session after profile error:", refreshError);
        }
      } finally {
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

  // Function to get the current session
  const getCurrentSession = async (
    setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setSessionChecked: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setIsLoading(true);
    setSessionError(null);
    
    try {
      console.log("AuthContext: Getting current session");
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("AuthContext: Error getting session:", sessionError);
        
        // Tentative de récupération de session en cas d'erreur
        if (sessionError.message.includes("Auth session missing") || 
            sessionError.message.includes("JWT expired")) {
          console.log("AuthContext: Attempting to refresh expired session");
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error("AuthContext: Failed to refresh expired session:", refreshError);
            throw refreshError;
          }
          
          if (refreshData.session) {
            console.log("AuthContext: Successfully refreshed session");
            await processSession(refreshData.session, setUser, setIsLoading, setSessionChecked);
            return;
          }
        }
        
        throw sessionError;
      }
      
      await processSession(sessionData.session, setUser, setIsLoading, setSessionChecked);
    } catch (error) {
      console.error("AuthContext: Error getting current session:", error);
      setSessionError(error as Error);
      setUser(null);
      setSession(null);
      setIsLoading(false);
      setSessionChecked(true);
    }
  };

  // Force refresh the session (can be called manually)
  const refreshSession = async (
    setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setSessionChecked: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setIsLoading(true);
    
    try {
      console.log("AuthContext: Manually refreshing Supabase session");
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error("AuthContext: Error refreshing session:", error);
        throw error;
      }
      
      await processSession(data.session, setUser, setIsLoading, setSessionChecked);
    } catch (error) {
      console.error("AuthContext: Failed to refresh session:", error);
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
    getCurrentSession,
    refreshSession
  };
};
