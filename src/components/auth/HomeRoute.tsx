
import React, { useEffect, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Index from "@/pages/Index";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const HomeRoute = () => {
  const { isAuthenticated, isLoading, sessionChecked, refreshSession, user } = useAuth();
  const { toast } = useToast();
  const [showTimeout, setShowTimeout] = useState(false);
  const [forceRedirect, setForceRedirect] = useState(false);
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);
  const [directSessionCheck, setDirectSessionCheck] = useState({
    isComplete: false,
    hasSession: false,
    lastChecked: 0
  });
  
  // Improved direct Supabase session check with caching
  const verifySupabaseSession = useCallback(async () => {
    // Skip if we've checked recently
    const now = Date.now();
    if (now - directSessionCheck.lastChecked < 2000) {
      return directSessionCheck.hasSession;
    }
    
    try {
      console.log("HomeRoute - Direct Supabase session check");
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      const hasValidSession = !!data.session;
      console.log(`HomeRoute - Supabase session: ${hasValidSession ? 'Valid session found' : 'No valid session'}`);
      
      setDirectSessionCheck({
        isComplete: true,
        hasSession: hasValidSession,
        lastChecked: now
      });
      
      return hasValidSession;
    } catch (error) {
      console.error("HomeRoute - Error checking Supabase session:", error);
      setDirectSessionCheck(prev => ({
        ...prev,
        isComplete: true,
        lastChecked: now
      }));
      return false;
    }
  }, [directSessionCheck.lastChecked]);
  
  // Display current state for debugging
  useEffect(() => {
    console.log("Home route check:", { 
      isAuthenticated, 
      isLoading, 
      sessionChecked,
      showTimeout,
      forceRedirect,
      recoveryAttempted,
      user: user ? 'present' : 'absent'
    });
  }, [isAuthenticated, isLoading, sessionChecked, showTimeout, forceRedirect, recoveryAttempted, user]);
  
  // Session recovery with improved feedback
  const handleSessionRecovery = useCallback(async () => {
    if (recoveryAttempted) return;
    
    setRecoveryAttempted(true);
    console.log("HomeRoute - Attempting session recovery");
    
    try {
      const hasDirectSession = await verifySupabaseSession();
      
      if (hasDirectSession) {
        console.log("HomeRoute - Direct session found, refreshing auth context");
        await refreshSession();
        console.log("HomeRoute - Session refreshed successfully");
        toast({
          title: "Session restaurée",
          description: "Votre session a été rafraîchie avec succès."
        });
      } else {
        console.log("HomeRoute - No direct session found, skipping refresh");
      }
    } catch (error) {
      console.error("HomeRoute - Failed to recover session:", error);
    }
  }, [recoveryAttempted, verifySupabaseSession, refreshSession, toast]);
  
  // Initial session check on mount - just once
  useEffect(() => {
    verifySupabaseSession();
  }, [verifySupabaseSession]);
  
  // Timers and redirects
  useEffect(() => {
    // Show timeout earlier for better UX
    const timeoutTimer = setTimeout(() => {
      if ((isLoading || !sessionChecked) && !recoveryAttempted) {
        setShowTimeout(true);
      }
    }, 2000);
    
    // Auto-recovery for faster response
    const recoveryTimer = setTimeout(() => {
      if ((isLoading || !sessionChecked) && !recoveryAttempted) {
        console.log("HomeRoute - Auth check taking too long, trying session refresh");
        handleSessionRecovery();
      }
    }, 3000);
    
    // Force index page after waiting long enough
    const forceTimer = setTimeout(() => {
      if (isLoading || !sessionChecked) {
        console.log("HomeRoute - Auth check taking too long, forcing index render");
        setForceRedirect(true);
      }
    }, 5000);
    
    return () => {
      clearTimeout(timeoutTimer);
      clearTimeout(recoveryTimer);
      clearTimeout(forceTimer);
    };
  }, [isLoading, sessionChecked, recoveryAttempted, handleSessionRecovery]);
  
  // If we force the redirection after long timeout
  if (forceRedirect) {
    console.log("HomeRoute - Forcing index page render after timeout");
    // Auto-refresh for cases where the session is stuck
    if (!recoveryAttempted) {
      console.log("Index - Auto-refreshing session after timeout");
      console.log("Attempting to refresh session");
      handleSessionRecovery();
    }
    return <Index />;
  }
  
  // If loading in progress
  if (isLoading || !sessionChecked) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="mb-4">Chargement...</div>
        {showTimeout && (
          <div className="text-sm text-mps-primary">
            <button 
              onClick={handleSessionRecovery}
              className="underline hover:text-mps-primary/80 mr-4"
              disabled={recoveryAttempted}
            >
              Restaurer la session
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="underline hover:text-mps-primary/80"
            >
              Rafraîchir la page
            </button>
          </div>
        )}
      </div>
    );
  }

  // Make decision based on authenticated state - ensure we have both isAuthenticated AND user
  if (isAuthenticated && user) {
    console.log("HomeRoute - User authenticated, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, show home page
  console.log("HomeRoute - User not authenticated, showing home page");
  return <Index />;
};

export default HomeRoute;
