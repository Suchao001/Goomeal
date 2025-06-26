import React, { createContext, useEffect, useContext, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios'; // Missing import
import { base_url } from './config'; // Missing import


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

  const loadToken = async () => { // Fixed typo in function name
    const accessToken = await SecureStore.getItemAsync('accessToken');
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    const userString = await SecureStore.getItemAsync('user');

    if (accessToken && refreshToken && userString) {
      setUser(JSON.parse(userString));
    } else {
      setUser(null);
    }

    if (accessToken) { 
      interface JwtPayload {
        exp: number;
        [key: string]: any;
      }
      const decodedToken = jwtDecode<JwtPayload>(accessToken);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        try {
          const response = await axios.post(`${base_url}/user/refresh`, { refreshToken });
          const newAccessToken = response.data.accessToken;
          await SecureStore.setItemAsync('accessToken', newAccessToken);
        } catch (error) {
          console.error('Error refreshing token:', error);
          setUser(null);
        }
      }
    }
    setLoading(false);
  };

  const reloadUser = async () => {
    await loadToken();
  };

  const fetchUserProfile = async (): Promise<User | null> => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      if (!accessToken) return null;

      const response = await axios.get(`${base_url}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

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
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('user');
    setUser(null);
    
  };

  useEffect(() => { // Fixed capitalization
    loadToken(); // Fixed function name
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout, reloadUser, fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
