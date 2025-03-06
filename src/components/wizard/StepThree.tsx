
import React from 'react';
import { useUserData } from '@/context/UserDataContext';
import { Card, CardContent } from '@/components/ui-components/Card';
import { Check, Wheat, Leaf, Egg, Milk } from 'lucide-react';

const StepThree: React.FC = () => {
  const { userData, setUserData } = useUserData();
  const { dietaryRestrictions } = userData;

  const handleRestrictionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setUserData(prev => ({
      ...prev,
      dietaryRestrictions: {
        ...prev.dietaryRestrictions,
        [name]: checked
      }
    }));
  };

  const restrictionOptions = [
    {
      id: 'sansGluten',
      label: 'Sans gluten',
      icon: <Wheat className="h-5 w-5 text-mps-primary" />,
      description: 'Exclusion du gluten (présent dans le blé, l\'orge, le seigle)'
    },
    {
      id: 'vegan',
      label: 'Vegan',
      icon: <Leaf className="h-5 w-5 text-mps-primary" />,
      description: 'Aucun produit d\'origine animale'
    },
    {
      id: 'sansOeuf',
      label: 'Sans œuf',
      icon: <Egg className="h-5 w-5 text-mps-primary" />,
      description: 'Exclusion des œufs et produits dérivés'
    },
    {
      id: 'sansProduitLaitier',
      label: 'Sans produit laitier',
      icon: <Milk className="h-5 w-5 text-mps-primary" />,
      description: 'Exclusion du lait et produits laitiers'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-2xl font-semibold text-mps-primary text-center">
        Régimes et Contraintes Alimentaires
      </h2>
      <p className="text-center text-mps-text max-w-2xl mx-auto">
        Sélectionnez vos régimes alimentaires ou contraintes diététiques spécifiques.
      </p>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {restrictionOptions.map((option) => (
              <label
                key={option.id}
                htmlFor={option.id}
                className="flex items-start p-4 rounded-md border border-gray-200 hover:border-mps-primary/50 hover:bg-mps-secondary/10 transition-all cursor-pointer"
              >
                <div className="flex h-5 items-center">
                  <input
                    type="checkbox"
                    id={option.id}
                    name={option.id as keyof typeof dietaryRestrictions}
                    checked={dietaryRestrictions[option.id as keyof typeof dietaryRestrictions] || false}
                    onChange={handleRestrictionChange}
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
                {dietaryRestrictions[option.id as keyof typeof dietaryRestrictions] && (
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

export default StepThree;
