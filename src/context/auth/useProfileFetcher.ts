
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from './types';

export const useProfileFetcher = () => {
  // Fetch the user's profile from the profiles table
  const fetchUserProfile = async (authUser: User): Promise<AuthUser> => {
    try {
      console.log("AuthContext: Fetching user profile for id:", authUser.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', authUser.id)
        .maybeSingle();
      
      if (error) {
        console.error("AuthContext: Error fetching user profile:", error);
        throw error;
      }

      console.log("AuthContext: Profile data retrieved:", data);
      return {
        id: authUser.id,
        email: authUser.email || '',
        name: data?.name || '',
      };
    } catch (error) {
      console.error('AuthContext: Error fetching user profile:', error);
      
      // Fallback to just the auth user data
      console.log("AuthContext: Using fallback user data");
      return {
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.email?.split('@')[0] || '',
      };
    }
  };

  return { fetchUserProfile };
};
