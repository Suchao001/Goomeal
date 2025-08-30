
import { BaseApiClient } from './api/baseClient';
import { FoodApiClient } from './api/foodClient';
import { FoodPlanApiClient } from './api/foodPlanClient';
import { AiApiClient } from './api/aiApiClient';
import { GoodChatApiClient } from './api/goodChatClient';
import { MealTimeSetting } from './api/mealTimeSetting';

export class ApiClient extends BaseApiClient {
  private foodClient: FoodApiClient;
  private foodPlanClient: FoodPlanApiClient;
  private aiClient: AiApiClient;
  private goodChatClient: GoodChatApiClient;
  private mealTimeSetting: MealTimeSetting;

  constructor() {
    super();
    this.foodClient = new FoodApiClient();
    this.foodPlanClient = new FoodPlanApiClient();
    this.aiClient = new AiApiClient();
    this.goodChatClient = new GoodChatApiClient();
    this.mealTimeSetting = new MealTimeSetting();
  }

  // ===== FOOD API METHODS =====
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
    return this.foodClient.addUserFood(foodData);
  }

  async searchFoods(query?: string, limit?: number) {
    return this.foodClient.searchFoods(query, limit);
  }

  async getUserFoods(query?: string, limit?: number, src?: 'user' | 'ai') {
    return this.foodClient.getUserFoods(query, limit, src);
  }

  async updateUserFood(foodId: string, foodData: {
    name?: string;
    calories?: string;
    carbs?: string;
    protein?: string;
    fat?: string;
    ingredient?: string;
    img?: string;
    deleteImage?: boolean;
  }) {
    return this.foodClient.updateUserFood(foodId, foodData);
  }

  async deleteUserFood(foodId: string) {
    return this.foodClient.deleteUserFood(foodId);
  }

  // ===== FOOD PLAN API METHODS =====
  async saveFoodPlan(data: {
    name: string;
    description?: string;
    plan: any;
    image?: string;
  }) {
    return this.foodPlanClient.saveFoodPlan(data);
  }

  async getUserFoodPlans() {
    return this.foodPlanClient.getUserFoodPlans();
  }

  async getUserFoodPlanById(id: number) {
    return this.foodPlanClient.getUserFoodPlanById(id);
  }

  async updateUserFoodPlan(planId: number, data: {
    name: string;
    description?: string;
    plan: any;
    image?: string;
  }) {
    return this.foodPlanClient.updateUserFoodPlan(planId, data);
  }

  async deleteUserFoodPlan(id: number) {
    return this.foodPlanClient.deleteUserFoodPlan(id);
  }

  async setCurrentFoodPlan(foodPlanId: number) {
    return this.foodPlanClient.setCurrentFoodPlan(foodPlanId);
  }

  async getCurrentFoodPlan() {
    return this.foodPlanClient.getCurrentFoodPlan();
  }

  async getUserFoodPlansList() {
    return this.foodPlanClient.getUserFoodPlansList();
  }

  async knowCurrentFoodPlan() {
    return this.foodPlanClient.knowCurrentFoodPlan();
  }

  async setPlanSettings(data: {
    food_plan_id: number;
    start_date: string;
    auto_loop: boolean;
  }) {
    return this.foodPlanClient.setPlanSettings(data);
  }

  async getPlanSettings() {
    return this.foodPlanClient.getPlanSettings();
  }

  // ===== AI API METHODS =====
  async suggestFood(payload?: any) {
    return this.aiClient.suggestFood(payload);
  }

  async getFoodPlanSuggestions(payload?: any) {
    return this.aiClient.getFoodPlanSuggestions(payload);
  }

  async getChatSession() {
    return this.goodChatClient.getChatSession();
  }

  async getChatMessages(limit?: number, offset?: number) {
    return this.goodChatClient.getChatMessages(limit, offset);
  }

  async sendChatMessage(message: string) {
    return this.goodChatClient.sendMessage(message);
  }

  async clearChatHistory() {
    return this.goodChatClient.clearChatHistory();
  }

  async updateChatStyle(style: string) {
    return this.goodChatClient.updateChatStyle(style);
  }

  async updateWeight(weight: number) {
    try {
      const response = await this.axiosInstance.put('/user/update-weight', {
        weight: weight
      });
      return response.data;
    } catch (error) {
      console.error('Error updating weight:', error);
      throw error;
    }
  }

  //get mealtime
  async getMealTimes() {
    return this.mealTimeSetting.getMealTime();
  }

  //setting mealtime
  async setMealTimes(mealTimes: { breakfast: string; lunch: string; dinner: string }) {
   return this.mealTimeSetting.setMealTime(mealTimes);
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();
