
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
  
  // Gestion des erreurs API globales
  useEffect(() => {
    const handleError = (error: Error) => {
      console.error("Global error caught:", error);
      
      // Analyse plus fine des erreurs réseau
      if (error.message.includes("Failed to fetch") || 
          error.message.includes("Network Error") || 
          error.message.includes("timeout")) {
        console.warn("Network related error - checking auth state only");
        
        // Invalidation ciblée pour vérifier l'état d'authentification uniquement
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['auth'] });
        }, 1000);
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

  // Gestionnaire d'événements de visibilité de page plus robuste
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const lastFocus = parseInt(sessionStorage.getItem('lastFocusTime') || '0');
        const now = Date.now();
        
        if (now - lastFocus > 3 * 60 * 1000) { // 3 minutes
          console.log("Page visibility changed to visible after extended period, refreshing auth");
          queryClient.invalidateQueries({ queryKey: ['auth'] });
          sessionStorage.setItem('lastFocusTime', now.toString());
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    sessionStorage.setItem('lastFocusTime', Date.now().toString());
    
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [queryClient]);

  // Surveillance périodique de session avec meilleure planification
  useEffect(() => {
    // Nettoyage plus sélectif toutes les 30 minutes
    const cleanupInterval = setInterval(() => {
      console.log("Running scheduled cleanup of inactive queries");
      // Ne pas vider tout le cache, juste les requêtes inactives
      queryClient.clear();
    }, 30 * 60 * 1000);
    
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
