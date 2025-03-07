
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Index from "@/pages/Index";
import { supabase } from "@/integrations/supabase/client";

const HomeRoute = () => {
  const { isAuthenticated, isLoading, sessionChecked, refreshSession } = useAuth();
  const [showTimeout, setShowTimeout] = useState(false);
  const [forceRedirect, setForceRedirect] = useState(false);
  const [localSessionCheck, setLocalSessionCheck] = useState(true);
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);
  
  // Vérification locale de session au montage du composant
  useEffect(() => {
    const verifySession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log("HomeRoute - Local session check:", data.session ? "Session exists" : "No session");
        setLocalSessionCheck(false);
      } catch (error) {
        console.error("HomeRoute - Error checking local session:", error);
        setLocalSessionCheck(false);
      }
    };
    
    verifySession();
  }, []);
  
  console.log("Home route check:", { 
    isAuthenticated, 
    isLoading, 
    sessionChecked, 
    showTimeout,
    forceRedirect,
    localSessionCheck,
    recoveryAttempted
  });

  // Add a timeout of 3 seconds to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if ((isLoading || !sessionChecked || localSessionCheck) && !recoveryAttempted) {
        setShowTimeout(true);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [isLoading, sessionChecked, localSessionCheck, recoveryAttempted]);
  
  // Add a maximum wait time for auth check (8 seconds)
  useEffect(() => {
    const maxAuthWait = setTimeout(() => {
      if ((isLoading || !sessionChecked || localSessionCheck) && !recoveryAttempted) {
        console.log("Auth check taking too long, trying session refresh");
        handleSessionRecovery();
      }
    }, 5000);
    
    const forceTimer = setTimeout(() => {
      if ((isLoading || !sessionChecked || localSessionCheck)) {
        console.log("Auth check taking too long, forcing a refresh");
        // Force redirect to home even if auth isn't ready
        setForceRedirect(true);
      }
    }, 10000);
    
    return () => {
      clearTimeout(maxAuthWait);
      clearTimeout(forceTimer);
    };
  }, [isLoading, sessionChecked, localSessionCheck, recoveryAttempted]);
  
  const handleSessionRecovery = async () => {
    if (recoveryAttempted) return;
    
    setRecoveryAttempted(true);
    console.log("HomeRoute - Attempting session recovery");
    
    try {
      await refreshSession();
      console.log("HomeRoute - Session refreshed successfully");
    } catch (error) {
      console.error("HomeRoute - Error refreshing session", error);
    }
  };
  
  // Si on force la redirection après un timeout long
  if (forceRedirect) {
    console.log("Forcing index page render after timeout");
    return <Index />;
  }
  
  // Si chargement en cours
  if (isLoading || !sessionChecked || localSessionCheck) {
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

  // If authenticated, redirect to dashboard
  if (isAuthenticated && !isLoading && sessionChecked) {
    console.log("User authenticated, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, show the Index page
  console.log("User not authenticated, showing home page");
  return <Index />;
};

export default HomeRoute;
