
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();
  
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      const returnTo = location.state?.returnTo || '/dashboard';
      navigate(returnTo, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);
  
  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Use the auth context login function
      await login(email, password);
      
      // If we get here, login was successful
      const returnTo = location.state?.returnTo || '/dashboard';
      navigate(returnTo, { replace: true });
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Set a user-friendly error message
      let errorMsg = "Une erreur est survenue lors de la connexion";
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMsg = "Identifiants invalides. Vérifiez votre email et mot de passe.";
      } else if (error.message?.includes('Email not confirmed')) {
        errorMsg = "Veuillez confirmer votre email avant de vous connecter.";
      } else if (error.message?.includes('network') || error.message?.includes('Network')) {
        errorMsg = "Problème de connexion réseau. Veuillez réessayer.";
      }
      
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mps-secondary/30 p-4">
        <div className="text-center">
          <p className="mb-4">Vérification de la session...</p>
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
          
          {errorMessage?.includes('réseau') && (
            <Button 
              type="button"
              variant="outline"
              className="w-full mt-4"
              onClick={() => window.location.reload()}
              disabled={isLoading}
            >
              Rafraîchir la page
            </Button>
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
