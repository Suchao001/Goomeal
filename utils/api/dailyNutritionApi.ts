import { apiClient } from '../apiClient';

export interface DailyNutritionSummary {
  id?: number;
  user_id: number;
  summary_date: string;
  total_calories?: number;
  total_fat?: number;
  total_protein?: number;
  total_carbs?: number;
  target_cal?: number;
  target_fat?: number;
  target_carb?: number;
  target_protein?: number;
  recommendation?: string;
  weight?: number;
  // New recommended fields from backend
  recommended_cal?: number | null;
  recommended_carb?: number | null;
  recommended_protein?: number | null;
  recommended_fat?: number | null;
}

export interface DailyNutritionResponse {
  success: boolean;
  data: DailyNutritionSummary;
  error?: string;
}

/**
 * Get daily nutrition summary by date
 */
export const getDailyNutritionSummary = async (date: string): Promise<DailyNutritionResponse> => {
  try {
    const url = `/api/daily-summary/${date}`;
    console.log(`📊 [DailyNutrition] Getting summary for date: ${date}`);
    console.log(`📊 [DailyNutrition] Full API URL: ${url}`);
    
    const response = await apiClient.get(url);
    
    if (response.data.success) {
      console.log(`✅ [DailyNutrition] Got summary:`, response.data.data);
      return response.data;
    } else {
      console.error('❌ [DailyNutrition] API returned error:', response.data.error);
      return {
        success: false,
        data: {} as DailyNutritionSummary,
        error: response.data.error
      };
    }
  } catch (error: any) {
    console.error('❌ [DailyNutrition] API call failed:', error);
    return {
      success: false,
      data: {} as DailyNutritionSummary,
      error: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลสรุป'
    };
  }
};

/**
 * Get daily nutrition summaries by date range
 */
export const getDailyNutritionSummariesByRange = async (startDate: string, endDate: string) => {
  try {
    console.log(`📊 [DailyNutrition] Getting summaries from ${startDate} to ${endDate}`);
    
    const response = await apiClient.get(`/api/daily-summary/range`, {
      params: { start_date: startDate, end_date: endDate }
    });
    
    if (response.data.success) {
      console.log(`✅ [DailyNutrition] Got ${response.data.data.summaries.length} summaries`);
      return response.data;
    } else {
      console.error('❌ [DailyNutrition] API returned error:', response.data.error);
      return response.data;
    }
  } catch (error: any) {
    console.error('❌ [DailyNutrition] API call failed:', error);
    return {
      success: false,
      error: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลสรุป'
    };
  }
};

/**
 * Update weight for a specific date
 */
export const updateDailyWeight = async (date: string, weight: number) => {
  try {
    console.log(`⚖️ [DailyNutrition] Updating weight for ${date}: ${weight}kg`);
    
    const response = await apiClient.put(`/api/daily-summary/${date}/weight`, { weight });
    
    if (response.data.success) {
      console.log(`✅ [DailyNutrition] Weight updated successfully`);
      return response.data;
    } else {
      console.error('❌ [DailyNutrition] API returned error:', response.data.error);
      return response.data;
    }
  } catch (error: any) {
    console.error('❌ [DailyNutrition] API call failed:', error);
    return {
      success: false,
      error: error.message || 'เกิดข้อผิดพลาดในการอัปเดตน้ำหนัก'
    };
  }
};

/**
 * Update recommendation for a specific date
 */
export const updateDailyRecommendation = async (date: string, recommendation: string) => {
  try {
    console.log(`💡 [DailyNutrition] Updating recommendation for ${date}`);
    
    const response = await apiClient.put(`/api/daily-summary/${date}/recommendation`, { recommendation });
    
    if (response.data.success) {
      console.log(`✅ [DailyNutrition] Recommendation updated successfully`);
      return response.data;
    } else {
      console.error('❌ [DailyNutrition] API returned error:', response.data.error);
      return response.data;
    }
  } catch (error: any) {
    console.error('❌ [DailyNutrition] API call failed:', error);
    return {
      success: false,
      error: error.message || 'เกิดข้อผิดพลาดในการอัปเดตคำแนะนำ'
    };
  }
};
