
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
  const { saveUserData, isLoading } = useUserData();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  
  const totalSteps = 5;

  // Add debug logging for Wizard page
  useEffect(() => {
    console.log('Wizard page loaded. Auth state:', { isAuthenticated, authLoading, user });
  }, [isAuthenticated, authLoading, user]);
  
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
      console.log('Rendering step:', currentStep);
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
      console.error('Error rendering step:', error);
      return <div>Erreur lors du chargement de cette étape.</div>;
    }
  };
  
  // Show loading state while auth is being determined
  if (authLoading) {
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
              disabled={isLoading}
            >
              {isLoading ? 'Sauvegarde...' : 'Sauvegarder'} <Save className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wizard;
