import React from 'react';
import { useUserData } from '@/context/UserDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Activity, Scale, Heart, User } from 'lucide-react';
import FlexibilityRating from './FlexibilityRating';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const StepOne: React.FC = () => {
  const { userData, setUserData } = useUserData();
  
  if (!userData) {
    console.log('StepOne: userData is null, showing loading state');
    return (
      <div className="flex justify-center items-center p-10">
        <div>Chargement des données...</div>
      </div>
    );
  }
  
  const { eGymData, personalInfo } = userData;

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [name]: name === 'age' ? parseInt(value) || 0 : value
      }
    }));
  };

  const handleSexChange = (value: string) => {
    setUserData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        sex: value
      }
    }));
  };

  const handleForceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      eGymData: {
        ...prev.eGymData,
        force: {
          ...prev.eGymData.force,
          [name]: parseFloat(value) || 0
        }
      }
    }));
  };

  const handleFlexibiliteChange = (name: string, value: number) => {
    setUserData(prev => ({
      ...prev,
      eGymData: {
        ...prev.eGymData,
        flexibilite: {
          ...prev.eGymData.flexibilite,
          [name]: value
        }
      }
    }));
  };

  const handleMetaboliqueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      eGymData: {
        ...prev.eGymData,
        metabolique: {
          ...prev.eGymData.metabolique,
          [name]: parseFloat(value) || 0
        }
      }
    }));
  };

  const handleCardioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      eGymData: {
        ...prev.eGymData,
        cardio: {
          ...prev.eGymData.cardio,
          [name]: parseFloat(value) || 0
        }
      }
    }));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-2xl font-semibold text-mps-primary text-center">
        Informations personnelles
      </h2>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <User className="h-6 w-6 text-mps-primary" />
            <CardTitle>Données personnelles</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="sex" className="block text-sm font-medium text-mps-text mb-2">
              Sexe
            </Label>
            <RadioGroup 
              id="sex" 
              value={personalInfo.sex || ''} 
              onValueChange={handleSexChange}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="homme" id="homme" />
                <Label htmlFor="homme">Homme</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="femme" id="femme" />
                <Label htmlFor="femme">Femme</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label htmlFor="age" className="block text-sm font-medium text-mps-text mb-1">
              Âge
            </Label>
            <Input
              type="number"
              id="age"
              name="age"
              value={personalInfo.age || ''}
              onChange={handlePersonalInfoChange}
              placeholder="Votre âge"
              className="input-field"
            />
          </div>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-semibold text-mps-primary text-center">
        Données eGym
      </h2>
      <p className="text-center text-mps-text max-w-2xl mx-auto">
        Saisissez vos dernières mesures obtenues sur les machines eGym ou lors de vos tests.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Dumbbell className="h-6 w-6 text-mps-primary" />
              <CardTitle>Force</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="hautDuCorps" className="block text-sm font-medium text-mps-text mb-1">
                Haut du corps
              </label>
              <input
                type="number"
                id="hautDuCorps"
                name="hautDuCorps"
                value={eGymData.force.hautDuCorps || ''}
                onChange={handleForceChange}
                placeholder="Exemple : 35"
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="milieuDuCorps" className="block text-sm font-medium text-mps-text mb-1">
                Milieu du corps
              </label>
              <input
                type="number"
                id="milieuDuCorps"
                name="milieuDuCorps"
                value={eGymData.force.milieuDuCorps || ''}
                onChange={handleForceChange}
                placeholder="Exemple : 40"
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="basDuCorps" className="block text-sm font-medium text-mps-text mb-1">
                Bas du corps
              </label>
              <input
                type="number"
                id="basDuCorps"
                name="basDuCorps"
                value={eGymData.force.basDuCorps || ''}
                onChange={handleForceChange}
                placeholder="Exemple : 30"
                className="input-field"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Activity className="h-6 w-6 text-mps-primary" />
              <CardTitle>Flexibilité</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <FlexibilityRating 
                name="cou"
                label="Cou"
                value={eGymData.flexibilite.cou}
                onChange={(value) => handleFlexibiliteChange("cou", value)}
              />
              <FlexibilityRating 
                name="epaules"
                label="Épaules"
                value={eGymData.flexibilite.epaules}
                onChange={(value) => handleFlexibiliteChange("epaules", value)}
              />
              <FlexibilityRating 
                name="lombaires"
                label="Lombaires"
                value={eGymData.flexibilite.lombaires}
                onChange={(value) => handleFlexibiliteChange("lombaires", value)}
              />
              <FlexibilityRating 
                name="ischios"
                label="Ischios"
                value={eGymData.flexibilite.ischios}
                onChange={(value) => handleFlexibiliteChange("ischios", value)}
              />
              <FlexibilityRating 
                name="hanches"
                label="Hanches"
                value={eGymData.flexibilite.hanches}
                onChange={(value) => handleFlexibiliteChange("hanches", value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Scale className="h-6 w-6 text-mps-primary" />
              <CardTitle>Métabolique</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="poids" className="block text-sm font-medium text-mps-text mb-1">
                Poids (kg)
              </label>
              <input
                type="number"
                id="poids"
                name="poids"
                value={eGymData.metabolique.poids || ''}
                onChange={handleMetaboliqueChange}
                step="0.1"
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="masseGraisseuse" className="block text-sm font-medium text-mps-text mb-1">
                Pourcentage de masse graisseuse
              </label>
              <input
                type="number"
                id="masseGraisseuse"
                name="masseGraisseuse"
                value={eGymData.metabolique.masseGraisseuse || ''}
                onChange={handleMetaboliqueChange}
                step="0.1"
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="masseMusculaire" className="block text-sm font-medium text-mps-text mb-1">
                Pourcentage de masse musculaire
              </label>
              <input
                type="number"
                id="masseMusculaire"
                name="masseMusculaire"
                value={eGymData.metabolique.masseMusculaire || ''}
                onChange={handleMetaboliqueChange}
                step="0.1"
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="ageMetabolique" className="block text-sm font-medium text-mps-text mb-1">
                Âge métabolique
              </label>
              <input
                type="number"
                id="ageMetabolique"
                name="ageMetabolique"
                value={eGymData.metabolique.ageMetabolique || ''}
                onChange={handleMetaboliqueChange}
                className="input-field"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Heart className="h-6 w-6 text-mps-primary" />
              <CardTitle>Cardio</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="vo2max" className="block text-sm font-medium text-mps-text mb-1">
                VO2max
              </label>
              <input
                type="number"
                id="vo2max"
                name="vo2max"
                value={eGymData.cardio.vo2max || ''}
                onChange={handleCardioChange}
                step="0.1"
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="ageCardio" className="block text-sm font-medium text-mps-text mb-1">
                Âge cardio
              </label>
              <input
                type="number"
                id="ageCardio"
                name="ageCardio"
                value={eGymData.cardio.ageCardio || ''}
                onChange={handleCardioChange}
                className="input-field"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StepOne;
