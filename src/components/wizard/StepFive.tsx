import React from 'react';
import { useUserData } from '@/context/UserDataContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-components/Card';
import Button from '@/components/ui-components/Button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Dumbbell, Activity, Scale, Heart, TrendingUp, AlertCircle, Wheat, Info } from 'lucide-react';

const StepFive: React.FC = () => {
  const { userData, saveUserData, isLoading } = useUserData();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour sauvegarder vos données.",
        variant: "destructive",
      });
      navigate('/login', { state: { returnTo: '/wizard' } });
      return;
    }

    try {
      await saveUserData();
      toast({
        title: "Données sauvegardées",
        description: "Vos informations ont été enregistrées avec succès.",
        variant: "default",
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-2xl font-semibold text-mps-primary text-center">
        Récapitulatif de vos données
      </h2>
      <p className="text-center text-mps-text max-w-2xl mx-auto">
        Vérifiez vos informations avant de valider. Vous pourrez les modifier ultérieurement.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Dumbbell className="h-6 w-6 text-mps-primary" />
              <CardTitle>Données eGym - Force</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-mps-text">Haut du corps:</span>
                <span className="font-medium">{userData.eGymData.force.hautDuCorps || 'Non renseigné'}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-mps-text">Milieu du corps:</span>
                <span className="font-medium">{userData.eGymData.force.milieuDuCorps || 'Non renseigné'}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-mps-text">Bas du corps:</span>
                <span className="font-medium">{userData.eGymData.force.basDuCorps || 'Non renseigné'}</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Activity className="h-6 w-6 text-mps-primary" />
              <CardTitle>Données eGym - Flexibilité</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-mps-text">Cou:</span>
                <span className="font-medium">{userData.eGymData.flexibilite.cou || 'Non renseigné'}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-mps-text">Épaules:</span>
                <span className="font-medium">{userData.eGymData.flexibilite.epaules || 'Non renseigné'}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-mps-text">Lombaires:</span>
                <span className="font-medium">{userData.eGymData.flexibilite.lombaires || 'Non renseigné'}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-mps-text">Ischios:</span>
                <span className="font-medium">{userData.eGymData.flexibilite.ischios || 'Non renseigné'}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-mps-text">Hanches:</span>
                <span className="font-medium">{userData.eGymData.flexibilite.hanches || 'Non renseigné'}</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Scale className="h-6 w-6 text-mps-primary" />
              <CardTitle>Données eGym - Métabolique</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-mps-text">Poids (kg):</span>
                <span className="font-medium">{userData.eGymData.metabolique.poids || 'Non renseigné'}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-mps-text">Masse graisseuse (%):</span>
                <span className="font-medium">{userData.eGymData.metabolique.masseGraisseuse || 'Non renseigné'}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-mps-text">Masse musculaire (%):</span>
                <span className="font-medium">{userData.eGymData.metabolique.masseMusculaire || 'Non renseigné'}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-mps-text">Âge métabolique:</span>
                <span className="font-medium">{userData.eGymData.metabolique.ageMetabolique || 'Non renseigné'}</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Heart className="h-6 w-6 text-mps-primary" />
              <CardTitle>Données eGym - Cardio</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-mps-text">VO2max:</span>
                <span className="font-medium">{userData.eGymData.cardio.vo2max || 'Non renseigné'}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-mps-text">Âge cardio:</span>
                <span className="font-medium">{userData.eGymData.cardio.ageCardio || 'Non renseigné'}</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-6 w-6 text-mps-primary" />
              <CardTitle>Objectifs</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <input type="checkbox" checked={userData.objectives.priseDeMasse} readOnly className="h-4 w-4" />
                <span className="text-mps-text">Prise de masse musculaire</span>
              </li>
              <li className="flex items-center space-x-2">
                <input type="checkbox" checked={userData.objectives.perteDePoids} readOnly className="h-4 w-4" />
                <span className="text-mps-text">Perte de poids</span>
              </li>
              <li className="flex items-center space-x-2">
                <input type="checkbox" checked={userData.objectives.ameliorationSouplesse} readOnly className="h-4 w-4" />
                <span className="text-mps-text">Amélioration de la souplesse</span>
              </li>
              <li className="flex items-center space-x-2">
                <input type="checkbox" checked={userData.objectives.ameliorationCardio} readOnly className="h-4 w-4" />
                <span className="text-mps-text">Amélioration de la capacité cardio</span>
              </li>
              <li className="flex items-center space-x-2">
                <input type="checkbox" checked={userData.objectives.maintienForme} readOnly className="h-4 w-4" />
                <span className="text-mps-text">Maintien du niveau de forme actuel</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Wheat className="h-6 w-6 text-mps-primary" />
              <CardTitle>Régimes et Contraintes Alimentaires</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <input type="checkbox" checked={userData.dietaryRestrictions.sansGluten} readOnly className="h-4 w-4" />
                <span className="text-mps-text">Sans gluten</span>
              </li>
              <li className="flex items-center space-x-2">
                <input type="checkbox" checked={userData.dietaryRestrictions.vegan} readOnly className="h-4 w-4" />
                <span className="text-mps-text">Vegan</span>
              </li>
              <li className="flex items-center space-x-2">
                <input type="checkbox" checked={userData.dietaryRestrictions.sansOeuf} readOnly className="h-4 w-4" />
                <span className="text-mps-text">Sans œuf</span>
              </li>
              <li className="flex items-center space-x-2">
                <input type="checkbox" checked={userData.dietaryRestrictions.sansProduitLaitier} readOnly className="h-4 w-4" />
                <span className="text-mps-text">Sans produit laitier</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Heart className="h-6 w-6 text-mps-primary" />
              <CardTitle>Pathologies / Santé</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <input type="checkbox" checked={userData.healthConditions.insuffisanceCardiaque} readOnly className="h-4 w-4" />
                  <span className="text-mps-text">Insuffisance cardiaque</span>
                </li>
                <li className="flex items-center space-x-2">
                  <input type="checkbox" checked={userData.healthConditions.arthrose} readOnly className="h-4 w-4" />
                  <span className="text-mps-text">Arthrose</span>
                </li>
                <li className="flex items-center space-x-2">
                  <input type="checkbox" checked={userData.healthConditions.problemesRespiratoires} readOnly className="h-4 w-4" />
                  <span className="text-mps-text">Problèmes respiratoires</span>
                </li>
              </ul>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <input type="checkbox" checked={userData.healthConditions.obesite} readOnly className="h-4 w-4" />
                  <span className="text-mps-text">Obésité</span>
                </li>
                <li className="flex items-center space-x-2">
                  <input type="checkbox" checked={userData.healthConditions.hypothyroidie} readOnly className="h-4 w-4" />
                  <span className="text-mps-text">Hypothyroïdie</span>
                </li>
              </ul>
            </div>
            
            {userData.healthConditions.autresInfoSante && (
              <div className="mt-4">
                <h4 className="font-medium text-mps-text mb-2">Autres informations de santé:</h4>
                <p className="text-mps-text">{userData.healthConditions.autresInfoSante}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pt-6">
        <Button
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={isLoading}
          size="lg"
          className="px-10"
        >
          Valider et Enregistrer
        </Button>
      </div>
    </div>
  );
};

export default StepFive;
