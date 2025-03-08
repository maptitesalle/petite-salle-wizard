
import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, sessionChecked, user, refreshSession } = useAuth();
  const location = useLocation();
  const [showFallback, setShowFallback] = useState(false);
  const [quickCheckDone, setQuickCheckDone] = useState(false);
  const [quickCheckPassed, setQuickCheckPassed] = useState(false);
  
  // Perform a quick check for recently authenticated sessions
  useEffect(() => {
    const quickCheck = () => {
      try {
        const cachedSession = localStorage.getItem('recent_session');
        const cachedTimestamp = localStorage.getItem('session_timestamp');
        const now = Date.now();
        
        if (cachedSession && cachedTimestamp && (now - Number(cachedTimestamp)) < 300000) {
          try {
            const parsedSession = JSON.parse(cachedSession);
            if (parsedSession && parsedSession.user) {
              console.log("QuickCheck: Found valid cached session");
              setQuickCheckPassed(true);
            }
          } catch (e) {
            console.log("QuickCheck: Error parsing cached session");
          }
        }
      } catch (e) {
        console.error("QuickCheck: Error checking cache", e);
      } finally {
        setQuickCheckDone(true);
      }
    };
    
    quickCheck();
  }, []);
  
  // Show fallback UI after a delay if loading takes too long
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading || !sessionChecked) {
        setShowFallback(true);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [isLoading, sessionChecked]);
  
  // If we have a quick check pass, show children immediately while auth validates in background
  if (quickCheckPassed && !sessionChecked) {
    return <>{children}</>;
  }
  
  // If loading and we've waited long enough, show the fallback UI
  if ((isLoading || !sessionChecked) && showFallback) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="mb-4">Vérification de l'authentification...</div>
        <Button 
          variant="outline" 
          onClick={() => refreshSession()}
          className="mb-2"
        >
          Rafraîchir la session
        </Button>
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
  if ((isLoading || !sessionChecked) && !quickCheckDone) {
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
