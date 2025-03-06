
import React from 'react';
import { useUserData } from '@/context/UserDataContext';
import { Card, CardContent } from '@/components/ui-components/Card';
import { Check, TrendingUp, TrendingDown, Activity, Heart, BarChart } from 'lucide-react';

const StepTwo: React.FC = () => {
  const { userData, setUserData } = useUserData();
  const { objectives } = userData;

  const handleObjectiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setUserData(prev => ({
      ...prev,
      objectives: {
        ...prev.objectives,
        [name]: checked
      }
    }));
  };

  const objectiveOptions = [
    {
      id: 'priseDeMasse',
      label: 'Prise de masse musculaire',
      icon: <TrendingUp className="h-5 w-5 text-mps-primary" />,
      description: 'Développer votre force et augmenter votre masse musculaire'
    },
    {
      id: 'perteDePoids',
      label: 'Perte de poids',
      icon: <TrendingDown className="h-5 w-5 text-mps-primary" />,
      description: 'Réduire votre masse graisseuse et affiner votre silhouette'
    },
    {
      id: 'ameliorationSouplesse',
      label: 'Amélioration de la souplesse',
      icon: <Activity className="h-5 w-5 text-mps-primary" />,
      description: 'Augmenter votre amplitude de mouvement et votre flexibilité'
    },
    {
      id: 'ameliorationCardio',
      label: 'Amélioration de la capacité cardio',
      icon: <Heart className="h-5 w-5 text-mps-primary" />,
      description: 'Renforcer votre système cardiovasculaire et votre endurance'
    },
    {
      id: 'maintienForme',
      label: 'Maintien du niveau de forme actuel',
      icon: <BarChart className="h-5 w-5 text-mps-primary" />,
      description: 'Conserver votre condition physique actuelle'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-2xl font-semibold text-mps-primary text-center">
        Vos Objectifs
      </h2>
      <p className="text-center text-mps-text max-w-2xl mx-auto">
        Sélectionnez les objectifs que vous souhaitez atteindre. Vous pouvez en choisir plusieurs.
      </p>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {objectiveOptions.map((option) => (
              <label
                key={option.id}
                htmlFor={option.id}
                className="flex items-start p-4 rounded-md border border-gray-200 hover:border-mps-primary/50 hover:bg-mps-secondary/10 transition-all cursor-pointer"
              >
                <div className="flex h-5 items-center">
                  <input
                    type="checkbox"
                    id={option.id}
                    name={option.id as keyof typeof objectives}
                    checked={objectives[option.id as keyof typeof objectives] || false}
                    onChange={handleObjectiveChange}
                    className="h-5 w-5 rounded border-gray-300 text-mps-primary focus:ring-mps-primary/30"
                  />
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center gap-2">
                    {option.icon}
                    <span className="font-medium text-mps-text">{option.label}</span>
                  </div>
                  <p className="text-sm text-mps-text/80 mt-1">{option.description}</p>
                </div>
                {objectives[option.id as keyof typeof objectives] && (
                  <div className="ml-2 flex h-5 items-center">
                    <Check className="h-5 w-5 text-mps-success" />
                  </div>
                )}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StepTwo;
