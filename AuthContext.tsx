import React, { createContext, useEffect, useContext, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { apiClient } from './utils/apiClient';

interface User {
  id?: string;
  email?: string;
  name?: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  reloadUser: () => Promise<void>;
  fetchUserProfile: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
  reloadUser: async () => {},
  fetchUserProfile: async () => null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadToken = async () => {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    const userString = await SecureStore.getItemAsync('user');

    if (accessToken && refreshToken && userString) {
      setUser(JSON.parse(userString));
    } else {
      setUser(null);
    }

    // ApiClient will handle token validation and refresh automatically
    // when API calls are made, so we don't need to manually check here
    
    setLoading(false);
  };

  const reloadUser = async () => {
    await loadToken();
  };

  const fetchUserProfile = async (): Promise<User | null> => {
    try {
      const response = await apiClient.get('/user/profile');

      if (response.data.success) {
        const userData = response.data.user;
        // Update stored user data
        await SecureStore.setItemAsync('user', JSON.stringify(userData));
        setUser(userData);
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Fetch user profile error:', error);
      // Fallback to stored user data if API fails
      try {
        const userString = await SecureStore.getItemAsync('user');
        if (userString) {
          const userData = JSON.parse(userString);
          setUser(userData);
          return userData;
        }
      } catch (fallbackError) {
        console.error('Fallback user data error:', fallbackError);
      }
      return null;
    }
  };

  const logout = async () => {
    await apiClient.logout(); // This will clear all tokens
    setUser(null);
  };

  useEffect(() => {
    loadToken();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout, reloadUser, fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
