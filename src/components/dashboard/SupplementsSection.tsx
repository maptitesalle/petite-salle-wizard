import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserData } from '@/context/UserDataContext';
import { Beaker, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Supplement {
  name: string;
  dosage: string;
  benefits: string[];
  precautions: string;
  timing: string;
}

interface SupplementsPlan {
  disclaimer: string;
  supplements: Supplement[];
}

const SUPPLEMENTS_STORAGE_KEY = 'mps-supplements-plan';

const SupplementsSection: React.FC = () => {
  const { userData } = useUserData();
  const [supplementsPlan, setSupplementsPlan] = useState<SupplementsPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadSavedPlan = () => {
      try {
        const savedPlan = localStorage.getItem(SUPPLEMENTS_STORAGE_KEY);
        if (savedPlan) {
          setSupplementsPlan(JSON.parse(savedPlan));
          console.log('Supplements plan loaded from localStorage');
        } else if (userData) {
          generateSupplementsPlan();
        }
      } catch (error) {
        console.error('Error loading supplements plan from localStorage:', error);
        if (userData) {
          generateSupplementsPlan();
        }
      }
    };

    loadSavedPlan();
  }, [userData]);

  const generateSupplementsPlan = async () => {
    setIsLoading(true);
    setError(null);

    try {
      toast({
        title: "Génération du plan de compléments",
        description: "Veuillez patienter pendant que nous générons vos recommandations personnalisées...",
      });

      const { data, error } = await supabase.functions.invoke('generate-ai-content', {
        body: { 
          userData,
          contentType: 'supplements'
        },
      });

      if (error) {
        throw new Error(`Erreur lors de l'appel à l'API: ${error.message}`);
      }

      if (data.error) {
        throw new Error(`Erreur de génération: ${data.error}`);
      }

      setSupplementsPlan(data.content);
      localStorage.setItem(SUPPLEMENTS_STORAGE_KEY, JSON.stringify(data.content));
      
      toast({
        title: "Recommandations générées",
        description: "Vos recommandations de compléments alimentaires sont prêtes !",
        variant: "default",
      });
    } catch (error) {
      console.error('Error generating supplements plan:', error);
      setError('Une erreur est survenue lors de la génération des recommandations de compléments.');
      
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : 'Une erreur inattendue est survenue',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-mps-primary/30 border-t-mps-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-mps-text">Génération de vos recommandations personnalisées...</p>
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
            <Button onClick={generateSupplementsPlan}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!supplementsPlan) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-mps-text mb-4">Chargement des données...</p>
          <Button onClick={generateSupplementsPlan}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Générer des recommandations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md mb-8">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
          <div>
            <p className="text-sm text-amber-700">{supplementsPlan.disclaimer}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {supplementsPlan.supplements.map((supplement, index) => (
          <Card key={index} className="hover:shadow-medium transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <Beaker className="h-5 w-5 mr-2 text-mps-primary" />
                {supplement.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 space-y-4">
              <div className="p-3 bg-mps-secondary/20 rounded-md">
                <span className="font-medium text-mps-primary">Dosage recommandé:</span>
                <p className="text-mps-text">{supplement.dosage}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-mps-primary mb-2">Bénéfices:</h4>
                <ul className="list-none space-y-2">
                  {supplement.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-mps-success mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-mps-text">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-3 bg-amber-50 rounded-md">
                <h4 className="font-medium text-amber-700 mb-1">Précautions:</h4>
                <p className="text-amber-700 text-sm">{supplement.precautions}</p>
              </div>
            </CardContent>
            <CardFooter className="pt-0 text-sm text-mps-text/80">
              <div className="w-full">
                <span className="font-medium text-mps-primary">Moment de prise:</span>
                <p className="text-mps-text">{supplement.timing}</p>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Button onClick={generateSupplementsPlan}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Régénérer les recommandations
        </Button>
      </div>
    </div>
  );
};

export default SupplementsSection;
