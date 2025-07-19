import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { ApiClient } from '../utils/apiClient';
import { useMealPlanStore } from '../stores/mealPlanStore';

export type MealPlanMode = 'add' | 'edit';

interface MealPlanModeData {
  mode: MealPlanMode;
  isLoading: boolean;
  planId?: number;
  originalPlanData?: any;
  planName: string;
  planDescription: string;
  planImage: string | null;
}

export const useMealPlanMode = (initialMode: MealPlanMode = 'add', planId?: number) => {
  const apiClient = new ApiClient();
  const { clearMealPlan, loadMealPlanData } = useMealPlanStore();
  const isInitialized = useRef(false);
  
  const [modeData, setModeData] = useState<MealPlanModeData>({
    mode: initialMode,
    isLoading: false,
    planId,
    planName: '',
    planDescription: '',
    planImage: null
  });

  // Load existing plan data when in edit mode
  const loadPlanData = useCallback(async (id: number) => {
    setModeData(prev => ({ ...prev, isLoading: true }));
    
    try {
      const result = await apiClient.getUserFoodPlanById(id);
      
      if (result.success && result.data) {
        const plan = result.data;
        
        // Set plan metadata
        setModeData(prev => ({
          ...prev,
          isLoading: false,
          originalPlanData: plan,
          planName: plan.name || '',
          planDescription: plan.description || '',
          planImage: plan.image ? `${plan.image}` : null
        }));

        // Load meal plan data into store
        if (plan.plan_data) {
          loadMealPlanData(plan);
        }
        
        return { success: true };
      } else {
        setModeData(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error loading plan data:', error);
      setModeData(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'เกิดข้อผิดพลาดในการโหลดข้อมูล' };
    }
  }, [apiClient, loadMealPlanData]);

  // Initialize based on mode
  useEffect(() => {
    if (isInitialized.current) return; // Prevent re-initialization
    
    if (modeData.mode === 'edit' && planId) {
      isInitialized.current = true;
      loadPlanData(planId);
    } else if (modeData.mode === 'add') {
      isInitialized.current = true;
      // Clear any existing data for new plan
      clearMealPlan();
      setModeData(prev => ({
        ...prev,
        planName: '',
        planDescription: '',
        planImage: null,
        originalPlanData: null
      }));
    }
  }, [modeData.mode, planId]); // Remove clearMealPlan and loadPlanData from dependencies

  // Save plan (create new or update existing)
  const savePlan = useCallback(async (mealPlanData: any) => {
    const { mode, planId, planName, planDescription, planImage } = modeData;
    
    if (!planName.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาใส่ชื่อแผนอาหาร');
      return { success: false, error: 'กรุณาใส่ชื่อแผนอาหาร' };
    }

    try {
      if (mode === 'edit' && planId) {
        // Update existing plan
        const result = await apiClient.updateUserFoodPlan(planId, {
          name: planName.trim(),
          description: planDescription.trim(),
          plan: mealPlanData,
          image: planImage || undefined
        });
        
        return result;
      } else {
        // Create new plan
        const result = await apiClient.saveFoodPlan({
          name: planName.trim(),
          description: planDescription.trim(),
          plan: mealPlanData,
          image: planImage || undefined
        });
        
        return result;
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      return { success: false, error: 'เกิดข้อผิดพลาดในการบันทึก' };
    }
  }, [modeData, apiClient]);

  // Update plan metadata
  const updatePlanMetadata = useCallback((updates: Partial<Pick<MealPlanModeData, 'planName' | 'planDescription' | 'planImage'>>) => {
    setModeData(prev => ({ ...prev, ...updates }));
  }, []);

  // Check if plan has changes (for edit mode)
  const hasChanges = useCallback(() => {
    if (modeData.mode === 'add') return true; // Always allow save for new plans
    
    const { originalPlanData, planName, planDescription, planImage } = modeData;
    if (!originalPlanData) return false;
    
    return (
      originalPlanData.name !== planName ||
      originalPlanData.description !== planDescription ||
      originalPlanData.image !== planImage
    );
  }, [modeData]);

  // Get screen title based on mode
  const getScreenTitle = useCallback(() => {
    return modeData.mode === 'edit' ? 'แก้ไขแผนอาหาร' : 'วางแผนเมนูอาหาร';
  }, [modeData.mode]);

  // Get save button text based on mode
  const getSaveButtonText = useCallback(() => {
    return modeData.mode === 'edit' ? 'อัพเดทแผน' : 'บันทึกแผน';
  }, [modeData.mode]);

  return {
    ...modeData,
    savePlan,
    updatePlanMetadata,
    hasChanges,
    getScreenTitle,
    getSaveButtonText,
    loadPlanData
  };
};

// Add function to meal plan store for loading data
declare module '../stores/mealPlanStore' {
  interface MealPlanStore {
    loadMealPlanData: (data: any) => void;
  }
}
