
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
  const [manualCheckComplete, setManualCheckComplete] = useState(false);
  const [hasDirectSession, setHasDirectSession] = useState(false);
  
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
          // Timeout for session check to avoid hanging
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Direct session check timeout")), 5000)
          );
          
          const sessionPromise = supabase.auth.getSession();
          
          // Race between session check and timeout
          const result = await Promise.race([
            sessionPromise,
            timeoutPromise
          ]) as { data: any, error: any } | Error;
          
          if (result instanceof Error) {
            console.error("ProtectedRoute - Session check timed out:", result);
            setManualCheckComplete(true);
            setHasDirectSession(false);
            setIsCheckingSession(false);
            return;
          }
          
          const { data, error } = result;
          
          if (error) {
            throw error;
          }
          
          if (data.session) {
            // We have a session, try to refresh auth context
            setHasDirectSession(true);
            await refreshSession();
          } else {
            // No session found, we should redirect
            setHasDirectSession(false);
            console.log("ProtectedRoute: No valid session found in direct check");
          }
          
          setManualCheckComplete(true);
        } catch (error) {
          console.error("ProtectedRoute: Error in direct session check", error);
          setHasDirectSession(false);
          setManualCheckComplete(true);
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
        
        {/* Afficher un message si la vérification manuelle est terminée */}
        {manualCheckComplete && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded max-w-md text-center">
            {hasDirectSession ? (
              <p>Une session valide a été détectée mais n'a pas pu être restaurée. Veuillez rafraîchir la page.</p>
            ) : (
              <p>Aucune session valide n'a été trouvée. Vous allez être redirigé vers la page de connexion.</p>
            )}
          </div>
        )}
        
        {/* Rediriger après un délai si aucune session n'est trouvée */}
        {manualCheckComplete && !hasDirectSession && (
          <div className="mt-4">
            <button 
              onClick={() => window.location.href = '/login'}
              className="px-4 py-2 bg-mps-primary text-white rounded hover:bg-mps-primary/80"
            >
              Aller à la page de connexion
            </button>
          </div>
        )}
      </div>
    );
  }
  
  // Si le délai de chargement est excessif et que la vérification manuelle a échoué
  if (manualCheckComplete && !hasDirectSession) {
    return <Navigate to="/login" state={{ returnTo: location.pathname }} replace />;
  }
  
  // If authenticated, display children
  if (isAuthenticated && user) {
    return <>{children}</>;
  }
  
  // If not authenticated, redirect to login (fallback)
  console.log("ProtectedRoute: Not authenticated, redirecting to login");
  return <Navigate to="/login" state={{ returnTo: location.pathname }} replace />;
};

export default ProtectedRoute;
