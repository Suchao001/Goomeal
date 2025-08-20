import { apiClient } from '../apiClient';

export interface DailyNutritionSummary {
  id?: number;
  user_id: number;
  summary_date: string;
  total_calories?: number;
  total_fat?: number;
  total_protein?: number;
  total_carbs?: number;
  recommendation?: string;
  weight?: number;
}

export interface DailySummaryStats {
  start_date: string;
  end_date: string;
  total_days: number;
  avg_calories: number;
  avg_fat: number;
  avg_protein: number;
  avg_carbs: number;
}

/**
 * Get daily nutrition summary for a specific date
 */
export const getDailyNutritionSummary = async (date: string): Promise<{
  success: boolean;
  data?: DailyNutritionSummary;
  error?: string;
}> => {
  try {
    const response = await apiClient.get(`/api/daily-summary/${date}`);
    return response.data;
  } catch (error: any) {
    console.error('Error getting daily nutrition summary:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'เกิดข้อผิดพลาดในการดึงข้อมูลสรุป'
    };
  }
};

/**
 * Get daily nutrition summaries by date range
 */
export const getDailyNutritionSummariesByRange = async (
  startDate: string,
  endDate: string
): Promise<{
  success: boolean;
  data?: {
    summaries: DailyNutritionSummary[];
    period_stats: DailySummaryStats;
  };
  error?: string;
}> => {
  try {
    const response = await apiClient.get('/api/daily-summary/range', {
      params: {
        start_date: startDate,
        end_date: endDate
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error getting daily nutrition summaries by range:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'เกิดข้อผิดพลาดในการดึงข้อมูลสรุป'
    };
  }
};

/**
 * Update weight for a specific date
 */
export const updateDailyWeight = async (
  date: string,
  weight: number
): Promise<{
  success: boolean;
  data?: DailyNutritionSummary;
  message?: string;
  error?: string;
}> => {
  try {
    const response = await apiClient.put(`/api/daily-summary/${date}/weight`, {
      weight
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating daily weight:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'เกิดข้อผิดพลาดในการอัปเดตน้ำหนัก'
    };
  }
};

/**
 * Update recommendation for a specific date
 */
export const updateDailyRecommendation = async (
  date: string,
  recommendation: string
): Promise<{
  success: boolean;
  data?: DailyNutritionSummary;
  message?: string;
  error?: string;
}> => {
  try {
    const response = await apiClient.put(`/api/daily-summary/${date}/recommendation`, {
      recommendation
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating daily recommendation:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'เกิดข้อผิดพลาดในการอัปเดตคำแนะนำ'
    };
  }
};
