
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Define types for the user data
export interface EGymData {
  force: {
    hautDuCorps: number;
    milieuDuCorps: number;
    basDuCorps: number;
  };
  flexibilite: {
    cou: number;
    epaules: number;
    lombaires: number;
    ischios: number;
    hanches: number;
  };
  metabolique: {
    poids: number;
    masseGraisseuse: number;
    masseMusculaire: number;
    ageMetabolique: number;
  };
  cardio: {
    vo2max: number;
    ageCardio: number;
  };
}

export interface PersonalInfo {
  sex: string;
  age: number;
}

export interface Objectives {
  priseDeMasse: boolean;
  perteDePoids: boolean;
  ameliorationSouplesse: boolean;
  ameliorationCardio: boolean;
  maintienForme: boolean;
}

export interface DietaryRestrictions {
  sansGluten: boolean;
  vegan: boolean;
  sansOeuf: boolean;
  sansProduitLaitier: boolean;
}

export interface HealthConditions {
  insuffisanceCardiaque: boolean;
  arthrose: boolean;
  problemesRespiratoires: boolean;
  obesite: boolean;
  hypothyroidie: boolean;
  autresInfoSante: string;
}

export interface UserData {
  personalInfo: PersonalInfo;
  eGymData: EGymData;
  objectives: Objectives;
  dietaryRestrictions: DietaryRestrictions;
  healthConditions: HealthConditions;
  lastUpdated: string;
}

const defaultUserData: UserData = {
  personalInfo: {
    sex: '',
    age: 0
  },
  eGymData: {
    force: {
      hautDuCorps: 0,
      milieuDuCorps: 0,
      basDuCorps: 0
    },
    flexibilite: {
      cou: 0,
      epaules: 0,
      lombaires: 0,
      ischios: 0,
      hanches: 0
    },
    metabolique: {
      poids: 0,
      masseGraisseuse: 0,
      masseMusculaire: 0,
      ageMetabolique: 0
    },
    cardio: {
      vo2max: 0,
      ageCardio: 0
    }
  },
  objectives: {
    priseDeMasse: false,
    perteDePoids: false,
    ameliorationSouplesse: false,
    ameliorationCardio: false,
    maintienForme: false
  },
  dietaryRestrictions: {
    sansGluten: false,
    vegan: false,
    sansOeuf: false,
    sansProduitLaitier: false
  },
  healthConditions: {
    insuffisanceCardiaque: false,
    arthrose: false,
    problemesRespiratoires: false,
    obesite: false,
    hypothyroidie: false,
    autresInfoSante: ''
  },
  lastUpdated: ''
};

interface UserDataContextType {
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  saveUserData: () => Promise<void>;
  loadUserData: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Create the context
const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

// Custom hook to use the user data context
export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};

interface UserDataProviderProps {
  children: ReactNode;
}

export const UserDataProvider: React.FC<UserDataProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Load user data function
  const loadUserData = async () => {
    if (!user) {
      console.log('UserDataContext: No user found, initializing with default data');
      setUserData(defaultUserData);
      return;
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
        
        setUserData(formattedData);
      } else {
        console.log('UserDataContext: No user data found, initializing with default data');
        // Initialize with default data if no data found
        setUserData(defaultUserData);
      }
    } catch (error) {
      console.error('UserDataContext: Failed to load user data:', error);
      setError('Failed to load your data. Please try again later.');
      // Still set default data on error
      setUserData(defaultUserData);
    } finally {
      setIsLoading(false);
      setInitialized(true);
    }
  };

  // Load user data when the user changes
  useEffect(() => {
    console.log('UserDataContext: Auth state changed', { user, isAuthenticated });
    
    // Small delay to ensure auth context is fully updated
    const timer = setTimeout(() => {
      loadUserData();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [user, isAuthenticated]);

  // Initialize with default data if not loading and not initialized
  useEffect(() => {
    if (!isLoading && !initialized && userData === null) {
      console.log('UserDataContext: Initializing with default data (fallback)');
      setUserData(defaultUserData);
      setInitialized(true);
    }
  }, [isLoading, initialized, userData]);

  // Save user data
  const saveUserData = async () => {
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
      // Fetch the updated data to get the latest timestamp
      await loadUserData();
      
    } catch (error) {
      console.error('UserDataContext: Failed to save user data:', error);
      setError('Failed to save your data. Please try again later.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    userData,
    setUserData,
    saveUserData,
    loadUserData,
    isLoading,
    error
  };

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
};
