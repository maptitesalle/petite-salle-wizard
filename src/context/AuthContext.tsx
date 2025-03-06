
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the user type
interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing user session in localStorage
    const checkUserSession = async () => {
      try {
        const storedUser = localStorage.getItem('mps_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to restore user session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSession();
  }, []);

  // Simulate login functionality - would connect to Netlify Identity in a real app
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // For now we'll just simulate a successful login with a mock user
      const mockUser = {
        id: '123456',
        email,
        name: 'John Doe'
      };
      
      setUser(mockUser);
      localStorage.setItem('mps_user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mps_user');
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // For now we'll just simulate a successful registration with a mock user
      const mockUser = {
        id: '123456',
        email,
        name
      };
      
      setUser(mockUser);
      localStorage.setItem('mps_user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Registration failed:', error);
      throw new Error('Registration failed. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
