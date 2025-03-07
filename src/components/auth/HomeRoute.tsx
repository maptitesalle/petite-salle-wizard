
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Index from "@/pages/Index";

const HomeRoute = () => {
  const { isAuthenticated, isLoading, sessionChecked } = useAuth();
  const [showTimeout, setShowTimeout] = useState(false);
  const [forceRedirect, setForceRedirect] = useState(false);
  
  console.log("Home route check:", { 
    isAuthenticated, 
    isLoading, 
    sessionChecked, 
    showTimeout,
    forceRedirect
  });

  // Add a timeout of 3 seconds to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Add a maximum wait time for auth check (8 seconds)
  useEffect(() => {
    const maxAuthWait = setTimeout(() => {
      if (isLoading || !sessionChecked) {
        console.log("Auth check taking too long, forcing a refresh");
        // Force redirect to home even if auth isn't ready
        setForceRedirect(true);
      }
    }, 8000);
    
    return () => clearTimeout(maxAuthWait);
  }, [isLoading, sessionChecked]);
  
  // Si on force la redirection après un timeout long
  if (forceRedirect) {
    console.log("Forcing index page render after timeout");
    return <Index />;
  }
  
  // Si chargement en cours
  if (isLoading && !sessionChecked) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="mb-4">Chargement...</div>
        {showTimeout && (
          <div className="text-sm text-mps-primary">
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
