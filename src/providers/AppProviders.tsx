
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
      // Optionally reset query cache on critical errors
      if (error.message.includes("network") || error.message.includes("timeout")) {
        queryClient.clear();
      }
    };

    window.addEventListener('error', (event) => handleError(event.error));
    window.addEventListener('unhandledrejection', (event) => handleError(event.reason));

    return () => {
      window.removeEventListener('error', (event) => handleError(event.error));
      window.removeEventListener('unhandledrejection', (event) => handleError(event.reason));
    };
  }, [queryClient]);

  // Add an event handler for page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Reload critical data when the page becomes visible again
        console.log("Page visibility changed to visible, invalidating auth queries");
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [queryClient]);

  // Add a handler to clean up the query cache and retry failed queries
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      // Clean up queries older than 15 minutes to avoid memory issues
      console.log("Running scheduled cleanup of old queries");
      queryClient.clear();
    }, 900000); // 15 minutes
    
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
