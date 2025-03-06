
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useUserData } from '@/context/UserDataContext';
import { supabase } from '@/integrations/supabase/client';

export function useSessionRedirect(redirectPath: string, delay: number = 2000) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { loadUserData } = useUserData();
  const navigate = useNavigate();
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  // Check the current session on component mount
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      console.log('Session check - Current session:', data.session);
    };
    
    checkSession();
  }, []);

  // Handle redirect when authentication state changes
  useEffect(() => {
    if (isAuthenticated && !isLoading && !redirectAttempted && user) {
      console.log(`Session redirect - User is authenticated, navigating to ${redirectPath}`);
      setRedirectAttempted(true);
      
      // Always navigate to specified path after authentication
      loadUserData().then(() => {
        console.log(`Session redirect - User data loaded, redirecting to ${redirectPath}`);
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, delay);
      }).catch(error => {
        console.error('Session redirect - Error loading user data:', error);
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, delay);
      });
    }
  }, [isAuthenticated, isLoading, navigate, redirectAttempted, user, loadUserData, redirectPath, delay]);

  // Check if user is already authenticated on initial render
  useEffect(() => {
    if (isAuthenticated && !isLoading && user && !redirectAttempted) {
      console.log(`Session redirect - User already authenticated, redirecting to ${redirectPath}`);
      setRedirectAttempted(true);
      
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, delay);
    }
  }, []);

  return { redirectAttempted, setRedirectAttempted };
}
