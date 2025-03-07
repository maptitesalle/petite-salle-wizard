
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Index from "@/pages/Index";

const HomeRoute = () => {
  const { isAuthenticated, isLoading, sessionChecked } = useAuth();
  const [showTimeout, setShowTimeout] = useState(false);
  
  console.log("Home route check:", { isAuthenticated, isLoading, sessionChecked });

  // Add a timeout of 5 seconds to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Add a maximum wait time for auth check (15 seconds)
  useEffect(() => {
    const maxAuthWait = setTimeout(() => {
      if (isLoading || !sessionChecked) {
        console.log("Auth check taking too long, forcing a refresh");
        window.location.reload();
      }
    }, 15000);
    
    return () => clearTimeout(maxAuthWait);
  }, [isLoading, sessionChecked]);
  
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
