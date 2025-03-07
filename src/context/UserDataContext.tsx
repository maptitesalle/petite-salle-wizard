
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { UserData, UserDataContextType } from './userData/types';
import { defaultUserData } from './userData/defaultUserData';
import { useUserDataLoader } from './userData/useUserDataLoader';
import { useUserDataSaver } from './userData/useUserDataSaver';

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
  const { user, isAuthenticated, isLoading: authLoading, sessionChecked } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [initialized, setInitialized] = useState(false);
  
  const { 
    loadUserData: fetchUserData, 
    isLoading: loadingData, 
    error: loadError,
    lastLoadedUserId,
    setLastLoadedUserId
  } = useUserDataLoader();
  
  const { 
    saveUserData: persistUserData, 
    isLoading: savingData, 
    error: saveError 
  } = useUserDataSaver();
  
  const isLoading = loadingData || savingData;
  const error = loadError || saveError;

  // Load user data function - wrapper around the hook
  const loadUserData = async (): Promise<void> => {
    if (!user) {
      console.log('UserDataContext: No user found, initializing with default data');
      setUserData(defaultUserData);
      return;
    }

    // Don't reload if we've already loaded for this user
    if (lastLoadedUserId === user.id && userData) {
      console.log(`UserDataContext: Already loaded data for user ${user.id}, skipping`);
      return;
    }

    const loadedData = await fetchUserData(user);
    if (loadedData) {
      setUserData(loadedData);
    }
  };

  // Save user data - wrapper around the hook
  const saveUserData = async (): Promise<void> => {
    await persistUserData(userData, user);
    // Re-fetch the updated data to get the latest timestamp
    await loadUserData();
  };

  // Load user data when auth state is fully ready
  useEffect(() => {
    console.log('UserDataContext: Auth state changed', { 
      user, 
      isAuthenticated, 
      authLoading, 
      sessionChecked,
      lastLoadedUserId 
    });
    
    // Only proceed when auth is fully loaded and user is authenticated
    if (!authLoading && sessionChecked && isAuthenticated && user) {
      // Check if we need to load data for this user
      if (lastLoadedUserId !== user.id) {
        console.log(`UserDataContext: Loading data for user ${user.id}`);
        loadUserData().catch(err => {
          console.error('UserDataContext: Error in auto-load:', err);
        });
      }
    } else if (!authLoading && sessionChecked && !isAuthenticated) {
      // If user is not authenticated and auth is done loading, reset user data
      console.log('UserDataContext: User not authenticated, resetting data');
      setUserData(null);
      setLastLoadedUserId(null);
    }
  }, [user, isAuthenticated, authLoading, sessionChecked]);

  // Initialize with default data if not loading and not initialized
  useEffect(() => {
    if (!isLoading && !initialized && userData === null && !authLoading) {
      console.log('UserDataContext: Initializing with default data (fallback)');
      setUserData(defaultUserData);
      setInitialized(true);
    }
  }, [isLoading, initialized, userData, authLoading]);

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

// Re-export the types
export type { 
  UserData, 
  EGymData, 
  PersonalInfo, 
  Objectives, 
  DietaryRestrictions, 
  HealthConditions 
} from './userData/types';
