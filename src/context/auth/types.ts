
import { Session, User } from '@supabase/supabase-js';

// Define the user type
export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionChecked: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  refreshSession: () => Promise<void>;
}
