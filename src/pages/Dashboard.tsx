
import React, { useEffect, useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useUserData } from '@/context/UserDataContext';
import { useToast } from '@/hooks/use-toast';
import { Edit, Utensils, Beaker, ActivitySquare, Dumbbell, RefreshCcw } from 'lucide-react';
import NutritionSection from '@/components/dashboard/NutritionSection';
import SupplementsSection from '@/components/dashboard/SupplementsSection';
import FlexibilitySection from '@/components/dashboard/FlexibilitySection';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
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
  
  // Affichage pour le timeout maximal
  if (showMaxTimeout && (authLoading || dataLoading || !userData) && !isVerifyingSession) {
    return (
      <div className="min-h-screen bg-mps-secondary/30 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-mps-primary mb-4">Problème de chargement détecté</h2>
          <p className="mb-6">
            Le chargement de vos données prend plus de temps que prévu. Cela peut être dû à un problème de connexion ou à une erreur temporaire.
          </p>
          <div className="space-y-4">
            <Button 
              variant="default" 
              onClick={handleSessionRefresh}
              className="w-full flex items-center justify-center gap-2"
              disabled={refreshAttempted}
            >
              <RefreshCcw size={16} /> Restaurer la session
            </Button>
            <Button 
              variant="default" 
              onClick={handleRefresh}
              className="w-full flex items-center justify-center gap-2"
            >
              <RefreshCcw size={16} /> Rafraîchir la page
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Retourner à la page de connexion
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Affichage pendant le chargement
  if (authLoading || !sessionChecked || dataLoading || isVerifyingSession) {
    return (
      <div className="min-h-screen bg-mps-secondary/30 flex flex-col items-center justify-center">
        <div className="animate-pulse-subtle mb-6">
          <div className="h-12 w-12 rounded-full bg-mps-primary/50 mb-4 mx-auto"></div>
          <div className="h-6 w-48 bg-mps-primary/20 mb-2 rounded"></div>
          <div className="h-4 w-64 bg-mps-primary/10 rounded"></div>
        </div>
        
        {showTimeout && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-mps-text/70 mb-2">Le chargement prend plus de temps que prévu</p>
            <Button 
              variant="default"
              onClick={handleSessionRefresh}
              className="flex items-center gap-2"
              disabled={refreshAttempted}
            >
              <RefreshCcw size={16} /> Restaurer la session
            </Button>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCcw size={16} /> Rafraîchir la page
            </Button>
          </div>
        )}
      </div>
    );
  }
  
  // Affichage si aucune donnée utilisateur
  if (!userData) {
    return (
      <div className="min-h-screen bg-mps-secondary/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl text-mps-primary">Aucune donnée disponible</CardTitle>
            <CardDescription>
              Vous devez compléter le formulaire d'information pour accéder à votre tableau de bord
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button 
              onClick={() => navigate('/wizard')}
              className="bg-mps-primary hover:bg-mps-primary/80"
            >
              <Edit className="mr-2 h-4 w-4" /> Compléter mes informations
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const getFlexibilityStatus = (value: number): string => {
    if (value >= 75) return 'excellent';
    if (value >= 50) return 'normal';
    return 'faible';
  };
  
  const GymSection = () => (
    <div className="p-8 text-center">
      <Dumbbell className="h-16 w-16 mx-auto mb-4 text-mps-primary opacity-50" />
      <h3 className="text-2xl font-semibold text-mps-text mb-2">Programme d'Entraînement</h3>
      <p className="text-mps-text/70 mb-6">
        Suivez votre plan d'entraînement personnalisé pour atteindre vos objectifs
      </p>
      <div className="border-2 border-dashed border-mps-primary/30 rounded-lg p-8 text-mps-text/50">
        Cette section sera disponible prochainement
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-mps-secondary/30 py-6 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-mps-primary">Tableau de Bord</h1>
          <p className="text-mps-text/80">
            Bienvenue {user?.name || 'Membre'}, voici vos recommandations personnalisées
          </p>
        </div>
        
        <Tabs defaultValue="nutrition" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="nutrition" className="data-[state=active]:bg-mps-primary data-[state=active]:text-white">
              <Utensils className="mr-2 h-4 w-4" /> Nutrition
            </TabsTrigger>
            <TabsTrigger value="supplements" className="data-[state=active]:bg-mps-primary data-[state=active]:text-white">
              <Beaker className="mr-2 h-4 w-4" /> Compléments
            </TabsTrigger>
            <TabsTrigger value="flexibility" className="data-[state=active]:bg-mps-primary data-[state=active]:text-white">
              <ActivitySquare className="mr-2 h-4 w-4" /> Souplesse
            </TabsTrigger>
            <TabsTrigger value="gym" className="data-[state=active]:bg-mps-primary data-[state=active]:text-white">
              <Dumbbell className="mr-2 h-4 w-4" /> Salle
            </TabsTrigger>
          </TabsList>
          
          <Card>
            <TabsContent value="nutrition" className="mt-0">
              <NutritionSection />
            </TabsContent>
            
            <TabsContent value="supplements" className="mt-0">
              <SupplementsSection />
            </TabsContent>
            
            <TabsContent value="flexibility" className="mt-0">
              <FlexibilitySection />
            </TabsContent>
            
            <TabsContent value="gym" className="mt-0">
              <GymSection />
            </TabsContent>
          </Card>
        </Tabs>
        
        <div className="mt-8 flex justify-end">
          <Button 
            variant="outline" 
            onClick={() => navigate('/wizard')}
            className="border-mps-primary text-mps-primary hover:bg-mps-primary/10"
          >
            <Edit className="mr-2 h-4 w-4" /> Mettre à jour mes informations
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
