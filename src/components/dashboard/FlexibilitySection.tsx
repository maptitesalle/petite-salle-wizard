
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserData } from '@/context/UserDataContext';
import { Activity, AlertTriangle, RefreshCw, Clock, Info, Target, Dumbbell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FlexibilityExercise {
  name: string;
  targetArea: string;
  description: string;
  benefits: string;
  frequency: string;
  duration: string;
  precautions: string | null;
  equipment: string[] | null;
}

interface FlexibilityPlan {
  disclaimer: string;
  introduction: string;
  exercises: FlexibilityExercise[];
}

const FlexibilitySection: React.FC = () => {
  const { userData } = useUserData();
  const [flexibilityPlan, setFlexibilityPlan] = useState<FlexibilityPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateFlexibilityPlan = async () => {
    setIsLoading(true);
    setError(null);

    try {
      toast({
        title: "Génération du programme d'exercices",
        description: "Veuillez patienter pendant que nous générons votre programme personnalisé...",
      });

      // Call our Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('generate-ai-content', {
        body: { 
          userData,
          contentType: 'flexibility'
        },
      });

      if (error) {
        throw new Error(`Erreur lors de l'appel à l'API: ${error.message}`);
      }

      if (data.error) {
        throw new Error(`Erreur de génération: ${data.error}`);
      }

      setFlexibilityPlan(data.content);
      
      toast({
        title: "Programme généré",
        description: "Votre programme d'exercices de souplesse est prêt !",
        variant: "default",
      });
    } catch (error) {
      console.error('Error generating flexibility plan:', error);
      setError('Une erreur est survenue lors de la génération du programme d\'exercices.');
      
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : 'Une erreur inattendue est survenue',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Generate the flexibility plan when the component mounts
    if (userData) {
      generateFlexibilityPlan();
    }
  }, [userData]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-mps-primary/30 border-t-mps-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-mps-text">Génération de votre programme d'exercices personnalisé...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-mps-error mx-auto mb-4" />
            <h3 className="text-lg font-medium text-mps-error mb-2">Une erreur est survenue</h3>
            <p className="text-mps-text mb-4">{error}</p>
            <Button onClick={generateFlexibilityPlan}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!flexibilityPlan) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <p className="text-mps-text">Chargement des données...</p>
      </div>
    );
  }

  const renderEquipment = (equipment: string[] | null) => {
    if (!equipment || equipment.length === 0) return "Aucun équipement nécessaire";
    
    return (
      <ul className="list-disc pl-5 space-y-1">
        {equipment.map((item, idx) => (
          <li key={idx} className="text-mps-text">{item}</li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="bg-mps-secondary/20 p-6 rounded-md mb-6">
        <h3 className="text-xl font-semibold text-mps-primary mb-3">Introduction</h3>
        <p className="text-mps-text">{flexibilityPlan.introduction}</p>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md mb-8">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
          <div>
            <p className="text-sm text-amber-700">{flexibilityPlan.disclaimer}</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {flexibilityPlan.exercises.map((exercise, index) => (
          <Card key={index} className="hover:shadow-medium transition-shadow overflow-hidden">
            <CardHeader className="bg-mps-secondary/20 pb-3">
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-mps-primary" />
                {exercise.name}
              </CardTitle>
              <div className="flex items-center text-sm text-mps-text/70 mt-1">
                <Target className="h-4 w-4 mr-1" />
                <span>Zone ciblée: {exercise.targetArea}</span>
              </div>
            </CardHeader>
            <CardContent className="pt-4 pb-3 space-y-4">
              <p className="text-mps-text">{exercise.description}</p>
              
              <div>
                <h4 className="font-medium text-mps-primary mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Bénéfices:
                </h4>
                <p className="text-mps-text">{exercise.benefits}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-mps-secondary/10 rounded-md">
                  <h4 className="font-medium text-mps-primary mb-1 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Fréquence:
                  </h4>
                  <p className="text-mps-text">{exercise.frequency}</p>
                </div>
                
                <div className="p-3 bg-mps-secondary/10 rounded-md">
                  <h4 className="font-medium text-mps-primary mb-1">Durée:</h4>
                  <p className="text-mps-text">{exercise.duration}</p>
                </div>
              </div>
              
              {exercise.precautions && (
                <div className="p-3 bg-amber-50 rounded-md">
                  <h4 className="font-medium text-amber-700 mb-1">Précautions:</h4>
                  <p className="text-amber-700 text-sm">{exercise.precautions}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-mps-secondary/5 border-t border-mps-secondary/20">
              <div className="w-full">
                <h4 className="font-medium text-mps-primary mb-2 flex items-center">
                  <Dumbbell className="h-4 w-4 mr-2" />
                  Équipement:
                </h4>
                <div className="text-mps-text/80">{renderEquipment(exercise.equipment)}</div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Button onClick={generateFlexibilityPlan}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Régénérer le programme
        </Button>
      </div>
    </div>
  );
};

export default FlexibilitySection;
