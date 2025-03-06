
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserData } from '@/context/UserDataContext';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { register, isAuthenticated, isLoading, user } = useAuth();
  const { userData, setUserData, loadUserData } = useUserData();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  // Debug log to check authentication state
  useEffect(() => {
    console.log('Register page - Auth state:', { isAuthenticated, isLoading, user, userData });
    
    // Check the current session on component mount
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      console.log('Register page - Current session:', data.session);
    };
    
    checkSession();
  }, [isAuthenticated, isLoading, user, userData]);

  // Add an effect to handle redirects when authentication state changes
  useEffect(() => {
    if (isAuthenticated && !isLoading && !redirectAttempted && user) {
      console.log('Register page - User is authenticated, navigating to wizard');
      setRedirectAttempted(true);
      
      // Make sure user data is loaded before redirecting
      loadUserData().then(() => {
        console.log('Register page - User data loaded, redirecting to wizard');
        // Add a longer delay to ensure auth context and user data are fully updated
        setTimeout(() => {
          navigate('/wizard', { replace: true });
        }, 2000);
      }).catch(error => {
        console.error('Register page - Error loading user data:', error);
        setTimeout(() => {
          navigate('/wizard', { replace: true });
        }, 2000);
      });
    }
  }, [isAuthenticated, isLoading, navigate, redirectAttempted, user, loadUserData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    setRedirectAttempted(false);
    
    // Basic validation
    if (password.length < 6) {
      setErrorMsg("Le mot de passe doit contenir au moins 6 caractères");
      setIsSubmitting(false);
      return;
    }
    
    try {
      console.log('Register page - Attempting registration with:', { email, name });
      await register(email, password, name);
      
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès. Un email de confirmation a été envoyé.",
      });
      
      console.log('Register page - Registration successful');
      
      // We'll rely on the useEffect above for navigation after auth state updates
    } catch (error: any) {
      console.error("Register page - Erreur d'inscription:", error);
      
      // More specific error message based on the error
      let errorMessage = "Impossible de créer votre compte";
      if (error.message?.includes('email already in use') || error.message?.includes('email_exists')) {
        errorMessage = "Cette adresse email est déjà utilisée";
      } else if (error.message?.includes('invalid email')) {
        errorMessage = "Format d'email invalide";
      } else if (error.message?.includes('weak password')) {
        errorMessage = "Mot de passe trop faible. Utilisez au moins 6 caractères.";
      }
      
      setErrorMsg(errorMessage);
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is already authenticated on initial render, redirect
  useEffect(() => {
    if (isAuthenticated && !isLoading && user && !redirectAttempted) {
      console.log('Register page - User already authenticated, redirecting to wizard');
      setRedirectAttempted(true);
      
      setTimeout(() => {
        navigate('/wizard', { replace: true });
      }, 2000);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-mps-secondary/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-mps-primary">Inscription</CardTitle>
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
                <Label htmlFor="name">Nom complet</Label>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="Jean Dupont" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
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
                  minLength={6}
                />
                <p className="text-xs text-gray-500">Le mot de passe doit contenir au moins 6 caractères</p>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-mps-primary hover:bg-mps-primary/80"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? 'Inscription en cours...' : 'S\'inscrire'}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-mps-text">
            Déjà un compte ? <Link to="/login" className="text-mps-primary font-semibold">Se connecter</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
