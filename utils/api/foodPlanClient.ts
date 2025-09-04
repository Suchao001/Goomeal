import { BaseApiClient } from './baseClient';

export class FoodPlanApiClient extends BaseApiClient {
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
  async updateUserFoodPlan(planId: number, data: {
    name: string;
    description?: string;
    plan: any;
    image?: string; // Can be a new file URI or an existing relative path
  }) {
    try {
     
      if (data.image && data.image.startsWith('file://')) {
        
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
        const payload: any = {
          name: data.name,
          description: data.description,
          plan: data.plan,
          // The backend should handle the image path. If data.image is a full URL,
          // we need to strip the base URL as requested by the user.
          image: data.image ? data.image.replace(/^(http?:\/\/[^\/]+)/, '') : undefined
        };
        
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
      console.error('💥 [foodPlanApiClient] Error updating food plan:', error);
      if (error.response) {
        console.error('💥 [foodPlanApiClient] Error response data:', error.response.data);
      } else {
        console.error('💥 [foodPlanApiClient] Error has no response object, likely a network issue.');
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

  /**
   * Set plan settings (start date and auto loop)
   */
  async setPlanSettings(data: {
    food_plan_id: number;
    start_date: string;
    is_repeat: boolean;
  }) {
    try {
      const response = await this.axiosInstance.post('/user-food-plans/set-plan-settings', {
        food_plan_id: data.food_plan_id,
        start_date: data.start_date,
        is_repeat: data.is_repeat
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Error setting plan settings:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'เกิดข้อผิดพลาดในการตั้งค่าแผน'
      };
    }
  }

  /**
   * Get plan settings (start date and auto loop)
   */
  async getPlanSettings() {
    try {
      const response = await this.axiosInstance.get('/user-food-plans/get-plan-settings');

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Error getting plan settings:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงการตั้งค่าแผน'
      };
    }
  }
}
