import { BaseApiClient } from './baseClient';

export class FoodApiClient extends BaseApiClient {
  // Add User Food API Method
  async addUserFood(foodData: {
    name: string;
    calories: string | number;
    carbs: string | number;
    fat: string | number;
    protein: string | number;
    ingredient?: string;
    img?: string;
    src?: string; 
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

      // Always append src if provided
      if (foodData.src) {
        formData.append('src', foodData.src);
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

  // Get User Foods API Method (only user's own foods)
  async getUserFoods(query?: string, limit?: number, src?: 'user' | 'ai') {
    try {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (limit) params.append('limit', limit.toString());
      if (src) params.append('src', src);

      const response = await this.axiosInstance.get(`/food/user?${params.toString()}`);
      
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

  // Delete User Food API Method
  async deleteUserFood(foodId: string) {
    try {
      // Extract numeric ID from user_123 format
      const numericId = foodId.replace('user_', '');
      
      const response = await this.axiosInstance.delete(`/food/user/${numericId}`);
      
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

  // Update User Food API Method
  async updateUserFood(foodId: string, foodData: {
    name?: string;
    calories?: string | number;
    carbs?: string | number;
    fat?: string | number;
    protein?: string | number;
    ingredient?: string;
    img?: string;
  }) {
    try {
      // Extract numeric ID from user_123 format
      const numericId = foodId.replace('user_', '');
      
      // Create FormData for multipart/form-data submission
      const formData = new FormData();
      
      if (foodData.name !== undefined) {
        formData.append('name', foodData.name);
      }
      if (foodData.calories !== undefined) {
        formData.append('calories', foodData.calories.toString());
      }
      if (foodData.carbs !== undefined) {
        formData.append('carbs', foodData.carbs.toString());
      }
      if (foodData.fat !== undefined) {
        formData.append('fat', foodData.fat.toString());
      }
      if (foodData.protein !== undefined) {
        formData.append('protein', foodData.protein.toString());
      }
      if (foodData.ingredient !== undefined) {
        formData.append('ingredient', foodData.ingredient);
      }

      // Handle image upload if provided
      if (foodData.img && !foodData.img.startsWith('http')) {
        formData.append('img', {
          uri: foodData.img,
          type: 'image/jpeg',
          name: 'food_image.jpg',
        } as any);
      }

      const response = await this.axiosInstance.put(`/food/user/${numericId}`, formData, {
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
}
