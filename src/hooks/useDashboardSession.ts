
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUserData } from '@/context/UserDataContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useDashboardSession = () => {
  const { isAuthenticated, user, isLoading: authLoading, refreshSession } = useAuth();
  const { userData, isLoading: dataLoading, loadUserData } = useUserData();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [showTimeout, setShowTimeout] = useState(false);
  const [showMaxTimeout, setShowMaxTimeout] = useState(false);
  const [refreshAttempted, setRefreshAttempted] = useState(false);
  
  // Show timeout UI after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (authLoading || dataLoading) {
        setShowTimeout(true);
      }
    }, 3000);
    
    const maxTimer = setTimeout(() => {
      if (authLoading || dataLoading) {
        setShowMaxTimeout(true);
      }
    }, 8000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(maxTimer);
    };
  }, [authLoading, dataLoading]);
  
  // Load user data if authenticated
  useEffect(() => {
    if (isAuthenticated && user && !userData && !dataLoading) {
      loadUserData().catch(error => {
        console.error("Error loading user data:", error);
        toast({
          variant: "destructive",
          title: "Erreur de chargement",
          description: "Impossible de charger vos données. Veuillez réessayer.",
        });
      });
    }
  }, [isAuthenticated, user, userData, dataLoading, loadUserData, toast]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);
  
  // Handle session refresh
  const handleSessionRefresh = async () => {
    try {
      setRefreshAttempted(true);
      
      toast({
        title: "Rafraîchissement de la session",
        description: "Tentative de restauration de votre session...",
      });
      
      await refreshSession();
      
      if (!userData) {
        await loadUserData();
      }
      
      toast({
        title: "Session restaurée",
        description: "Votre session a été rafraîchie avec succès.",
      });
    } catch (error) {
      console.error("Failed to refresh session:", error);
      toast({
        variant: "destructive",
        title: "Erreur de session",
        description: "Impossible de restaurer votre session. Veuillez vous reconnecter.",
      });
      
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    }
  };
  
  // Handle page refresh
  const handleRefresh = () => {
    window.location.reload();
  };

  return {
    isAuthenticated,
    user,
    userData,
    isLoading: authLoading || dataLoading,
    showTimeout,
    showMaxTimeout,
    refreshAttempted,
    handleSessionRefresh,
    handleRefresh
  };
};
