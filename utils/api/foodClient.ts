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
}
