
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserData } from '@/context/UserDataContext';
import { Utensils, AlertTriangle, RefreshCw, List, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const NutritionSection: React.FC = () => {
  const { userData } = useUserData();
  const [nutritionPlan, setNutritionPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState(0);
  const [activeView, setActiveView] = useState('plan');
  const { toast } = useToast();

  const generateNutritionPlan = async () => {
    setIsLoading(true);
    setError(null);

    try {
      toast({
        title: "Génération du plan nutritionnel",
        description: "Veuillez patienter pendant que nous générons votre plan personnalisé...",
      });

      console.log("Calling generate-nutrition-plan with userData:", userData);

      // Call our Supabase Edge Function directly
      const { data, error } = await supabase.functions.invoke('generate-nutrition-plan', {
        body: { userData },
      });

      if (error) {
        console.error("Error from Edge Function:", error);
        throw new Error(`Erreur lors de l'appel à l'API: ${error.message}`);
      }

      console.log("Edge Function response received:", data);

      if (data.error) {
        console.warn("Warning from Edge Function:", data.error);
        toast({
          title: "Attention",
          description: data.error,
          variant: "destructive",
        });
      }

      if (!data.nutritionPlan) {
        throw new Error("Le plan nutritionnel n'a pas été généré correctement");
      }

      setNutritionPlan(data.nutritionPlan);
      
      toast({
        title: "Plan nutritionnel généré",
        description: "Votre plan nutritionnel personnalisé est prêt !",
        variant: "default",
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
    // Add safeguard to prevent calling the API with null userData
    if (userData) {
      generateNutritionPlan();
    }
  }, [userData]);

  const sendShoppingListByEmail = () => {
    // Implémentation future: envoi de la liste de courses par email
    toast({
      title: "Fonctionnalité en développement",
      description: "L'envoi de la liste de courses par email sera disponible prochainement.",
    });
  };

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

  // Vérifier si le plan nutritionnel a la structure attendue
  if (!nutritionPlan.days || !Array.isArray(nutritionPlan.days) || nutritionPlan.days.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-mps-error mx-auto mb-4" />
            <h3 className="text-lg font-medium text-mps-error mb-2">Format de données invalide</h3>
            <p className="text-mps-text mb-4">Le plan nutritionnel n'a pas la structure attendue.</p>
            <Button onClick={generateNutritionPlan}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Régénérer le plan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // S'assurer que activeDay est dans les limites valides
  if (activeDay >= nutritionPlan.days.length) {
    setActiveDay(0);
    return null; // Éviter le rendu avec un index invalide
  }

  const currentDay = nutritionPlan.days[activeDay];

  const renderIngredientsList = (ingredients: string[]) => {
    if (!ingredients || !Array.isArray(ingredients)) {
      return <p className="text-mps-text italic">Ingrédients non disponibles</p>;
    }
    
    return (
      <ul className="list-disc pl-5 space-y-1">
        {ingredients.map((ingredient, idx) => (
          <li key={idx} className="text-mps-text">{ingredient}</li>
        ))}
      </ul>
    );
  };

  const renderShoppingList = () => {
    if (!nutritionPlan.shoppingList || !nutritionPlan.shoppingList.categories) {
      return (
        <div className="text-center p-8">
          <p className="text-mps-text">Liste de courses non disponible.</p>
          <Button onClick={generateNutritionPlan} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Régénérer le plan avec la liste de courses
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-mps-primary">Liste de courses</h3>
          <Button onClick={sendShoppingListByEmail} variant="outline" className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>Envoyer par email</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(nutritionPlan.shoppingList.categories).map(([category, items]) => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(items) ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {items.map((item, idx) => (
                      <li key={idx} className="text-mps-text">{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-mps-text italic">Éléments non disponibles</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

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

      <Tabs defaultValue="plan" onValueChange={value => setActiveView(value)}>
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="plan" className="flex items-center">
            <Utensils className="h-4 w-4 mr-2" />
            Plan nutritionnel
          </TabsTrigger>
          <TabsTrigger value="shopping" className="flex items-center">
            <List className="h-4 w-4 mr-2" />
            Liste de courses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plan" className="space-y-6">
          <div className="bg-mps-secondary/30 p-4 rounded-md mb-6 overflow-x-auto">
            <div className="flex space-x-2 min-w-max">
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
            {currentDay && currentDay.meals ? (
              Object.entries(currentDay.meals).map(([key, meal]: [string, any]) => {
                if (!meal) return null;
                
                return (
                  <Card key={key} className="hover:shadow-medium transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center">
                        <Utensils className="h-5 w-5 mr-2 text-mps-primary" />
                        {meal.title || (
                          key === 'breakfast' ? 'Petit-déjeuner' : 
                          key === 'lunch' ? 'Déjeuner' : 
                          key === 'snack' ? 'Collation' : 'Dîner'
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-mps-text mb-4">{meal.description || 'Description non disponible'}</p>
                      
                      <div className="mb-4">
                        <h4 className="font-medium text-mps-primary mb-2">Ingrédients :</h4>
                        {renderIngredientsList(meal.ingredients)}
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-mps-primary mb-2">Préparation :</h4>
                        <p className="text-mps-text text-sm">{meal.preparation || 'Instructions non disponibles'}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 flex justify-between text-sm text-mps-text/80">
                      <span>{(meal.calories || 0)} calories</span>
                    </CardFooter>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-2 text-center p-8">
                <p className="text-mps-text">Données des repas non disponibles.</p>
              </div>
            )}
          </div>

          {currentDay && currentDay.macros ? (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Résumé nutritionnel du jour</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-mps-secondary/20 rounded-md text-center">
                    <div className="text-xl font-semibold text-mps-primary">{currentDay.totalCalories || 0}</div>
                    <div className="text-sm text-mps-text">Calories totales</div>
                  </div>
                  <div className="p-4 bg-mps-secondary/20 rounded-md text-center">
                    <div className="text-xl font-semibold text-mps-primary">{currentDay.macros.proteins || '0%'}</div>
                    <div className="text-sm text-mps-text">Protéines</div>
                  </div>
                  <div className="p-4 bg-mps-secondary/20 rounded-md text-center">
                    <div className="text-xl font-semibold text-mps-primary">{currentDay.macros.carbs || '0%'}</div>
                    <div className="text-sm text-mps-text">Glucides</div>
                  </div>
                  <div className="p-4 bg-mps-secondary/20 rounded-md text-center">
                    <div className="text-xl font-semibold text-mps-primary">{currentDay.macros.fats || '0%'}</div>
                    <div className="text-sm text-mps-text">Lipides</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 text-sm text-mps-text/80 italic">
                {nutritionPlan.disclaimer || "Ces recommandations nutritionnelles sont générées automatiquement et doivent être validées par un professionnel de santé."}
              </CardFooter>
            </Card>
          ) : (
            <Card className="mt-8">
              <CardContent className="p-6 text-center">
                <p className="text-mps-text">Données nutritionnelles non disponibles.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="shopping">
          {renderShoppingList()}
        </TabsContent>
      </Tabs>

      <div className="flex justify-center mt-8">
        <Button onClick={generateNutritionPlan} className="mr-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Régénérer le plan
        </Button>
      </div>
    </div>
  );
};

export default NutritionSection;
