import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
  iat: number;
  [key: string]: any;
}

export const debugToken = async () => {
  try {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    
    console.log('🔍 [TokenDebug] ===== TOKEN DEBUG INFO =====');
    
    if (accessToken) {
      try {
        const decoded = jwtDecode<JwtPayload>(accessToken);
        const currentTime = Date.now() / 1000;
        const timeToExpiry = decoded.exp - currentTime;
        
        console.log('📋 [TokenDebug] Access Token Info:');
        console.log('  - Length:', accessToken.length);
        console.log('  - Expires at:', new Date(decoded.exp * 1000).toISOString());
        console.log('  - Current time:', new Date(currentTime * 1000).toISOString());
        console.log('  - Time to expiry:', Math.round(timeToExpiry), 'seconds');
        console.log('  - Is expired:', timeToExpiry < 0);
        console.log('  - Token payload:', JSON.stringify(decoded, null, 2));
      } catch (decodeError) {
        console.error('❌ [TokenDebug] Failed to decode access token:', decodeError);
        console.log('📋 [TokenDebug] Raw access token:', accessToken.substring(0, 50) + '...');
      }
    } else {
      console.log('❌ [TokenDebug] No access token found');
    }
    
    if (refreshToken) {
      console.log('📋 [TokenDebug] Refresh Token Info:');
      console.log('  - Length:', refreshToken.length);
      console.log('  - First 50 chars:', refreshToken.substring(0, 50) + '...');
    } else {
      console.log('❌ [TokenDebug] No refresh token found');
    }
    
    console.log('🔍 [TokenDebug] ========================');
  } catch (error) {
    console.error('❌ [TokenDebug] Error during token debug:', error);
  }
};

export const clearAllTokensDebug = async () => {
  console.log('🧹 [TokenDebug] Clearing all tokens...');
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
  await SecureStore.deleteItemAsync('user');
  console.log('✅ [TokenDebug] All tokens cleared');
};
