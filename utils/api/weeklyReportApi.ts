import { apiClient } from '../apiClient';

// Type definitions for weekly report data
export interface WeeklyNutritionSummary {
  user_id: number;
  week_start_date: string;
  week_end_date: string;
  days_count: number;
  avg_total_calories: number;
  avg_total_protein: number;
  avg_total_carbs: number;
  avg_total_fat: number;
  avg_target_cal: number;
  avg_target_protein: number;
  avg_target_carb: number;
  avg_target_fat: number;
  avg_recommended_cal: number;
  avg_recommended_protein: number;
  avg_recommended_carb: number;
  avg_recommended_fat: number;
  total_days_with_data: number;
  calories_deficit_surplus: number;
}

export interface DayDetail {
  date: string;
  day_name: string;
  total_calories: number;
  target_cal: number;
  recommended_cal: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  weight: number | null;
  has_data: boolean;
}

export interface WeightChange {
  start_weight: number;
  end_weight: number;
  change: number;
  days_between: number;
}

export interface WeekInfo {
  week_offset: number;
  start_date: string;
  end_date: string;
  is_current_week: boolean;
}

export interface WeeklyReportData {
  summary: WeeklyNutritionSummary;
  daily_details: DayDetail[];
  weight_change: WeightChange | null;
  week_info: WeekInfo;
}

export interface Recommendation {
  icon: string;
  color: string;
  title: string;
  message: string;
}

export interface WeeklyInsights {
  days_logged: number;
  consistency_rate: number;
  avg_calories: number;
  avg_target: number;
  balance_score: string;
}

export interface WeeklyInsightsData {
  recommendations: Recommendation[];
  insights: WeeklyInsights;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Get weekly nutrition summary
 * @param weekOffset - Offset from current week (0 = current week, -1 = last week, 1 = next week)
 */
export const getWeeklyNutritionSummary = async (weekOffset = 0): Promise<ApiResponse<WeeklyReportData>> => {
  try {
    
    const response = await apiClient.get(`/api/weekly-report/summary`, {
      params: { weekOffset }
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ [WeeklyApi] Error getting weekly summary:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get weekly nutrition summary',
      error: error.message
    };
  }
};

/**
 * Get weekly insights and recommendations
 * @param weekOffset - Offset from current week (0 = current week, -1 = last week, 1 = next week)
 */
export const getWeeklyInsights = async (weekOffset = 0): Promise<ApiResponse<WeeklyInsightsData>> => {
  try {
    
    const response = await apiClient.get(`/api/weekly-report/insights`, {
      params: { weekOffset }
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ [WeeklyApi] Error getting weekly insights:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get weekly insights',
      error: error.message
    };
  }
};

/**
 * Helper function to format week range display
 */
export const formatWeekRange = (startDate: string, endDate: string): string => {
  const monthNames = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return `${start.getDate()} ${monthNames[start.getMonth()]} - ${end.getDate()} ${monthNames[end.getMonth()]}`;
};

/**
 * Helper function to get Thai day name from date
 */
export const getThaiDayName = (date: string): string => {
  const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  const dateObj = new Date(date);
  return dayNames[dateObj.getDay()];
};

/**
 * Helper function to get short Thai day name from date
 */
export const getShortThaiDayName = (date: string): string => {
  const shortDayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
  const dateObj = new Date(date);
  return shortDayNames[dateObj.getDay()];
};
