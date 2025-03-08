
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/context/AuthContext';
import { RefreshCcw, Loader2 } from 'lucide-react';
import LoadingState from '@/components/dashboard/LoadingState';
import MaxTimeoutState from '@/components/dashboard/MaxTimeoutState';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSessionRefresh, setShowSessionRefresh] = useState(false);
  const [showMaxTimeout, setShowMaxTimeout] = useState(false);
  const [refreshAttempted, setRefreshAttempted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, sessionChecked, login, refreshSession } = useAuth();
  
  // Show refresh button after 2 seconds if still loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (authLoading) {
        setShowSessionRefresh(true);
      }
    }, 2000);
    
    const maxTimer = setTimeout(() => {
      if (authLoading) {
        setShowMaxTimeout(true);
      }
    }, 5000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(maxTimer);
    };
  }, [authLoading]);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && sessionChecked) {
      const returnTo = location.state?.returnTo || '/dashboard';
      navigate(returnTo, { replace: true });
    }
  }, [isAuthenticated, sessionChecked, navigate, location.state]);
  
  // Reset error on mount
  useEffect(() => {
    setErrorMessage(null);
  }, []);
  
  // Handle session issues
  useEffect(() => {
    if (location.search?.includes("error=")) {
      setErrorMessage("Problème d'authentification. Veuillez réessayer.");
    }
  }, [location]);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      await login(email, password);
      // If we get here, login succeeded
    } catch (error: any) {
      console.error("Login error:", error);
      
      // User-friendly error message
      let errorMsg = "Une erreur est survenue lors de la connexion";
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMsg = "Identifiants invalides. Vérifiez votre email et mot de passe.";
      } else if (error.message?.includes('Email not confirmed')) {
        errorMsg = "Veuillez confirmer votre email avant de vous connecter.";
      } else if (error.message?.includes('network') || error.message?.includes('Network') || error.message?.includes('time')) {
        errorMsg = "Problème de connexion réseau. Veuillez réessayer.";
      }
      
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSessionRefresh = async () => {
    try {
      setRefreshAttempted(true);
      await refreshSession();
      toast({
        title: "Rafraîchissement de session",
        description: "Tentative de reconnexion en cours...",
      });
    } catch (error) {
      console.error("Error refreshing session:", error);
    }
  };
  
  const handlePageRefresh = () => {
    window.location.reload();
  };
  
  // Utilisez les nouveaux composants LoadingState et MaxTimeoutState
  if (authLoading && !showMaxTimeout) {
    return (
      <LoadingState
        showTimeout={showSessionRefresh}
        refreshAttempted={refreshAttempted}
        onSessionRefresh={handleSessionRefresh}
        onRefresh={handlePageRefresh}
      />
    );
  }
  
  if (authLoading && showMaxTimeout) {
    return (
      <MaxTimeoutState
        refreshAttempted={refreshAttempted}
        onSessionRefresh={handleSessionRefresh}
        onRefresh={handlePageRefresh}
      />
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-mps-secondary/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-mps-primary">Connexion</CardTitle>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errorMessage}
            </div>
          )}
          
          <LoginForm onLogin={handleLogin} isLoading={isLoading} />
          
          {(errorMessage?.includes('réseau') || errorMessage?.includes('time')) && (
            <div className="mt-4 flex flex-col gap-2">
              <Button 
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleSessionRefresh}
                disabled={isLoading}
              >
                <RefreshCcw size={16} /> Rafraîchir la session
              </Button>
              <Button 
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={handlePageRefresh}
                disabled={isLoading}
              >
                <RefreshCcw size={16} /> Rafraîchir la page
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-mps-text">
            Pas encore de compte ? <Link to="/register" className="text-mps-primary font-semibold">S'inscrire</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
