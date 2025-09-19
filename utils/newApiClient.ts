import { BaseApiClient } from './api/baseClient';
import { FoodApiClient } from './api/foodClient';
import { FoodPlanApiClient } from './api/foodPlanClient';

export class ApiClient extends BaseApiClient {
  private foodClient: FoodApiClient;
  private foodPlanClient: FoodPlanApiClient;

  constructor() {
    super();
    this.foodClient = new FoodApiClient();
    this.foodPlanClient = new FoodPlanApiClient();
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
    serving?: string;
  }) {
    return this.foodClient.addUserFood(foodData);
  }

  async searchFoods(query?: string, limit?: number) {
    return this.foodClient.searchFoods(query, limit);
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
}

// Export a singleton instance
export const apiClient = new ApiClient();
