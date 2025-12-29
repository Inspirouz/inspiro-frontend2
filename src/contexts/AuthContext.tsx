import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  isAuthenticated,
  getToken,
  getUser,
  saveAuthData,
  clearAuthData,
  type User,
  type AuthResponse,
} from '@/utils/auth';

interface AuthContextType {
  isAuthorized: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setAuthData: (token: string, user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const hasToken = isAuthenticated();
      const userData = getUser();
      const tokenData = getToken();

      setIsAuthorized(hasToken);
      setUser(userData);
      setToken(tokenData);
    };

    checkAuth();
  }, []);

  const setAuthData = (newToken: string, newUser: User) => {
    saveAuthData(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
    setIsAuthorized(true);
  };

  const login = async (email: string, password: string) => {
    // This will be implemented in the component that uses it
    // For now, just a placeholder
    throw new Error('Login should be called from component');
  };

  const register = async (email: string, password: string) => {
    // This will be implemented in the component that uses it
    // For now, just a placeholder
    throw new Error('Register should be called from component');
  };

  const logout = () => {
    clearAuthData();
    setToken(null);
    setUser(null);
    setIsAuthorized(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthorized,
        user,
        token,
        login,
        register,
        logout,
        setAuthData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};










