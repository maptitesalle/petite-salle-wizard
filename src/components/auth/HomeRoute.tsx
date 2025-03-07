
import React, { useEffect, useState, useCallback } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Index from "@/pages/Index";
import { supabase } from "@/integrations/supabase/client";

const HomeRoute = () => {
  const { isAuthenticated, isLoading, sessionChecked, refreshSession } = useAuth();
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
    if (now - directSessionCheck.lastChecked < 3000) {
      console.log("HomeRoute - Skipping direct session check (checked recently)");
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
  }, [directSessionCheck.lastChecked, directSessionCheck.hasSession]);
  
  // Optimized session recovery for all cases
  const handleSessionRecovery = useCallback(async () => {
    if (recoveryAttempted) return;
    
    setRecoveryAttempted(true);
    console.log("HomeRoute - Attempting session recovery");
    
    const hasDirectSession = await verifySupabaseSession();
    
    if (hasDirectSession) {
      try {
        console.log("HomeRoute - Direct session found, refreshing auth context");
        await refreshSession();
      } catch (error) {
        console.error("HomeRoute - Error refreshing session", error);
      }
    } else {
      console.log("HomeRoute - No direct session found, skipping refresh");
    }
  }, [recoveryAttempted, verifySupabaseSession, refreshSession]);
  
  // Initial session check on mount - just once
  useEffect(() => {
    verifySupabaseSession();
  }, [verifySupabaseSession]);
  
  // Logs for diagnostic with optimized output
  useEffect(() => {
    console.log("Home route check:", { 
      isAuthenticated, 
      isLoading, 
      sessionChecked, 
      showTimeout,
      forceRedirect,
      directSessionComplete: directSessionCheck.isComplete,
      directSessionHasSession: directSessionCheck.hasSession,
      recoveryAttempted
    });
  }, [isAuthenticated, isLoading, sessionChecked, showTimeout, forceRedirect, directSessionCheck, recoveryAttempted]);

  // Shorter timeout for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      if ((isLoading || !sessionChecked || !directSessionCheck.isComplete) && !recoveryAttempted) {
        setShowTimeout(true);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [isLoading, sessionChecked, directSessionCheck.isComplete, recoveryAttempted]);
  
  // Auto-recovery for faster response
  useEffect(() => {
    const maxAuthWait = setTimeout(() => {
      if ((isLoading || !sessionChecked || !directSessionCheck.isComplete) && !recoveryAttempted) {
        console.log("HomeRoute - Auth check taking too long, trying session refresh");
        handleSessionRecovery();
      }
    }, 3000);
    
    // Reduced timeout for better UX
    const forceTimer = setTimeout(() => {
      if ((isLoading || !sessionChecked || !directSessionCheck.isComplete)) {
        console.log("HomeRoute - Auth check taking too long, forcing index render");
        setForceRedirect(true);
      }
    }, 5000);
    
    return () => {
      clearTimeout(maxAuthWait);
      clearTimeout(forceTimer);
    };
  }, [isLoading, sessionChecked, directSessionCheck.isComplete, recoveryAttempted, handleSessionRecovery]);
  
  // If we force the redirection after long timeout
  if (forceRedirect) {
    console.log("HomeRoute - Forcing index page render after timeout");
    return <Index />;
  }
  
  // If loading in progress
  if (isLoading || !sessionChecked || !directSessionCheck.isComplete) {
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

  // Make decision based on both auth context and direct session check
  const hasAuthentication = isAuthenticated || directSessionCheck.hasSession;
  
  // If authenticated, redirect to dashboard
  if (hasAuthentication && !isLoading && sessionChecked) {
    console.log("HomeRoute - User authenticated, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, show home page
  console.log("HomeRoute - User not authenticated, showing home page");
  return <Index />;
};

export default HomeRoute;
