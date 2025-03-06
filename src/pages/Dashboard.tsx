
import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useUserData } from '@/context/UserDataContext';
import { useToast } from '@/hooks/use-toast';
import { Edit, Utensils, Beaker, ActivitySquare, Dumbbell } from 'lucide-react';
import NutritionSection from '@/components/dashboard/NutritionSection';
// Placeholder imports for other sections that aren't yet implemented
// import SupplementsSection from '@/components/dashboard/SupplementsSection';
// import FlexibilitySection from '@/components/dashboard/FlexibilitySection';
// import GymSection from '@/components/dashboard/GymSection';

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const { userData, isLoading } = useUserData();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Placeholder components for the sections that aren't implemented yet
  const SupplementsSection = () => (
    <div className="p-8 text-center">
      <Beaker className="h-16 w-16 mx-auto mb-4 text-mps-primary opacity-50" />
      <h3 className="text-2xl font-semibold text-mps-text mb-2">Compléments Alimentaires</h3>
      <p className="text-mps-text/70 mb-6">
        Découvrez les compléments adaptés à vos objectifs et votre profil
      </p>
      <div className="border-2 border-dashed border-mps-primary/30 rounded-lg p-8 text-mps-text/50">
        Cette section sera disponible prochainement
      </div>
    </div>
  );
  
  const FlexibilitySection = () => (
    <div className="p-8 text-center">
      <ActivitySquare className="h-16 w-16 mx-auto mb-4 text-mps-primary opacity-50" />
      <h3 className="text-2xl font-semibold text-mps-text mb-2">Exercices de Souplesse</h3>
      <p className="text-mps-text/70 mb-6">
        Améliorez votre souplesse avec des exercices personnalisés
      </p>
      <div className="border-2 border-dashed border-mps-primary/30 rounded-lg p-8 text-mps-text/50">
        Cette section sera disponible prochainement
      </div>
    </div>
  );
  
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
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-mps-secondary/30 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-pulse-subtle">
              <div className="h-12 w-12 rounded-full bg-mps-primary/50 mb-4"></div>
              <div className="h-6 w-48 bg-mps-primary/20 mb-2 rounded"></div>
              <div className="h-4 w-64 bg-mps-primary/10 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
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
