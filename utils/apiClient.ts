import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { base_url } from '../config';

interface JwtPayload {
  exp: number;
  [key: string]: any;
}

export class ApiClient {
  private axiosInstance: AxiosInstance;

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

  // Food API Methods
  async addUserFood(foodData: {
    name: string;
    calories: string | number;
    carbs: string | number;
    fat: string | number;
    protein: string | number;
    ingredient?: string;
    img?: string;
  }) {
    try {
      // Create FormData for multipart/form-data submission
      const formData = new FormData();
      formData.append('name', foodData.name);
      formData.append('calories', foodData.calories.toString());
      formData.append('carbs', foodData.carbs.toString());
      formData.append('fat', foodData.fat.toString());
      formData.append('protein', foodData.protein.toString());
      
      if (foodData.ingredient) {
        formData.append('ingredient', foodData.ingredient);
      }
      
      // Handle image upload
      if (foodData.img) {
        // Extract filename from URI
        const filename = foodData.img.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('image', {
          uri: foodData.img,
          name: filename,
          type: type,
        } as any);
      }

      const response = await this.axiosInstance.post('/food', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      const errorInfo = this.getErrorInfo(error);
      return {
        success: false,
        error: errorInfo.message,
        shouldLogout: errorInfo.shouldLogout
      };
    }
  }

  // Search Foods API Method
  async searchFoods(query?: string, limit?: number) {
    try {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (limit) params.append('limit', limit.toString());

      const response = await this.axiosInstance.get(`/food/search?${params.toString()}`);
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      const errorInfo = this.getErrorInfo(error);
      return {
        success: false,
        error: errorInfo.message,
        shouldLogout: errorInfo.shouldLogout
      };
    }
  }

  // ===== USER FOOD PLANS =====
  
  /**
   * Create a new user food plan
   */
  async saveFoodPlan(data: {
    name: string;
    description?: string;
    plan: any;
    image?: string;
  }) {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.description) {
        formData.append('description', data.description);
      }
      formData.append('plan', JSON.stringify(data.plan));
      
      // Handle image upload
      if (data.image) {
        // Extract filename from URI
        const filename = data.image.split('/').pop() || 'plan-image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('image', {
          uri: data.image,
          name: filename,
          type: type,
        } as any);
      }

      const response = await this.axiosInstance.post('/user-food-plans', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Error saving food plan:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึกแผนอาหาร'
      };
    }
  }

  /**
   * Get all user food plans
   */
  async getUserFoodPlans() {
    try {
      const response = await this.axiosInstance.get('/user-food-plans');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Error fetching user food plans:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'เกิดข้อผิดพลาดในการดึงข้อมูลแผนอาหาร'
      };
    }
  }

  /**
   * Get user food plan by ID
   */
  async getUserFoodPlanById(id: number) {
    try {
      const response = await this.axiosInstance.get(`/user-food-plans/${id}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Error fetching user food plan:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'เกิดข้อผิดพลาดในการดึงข้อมูลแผนอาหาร'
      };
    }
  }

  /**
   * Update user food plan
   */
  async updateUserFoodPlan(id: number, data: {
    name?: string;
    description?: string;
    plan?: any;
    image?: string;
  }) {
    try {
      // If there's a new image (file URI), use FormData
      if (data.image && data.image.startsWith('file://')) {
        const formData = new FormData();
        if (data.name) formData.append('name', data.name);
        if (data.description !== undefined) formData.append('description', data.description);
        if (data.plan) formData.append('plan', JSON.stringify(data.plan));
        
        formData.append('image', {
          uri: data.image,
          type: 'image/jpeg',
          name: 'plan-image.jpg',
        } as any);

        const response = await this.axiosInstance.put(`/user-food-plans/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        });

        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        // If no new image or existing image URL, use regular JSON
        const requestData: any = {};
        if (data.name) requestData.name = data.name;
        if (data.description !== undefined) requestData.description = data.description;
        if (data.plan) requestData.plan = data.plan;

        const response = await this.axiosInstance.put(`/user-food-plans/${id}`, requestData, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        });

        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
    } catch (error: any) {
      console.error('Error updating food plan:', error);
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        return {
          success: false,
          error: 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาตรวจสอบอินเทอร์เน็ต'
        };
      }
      return {
        success: false,
        error: error.response?.data?.error || 'เกิดข้อผิดพลาดในการอัพเดทแผนอาหาร'
      };
    }
  }

  /**
   * Update an existing user food plan
   */
  async updateUserFoodPlan(planId: number, data: {
    name: string;
    description?: string;
    plan: any;
    image?: string; // Can be a new file URI or an existing relative path
  }) {
    try {
      console.log('🔄 [apiClient] Updating food plan:', { planId, name: data.name, image: data.image });

      // If the image is a new file to upload (e.g., starts with 'file://')
      if (data.image && data.image.startsWith('file://')) {
        console.log('📤 [apiClient] Updating with new image using FormData.');
        const formData = new FormData();
        formData.append('name', data.name);
        if (data.description) {
          formData.append('description', data.description);
        }
        formData.append('plan', JSON.stringify(data.plan));

        const filename = data.image.split('/').pop() || 'plan-image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('image', {
          uri: data.image,
          name: filename,
          type: type,
        } as any);

        const response = await this.axiosInstance.put(`/user-food-plans/${planId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };

      } else {
        // If no new image, or if the image is an existing URL/path, use application/json
        console.log('📤 [apiClient] Updating with JSON (no new image).');
        const payload: any = {
          name: data.name,
          description: data.description,
          plan: data.plan,
          // The backend should handle the image path. If data.image is a full URL,
          // we need to strip the base URL as requested by the user.
          image: data.image ? data.image.replace(/^(http?:\/\/[^\/]+)/, '') : undefined
        };
        
        console.log('📤 [apiClient] Sending JSON payload:', JSON.stringify(payload, null, 2));

        const response = await this.axiosInstance.put(`/user-food-plans/${planId}`, payload, {
          headers: { 'Content-Type': 'application/json' },
        });

        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
    } catch (error: any) {
      console.error('💥 [apiClient] Error updating food plan:', error);
      if (error.response) {
        console.error('💥 [apiClient] Error response data:', error.response.data);
      } else {
        console.error('💥 [apiClient] Error has no response object, likely a network issue.');
      }
      
      return {
        success: false,
        error: error.response?.data?.error || 'เกิดข้อผิดพลาดในการอัพเดทแผนอาหาร'
      };
    }
  }

  /**
   * Delete user food plan
   */
  async deleteUserFoodPlan(id: number) {
    try {
      const response = await this.axiosInstance.delete(`/user-food-plans/${id}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Error deleting food plan:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'เกิดข้อผิดพลาดในการลบแผนอาหาร'
      };
    }
  }

  /**
   * Set a food plan as current plan for user
   */
  async setCurrentFoodPlan(foodPlanId: number) {
    try {
      const response = await this.axiosInstance.post('/user-food-plans/set-current', {
        food_plan_id: foodPlanId
      });

      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message || 'ตั้งเป็นแผนปัจจุบันสำเร็จ'
      };
    } catch (error: any) {
      console.error('Error setting current food plan:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'เกิดข้อผิดพลาดในการตั้งแผนปัจจุบัน'
      };
    }
  }

  /**
   * Get current food plan for user
   */
  async getCurrentFoodPlan() {
    try {
      const response = await this.axiosInstance.get('/user-food-plans/current');

      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message
      };
    } catch (error: any) {
      console.error('Error getting current food plan:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลแผนปัจจุบัน'
      };
    }
  }

  /**
   * Get list of user food plans (without plan data)
   */
  async getUserFoodPlansList() {
    try {
      const response = await this.axiosInstance.get('/user-food-plans');

      return {
        success: true,
        data: response.data?.data || [],
        message: response.data?.message
      };
    } catch (error: any) {
      console.error('Error getting user food plans list:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงรายการแผนอาหาร'
      };
    }
  }

  /**
   * Get active current food plan ID only
   */
  async knowCurrentFoodPlan() {
    try {
      const response = await this.axiosInstance.get('/user-food-plans/know-current');

      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message
      };
    } catch (error: any) {
      console.error('Error getting current food plan ID:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลแผนปัจจุบัน'
      };
    }
  }

  // ===== ERROR HANDLING =====
  private getErrorInfo(error: any) {
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

// Export a singleton instance
export const apiClient = new ApiClient();
