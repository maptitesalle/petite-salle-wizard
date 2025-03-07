
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useUserData } from '@/context/UserDataContext';
import { supabase } from '@/integrations/supabase/client';

export function useSessionRedirect(redirectPath: string, delay: number = 1000) {
  const { isAuthenticated, isLoading, user, sessionChecked } = useAuth();
  const { loadUserData } = useUserData();
  const navigate = useNavigate();
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const [sessionVerified, setSessionVerified] = useState(false);

  // Check the current session once on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log('Session check - Current session:', data.session ? 'Active' : 'None');
        setSessionVerified(true);
      } catch (error) {
        console.error('Session check - Error:', error);
        setSessionVerified(true); // Still mark as verified so we don't get stuck
      }
    };
    
    checkSession();
  }, []);

  // Handle redirect when authentication state changes and is confirmed
  useEffect(() => {
    if (!sessionVerified) return; // Wait until initial session check completes
    
    if (isAuthenticated && !isLoading && sessionChecked && !redirectAttempted && user) {
      console.log(`Session redirect - User is authenticated (${user.id}), navigating to ${redirectPath}`);
      setRedirectAttempted(true);
      
      // Load user data before redirecting
      loadUserData()
        .then(() => {
          console.log(`Session redirect - User data loaded, redirecting to ${redirectPath}`);
          const redirectTimer = setTimeout(() => {
            navigate(redirectPath, { replace: true });
          }, delay);
          
          return () => clearTimeout(redirectTimer);
        })
        .catch(error => {
          console.error('Session redirect - Error loading user data:', error);
          const redirectTimer = setTimeout(() => {
            navigate(redirectPath, { replace: true });
          }, delay);
          
          return () => clearTimeout(redirectTimer);
        });
    }
  }, [isAuthenticated, isLoading, sessionChecked, navigate, redirectAttempted, user, loadUserData, redirectPath, delay, sessionVerified]);

  return { redirectAttempted, setRedirectAttempted };
}
