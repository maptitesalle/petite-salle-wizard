
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

export interface UserDataContextType {
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  saveUserData: () => Promise<void>;
  loadUserData: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}
