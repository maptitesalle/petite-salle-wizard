
import React from 'react';
import { useUserData } from '@/context/UserDataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Heart, AlertCircle, Activity, Scale, Info } from 'lucide-react';

const StepFour: React.FC = () => {
  const { userData, setUserData } = useUserData();
  const { healthConditions } = userData;

  const handleConditionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, type } = e.target;
    const value = type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    
    setUserData(prev => ({
      ...prev,
      healthConditions: {
        ...prev.healthConditions,
        [name]: value
      }
    }));
  };

  const conditionOptions = [
    {
      id: 'insuffisanceCardiaque',
      label: 'Insuffisance cardiaque',
      icon: <Heart className="h-5 w-5 text-mps-primary" />,
      description: 'Votre cœur ne pompe pas le sang aussi efficacement qu\'il le devrait'
    },
    {
      id: 'arthrose',
      label: 'Arthrose',
      icon: <AlertCircle className="h-5 w-5 text-mps-primary" />,
      description: 'Dégradation du cartilage des articulations'
    },
    {
      id: 'problemesRespiratoires',
      label: 'Problèmes respiratoires',
      icon: <Activity className="h-5 w-5 text-mps-primary" />,
      description: 'Asthme, BPCO ou autres troubles respiratoires'
    },
    {
      id: 'obesite',
      label: 'Obésité',
      icon: <Scale className="h-5 w-5 text-mps-primary" />,
      description: 'IMC supérieur à 30'
    },
    {
      id: 'hypothyroidie',
      label: 'Hypothyroïdie',
      icon: <Info className="h-5 w-5 text-mps-primary" />,
      description: 'Production insuffisante d\'hormones thyroïdiennes'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-2xl font-semibold text-mps-primary text-center">
        Pathologies / Santé
      </h2>
      <p className="text-center text-mps-text max-w-2xl mx-auto">
        Indiquez vos conditions médicales afin que nous puissions adapter nos recommandations.
      </p>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {conditionOptions.map((option) => (
              <label
                key={option.id}
                htmlFor={option.id}
                className="flex items-start p-4 rounded-md border border-gray-200 hover:border-mps-primary/50 hover:bg-mps-secondary/10 transition-all cursor-pointer"
              >
                <div className="flex h-5 items-center">
                  <input
                    type="checkbox"
                    id={option.id}
                    name={option.id}
                    checked={healthConditions[option.id] || false}
                    onChange={handleConditionChange}
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
                {healthConditions[option.id] && (
                  <div className="ml-2 flex h-5 items-center">
                    <Check className="h-5 w-5 text-mps-success" />
                  </div>
                )}
              </label>
            ))}
            
            <div className="mt-6">
              <label htmlFor="autresInfoSante" className="block text-sm font-medium text-mps-text mb-2">
                Autres informations de santé
              </label>
              <textarea
                id="autresInfoSante"
                name="autresInfoSante"
                value={healthConditions.autresInfoSante || ''}
                onChange={handleConditionChange}
                rows={4}
                placeholder="Exemple : cholestérol élevé, anémie, allergies..."
                className="input-field"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StepFour;

