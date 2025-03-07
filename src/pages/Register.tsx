
import React, { useEffect } from 'react';
import { useSessionRedirect } from '@/hooks/useSessionRedirect';
import RegisterCard from '@/components/auth/RegisterCard';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Register = () => {
  const { redirectAttempted, setRedirectAttempted } = useSessionRedirect('/wizard');
  const { isAuthenticated, isLoading, sessionChecked } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle registration success
  const handleRegisterSuccess = () => {
    setRedirectAttempted(false);
    toast({
      title: "Inscription réussie",
      description: "Redirection vers le formulaire de configuration...",
    });
  };

  // Effect to ensure redirect happens once auth is confirmed
  useEffect(() => {
    if (isAuthenticated && !isLoading && sessionChecked && !redirectAttempted) {
      console.log("Register - User authenticated, redirecting to wizard");
      setRedirectAttempted(true);
      
      // Small delay to ensure all contexts are ready
      const timer = setTimeout(() => {
        navigate('/wizard', { replace: true });
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, sessionChecked, redirectAttempted, navigate, setRedirectAttempted]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-mps-secondary/30 p-4">
      <RegisterCard onRegisterSuccess={handleRegisterSuccess} />
    </div>
  );
};

export default Register;
