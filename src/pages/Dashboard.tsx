
import React, { useEffect, useState } from 'react';
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

const Dashboard = () => {
  const { isAuthenticated, user, isLoading, sessionChecked } = useAuth();
  const { userData, isLoading: dataLoading, loadUserData } = useUserData();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Add state to track if we're showing a timeout message
  const [showTimeout, setShowTimeout] = useState(false);
  const [showMaxTimeout, setShowMaxTimeout] = useState(false);
  
  useEffect(() => {
    // Si l'authentification est vérifiée et que l'utilisateur est authentifié mais que userData est null,
    // essayer de recharger les données utilisateur
    if (sessionChecked && isAuthenticated && !isLoading && !userData && !dataLoading) {
      console.log("Dashboard - Session checked, user authenticated, but userData is null. Reloading user data.");
      loadUserData().catch(error => {
        console.error("Error loading user data:", error);
      });
    }
    
    // If we've checked the session and the user is not authenticated, redirect to login
    if (sessionChecked && !isAuthenticated && !isLoading) {
      navigate('/login');
    }
    
    // Set a timer to show the refresh button after 5 seconds if still loading
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, 5000);
    
    // Set a timer for a hard page reload after 20 seconds if still loading
    const maxTimer = setTimeout(() => {
      if ((isLoading || dataLoading) && !userData) {
        setShowMaxTimeout(true);
        console.log("Dashboard - Loading timeout exceeded, suggest page reload");
      }
    }, 20000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(maxTimer);
    };
  }, [isAuthenticated, isLoading, navigate, sessionChecked, userData, dataLoading, loadUserData]);
  
  const handleRefresh = () => {
    window.location.reload();
  };
  
  // Si le chargement prend trop de temps (20 secondes), proposer une solution plus radicale
  if (showMaxTimeout && (isLoading || dataLoading || !userData)) {
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
  
  // If still checking authentication or loading user data, show a loading state with a refresh button after timeout
  if (isLoading || !sessionChecked || dataLoading) {
    return (
      <div className="min-h-screen bg-mps-secondary/30 flex flex-col items-center justify-center">
        <div className="animate-pulse-subtle mb-6">
          <div className="h-12 w-12 rounded-full bg-mps-primary/50 mb-4 mx-auto"></div>
          <div className="h-6 w-48 bg-mps-primary/20 mb-2 rounded"></div>
          <div className="h-4 w-64 bg-mps-primary/10 rounded"></div>
        </div>
        
        {showTimeout && (
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            className="mt-4 flex items-center gap-2"
          >
            <RefreshCcw size={16} /> Rafraîchir la page
          </Button>
        )}
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
              className="bg-mps-primary hover:bg-mps-primary/90"
            >
              <Edit className="mr-2 h-4 w-4" /> Compléter mes informations
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
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
