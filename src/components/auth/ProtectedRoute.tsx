
import React, { useEffect, useState } from "react";
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
  const [isVerifyingLocally, setIsVerifyingLocally] = useState(true);

  // Vérification locale de session au montage du composant
  useEffect(() => {
    const verifySession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log("ProtectedRoute - Local session check:", data.session ? "Session exists" : "No session");
        setIsVerifyingLocally(false);
      } catch (error) {
        console.error("ProtectedRoute - Error checking local session:", error);
        setIsVerifyingLocally(false);
      }
    };
    
    verifySession();
  }, []);

  // Log authentication state for debugging
  useEffect(() => {
    console.log("Protected route check:", { 
      isAuthenticated, 
      isLoading, 
      path: location.pathname, 
      sessionChecked,
      isVerifyingLocally,
      showTimeout,
      showMaxTimeout,
      recoveryAttempted
    });
  }, [isAuthenticated, isLoading, location.pathname, sessionChecked, isVerifyingLocally, showTimeout, showMaxTimeout, recoveryAttempted]);

  // Set a timer to show the refresh button after 2 seconds if still loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if ((isLoading || !sessionChecked || isVerifyingLocally) && !recoveryAttempted) {
        setShowTimeout(true);
      }
    }, 3000); // Augmenté à 3s pour laisser plus de temps
    
    return () => clearTimeout(timer);
  }, [isLoading, sessionChecked, isVerifyingLocally, recoveryAttempted]);

  // Detect if the auth check is taking too long and show max timeout message
  useEffect(() => {
    const maxAuthWait = setTimeout(() => {
      if ((isLoading || !sessionChecked || isVerifyingLocally) && !recoveryAttempted) {
        console.log("Auth check taking too long, showing max timeout");
        setShowMaxTimeout(true);
        
        // Auto-recovery attempt
        handleSessionRecovery();
      }
    }, 7000); // Augmenté à 7s
    
    return () => clearTimeout(maxAuthWait);
  }, [isLoading, sessionChecked, isVerifyingLocally, recoveryAttempted]);

  // Handle session recovery
  const handleSessionRecovery = async () => {
    if (recoveryAttempted) return;
    
    setRecoveryAttempted(true);
    console.log("ProtectedRoute - Attempting session recovery");
    
    try {
      await refreshSession();
      console.log("ProtectedRoute - Session refreshed successfully");
    } catch (error) {
      console.error("ProtectedRoute - Error refreshing session", error);
    }
  };

  // If session is checked and we're not authenticated, redirect to login
  useEffect(() => {
    if (sessionChecked && !isAuthenticated && !isLoading && !isVerifyingLocally) {
      console.log("Session checked, not authenticated, redirecting to login");
    }
  }, [sessionChecked, isAuthenticated, isLoading, isVerifyingLocally]);

  // Si on a atteint le timeout maximum
  if (showMaxTimeout && (isLoading || !sessionChecked || isVerifyingLocally)) {
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

  // If we are still loading but it's taking too long
  if ((isLoading || !sessionChecked || isVerifyingLocally) && showTimeout) {
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

  // If we are still loading
  if (isLoading || !sessionChecked || isVerifyingLocally) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  // If not authenticated, redirect to login with the return path
  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ returnTo: location.pathname }} replace />;
  }

  // If authenticated, show the children
  return <>{children}</>;
};

export default ProtectedRoute;
