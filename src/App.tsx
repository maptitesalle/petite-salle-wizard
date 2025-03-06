
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { UserDataProvider } from "./context/UserDataContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import React, { useEffect } from "react";

// Import pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Wizard from "./pages/Wizard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected route component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  console.log("Protected route check:", { isAuthenticated, isLoading, path: location.pathname });

  // If authentication is still loading, show a loading state
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  // If not authenticated, redirect to login with the return path
  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ returnTo: location.pathname }} replace />;
  }

  // If authenticated, render the children
  return <>{children}</>;
};

// Home route component to check auth and redirect accordingly
const HomeRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  console.log("Home route check:", { isAuthenticated, isLoading });

  // If authentication is still loading, show a loading state
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    console.log("User authenticated, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, show the Index page
  return <Index />;
};

const App = () => (
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

export default App;
