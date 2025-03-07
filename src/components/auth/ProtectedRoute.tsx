
import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, sessionChecked, refreshSession, user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  
  // Show fallback UI after a short delay if still loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading || !sessionChecked) {
        setShowFallback(true);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [isLoading, sessionChecked]);
  
  // Perform direct session check if needed
  useEffect(() => {
    const verifySession = async () => {
      // Only check if we're in a loading state for too long
      if ((isLoading || !sessionChecked) && showFallback && !isCheckingSession) {
        setIsCheckingSession(true);
        
        try {
          const { data } = await supabase.auth.getSession();
          
          if (data.session) {
            // We have a session, try to refresh auth context
            await refreshSession();
          } else {
            // No session found, we should redirect
            console.log("ProtectedRoute: No valid session found in direct check");
          }
        } catch (error) {
          console.error("ProtectedRoute: Error in direct session check", error);
        } finally {
          setIsCheckingSession(false);
        }
      }
    };
    
    verifySession();
  }, [isLoading, sessionChecked, showFallback, isCheckingSession, refreshSession]);
  
  // If still loading and fallback timer hasn't triggered
  if ((isLoading || !sessionChecked) && !showFallback) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }
  
  // If loading is taking too long, show options
  if ((isLoading || !sessionChecked) && showFallback) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="mb-4">Vérification de l'authentification...</div>
        <div className="text-sm text-mps-primary">
          <button 
            onClick={() => refreshSession()}
            className="underline hover:text-mps-primary/80 mr-4"
            disabled={isCheckingSession}
          >
            {isCheckingSession ? "Vérification..." : "Restaurer la session"}
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
  
  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    console.log("ProtectedRoute: Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ returnTo: location.pathname }} replace />;
  }
  
  // If authenticated, display children
  return <>{children}</>;
};

export default ProtectedRoute;
