import { BaseApiClient } from "./baseClient";

export class MealTimeSetting extends BaseApiClient {
  async getMealTime() {
    try {
      const response = await this.axiosInstance.get('/api/meal-time');
      return {
        success: true,
        data: response.data,
        message: response.data?.message ?? undefined,
      };
    } catch (error) {
      const errorInfo = this.getErrorInfo(error);
      return {
        success: false,
        error: errorInfo.message,
        shouldLogout: errorInfo.shouldLogout,
      };
    }
  }

  async setMealTime(payload?: any) {
    try {
      const response = await this.axiosInstance.post('/api/meal-time', payload || {});
      return {
        success: true,
        data: response.data,
        message: response.data?.message ?? undefined,
      };
    } catch (error) {
      const errorInfo = this.getErrorInfo(error);
      return {
        success: false,
        error: errorInfo.message,
        shouldLogout: errorInfo.shouldLogout,
      };
    }
  }
}
