
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, sessionChecked } = useAuth();
  const location = useLocation();
  const [showTimeout, setShowTimeout] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  // Log authentication state for debugging
  useEffect(() => {
    console.log("Protected route check:", { 
      isAuthenticated, 
      isLoading, 
      path: location.pathname, 
      sessionChecked, 
      renderKey 
    });
  }, [isAuthenticated, isLoading, location.pathname, sessionChecked, renderKey]);

  // Set a timer to show the refresh button after 3 seconds if still loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading || !sessionChecked) {
        setShowTimeout(true);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [isLoading, sessionChecked]);

  // Detect if the auth check is taking too long and force a re-render
  useEffect(() => {
    const maxAuthWait = setTimeout(() => {
      if (isLoading || !sessionChecked) {
        console.log("Auth check taking too long, forcing a re-render");
        setRenderKey(prev => prev + 1);
      }
    }, 8000);
    
    return () => clearTimeout(maxAuthWait);
  }, [isLoading, sessionChecked]);

  // If session is checked and we're not authenticated, redirect to login
  useEffect(() => {
    if (sessionChecked && !isAuthenticated && !isLoading) {
      console.log("Session checked, not authenticated, redirecting to login");
    }
  }, [sessionChecked, isAuthenticated, isLoading]);

  // If we are still loading but it's taking too long
  if ((isLoading || !sessionChecked) && showTimeout) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="mb-4">Vérification de l'authentification...</div>
        <div className="text-sm text-mps-primary">
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
  if (isLoading || !sessionChecked) {
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
