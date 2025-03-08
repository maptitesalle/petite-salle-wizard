
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
  
  // Perform a quick check for recently authenticated sessions
  useEffect(() => {
    const quickCheck = () => {
      try {
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
            console.log("HomeRoute: Error parsing cached user data");
          }
        }
      } catch (e) {
        console.error("HomeRoute: Error checking cache", e);
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
    
    const maxTimer = setTimeout(() => {
      if (isLoading || !sessionChecked) {
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
    await refreshSession();
  };
  
  // Handle page refresh
  const handleRefresh = () => {
    window.location.reload();
  };
  
  // If quick check passed and still loading, show dashboard
  if (quickCheckPassed && !sessionChecked) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // If loading and we've waited long enough, show the max timeout UI
  if ((isLoading || !sessionChecked) && showMaxTimeout) {
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
