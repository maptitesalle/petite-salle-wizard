
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
  const [localSessionCheck, setLocalSessionCheck] = useState({ 
    isChecking: true,
    hasSession: false,
    error: null as Error | null 
  });
  
  // Vérification directe de session avec Supabase
  const verifySupabaseSession = useCallback(async () => {
    try {
      console.log("HomeRoute - Direct Supabase session check");
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      const hasValidSession = !!data.session;
      console.log(`HomeRoute - Supabase session: ${hasValidSession ? 'Valid session found' : 'No valid session'}`);
      
      setLocalSessionCheck({
        isChecking: false,
        hasSession: hasValidSession,
        error: null
      });
      
      // Si inconsistance entre état local et Supabase
      if (hasValidSession !== isAuthenticated && !isLoading && sessionChecked) {
        console.warn("HomeRoute - Auth state inconsistent with Supabase session, refreshing");
        handleSessionRecovery();
      }
      
      return hasValidSession;
    } catch (error) {
      console.error("HomeRoute - Error checking Supabase session:", error);
      setLocalSessionCheck({
        isChecking: false,
        hasSession: false,
        error: error as Error
      });
      return false;
    }
  }, [isAuthenticated, isLoading, sessionChecked]);
  
  // Vérification initiale de session
  useEffect(() => {
    verifySupabaseSession();
  }, [verifySupabaseSession]);
  
  // Logs de diagnostic
  useEffect(() => {
    console.log("Home route check:", { 
      isAuthenticated, 
      isLoading, 
      sessionChecked, 
      showTimeout,
      forceRedirect,
      localSessionState: localSessionCheck,
      recoveryAttempted
    });
  }, [isAuthenticated, isLoading, sessionChecked, showTimeout, forceRedirect, localSessionCheck, recoveryAttempted]);

  // Délai court pour montrer timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if ((isLoading || !sessionChecked || localSessionCheck.isChecking) && !recoveryAttempted) {
        setShowTimeout(true);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [isLoading, sessionChecked, localSessionCheck.isChecking, recoveryAttempted]);
  
  // Délai intermédiaire pour récupération auto
  useEffect(() => {
    const maxAuthWait = setTimeout(() => {
      if ((isLoading || !sessionChecked || localSessionCheck.isChecking) && !recoveryAttempted) {
        console.log("HomeRoute - Auth check taking too long, trying session refresh");
        handleSessionRecovery();
      }
    }, 5000);
    
    // Délai long pour forcer l'affichage
    const forceTimer = setTimeout(() => {
      if ((isLoading || !sessionChecked || localSessionCheck.isChecking)) {
        console.log("HomeRoute - Auth check taking too long, forcing index render");
        setForceRedirect(true);
      }
    }, 8000);
    
    return () => {
      clearTimeout(maxAuthWait);
      clearTimeout(forceTimer);
    };
  }, [isLoading, sessionChecked, localSessionCheck.isChecking, recoveryAttempted]);
  
  // Fonction de récupération de session
  const handleSessionRecovery = async () => {
    if (recoveryAttempted) return;
    
    setRecoveryAttempted(true);
    console.log("HomeRoute - Attempting session recovery");
    
    try {
      await refreshSession();
      console.log("HomeRoute - Session refreshed successfully");
      
      // Double-vérification avec Supabase
      await verifySupabaseSession();
    } catch (error) {
      console.error("HomeRoute - Error refreshing session", error);
    }
  };
  
  // Si on force la redirection après long timeout
  if (forceRedirect) {
    console.log("HomeRoute - Forcing index page render after timeout");
    return <Index />;
  }
  
  // Si chargement en cours
  if (isLoading || !sessionChecked || localSessionCheck.isChecking) {
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

  // Si authentifié, redirection au dashboard
  if ((isAuthenticated || localSessionCheck.hasSession) && !isLoading && sessionChecked) {
    console.log("HomeRoute - User authenticated, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // Si non authentifié, afficher la page d'accueil
  console.log("HomeRoute - User not authenticated, showing home page");
  return <Index />;
};

export default HomeRoute;
