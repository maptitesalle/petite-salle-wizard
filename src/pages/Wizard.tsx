
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import StepOne from '@/components/wizard/StepOne';
import StepTwo from '@/components/wizard/StepTwo';
import StepThree from '@/components/wizard/StepThree';
import StepFour from '@/components/wizard/StepFour';
import StepFive from '@/components/wizard/StepFive';
import { Progress } from '@/components/ui/progress';
import { useUserData } from '@/context/UserDataContext';
import { useAuth } from '@/context/AuthContext';

const Wizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { saveUserData, isLoading: dataLoading, userData, setUserData } = useUserData();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  
  const totalSteps = 5;
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize userData with default values if it's null
  useEffect(() => {
    console.log('Wizard page - userData check:', userData);
    console.log('Wizard page - Auth check:', { isAuthenticated, authLoading, user });
    
    // Set a small timeout to ensure auth context has been fully initialized
    const initTimer = setTimeout(() => {
      if (!userData && !dataLoading) {
        console.log('Wizard page - Initializing userData with default values');
        setUserData({
          personalInfo: { sex: '', age: 0 },
          eGymData: {
            force: { hautDuCorps: 0, milieuDuCorps: 0, basDuCorps: 0 },
            flexibilite: { cou: 0, epaules: 0, lombaires: 0, ischios: 0, hanches: 0 },
            metabolique: { poids: 0, masseGraisseuse: 0, masseMusculaire: 0, ageMetabolique: 0 },
            cardio: { vo2max: 0, ageCardio: 0 }
          },
          objectives: {
            priseDeMasse: false,
            perteDePoids: false,
            ameliorationSouplesse: false,
            ameliorationCardio: false,
            maintienForme: false
          },
          dietaryRestrictions: {
            sansGluten: false,
            vegan: false,
            sansOeuf: false,
            sansProduitLaitier: false
          },
          healthConditions: {
            insuffisanceCardiaque: false,
            arthrose: false,
            problemesRespiratoires: false,
            obesite: false,
            hypothyroidie: false,
            autresInfoSante: ''
          },
          lastUpdated: ''
        });
      }
      setIsInitializing(false);
    }, 1000); // Give auth context time to initialize
    
    return () => clearTimeout(initTimer);
  }, [userData, dataLoading, setUserData, isAuthenticated, authLoading, user]);
  
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Non connecté",
        description: "Veuillez vous connecter pour sauvegarder vos données",
      });
      navigate('/login', { state: { returnTo: '/wizard' } });
      return;
    }
    
    try {
      await saveUserData();
      toast({
        title: "Données sauvegardées",
        description: "Vos informations ont été enregistrées avec succès dans la base de données",
      });
      navigate('/dashboard');
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder vos données dans la base de données",
      });
    }
  };
  
  const renderStep = () => {
    try {
      console.log('Wizard page - Rendering step:', currentStep);
      
      // Additional safeguard - If userData is null, don't render the step components
      if (!userData) {
        console.log('Wizard page - userData is null, showing loading state');
        return (
          <div className="flex justify-center items-center p-10">
            <div>Chargement des données...</div>
          </div>
        );
      }
      
      switch (currentStep) {
        case 1:
          return <StepOne />;
        case 2:
          return <StepTwo />;
        case 3:
          return <StepThree />;
        case 4:
          return <StepFour />;
        case 5:
          return <StepFive />;
        default:
          return <StepOne />;
      }
    } catch (error) {
      console.error('Wizard page - Error rendering step:', error);
      return <div>Erreur lors du chargement de cette étape. Veuillez réessayer.</div>;
    }
  };
  
  // Show loading state while initializing
  if (authLoading || dataLoading || isInitializing) {
    return (
      <div className="min-h-screen bg-mps-secondary/30 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">Chargement...</div>
          <Progress value={100} className="w-48 h-2 bg-mps-secondary animate-pulse" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-mps-secondary/30 py-10 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-mps-primary text-center mb-2">
            Configurez votre profil
          </h1>
          <p className="text-mps-text text-center mb-6">
            Étape {currentStep} sur {totalSteps}
          </p>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2 bg-mps-secondary" />
        </div>
        
        <Card className="mb-6 border-mps-primary/20">
          <CardContent className="pt-6">
            {renderStep()}
          </CardContent>
        </Card>
        
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="border-mps-primary text-mps-primary hover:bg-mps-primary/10"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Précédent
          </Button>
          
          {currentStep < totalSteps ? (
            <Button onClick={nextStep} className="bg-mps-primary hover:bg-mps-primary/90">
              Suivant <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              className="bg-mps-success hover:bg-mps-success/90"
              disabled={dataLoading}
            >
              {dataLoading ? 'Sauvegarde...' : 'Sauvegarder'} <Save className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wizard;
