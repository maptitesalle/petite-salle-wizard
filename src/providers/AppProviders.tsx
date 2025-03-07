
import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { UserDataProvider } from "@/context/UserDataContext";
import { createQueryClient } from "@/lib/queryClient";

interface AppProvidersProps {
  children: React.ReactNode;
}

const AppProviders = ({ children }: AppProvidersProps) => {
  const queryClient = React.useMemo(() => createQueryClient(), []);

  // Add error boundary for query client
  useEffect(() => {
    const handleError = (error: Error) => {
      console.error("Global error caught:", error);
      
      // Ne pas systématiquement vider le cache pour éviter des rechargements inutiles
      if (error.message.includes("Failed to fetch") || 
          error.message.includes("Network Error") || 
          error.message.includes("timeout")) {
        console.warn("Network related error - clearing affected queries only");
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      }
    };

    const errorHandler = (event: ErrorEvent) => handleError(event.error);
    const rejectionHandler = (event: PromiseRejectionEvent) => handleError(event.reason);

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, [queryClient]);

  // Add an event handler for page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Recharger seulement les données d'authentification quand nécessaire
        const lastFocus = parseInt(sessionStorage.getItem('lastFocusTime') || '0');
        const now = Date.now();
        
        // Seulement rafraîchir si plus de 60 secondes se sont écoulées
        if (now - lastFocus > 60000) {
          console.log("Page visibility changed to visible, invalidating auth queries");
          queryClient.invalidateQueries({ queryKey: ['auth'] });
          sessionStorage.setItem('lastFocusTime', now.toString());
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    sessionStorage.setItem('lastFocusTime', Date.now().toString());
    
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [queryClient]);

  // Périodiquement vérifier pour des problèmes de session
  useEffect(() => {
    // Exécuter moins souvent pour éviter les surcharges
    const cleanupInterval = setInterval(() => {
      // Clean up queries older than 30 minutes to avoid memory issues
      console.log("Running scheduled cleanup of old queries");
      queryClient.clear();
    }, 30 * 60 * 1000); // 30 minutes au lieu de 15
    
    return () => clearInterval(cleanupInterval);
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserDataProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              {children}
            </BrowserRouter>
          </TooltipProvider>
        </UserDataProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default AppProviders;
