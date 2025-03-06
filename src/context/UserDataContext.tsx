
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

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
  eGymData: EGymData;
  objectives: Objectives;
  dietaryRestrictions: DietaryRestrictions;
  healthConditions: HealthConditions;
  lastUpdated: string;
}

const defaultUserData: UserData = {
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
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user data function
  const loadUserData = async () => {
    if (!user) {
      setUserData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In a real app, this would be an API call to Netlify Functions
      // For now, we'll use localStorage
      const storedData = localStorage.getItem(`userData_${user.id}`);
      
      if (storedData) {
        setUserData(JSON.parse(storedData));
      } else {
        // Initialize with default data
        setUserData(defaultUserData);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      setError('Failed to load your data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load user data when the user changes
  useEffect(() => {
    loadUserData();
  }, [user]);

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
      // In a real app, this would be an API call to Netlify Functions
      // For now, we'll use localStorage
      const updatedData = {
        ...userData,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(`userData_${user.id}`, JSON.stringify(updatedData));
      setUserData(updatedData);
    } catch (error) {
      console.error('Failed to save user data:', error);
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
