import { apiClient } from '../newApiClient';

export interface EatingRecord {
  id?: number;
  user_id?: number;
  log_date: string;
  food_name: string;
  meal_type?: string;
  calories?: number;
  carbs?: number;
  fat?: number;
  protein?: number;
  meal_time?: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EatingRecordResponse {
  success: boolean;
  data: EatingRecord;
  message?: string;
}

export interface EatingRecordsResponse {
  success: boolean;
  data: {
    records: EatingRecord[];
    summary: {
      date: string;
      total_records: number;
      total_nutrients: {
        calories: number;
        carbs: number;
        fat: number;
        protein: number;
      };
    };
  };
}

export interface EatingRecordsRangeResponse {
  success: boolean;
  data: {
    daily_records: Array<{
      date: string;
      records: EatingRecord[];
      total_nutrients: {
        calories: number;
        carbs: number;
        fat: number;
        protein: number;
      };
    }>;
    summary: {
      start_date: string;
      end_date: string;
      total_days: number;
      total_records: number;
    };
  };
}

export interface EatingStatsResponse {
  success: boolean;
  data: {
    period_days: number;
    total_records: number;
    daily_averages: {
      calories: number;
      carbs: number;
      fat: number;
      protein: number;
      meals: number;
    };
    daily_data: Array<{
      date: string;
      calories: number;
      carbs: number;
      fat: number;
      protein: number;
      count: number;
    }>;
  };
}

/**
 * Create new eating record
 */
export const createEatingRecord = async (recordData: Omit<EatingRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<EatingRecordResponse> => {
  try {
    console.log('🍽️ [EatingRecordAPI] Creating eating record:', recordData.food_name);
    const response = await apiClient.post('/api/eating-records', recordData);
    return response.data;
  } catch (error: any) {
    console.error('❌ [EatingRecordAPI] Error creating record:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
  }
};

/**
 * Get eating records by date
 */
export const getEatingRecordsByDate = async (date: string): Promise<EatingRecordsResponse> => {
  try {
    console.log('🍽️ [EatingRecordAPI] Getting records for date:', date);
    const response = await apiClient.get(`/api/eating-records/date/${date}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ [EatingRecordAPI] Error getting records by date:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
  }
};

/**
 * Get eating records by date range
 */
export const getEatingRecordsByDateRange = async (startDate: string, endDate: string): Promise<EatingRecordsRangeResponse> => {
  try {
    console.log('🍽️ [EatingRecordAPI] Getting records for range:', startDate, 'to', endDate);
    const response = await apiClient.get(`/api/eating-records/range?start_date=${startDate}&end_date=${endDate}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ [EatingRecordAPI] Error getting records by range:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
  }
};

/**
 * Update eating record
 */
export const updateEatingRecord = async (id: number, recordData: Partial<EatingRecord>): Promise<EatingRecordResponse> => {
  try {
    console.log('🍽️ [EatingRecordAPI] Updating record:', id);
    const response = await apiClient.put(`/api/eating-records/${id}`, recordData);
    return response.data;
  } catch (error: any) {
    console.error('❌ [EatingRecordAPI] Error updating record:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
  }
};

/**
 * Delete eating record
 */
export const deleteEatingRecord = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🍽️ [EatingRecordAPI] Deleting record:', id);
    const response = await apiClient.delete(`/api/eating-records/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ [EatingRecordAPI] Error deleting record:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'เกิดข้อผิดพลาดในการลบข้อมูล');
  }
};

/**
 * Get eating statistics
 */
export const getEatingStats = async (periodDays: number = 7): Promise<EatingStatsResponse> => {
  try {
    console.log('🍽️ [EatingRecordAPI] Getting stats for period:', periodDays, 'days');
    const response = await apiClient.get(`/api/eating-records/stats?period=${periodDays}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ [EatingRecordAPI] Error getting stats:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'เกิดข้อผิดพลาดในการดึงสถิติ');
  }
};

// Utility functions for formatting
export const formatNutrients = (record: EatingRecord) => {
  return {
    calories: record.calories || 0,
    carbs: record.carbs || 0,
    fat: record.fat || 0,
    protein: record.protein || 0
  };
};

export const formatMealTime = (time?: string) => {
  if (!time) return '';
  
  try {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return time;
  }
};

export const calculateTotalNutrients = (records: EatingRecord[]) => {
  return records.reduce(
    (total, record) => ({
      calories: total.calories + (record.calories || 0),
      carbs: total.carbs + (record.carbs || 0),
      fat: total.fat + (record.fat || 0),
      protein: total.protein + (record.protein || 0)
    }),
    { calories: 0, carbs: 0, fat: 0, protein: 0 }
  );
};
