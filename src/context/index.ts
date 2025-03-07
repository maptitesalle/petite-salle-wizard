export { useAuth, AuthProvider } from './AuthContext';
export type { AuthUser } from './auth/types';

export { UserDataProvider, useUserData } from './UserDataContext';
export type { 
  UserData, 
  EGymData, 
  PersonalInfo, 
  Objectives, 
  DietaryRestrictions, 
  HealthConditions 
} from './userData/types';
