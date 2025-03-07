
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserData } from './types';
import { AuthUser } from '../auth/types';

export const useUserDataSaver = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveUserData = async (userData: UserData | null, user: AuthUser | null): Promise<void> => {
    if (!user) {
      throw new Error('You must be logged in to save data');
    }

    if (!userData) {
      throw new Error('No user data to save');
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('UserDataContext: Saving user data for', user.id);
      // Transform data from app format to database format
      const dbData = {
        user_id: user.id,
        
        // Personal Info
        sex: userData.personalInfo.sex,
        age: userData.personalInfo.age,
        
        // Force data
        force_haut_du_corps: userData.eGymData.force.hautDuCorps,
        force_milieu_du_corps: userData.eGymData.force.milieuDuCorps,
        force_bas_du_corps: userData.eGymData.force.basDuCorps,
        
        // Flexibilite data
        flexibilite_cou: userData.eGymData.flexibilite.cou,
        flexibilite_epaules: userData.eGymData.flexibilite.epaules,
        flexibilite_lombaires: userData.eGymData.flexibilite.lombaires,
        flexibilite_ischios: userData.eGymData.flexibilite.ischios,
        flexibilite_hanches: userData.eGymData.flexibilite.hanches,
        
        // Metabolique data
        metabolique_poids: userData.eGymData.metabolique.poids,
        metabolique_masse_graisseuse: userData.eGymData.metabolique.masseGraisseuse,
        metabolique_masse_musculaire: userData.eGymData.metabolique.masseMusculaire,
        metabolique_age_metabolique: userData.eGymData.metabolique.ageMetabolique,
        
        // Cardio data
        cardio_vo2max: userData.eGymData.cardio.vo2max,
        cardio_age_cardio: userData.eGymData.cardio.ageCardio,
        
        // Objectives
        objective_prise_de_masse: userData.objectives.priseDeMasse,
        objective_perte_de_poids: userData.objectives.perteDePoids,
        objective_amelioration_souplesse: userData.objectives.ameliorationSouplesse,
        objective_amelioration_cardio: userData.objectives.ameliorationCardio,
        objective_maintien_forme: userData.objectives.maintienForme,
        
        // Dietary restrictions
        restriction_sans_gluten: userData.dietaryRestrictions.sansGluten,
        restriction_vegan: userData.dietaryRestrictions.vegan,
        restriction_sans_oeuf: userData.dietaryRestrictions.sansOeuf,
        restriction_sans_produit_laitier: userData.dietaryRestrictions.sansProduitLaitier,
        
        // Health conditions
        condition_insuffisance_cardiaque: userData.healthConditions.insuffisanceCardiaque,
        condition_arthrose: userData.healthConditions.arthrose,
        condition_problemes_respiratoires: userData.healthConditions.problemesRespiratoires,
        condition_obesite: userData.healthConditions.obesite,
        condition_hypothyroidie: userData.healthConditions.hypothyroidie,
        condition_autres_info_sante: userData.healthConditions.autresInfoSante
      };
      
      // Insert data into Supabase
      const { error: upsertError } = await supabase
        .from('user_data')
        .upsert(dbData)
        .select();

      if (upsertError) {
        throw upsertError;
      }
      
      console.log('UserDataContext: User data saved successfully');
      
    } catch (error) {
      console.error('UserDataContext: Failed to save user data:', error);
      setError('Failed to save your data. Please try again later.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveUserData,
    isLoading,
    error
  };
};
