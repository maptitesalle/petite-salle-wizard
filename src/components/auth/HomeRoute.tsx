
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Index from "@/pages/Index";
import LoadingState from "@/components/dashboard/LoadingState";
import MaxTimeoutState from "@/components/dashboard/MaxTimeoutState";

const HomeRoute = () => {
  const { isAuthenticated, isLoading, sessionChecked, user, refreshSession } = useAuth();
  const [showFallback, setShowFallback] = useState(false);
  const [showMaxTimeout, setShowMaxTimeout] = useState(false);
  const [refreshAttempted, setRefreshAttempted] = useState(false);
  const [quickCheckDone, setQuickCheckDone] = useState(false);
  const [quickCheckPassed, setQuickCheckPassed] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Perform a quick check for recently authenticated sessions
  useEffect(() => {
    const quickCheck = () => {
      try {
        console.log("HomeRoute: Performing quick check");
        const cachedUserData = localStorage.getItem('user_data');
        const userTimestamp = localStorage.getItem('user_timestamp');
        const now = Date.now();
        
        if (cachedUserData && userTimestamp && (now - Number(userTimestamp)) < 300000) {
          try {
            const parsedUserData = JSON.parse(cachedUserData);
            if (parsedUserData && parsedUserData.id) {
              console.log("HomeRoute: Found valid cached user data");
              setQuickCheckPassed(true);
            }
          } catch (e) {
            console.log("HomeRoute: Error parsing cached user data", e);
            setLoadError("Erreur lors de la lecture des données utilisateur");
          }
        }
      } catch (e) {
        console.error("HomeRoute: Error checking cache", e);
        setLoadError("Erreur lors de l'accès au cache");
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
        console.log("HomeRoute: Loading timeout reached, showing fallback");
        setShowFallback(true);
      }
    }, 2000);
    
    const maxTimer = setTimeout(() => {
      if (isLoading || !sessionChecked) {
        console.log("HomeRoute: Max loading timeout reached");
        setShowMaxTimeout(true);
      }
    }, 5000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(maxTimer);
    };
  }, [isLoading, sessionChecked]);
  
  // Handle session refresh
  const handleSessionRefresh = async () => {
    setRefreshAttempted(true);
    try {
      console.log("HomeRoute: Attempting session refresh");
      await refreshSession();
      console.log("HomeRoute: Session refresh completed");
    } catch (error) {
      console.error("HomeRoute: Session refresh failed", error);
      setLoadError("Erreur lors du rafraîchissement de la session");
    }
  };
  
  // Handle page refresh
  const handleRefresh = () => {
    console.log("HomeRoute: Manual page refresh triggered");
    window.location.reload();
  };
  
  // If quick check passed and still loading, show dashboard
  if (quickCheckPassed && !sessionChecked) {
    console.log("HomeRoute: Quick check passed, navigating to dashboard");
    return <Navigate to="/dashboard" replace />;
  }
  
  // If loading and we've waited long enough, show the max timeout UI
  if ((isLoading || !sessionChecked) && showMaxTimeout) {
    console.log("HomeRoute: Showing max timeout UI");
    return (
      <MaxTimeoutState
        refreshAttempted={refreshAttempted}
        onSessionRefresh={handleSessionRefresh}
        onRefresh={handleRefresh}
      />
    );
  }
  
  // If loading and we've waited enough, show the timeout UI
  if ((isLoading || !sessionChecked) && showFallback) {
    console.log("HomeRoute: Showing timeout UI");
    return (
      <LoadingState 
        showTimeout={true}
        refreshAttempted={refreshAttempted}
        onSessionRefresh={handleSessionRefresh}
        onRefresh={handleRefresh}
      />
    );
  }
  
  // If loading but we haven't waited long enough, show a simple loading indicator
  if ((isLoading || !sessionChecked) && !quickCheckDone) {
    console.log("HomeRoute: Showing initial loading indicator");
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="mb-4">Chargement...</div>
        {loadError && (
          <div className="text-red-500 text-sm">{loadError}</div>
        )}
      </div>
    );
  }

  // If authenticated, redirect to dashboard
  if (isAuthenticated && user) {
    console.log("HomeRoute: User authenticated, navigating to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, show home page
  console.log("HomeRoute: User not authenticated, showing home page");
  return <Index />;
};

export default HomeRoute;
