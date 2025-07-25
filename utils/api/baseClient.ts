import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { base_url } from '../../config';

interface JwtPayload {
  exp: number;
  [key: string]: any;
}

export class BaseApiClient {
  protected axiosInstance: AxiosInstance;

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
          originalRequest._retry = true;

          try {
            // Try to refresh token
            const newToken = await this.refreshToken();
            if (newToken) {
              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // Clear all tokens and throw the original error
            await this.clearTokens();
            throw error;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async getValidToken(): Promise<string | null> {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      
      if (!accessToken) {
        return null;
      }

      // Check if token is expired
      const decodedToken = jwtDecode<JwtPayload>(accessToken);
      const currentTime = Date.now() / 1000;
      
      // If token expires within 30 seconds, refresh it
      if (decodedToken.exp - currentTime < 30) {
        const newToken = await this.refreshToken();
        return newToken || accessToken;
      }

      return accessToken;
    } catch (error) {
      console.error('Error getting valid token:', error);
      return null;
    }
  }

  private async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(`${base_url}/user/refresh`, {
        refreshToken: refreshToken
      });

      if (response.data.success && response.data.accessToken) {
        const newAccessToken = response.data.accessToken;
        await SecureStore.setItemAsync('accessToken', newAccessToken);
        return newAccessToken;
      } else {
        throw new Error('Invalid refresh response');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  private async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('user');
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  // Public methods for API calls
  async get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.axiosInstance.get(url, config);
  }

  async post(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.axiosInstance.post(url, data, config);
  }

  async put(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.axiosInstance.put(url, data, config);
  }

  async delete(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.axiosInstance.delete(url, config);
  }

  async patch(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
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
