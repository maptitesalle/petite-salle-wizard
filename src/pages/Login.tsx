
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import LoginForm from '@/components/auth/LoginForm';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [sessionChecking, setSessionChecking] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        setSessionChecking(true);
        console.log("Login - Checking for existing session");
        
        // Création d'un délai pour éviter les timeouts indéfinis
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Session check timeout")), 5000)
        );
        
        const sessionPromise = supabase.auth.getSession();
        
        // Race entre la vérification de session et le timeout
        const result = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as { data: { session: any }, error: any } | Error;
        
        if (result instanceof Error) {
          console.error("Login session check timed out:", result);
          setSessionChecking(false);
          return;
        }
        
        const { data, error } = result;
        
        if (error) {
          console.error("Login check session error:", error);
          return;
        }
        
        if (data.session) {
          console.log("Login - User already logged in, redirecting");
          // User is already logged in, redirect to dashboard
          const returnTo = location.state?.returnTo || '/dashboard';
          navigate(returnTo, { replace: true });
        } else {
          console.log("Login - No active session found");
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setSessionChecking(false);
      }
    };
    
    checkSession();
  }, [navigate, location.state]);
  
  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Attempt to sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      if (data.session) {
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur Ma P'tite Salle",
        });
        
        // Navigate to the returnTo path or dashboard
        const returnTo = location.state?.returnTo || '/dashboard';
        navigate(returnTo, { replace: true });
      } else {
        throw new Error("Aucune session utilisateur n'a été créée");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Handle specific error cases
      let errorMsg = "Une erreur est survenue lors de la connexion";
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMsg = "Identifiants invalides. Vérifiez votre email et mot de passe.";
      } else if (error.message?.includes('Email not confirmed')) {
        errorMsg = "Veuillez confirmer votre email avant de vous connecter.";
      } else if (error.message?.includes('network') || error.message?.includes('Network')) {
        errorMsg = "Problème de connexion réseau. Veuillez réessayer.";
      }
      
      setErrorMessage(errorMsg);
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (sessionChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mps-secondary/30 p-4">
        <div className="text-center">
          <p className="mb-4">Vérification de la session...</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Rafraîchir la page
          </Button>
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
