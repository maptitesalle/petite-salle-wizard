
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserData } from '@/context/UserDataContext';
import { Utensils, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const NutritionSection: React.FC = () => {
  const { userData } = useUserData();
  const [nutritionPlan, setNutritionPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState(0);
  const { toast } = useToast();

  const generateNutritionPlan = async () => {
    setIsLoading(true);
    setError(null);

    try {
      toast({
        title: "Génération du plan nutritionnel",
        description: "Veuillez patienter pendant que nous générons votre plan personnalisé...",
      });

      // Call our Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('generate-nutrition-plan', {
        body: { userData },
      });

      if (error) {
        throw new Error(`Erreur lors de l'appel à l'API: ${error.message}`);
      }

      if (data.error) {
        throw new Error(`Erreur de génération: ${data.error}`);
      }

      setNutritionPlan(data.nutritionPlan);
      
      toast({
        title: "Plan nutritionnel généré",
        description: "Votre plan nutritionnel personnalisé est prêt !",
        variant: "default", // Modifié "success" en "default"
      });
    } catch (error) {
      console.error('Error generating nutrition plan:', error);
      setError('Une erreur est survenue lors de la génération du plan nutritionnel.');
      
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
    // Generate the nutrition plan when the component mounts
    if (userData) {
      generateNutritionPlan();
    }
  }, [userData]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-mps-primary/30 border-t-mps-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-mps-text">Génération de votre plan nutritionnel personnalisé...</p>
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
            <Button onClick={generateNutritionPlan}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!nutritionPlan) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <p className="text-mps-text">Chargement des données...</p>
      </div>
    );
  }

  const currentDay = nutritionPlan.days[activeDay];

  return (
    <div className="space-y-6 animate-fade-in">
      {nutritionPlan.alert && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
            <div>
              <p className="text-sm text-amber-700">{nutritionPlan.alert}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-mps-secondary/30 p-4 rounded-md mb-6">
        <div className="flex overflow-x-auto pb-2 space-x-2 scrollbar-none">
          {nutritionPlan.days.map((day: any, index: number) => (
            <button
              key={index}
              onClick={() => setActiveDay(index)}
              className={`px-4 py-2 rounded-md whitespace-nowrap transition-all ${
                activeDay === index 
                  ? 'bg-mps-primary text-white shadow-sm' 
                  : 'bg-white text-mps-text hover:bg-mps-secondary'
              }`}
            >
              {day.day}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(currentDay.meals).map(([key, meal]: [string, any]) => (
          <Card key={key} className="hover:shadow-medium transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <Utensils className="h-5 w-5 mr-2 text-mps-primary" />
                {meal.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-mps-text">{meal.description}</p>
            </CardContent>
            <CardFooter className="pt-0 flex justify-between text-sm text-mps-text/80">
              <span>{meal.calories} calories</span>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Résumé nutritionnel du jour</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-mps-secondary/20 rounded-md text-center">
              <div className="text-xl font-semibold text-mps-primary">{currentDay.totalCalories}</div>
              <div className="text-sm text-mps-text">Calories totales</div>
            </div>
            <div className="p-4 bg-mps-secondary/20 rounded-md text-center">
              <div className="text-xl font-semibold text-mps-primary">{currentDay.macros.proteins}</div>
              <div className="text-sm text-mps-text">Protéines</div>
            </div>
            <div className="p-4 bg-mps-secondary/20 rounded-md text-center">
              <div className="text-xl font-semibold text-mps-primary">{currentDay.macros.carbs}</div>
              <div className="text-sm text-mps-text">Glucides</div>
            </div>
            <div className="p-4 bg-mps-secondary/20 rounded-md text-center">
              <div className="text-xl font-semibold text-mps-primary">{currentDay.macros.fats}</div>
              <div className="text-sm text-mps-text">Lipides</div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-4 text-sm text-mps-text/80 italic">
          {nutritionPlan.disclaimer}
        </CardFooter>
      </Card>

      <div className="flex justify-center mt-8">
        <Button onClick={generateNutritionPlan} className="mr-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Régénérer le plan
        </Button>
        <Button variant="secondary" className="flex items-center space-x-2">
          <span>Voir plus de détails</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default NutritionSection;
