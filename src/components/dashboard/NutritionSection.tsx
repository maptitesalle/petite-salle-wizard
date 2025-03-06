
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserData } from '@/context/UserDataContext';
import { Utensils, AlertTriangle, RefreshCw, Clock, Pizza, Apple, Carrot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NutritionPlan {
  breakfast: {
    description: string;
    examples: string[];
    timing: string;
  };
  lunch: {
    description: string;
    examples: string[];
    timing: string;
  };
  dinner: {
    description: string;
    examples: string[];
    timing: string;
  };
  snacks: {
    description: string;
    examples: string[];
    timing: string;
  };
  hydration: string;
  disclaimer: string;
}

// Default nutrition plan to use as fallback
const defaultNutritionPlan: NutritionPlan = {
  breakfast: {
    description: "Repas équilibré riche en protéines et fibres",
    examples: ["Œufs brouillés avec des légumes", "Porridge aux fruits rouges"],
    timing: "7h-9h"
  },
  lunch: {
    description: "Repas complet avec protéines, légumes et glucides complexes",
    examples: ["Salade composée avec poulet grillé", "Bol de quinoa aux légumes"],
    timing: "12h-14h"
  },
  dinner: {
    description: "Repas léger et équilibré",
    examples: ["Poisson grillé avec légumes vapeur", "Soupe de légumes avec tofu"],
    timing: "19h-21h"
  },
  snacks: {
    description: "Collations saines pour maintenir l'énergie",
    examples: ["Fruits frais", "Poignée d'amandes", "Yaourt nature"],
    timing: "10h30 et 16h"
  },
  hydration: "Boire au moins 2L d'eau par jour, répartis tout au long de la journée",
  disclaimer: "Ces recommandations sont générales. Consultez un professionnel de santé pour des conseils personnalisés."
};

const NutritionSection: React.FC = () => {
  const { userData } = useUserData();
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [retryCount, setRetryCount] = useState(0);
  const [useFallbackPlan, setUseFallbackPlan] = useState(false);

  const generateNutritionPlan = async () => {
    setIsLoading(true);
    setError(null);

    try {
      toast({
        title: "Génération du plan nutritionnel",
        description: "Veuillez patienter pendant que nous générons vos recommandations personnalisées...",
      });

      console.log("Generating nutrition plan for user data:", userData);
      
      if (useFallbackPlan) {
        // Si on utilise explicitement le plan par défaut
        console.log("Using default nutrition plan by user choice");
        setNutritionPlan(defaultNutritionPlan);
        toast({
          title: "Plan par défaut utilisé",
          description: "Un plan nutritionnel standard a été chargé",
          variant: "default",
        });
        setIsLoading(false);
        return;
      }
      
      // Définir un timeout pour la requête API
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Délai d'attente dépassé pour l'appel à l'API")), 12000);
      });
      
      // Appel à notre fonction Supabase avec timeout
      const apiCallPromise = supabase.functions.invoke('generate-nutrition-plan', {
        body: { userData },
      });
      
      // Course entre le timeout et l'appel API
      const { data, error } = await Promise.race([
        apiCallPromise,
        timeoutPromise.then(() => {
          throw new Error("Délai d'attente dépassé pour l'appel à l'API");
        })
      ]) as any;

      if (error) {
        console.error("Error calling nutrition plan function:", error);
        throw new Error(`Erreur lors de l'appel à l'API: ${error.message}`);
      }

      if (data?.error) {
        console.error("Error in nutrition plan function response:", data.error);
        throw new Error(`Erreur de génération: ${data.error}`);
      }

      console.log("Received nutrition plan data:", data);

      // Validate that data contains expected content
      if (!data?.content || 
          !data.content.breakfast || 
          !data.content.lunch || 
          !data.content.dinner || 
          !data.content.snacks) {
        console.error("Invalid nutrition plan data format:", data);
        throw new Error("Format de données invalide reçu du serveur");
      }

      setNutritionPlan(data.content);
      
      toast({
        title: "Plan généré",
        description: "Votre plan nutritionnel est prêt !",
        variant: "default",
      });
    } catch (error) {
      console.error('Error generating nutrition plan:', error);
      setError('Une erreur est survenue lors de la génération du plan nutritionnel.');
      
      // Use default nutrition plan as fallback
      console.log("Using default nutrition plan as fallback");
      setNutritionPlan(defaultNutritionPlan);
      
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
  }, [userData, retryCount]);

  // Add a custom retry handler
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };
  
  // Add handler to force using the fallback plan
  const handleUseFallback = () => {
    setUseFallbackPlan(true);
    setRetryCount(prev => prev + 1);
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

  if (error && !nutritionPlan) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-mps-error mx-auto mb-4" />
            <h3 className="text-lg font-medium text-mps-error mb-2">Une erreur est survenue</h3>
            <p className="text-mps-text mb-4">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleRetry} className="flex items-center justify-center">
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
              <Button onClick={handleUseFallback} variant="outline" className="flex items-center justify-center">
                <Clock className="h-4 w-4 mr-2" />
                Utiliser plan par défaut
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!nutritionPlan) {
    // If we still don't have a nutrition plan, use the default one
    setNutritionPlan(defaultNutritionPlan);
    return (
      <div className="h-full flex items-center justify-center p-8">
        <p className="text-mps-text">Chargement des données...</p>
      </div>
    );
  }

  // Safe access to nutrition plan data with fallbacks
  const getDescription = (section: keyof NutritionPlan) => {
    try {
      if (typeof nutritionPlan[section] === 'object') {
        return (nutritionPlan[section] as any)?.description || "Description non disponible";
      }
      return nutritionPlan[section]?.toString() || "Information non disponible";
    } catch (e) {
      return "Information non disponible";
    }
  };
  
  const getExamples = (section: keyof NutritionPlan) => {
    try {
      if (section === 'hydration' || section === 'disclaimer') return [];
      return (nutritionPlan[section] as any)?.examples || [];
    } catch (e) {
      return [];
    }
  };
  
  const getTiming = (section: keyof NutritionPlan) => {
    try {
      if (section === 'hydration' || section === 'disclaimer') return "";
      return (nutritionPlan[section] as any)?.timing || "";
    } catch (e) {
      return "";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-6 overflow-x-hidden">
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md mb-8">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-amber-700">{nutritionPlan.disclaimer || defaultNutritionPlan.disclaimer}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-medium transition-shadow">
          <CardHeader className="pb-3 bg-mps-secondary/10">
            <CardTitle className="flex items-center">
              <Pizza className="h-5 w-5 mr-2 text-mps-primary" />
              Petit-déjeuner
            </CardTitle>
            <div className="text-xs text-mps-text/70 flex items-center mt-1">
              <Clock className="h-3 w-3 mr-1" />
              {getTiming('breakfast')}
            </div>
          </CardHeader>
          <CardContent className="pt-4 pb-3">
            <p className="text-mps-text mb-4">{getDescription('breakfast')}</p>
            <div>
              <h4 className="font-medium text-mps-primary mb-2">Exemples:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {getExamples('breakfast').map((example: string, idx: number) => (
                  <li key={idx} className="text-mps-text">{example}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-medium transition-shadow">
          <CardHeader className="pb-3 bg-mps-secondary/10">
            <CardTitle className="flex items-center">
              <Utensils className="h-5 w-5 mr-2 text-mps-primary" />
              Déjeuner
            </CardTitle>
            <div className="text-xs text-mps-text/70 flex items-center mt-1">
              <Clock className="h-3 w-3 mr-1" />
              {getTiming('lunch')}
            </div>
          </CardHeader>
          <CardContent className="pt-4 pb-3">
            <p className="text-mps-text mb-4">{getDescription('lunch')}</p>
            <div>
              <h4 className="font-medium text-mps-primary mb-2">Exemples:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {getExamples('lunch').map((example: string, idx: number) => (
                  <li key={idx} className="text-mps-text">{example}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-medium transition-shadow">
          <CardHeader className="pb-3 bg-mps-secondary/10">
            <CardTitle className="flex items-center">
              <Utensils className="h-5 w-5 mr-2 text-mps-primary" />
              Dîner
            </CardTitle>
            <div className="text-xs text-mps-text/70 flex items-center mt-1">
              <Clock className="h-3 w-3 mr-1" />
              {getTiming('dinner')}
            </div>
          </CardHeader>
          <CardContent className="pt-4 pb-3">
            <p className="text-mps-text mb-4">{getDescription('dinner')}</p>
            <div>
              <h4 className="font-medium text-mps-primary mb-2">Exemples:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {getExamples('dinner').map((example: string, idx: number) => (
                  <li key={idx} className="text-mps-text">{example}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-medium transition-shadow">
          <CardHeader className="pb-3 bg-mps-secondary/10">
            <CardTitle className="flex items-center">
              <Apple className="h-5 w-5 mr-2 text-mps-primary" />
              Collations
            </CardTitle>
            <div className="text-xs text-mps-text/70 flex items-center mt-1">
              <Clock className="h-3 w-3 mr-1" />
              {getTiming('snacks')}
            </div>
          </CardHeader>
          <CardContent className="pt-4 pb-3">
            <p className="text-mps-text mb-4">{getDescription('snacks')}</p>
            <div>
              <h4 className="font-medium text-mps-primary mb-2">Exemples:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {getExamples('snacks').map((example: string, idx: number) => (
                  <li key={idx} className="text-mps-text">{example}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="hover:shadow-medium transition-shadow mt-6">
        <CardHeader className="pb-3 bg-mps-secondary/10">
          <CardTitle className="flex items-center">
            <Carrot className="h-5 w-5 mr-2 text-mps-primary" />
            Hydratation
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 pb-3">
          <p className="text-mps-text">{nutritionPlan.hydration || defaultNutritionPlan.hydration}</p>
        </CardContent>
      </Card>

      <div className="flex justify-center mt-8 gap-4">
        <Button onClick={handleRetry} className="flex items-center">
          <RefreshCw className="h-4 w-4 mr-2" />
          Régénérer le plan
        </Button>
        
        {!useFallbackPlan && (
          <Button onClick={handleUseFallback} variant="outline" className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Utiliser plan par défaut
          </Button>
        )}
      </div>
    </div>
  );
};

export default NutritionSection;
