
import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, sessionChecked, user } = useAuth();
  const location = useLocation();
  const [showFallback, setShowFallback] = useState(false);
  
  // Show fallback UI after a delay if loading takes too long
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading || !sessionChecked) {
        setShowFallback(true);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [isLoading, sessionChecked]);
  
  // If loading and we've waited long enough, show the fallback UI
  if ((isLoading || !sessionChecked) && showFallback) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="mb-4">Vérification de l'authentification...</div>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          Rafraîchir la page
        </Button>
      </div>
    );
  }
  
  // If loading but we haven't waited long enough, show a simple loading indicator
  if (isLoading || !sessionChecked) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  // If authenticated, display children
  if (isAuthenticated && user) {
    return <>{children}</>;
  }
  
  // If not authenticated, redirect to login
  return <Navigate to="/login" state={{ returnTo: location.pathname }} replace />;
};

export default ProtectedRoute;
