
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUserData } from '@/context/UserDataContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardSession = () => {
  const { isAuthenticated, user, isLoading: authLoading, sessionChecked, refreshSession } = useAuth();
  const { userData, isLoading: dataLoading, loadUserData } = useUserData();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [showTimeout, setShowTimeout] = useState(false);
  const [showMaxTimeout, setShowMaxTimeout] = useState(false);
  const [refreshAttempted, setRefreshAttempted] = useState(false);
  const [isVerifyingSession, setIsVerifyingSession] = useState(true);
  
  // Vérification manuelle de la session
  useEffect(() => {
    const verifySession = async () => {
      try {
        console.log("Dashboard - Verifying Supabase session");
        const { data } = await supabase.auth.getSession();
        
        const hasValidSession = !!data.session;
        console.log(`Dashboard - Session verification: ${hasValidSession ? 'Valid session found' : 'No valid session'}`);
        
        // Si pas de session valide mais l'état local dit qu'on est authentifié
        if (!hasValidSession && isAuthenticated) {
          console.warn("Dashboard - Session inconsistency detected, refreshing session");
          await refreshSession();
        }
        
        setIsVerifyingSession(false);
      } catch (error) {
        console.error("Dashboard - Error verifying session:", error);
        setIsVerifyingSession(false);
      }
    };
    
    verifySession();
  }, [isAuthenticated, refreshSession]);
  
  // Log de l'état pour diagnostic
  useEffect(() => {
    console.log("Dashboard state:", { 
      isAuthenticated, 
      authLoading, 
      sessionChecked,
      hasUserData: !!userData,
      dataLoading,
      showTimeout,
      showMaxTimeout,
      refreshAttempted,
      isVerifyingSession
    });
  }, [isAuthenticated, authLoading, sessionChecked, userData, dataLoading, showTimeout, showMaxTimeout, refreshAttempted, isVerifyingSession]);
  
  // Optimisations pour éviter les chargements redondants
  const loadUserDataIfNeeded = useCallback(async () => {
    if (sessionChecked && isAuthenticated && !authLoading && !userData && !dataLoading) {
      console.log("Dashboard - Loading user data");
      try {
        await loadUserData();
      } catch (error) {
        console.error("Dashboard - Error loading user data:", error);
        toast({
          variant: "destructive",
          title: "Erreur de chargement",
          description: "Impossible de charger vos données. Veuillez réessayer.",
        });
      }
    }
  }, [sessionChecked, isAuthenticated, authLoading, userData, dataLoading, loadUserData, toast]);
  
  // Chargement des données utilisateur
  useEffect(() => {
    loadUserDataIfNeeded();
  }, [loadUserDataIfNeeded]);
  
  // Redirection si non authentifié
  useEffect(() => {
    if (sessionChecked && !isAuthenticated && !authLoading && !isVerifyingSession) {
      console.log("Dashboard - Not authenticated, redirecting to login");
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate, sessionChecked, isVerifyingSession]);
  
  // Délais et timeouts améliorés
  useEffect(() => {
    // Court délai pour montrer les options de rafraîchissement
    const timer = setTimeout(() => {
      if ((authLoading || dataLoading || !sessionChecked || isVerifyingSession) && !refreshAttempted) {
        setShowTimeout(true);
      }
    }, 3000);
    
    // Délai intermédiaire pour la tentative de récupération automatique
    const refreshTimer = setTimeout(() => {
      if ((authLoading || dataLoading || !userData) && !refreshAttempted && sessionChecked && !isVerifyingSession) {
        console.log("Dashboard - Auto-attempting session recovery (5s)");
        handleSessionRefresh();
      }
    }, 5000);
    
    // Long délai pour montrer le message de timeout maximal
    const maxTimer = setTimeout(() => {
      if ((authLoading || dataLoading || !userData) && sessionChecked && !isVerifyingSession) {
        console.log("Dashboard - Loading timeout exceeded (10s)");
        setShowMaxTimeout(true);
      }
    }, 10000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(maxTimer);
      clearTimeout(refreshTimer);
    };
  }, [authLoading, dataLoading, sessionChecked, userData, refreshAttempted, isVerifyingSession]);
  
  // Fonction de rafraîchissement de session améliorée
  const handleSessionRefresh = async () => {
    setRefreshAttempted(true);
    try {
      console.log("Dashboard - Manual session refresh attempt");
      toast({
        title: "Rafraîchissement de la session",
        description: "Tentative de restauration de votre session...",
      });
      
      // Vérification directe avec Supabase avant de rafraîchir
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.log("Dashboard - No active session found, redirecting to login");
        toast({
          variant: "destructive",
          title: "Session expirée",
          description: "Votre session a expiré. Veuillez vous reconnecter.",
        });
        
        setTimeout(() => {
          navigate('/login');
        }, 1500);
        return;
      }
      
      // Rafraîchissement de la session dans le contexte
      await refreshSession();
      
      // Chargement des données utilisateur si nécessaire
      if (!userData) {
        console.log("Dashboard - Refreshing user data after session refresh");
        await loadUserData();
      }
      
      toast({
        title: "Session restaurée",
        description: "Votre session a été rafraîchie avec succès.",
      });
    } catch (error) {
      console.error("Dashboard - Failed to refresh session:", error);
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
  
  // Fonction pour rafraîchir la page
  const handleRefresh = () => {
    console.log("Dashboard - Manual page refresh");
    window.location.reload();
  };

  return {
    isAuthenticated,
    user,
    userData,
    isLoading: authLoading || !sessionChecked || dataLoading || isVerifyingSession,
    showTimeout,
    showMaxTimeout,
    refreshAttempted,
    handleSessionRefresh,
    handleRefresh
  };
};
