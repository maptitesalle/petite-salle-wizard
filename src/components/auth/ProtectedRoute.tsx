
import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import LoadingState from "@/components/dashboard/LoadingState";
import MaxTimeoutState from "@/components/dashboard/MaxTimeoutState";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, sessionChecked, user, refreshSession } = useAuth();
  const location = useLocation();
  const [showFallback, setShowFallback] = useState(false);
  const [showMaxTimeout, setShowMaxTimeout] = useState(false);
  const [quickCheckDone, setQuickCheckDone] = useState(false);
  const [quickCheckPassed, setQuickCheckPassed] = useState(false);
  const [refreshAttempted, setRefreshAttempted] = useState(false);
  
  // Perform a quick check for recently authenticated sessions
  useEffect(() => {
    const quickCheck = () => {
      try {
        // Check both session cache and user data cache
        const cachedSession = localStorage.getItem('recent_session');
        const cachedTimestamp = localStorage.getItem('session_timestamp');
        const cachedUserData = localStorage.getItem('user_data');
        const userTimestamp = localStorage.getItem('user_timestamp');
        const now = Date.now();
        
        const sessionValid = cachedSession && cachedTimestamp && 
          (now - Number(cachedTimestamp)) < 300000;
        
        const userDataValid = cachedUserData && userTimestamp && 
          (now - Number(userTimestamp)) < 300000;
        
        if ((sessionValid || userDataValid) && (cachedSession || cachedUserData)) {
          try {
            if (sessionValid && cachedSession) {
              const parsedSession = JSON.parse(cachedSession);
              if (parsedSession && parsedSession.user) {
                console.log("QuickCheck: Found valid cached session");
                setQuickCheckPassed(true);
              }
            }
            
            if (userDataValid && cachedUserData) {
              const parsedUserData = JSON.parse(cachedUserData);
              if (parsedUserData && parsedUserData.id) {
                console.log("QuickCheck: Found valid cached user data");
                setQuickCheckPassed(true);
              }
            }
          } catch (e) {
            console.log("QuickCheck: Error parsing cached data");
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
  
  // If we have a quick check pass, show children immediately while auth validates in background
  if (quickCheckPassed && !sessionChecked) {
    return <>{children}</>;
  }
  
  // If loading and we've waited long enough, show the fallback UI
  if ((isLoading || !sessionChecked) && showMaxTimeout) {
    return (
      <MaxTimeoutState
        refreshAttempted={refreshAttempted}
        onSessionRefresh={handleSessionRefresh}
        onRefresh={handleRefresh}
      />
    );
  }
  
  // If loading and we've waited enough time, show timeout state
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

  // If authenticated, display children
  if (isAuthenticated && user) {
    return <>{children}</>;
  }
  
  // If not authenticated, redirect to login
  return <Navigate to="/login" state={{ returnTo: location.pathname }} replace />;
};

export default ProtectedRoute;
