
import React, { useEffect, useState, useCallback } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, sessionChecked, refreshSession } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [showTimeout, setShowTimeout] = useState(false);
  const [showMaxTimeout, setShowMaxTimeout] = useState(false);
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);
  const [localSessionCheck, setLocalSessionCheck] = useState({ 
    isChecking: true,
    hasSession: false,
    error: null as Error | null,
    lastChecked: 0
  });

  // Improved direct session check
  const verifySupabaseSession = useCallback(async () => {
    // Skip if we've checked recently
    const now = Date.now();
    if (now - localSessionCheck.lastChecked < 2000) {
      return localSessionCheck.hasSession;
    }
    
    try {
      console.log("ProtectedRoute - Direct Supabase session check");
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      const hasValidSession = !!data.session;
      console.log(`ProtectedRoute - Supabase session: ${hasValidSession ? 'Valid session found' : 'No valid session'}`);
      
      setLocalSessionCheck({
        isChecking: false,
        hasSession: hasValidSession,
        error: null,
        lastChecked: now
      });
      
      return hasValidSession;
    } catch (error) {
      console.error("ProtectedRoute - Error checking Supabase session:", error);
      setLocalSessionCheck({
        isChecking: false,
        hasSession: false,
        error: error as Error,
        lastChecked: now
      });
      return false;
    }
  }, [localSessionCheck.lastChecked]);

  // Initial session check
  useEffect(() => {
    verifySupabaseSession();
  }, [verifySupabaseSession]);

  // Timeout handling
  useEffect(() => {
    // Show timeout options sooner
    const timeoutTimer = setTimeout(() => {
      if ((isLoading || !sessionChecked) && !recoveryAttempted) {
        setShowTimeout(true);
      }
    }, 2000);
    
    // Auto-recovery for faster response
    const maxAuthWait = setTimeout(() => {
      if ((isLoading || !sessionChecked) && !recoveryAttempted) {
        console.log("ProtectedRoute - Auth check taking too long, attempting auto-recovery");
        setShowMaxTimeout(true);
        handleSessionRecovery();
      }
    }, 4000);
    
    return () => {
      clearTimeout(timeoutTimer);
      clearTimeout(maxAuthWait);
    };
  }, [isLoading, sessionChecked, recoveryAttempted]);

  // Session recovery function
  const handleSessionRecovery = async () => {
    if (recoveryAttempted) return;
    
    setRecoveryAttempted(true);
    console.log("ProtectedRoute - Attempting session recovery");
    
    try {
      // First check if we actually have a session directly with Supabase
      const hasSession = await verifySupabaseSession();
      
      if (hasSession) {
        await refreshSession();
        console.log("ProtectedRoute - Session refreshed successfully");
        toast({
          title: "Session restaurée",
          description: "Votre session a été rafraîchie avec succès."
        });
      } else {
        console.log("ProtectedRoute - No valid session found, redirect needed");
        toast({
          variant: "destructive",
          title: "Session expirée",
          description: "Votre session a expiré. Veuillez vous reconnecter."
        });
      }
    } catch (error) {
      console.error("ProtectedRoute - Error refreshing session", error);
    }
  };

  // If timeout maximal atteint
  if (showMaxTimeout && (isLoading || !sessionChecked)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="mb-4">Problème d'authentification détecté</div>
        <div className="text-sm text-mps-primary mb-4">
          Veuillez essayer de rafraîchir la page
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-mps-primary text-white rounded-md hover:bg-mps-primary/80"
        >
          Rafraîchir la page
        </button>
      </div>
    );
  }

  // If loading with timeout
  if ((isLoading || !sessionChecked) && showTimeout) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="mb-4">Vérification de l'authentification...</div>
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
      </div>
    );
  }

  // If still loading
  if (isLoading || !sessionChecked) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log("ProtectedRoute - Not authenticated, redirecting to login");
    // Use a more reliable direct session check as fallback
    if (localSessionCheck.hasSession) {
      console.log("ProtectedRoute - Direct session check found a session, attempting recovery");
      handleSessionRecovery();
      return <div className="flex items-center justify-center h-screen">Restauration de la session...</div>;
    }
    return <Navigate to="/login" state={{ returnTo: location.pathname }} replace />;
  }

  // If authenticated, display children
  return <>{children}</>;
};

export default ProtectedRoute;
