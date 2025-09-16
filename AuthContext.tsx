import React, { createContext, useEffect, useContext, useState, ReactNode, useCallback } from 'react'; 
import * as SecureStore from 'expo-secure-store';

import { apiClient } from './utils/apiClient';
import { setGlobalLogoutCallback } from './utils/api/baseClient';
import { debugToken } from './utils/tokenDebug';
import { useMealPlanStore } from './stores/mealPlanStore';


interface User {
  id?: string;
  email?: string;
  name?: string;
  username?: string;
  age?: number;
  weight?: number;
  last_updated_weight?: number;
  height?: number;
  gender?: 'male' | 'female' | 'other';
  body_fat?: 'high' | 'low' | 'normal' | "don't know";
  target_goal?: 'decrease' | 'increase' | 'healthy';
  target_weight?: number;
  start_weight?: number;
  activity_level?: 'low' | 'moderate' | 'high' | 'very high';
  additional_requirements?: string;
  dietary_restrictions?: string;
  eating_type?: 'vegan' | 'vegetarian' | 'omnivore' | 'keto' | 'other';
  account_status?: 'active' | 'suspended' | 'deactivated';
  suspend_reason?: string;
  created_date?: string;
  first_time_setting?: boolean;
  is_verified?: boolean; 
}


interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  reloadUser: () => Promise<void>;
  fetchUserProfile: () => Promise<User | null>;
  debugTokens: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
  reloadUser: async () => {},
  fetchUserProfile: async () => null,
  debugTokens: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadToken = useCallback(async () => {
    setLoading(true); 
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      const userString = await SecureStore.getItemAsync('user');

      if (accessToken && refreshToken && userString) {
        setUser(JSON.parse(userString));
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error("Failed to load token or user data", e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []); 

  const fetchUserProfile = useCallback(async (): Promise<User | null> => {
    try {
      const response = await apiClient.get('/user/profile');

      if (response.data.success) {
        const userData = response.data.user;
        
        await SecureStore.setItemAsync('user', JSON.stringify(userData));
        
        
        const { clearNutritionCache } = useMealPlanStore.getState();
        clearNutritionCache();
        setUser(userData);
        return userData;
      }
      console.log('❌ [AuthContext] Profile fetch unsuccessful');
      return null;
    } catch (error) {
      console.error('❌ [AuthContext] Fetch user profile error:', error);
      
      try {
        const userString = await SecureStore.getItemAsync('user');
        if (userString) {
          const userData = JSON.parse(userString);
          setUser(userData); 
          return userData;
        }
      } catch (fallbackError) {
        console.error('❌ [AuthContext] Fallback user data error:', fallbackError);
      }
      return null;
    }
  }, []); 

  
  const logout = useCallback(async () => {
    console.log('🚪 [AuthContext] Logout initiated');
    await apiClient.logout();
    
    
    const { clearNutritionCache } = useMealPlanStore.getState();
    clearNutritionCache();
    console.log('🔄 [AuthContext] Nutrition cache cleared on logout');
    
    setUser(null);
    console.log('✅ [AuthContext] User logged out successfully');
  }, []); 

  
  const reloadUser = useCallback(async () => {
    await loadToken();
  }, [loadToken]); 

  
  const debugTokens = useCallback(async () => {
    await debugToken();
  }, []); 

  useEffect(() => {
    loadToken();
    
    setGlobalLogoutCallback(() => {
      console.log('🔄 [AuthContext] Global logout callback triggered');
      setUser(null);
    });
  }, [loadToken]); 

  
  useEffect(() => {
    if (!user) return;
    try {
      const { fetchAndApplyMealTimes } = useMealPlanStore.getState();
      fetchAndApplyMealTimes();
    } catch (e) {
      
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, logout, reloadUser, fetchUserProfile, debugTokens }}>
      {children}
    </AuthContext.Provider>
  );
};
