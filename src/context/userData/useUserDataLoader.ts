
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserData } from './types';
import { defaultUserData } from './defaultUserData';
import { AuthUser } from '../auth/types';

export const useUserDataLoader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLoadedUserId, setLastLoadedUserId] = useState<string | null>(null);

  const loadUserData = async (user: AuthUser | null): Promise<UserData | null> => {
    if (!user) {
      console.log('UserDataContext: No user found, initializing with default data');
      return defaultUserData;
    }

    // Don't reload if we've already loaded for this user
    if (lastLoadedUserId === user.id) {
      console.log(`UserDataContext: Already loaded data for user ${user.id}, skipping`);
      return null; // Indicates no change needed
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('UserDataContext: Fetching user data for', user.id);
      // Fetch data from Supabase
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        console.log('UserDataContext: User data found', data);
        // Transform data from database format to app format
        const formattedData: UserData = {
          personalInfo: {
            sex: data.sex || '',
            age: data.age || 0
          },
          eGymData: {
            force: {
              hautDuCorps: data.force_haut_du_corps || 0,
              milieuDuCorps: data.force_milieu_du_corps || 0,
              basDuCorps: data.force_bas_du_corps || 0
            },
            flexibilite: {
              cou: data.flexibilite_cou || 0,
              epaules: data.flexibilite_epaules || 0,
              lombaires: data.flexibilite_lombaires || 0,
              ischios: data.flexibilite_ischios || 0,
              hanches: data.flexibilite_hanches || 0
            },
            metabolique: {
              poids: data.metabolique_poids || 0,
              masseGraisseuse: data.metabolique_masse_graisseuse || 0,
              masseMusculaire: data.metabolique_masse_musculaire || 0,
              ageMetabolique: data.metabolique_age_metabolique || 0
            },
            cardio: {
              vo2max: data.cardio_vo2max || 0,
              ageCardio: data.cardio_age_cardio || 0
            }
          },
          objectives: {
            priseDeMasse: data.objective_prise_de_masse || false,
            perteDePoids: data.objective_perte_de_poids || false,
            ameliorationSouplesse: data.objective_amelioration_souplesse || false,
            ameliorationCardio: data.objective_amelioration_cardio || false,
            maintienForme: data.objective_maintien_forme || false
          },
          dietaryRestrictions: {
            sansGluten: data.restriction_sans_gluten || false,
            vegan: data.restriction_vegan || false,
            sansOeuf: data.restriction_sans_oeuf || false,
            sansProduitLaitier: data.restriction_sans_produit_laitier || false
          },
          healthConditions: {
            insuffisanceCardiaque: data.condition_insuffisance_cardiaque || false,
            arthrose: data.condition_arthrose || false,
            problemesRespiratoires: data.condition_problemes_respiratoires || false,
            obesite: data.condition_obesite || false,
            hypothyroidie: data.condition_hypothyroidie || false,
            autresInfoSante: data.condition_autres_info_sante || ''
          },
          lastUpdated: data.updated_at
        };
        
        setLastLoadedUserId(user.id);
        return formattedData;
      } else {
        console.log('UserDataContext: No user data found, initializing with default data');
        // Initialize with default data if no data found
        return defaultUserData;
      }
    } catch (error) {
      console.error('UserDataContext: Failed to load user data:', error);
      setError('Failed to load your data. Please try again later.');
      // Still set default data on error
      return defaultUserData;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    loadUserData,
    isLoading,
    error,
    lastLoadedUserId,
    setLastLoadedUserId
  };
};
