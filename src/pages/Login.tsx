
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/context/AuthContext';
import { RefreshCcw, Loader2 } from 'lucide-react';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSessionRefresh, setShowSessionRefresh] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, sessionChecked, login, refreshSession } = useAuth();
  
  // Show refresh button after 3 seconds if still loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (authLoading) {
        setShowSessionRefresh(true);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
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
  
  const handleRefreshSession = async () => {
    try {
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
  
  if (authLoading && !showSessionRefresh) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mps-secondary/30 p-4">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-mps-primary" />
          <p className="mb-4">Vérification de la session...</p>
        </div>
      </div>
    );
  }
  
  if (authLoading && showSessionRefresh) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mps-secondary/30 p-4">
        <div className="text-center">
          <p className="mb-6">La vérification de la session prend plus de temps que prévu</p>
          <div className="space-y-3">
            <Button 
              variant="default"
              onClick={handleRefreshSession}
              className="w-full flex items-center justify-center gap-2"
            >
              <RefreshCcw size={16} /> Restaurer la session
            </Button>
            <Button 
              variant="outline"
              onClick={handlePageRefresh}
              className="w-full flex items-center justify-center gap-2"
            >
              <RefreshCcw size={16} /> Rafraîchir la page
            </Button>
          </div>
        </div>
      </div>
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
                onClick={handleRefreshSession}
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
