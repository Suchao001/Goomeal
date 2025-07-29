import React, { createContext, useEffect, useContext, useState, ReactNode, useCallback } from 'react'; // <--- 1. Import useCallback
import * as SecureStore from 'expo-secure-store';
// import { jwtDecode } from 'jwt-decode'; // ไม่ได้ใช้งานในโค้ดนี้
import { apiClient } from './utils/apiClient';
import { setGlobalLogoutCallback } from './utils/api/baseClient';
import { debugToken } from './utils/tokenDebug';

// ... Interface User ไม่มีการเปลี่ยนแปลง ...
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
  activity_level?: 'low' | 'moderate' | 'high' | 'very high';
  additional_requirements?: string;
  dietary_restrictions?: string;
  eating_type?: 'vegan' | 'vegetarian' | 'omnivore' | 'keto' | 'other';
  account_status?: 'active' | 'suspended' | 'deactivated';
  suspend_reason?: string;
  created_date?: string;
  first_time_setting?: boolean;
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

  // USECALLBACK: ห่อฟังก์ชันนี้เพื่อทำให้ reference คงที่
  // ฟังก์ชันนี้ถูกเรียกโดย reloadUser และ useEffect
  const loadToken = useCallback(async () => {
    setLoading(true); // ควรตั้งค่า loading ตอนเริ่มโหลด
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
  }, []); // Dependency array ว่าง เพราะไม่ได้ใช้ค่าจาก state/props ภายนอก

  // USECALLBACK: ห่อฟังก์ชัน fetchUserProfile
  // นี่คือฟังก์ชันที่เป็นต้นเหตุของ Loop ในหน้า Home.js
  const fetchUserProfile = useCallback(async (): Promise<User | null> => {
    try {
      const response = await apiClient.get('/user/profile');

      if (response.data.success) {
        const userData = response.data.user;
        console.log('✅ [AuthContext] Profile fetched successfully:', userData);
        await SecureStore.setItemAsync('user', JSON.stringify(userData));
        setUser(userData);
        return userData;
      }
      console.log('❌ [AuthContext] Profile fetch unsuccessful');
      return null;
    } catch (error) {
      console.error('❌ [AuthContext] Fetch user profile error:', error);
      // Fallback logic
      try {
        const userString = await SecureStore.getItemAsync('user');
        if (userString) {
          const userData = JSON.parse(userString);
          console.log('📱 [AuthContext] Using cached user data:', userData);
          setUser(userData); // อัปเดต state ด้วยข้อมูล fallback
          return userData;
        }
      } catch (fallbackError) {
        console.error('❌ [AuthContext] Fallback user data error:', fallbackError);
      }
      return null;
    }
  }, []); // Dependency array ว่าง เพราะใช้ state setter (setUser) ซึ่ง React การันตีว่าคงที่

  // USECALLBACK: ห่อฟังก์ชัน logout
  const logout = useCallback(async () => {
    console.log('🚪 [AuthContext] Logout initiated');
    await apiClient.logout();
    setUser(null);
    console.log('✅ [AuthContext] User logged out successfully');
  }, []); // Dependency array ว่าง

  // USECALLBACK: ห่อฟังก์ชัน reloadUser
  const reloadUser = useCallback(async () => {
    await loadToken();
  }, [loadToken]); // มี dependency เป็น loadToken ซึ่งเราได้ทำให้มันคงที่แล้ว

  // USECALLBACK: ห่อฟังก์ชัน debugTokens
  const debugTokens = useCallback(async () => {
    await debugToken();
  }, []); // Dependency array ว่าง

  useEffect(() => {
    loadToken();
    
    setGlobalLogoutCallback(() => {
      console.log('🔄 [AuthContext] Global logout callback triggered');
      setUser(null);
    });
  }, [loadToken]); // เพิ่ม loadToken เข้าไปใน dependency array (ซึ่งเป็น best practice)

  return (
    <AuthContext.Provider value={{ user, loading, logout, reloadUser, fetchUserProfile, debugTokens }}>
      {children}
    </AuthContext.Provider>
  );
};