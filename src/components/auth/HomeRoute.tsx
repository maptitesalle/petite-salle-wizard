
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Index from "@/pages/Index";
import { Button } from "@/components/ui/button";

const HomeRoute = () => {
  const { isAuthenticated, isLoading, sessionChecked, user } = useAuth();
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
        <div className="mb-4">Chargement...</div>
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

  // If authenticated, redirect to dashboard
  if (isAuthenticated && user) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, show home page
  return <Index />;
};

export default HomeRoute;
