
import React, { useEffect, useState, useCallback } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, sessionChecked, refreshSession } = useAuth();
  const location = useLocation();
  const [showTimeout, setShowTimeout] = useState(false);
  const [showMaxTimeout, setShowMaxTimeout] = useState(false);
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);
  const [localSessionCheck, setLocalSessionCheck] = useState({ 
    isChecking: true,
    hasSession: false,
    error: null as Error | null 
  });

  // Vérification de session Supabase directe et fiable
  const verifySupabaseSession = useCallback(async () => {
    try {
      console.log("ProtectedRoute - Direct Supabase session check");
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      const hasValidSession = !!data.session;
      console.log(`ProtectedRoute - Supabase session: ${hasValidSession ? 'Valid session found' : 'No valid session'}`);
      
      setLocalSessionCheck({
        isChecking: false,
        hasSession: hasValidSession,
        error: null
      });
      
      // Si incohérence entre état local et Supabase
      if (hasValidSession !== isAuthenticated && !isLoading && sessionChecked) {
        console.warn("ProtectedRoute - Auth state inconsistent with Supabase session, refreshing");
        handleSessionRecovery();
      }
      
      return hasValidSession;
    } catch (error) {
      console.error("ProtectedRoute - Error checking Supabase session:", error);
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

  // Logs pour diagnostic
  useEffect(() => {
    console.log("Protected route check:", { 
      isAuthenticated, 
      isLoading, 
      path: location.pathname, 
      sessionChecked,
      localSessionState: localSessionCheck,
      showTimeout,
      showMaxTimeout,
      recoveryAttempted
    });
  }, [isAuthenticated, isLoading, location.pathname, sessionChecked, localSessionCheck, showTimeout, showMaxTimeout, recoveryAttempted]);

  // Délai court pour afficher les options de récupération
  useEffect(() => {
    const timer = setTimeout(() => {
      if ((isLoading || !sessionChecked || localSessionCheck.isChecking) && !recoveryAttempted) {
        setShowTimeout(true);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [isLoading, sessionChecked, localSessionCheck.isChecking, recoveryAttempted]);

  // Délai long pour la récupération automatique
  useEffect(() => {
    const maxAuthWait = setTimeout(() => {
      if ((isLoading || !sessionChecked || localSessionCheck.isChecking) && !recoveryAttempted) {
        console.log("ProtectedRoute - Auth check taking too long, attempting auto-recovery");
        setShowMaxTimeout(true);
        handleSessionRecovery();
      }
    }, 5000); // Réduit pour une réponse plus rapide
    
    return () => clearTimeout(maxAuthWait);
  }, [isLoading, sessionChecked, localSessionCheck.isChecking, recoveryAttempted]);

  // Fonction de récupération de session
  const handleSessionRecovery = async () => {
    if (recoveryAttempted) return;
    
    setRecoveryAttempted(true);
    console.log("ProtectedRoute - Attempting session recovery");
    
    try {
      await refreshSession();
      console.log("ProtectedRoute - Session refreshed successfully");
      
      // Double-vérification avec Supabase après le rafraîchissement
      const hasSession = await verifySupabaseSession();
      
      if (!hasSession) {
        console.log("ProtectedRoute - Session refresh failed, redirecting to login");
      }
    } catch (error) {
      console.error("ProtectedRoute - Error refreshing session", error);
    }
  };

  // Si timeout maximal atteint
  if (showMaxTimeout && (isLoading || !sessionChecked || localSessionCheck.isChecking)) {
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

  // Si chargement en cours mais timeout atteint
  if ((isLoading || !sessionChecked || localSessionCheck.isChecking) && showTimeout) {
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

  // Si chargement en cours
  if (isLoading || !sessionChecked || localSessionCheck.isChecking) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  // Si direct Supabase check a confirmé aucune session mais pas le contexte Auth
  if (!isAuthenticated || !localSessionCheck.hasSession) {
    console.log("ProtectedRoute - Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ returnTo: location.pathname }} replace />;
  }

  // Si authentifié, afficher les enfants
  return <>{children}</>;
};

export default ProtectedRoute;
