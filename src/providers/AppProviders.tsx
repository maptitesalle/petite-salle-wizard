
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

  // Add an event handler for page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Reload data when the page becomes visible again
        queryClient.invalidateQueries();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [queryClient]);

  // Add a handler to clean up the query cache and retry failed queries
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      // Clean up queries older than 5 minutes to avoid memory issues
      queryClient.clear();
    }, 300000); // 5 minutes
    
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
