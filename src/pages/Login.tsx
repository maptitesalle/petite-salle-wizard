
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  // Debug log to check authentication state
  useEffect(() => {
    console.log('Login page - Auth state:', { isAuthenticated, isLoading, user });
    
    // Check the current session on component mount
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      console.log('Login page - Current session:', data.session);
    };
    
    checkSession();
  }, [isAuthenticated, isLoading, user]);

  // Add an effect to handle redirects when authentication state changes
  useEffect(() => {
    if (isAuthenticated && !isLoading && !redirectAttempted) {
      // Get return URL from location state or default to dashboard
      const returnTo = location.state?.returnTo || '/dashboard';
      console.log('Login page - User is authenticated, navigating to:', returnTo);
      setRedirectAttempted(true);
      
      // Add a delay to ensure auth context is fully updated
      setTimeout(() => {
        navigate(returnTo, { replace: true });
      }, 1500);
    }
  }, [isAuthenticated, isLoading, navigate, location.state, redirectAttempted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    setRedirectAttempted(false);
    
    try {
      console.log('Login page - Attempting login with:', { email });
      await login(email, password);
      
      console.log('Login page - Login successful');
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur Ma P'tite Salle",
      });
      
      // We'll rely on the useEffect above for navigation after auth state updates
    } catch (error: any) {
      console.error("Login page - Erreur de connexion:", error);
      
      // More specific error message
      let errorMessage = "Email ou mot de passe incorrect";
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = "Identifiants invalides. Vérifiez votre email et mot de passe.";
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = "Veuillez confirmer votre email avant de vous connecter.";
      }
      
      setErrorMsg(errorMessage);
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is already authenticated on initial render, redirect
  useEffect(() => {
    if (isAuthenticated && !isLoading && !redirectAttempted) {
      console.log('Login page - User already authenticated, redirecting to dashboard');
      setRedirectAttempted(true);
      
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-mps-secondary/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-mps-primary">Connexion</CardTitle>
        </CardHeader>
        <CardContent>
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errorMsg}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="votre@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-mps-primary hover:bg-mps-primary/80"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
              </Button>
            </div>
          </form>
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
