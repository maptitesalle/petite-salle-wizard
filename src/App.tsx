
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { UserDataProvider } from "./context/UserDataContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import React, { useEffect, useState } from "react";

// Import pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Wizard from "./pages/Wizard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,                     // Augmenter le nombre de tentatives
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponentiel avec max de 30s
      refetchOnWindowFocus: true,   // Changé à true pour recharger les données lors du retour sur la page
      staleTime: 10000,             // Considérer les données comme fraîches pendant 10 secondes
    },
  },
});

// Protected route component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, sessionChecked } = useAuth();
  const location = useLocation();
  const [showTimeout, setShowTimeout] = useState(false);
  const [renderKey, setRenderKey] = useState(0); // Add a key to force re-render when needed

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
    }, 8000); // Reduce from 15 to 8 seconds
    
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

// Home route component to check auth and redirect accordingly
const HomeRoute = () => {
  const { isAuthenticated, isLoading, sessionChecked } = useAuth();
  const location = useLocation();
  const [showTimeout, setShowTimeout] = useState(false);
  
  console.log("Home route check:", { isAuthenticated, isLoading, sessionChecked });

  // Add a timeout of 5 seconds to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Ajouter un délai maximal pour la vérification d'auth (15 secondes)
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

const App = () => {
  // Ajouter un gestionnaire d'événement pour les changements de visibilité de la page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Recharger les données lorsque la page devient visible à nouveau
        queryClient.invalidateQueries();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Ajouter un gestionnaire pour nettoyer le cache de requêtes et réessayer les requêtes échouées
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      // Nettoyer les requêtes plus anciennes que 5 minutes pour éviter des problèmes de mémoire
      queryClient.clear();
    }, 300000); // 5 minutes
    
    return () => clearInterval(cleanupInterval);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserDataProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<HomeRoute />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/wizard" 
                  element={
                    <ProtectedRoute>
                      <Wizard />
                    </ProtectedRoute>
                  } 
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </UserDataProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
