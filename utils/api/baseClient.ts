import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { base_url } from '../../config';

interface JwtPayload {
  exp: number;
  [key: string]: any;
}

// Global logout callback that can be set by AuthContext
let globalLogoutCallback: (() => void) | null = null;

export const setGlobalLogoutCallback = (callback: () => void) => {
  globalLogoutCallback = callback;
};

export class BaseApiClient {
  protected axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: base_url,
    });

    // Add request interceptor to include token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await this.getValidToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle 401 errors and retry
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, queue the request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => {
              const token = SecureStore.getItemAsync('accessToken');
              if (token) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.axiosInstance(originalRequest);
              } else {
                throw new Error('No token after refresh');
              }
            }).catch(err => {
              throw err;
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            console.log('🔄 [BaseApiClient] Attempting to refresh token...');
            // Try to refresh token
            const newToken = await this.refreshToken();
            if (newToken) {
              console.log('✅ [BaseApiClient] Token refresh successful');
              // Process queued requests
              this.processQueue(null);
              
              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.axiosInstance(originalRequest);
            } else {
              throw new Error('Token refresh returned null');
            }
          } catch (refreshError) {
            console.error('❌ [BaseApiClient] Token refresh failed:', refreshError);
            // Process queued requests with error
            this.processQueue(refreshError);
            
            // Clear all tokens and trigger logout
            await this.clearTokens();
            await this.triggerLogout();
            
            throw new Error('Authentication failed - logged out');
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: any) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
    
    this.failedQueue = [];
  }

  private async triggerLogout(): Promise<void> {
    console.log('🚪 [BaseApiClient] Triggering logout due to token expiration');
    if (globalLogoutCallback) {
      globalLogoutCallback();
    } else {
      console.warn('⚠️ [BaseApiClient] No global logout callback set');
    }
  }

  private async getValidToken(): Promise<string | null> {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      
      if (!accessToken) {
        console.log('🔍 [BaseApiClient] No access token found');
        return null;
      }

      // Check if token is expired
      const decodedToken = jwtDecode<JwtPayload>(accessToken);
      const currentTime = Date.now() / 1000;
      const timeToExpiry = decodedToken.exp - currentTime;
      
      console.log('🔍 [BaseApiClient] Token expiry check:', {
        timeToExpiry: Math.round(timeToExpiry),
        willRefresh: timeToExpiry < 30
      });
      
      // If token expires within 30 seconds, refresh it
      if (timeToExpiry < 30) {
        console.log('⏰ [BaseApiClient] Token expires soon, refreshing...');
        const newToken = await this.refreshToken();
        return newToken || accessToken;
      }

      return accessToken;
    } catch (error) {
      console.error('❌ [BaseApiClient] Error getting valid token:', error);
      return null;
    }
  }

  private async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      
      if (!refreshToken) {
        console.log('❌ [BaseApiClient] No refresh token available');
        throw new Error('No refresh token available');
      }

      console.log('🔄 [BaseApiClient] Calling refresh endpoint...');
      console.log('📝 [BaseApiClient] Refresh token length:', refreshToken.length);

      // Use direct axios call to avoid interceptors
      const response = await axios.post(`${base_url}/user/refresh`, {
        refreshToken: refreshToken
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      console.log('📝 [BaseApiClient] Refresh response status:', response.status);
      console.log('📝 [BaseApiClient] Refresh response data:', response.data);

      if (response.data.success && response.data.accessToken) {
        const newAccessToken = response.data.accessToken;
        await SecureStore.setItemAsync('accessToken', newAccessToken);
        console.log('✅ [BaseApiClient] New access token stored, length:', newAccessToken.length);
        
        // Also update refresh token if provided
        if (response.data.refreshToken) {
          await SecureStore.setItemAsync('refreshToken', response.data.refreshToken);
          console.log('✅ [BaseApiClient] New refresh token stored');
        }
        
        return newAccessToken;
      } else {
        console.log('❌ [BaseApiClient] Invalid refresh response structure');
        throw new Error('Invalid refresh response: ' + JSON.stringify(response.data));
      }
    } catch (error: any) {
      if (error.response) {
        console.error('❌ [BaseApiClient] Refresh API error:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        
        // If refresh token is invalid/expired, trigger immediate logout
        if (error.response.status === 401 || error.response.status === 403) {
          console.log('🚨 [BaseApiClient] Refresh token is invalid/expired');
          await this.clearTokens();
          await this.triggerLogout();
        }
      } else {
        console.error('❌ [BaseApiClient] Network/other error during refresh:', error.message);
      }
      throw error;
    }
  }

  private async clearTokens(): Promise<void> {
    try {
      console.log('🧹 [BaseApiClient] Clearing all tokens...');
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('user');
      console.log('✅ [BaseApiClient] All tokens cleared');
    } catch (error) {
      console.error('❌ [BaseApiClient] Error clearing tokens:', error);
    }
  }

  // Check if token is expired and trigger logout if needed
  private async checkTokenExpiration(): Promise<void> {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      
      if (!accessToken) {
        console.log('🔍 [BaseApiClient] No access token found');
        await this.triggerLogout();
        return;
      }

      const decodedToken = jwtDecode<JwtPayload>(accessToken);
      const currentTime = Date.now() / 1000;
      
      if (decodedToken.exp < currentTime) {
        console.log('⏰ [BaseApiClient] Token expired, triggering logout');
        await this.clearTokens();
        await this.triggerLogout();
      }
    } catch (error) {
      console.error('❌ [BaseApiClient] Error checking token expiration:', error);
      await this.clearTokens();
      await this.triggerLogout();
    }
  }

  // Public methods for API calls
  async get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    await this.checkTokenExpiration();
    return this.axiosInstance.get(url, config);
  }

  async post(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    await this.checkTokenExpiration();
    return this.axiosInstance.post(url, data, config);
  }

  async put(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    await this.checkTokenExpiration();
    return this.axiosInstance.put(url, data, config);
  }

  async delete(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    await this.checkTokenExpiration();
    return this.axiosInstance.delete(url, config);
  }

  async patch(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    await this.checkTokenExpiration();
    return this.axiosInstance.patch(url, data, config);
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await SecureStore.getItemAsync('accessToken');
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    return !!(token && refreshToken);
  }

  // Manually clear authentication
  async logout(): Promise<void> {
    console.log('🚪 [BaseApiClient] Manual logout called');
    await this.clearTokens();
  }

  // Error handling utility
  protected getErrorInfo(error: any) {
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      return {
        title: 'หมดเวลาเซสชัน',
        message: 'กรุณาเข้าสู่ระบบใหม่',
        shouldLogout: true
      };
    } else if (error.response?.status === 403) {
      return {
        title: 'ไม่มีสิทธิ์',
        message: 'คุณไม่มีสิทธิ์ในการดำเนินการนี้',
        shouldLogout: false
      };
    } else if (error.response?.status >= 500) {
      return {
        title: 'ข้อผิดพลาดของเซิร์ฟเวอร์',
        message: 'กรุณาลองใหม่อีกครั้งในภายหลัง',
        shouldLogout: false
      };
    } else if (!error.response) {
      return {
        title: 'ไม่สามารถเชื่อมต่อได้',
        message: 'กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
        shouldLogout: false
      };
    } else {
      return {
        title: 'ข้อผิดพลาด',
        message: error.response?.data?.message || 'เกิดข้อผิดพลาดที่ไม่คาดคิด',
        shouldLogout: false
      };
    }
  }
}
