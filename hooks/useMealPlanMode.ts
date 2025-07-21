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
  setAsCurrentPlan: boolean;
}

export const useMealPlanMode = (initialMode: MealPlanMode = 'add', planId?: number) => {
  const apiClient = new ApiClient();
  const { clearMealPlan, loadMealPlanData, setEditMode } = useMealPlanStore();
  const isInitialized = useRef(false);
  
  const [modeData, setModeData] = useState<MealPlanModeData>({
    mode: initialMode,
    isLoading: false,
    planId,
    planName: '',
    planDescription: '',
    planImage: null,
    setAsCurrentPlan: true // Default to true
  });

  // Load existing plan data when in edit mode
  const loadPlanData = useCallback(async (id: number) => {
    setModeData(prev => ({ ...prev, isLoading: true }));
    
    try {
      const result = await apiClient.getUserFoodPlanById(id);
      
      if (result.success && result.data) {
        const plan = result.data;
        
        console.log('✅ [useMealPlanMode] API response successful:', plan);
        
        // Set plan metadata
        setModeData(prev => ({
          ...prev,
          isLoading: false,
          originalPlanData: plan,
          planName: plan.name || '',
          planDescription: plan.description || '',
          planImage: plan.img ? plan.img : null
        }));

        // Note: ไม่โหลดข้อมูลลง store ที่นี่ เพราะจะโหลดใน MealPlanScreenEdit แทน
        // เพื่อหลีกเลี่ยงการโหลดซ้ำ
        console.log('📝 [useMealPlanMode] Plan data ready for screen to load');
        
        return { success: true };
      } else {
        console.log('❌ [useMealPlanMode] API response failed:', result.error);
        setModeData(prev => ({ ...prev, isLoading: false, originalPlanData: null }));
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.log('💥 [useMealPlanMode] Exception in loadPlanData:', error);
      setModeData(prev => ({ ...prev, isLoading: false, originalPlanData: null }));
      return { success: false, error: 'เกิดข้อผิดพลาดในการโหลดข้อมูล' };
    }
  }, [apiClient, loadMealPlanData]);

  // Initialize based on mode
  useEffect(() => {
    if (isInitialized.current) return; // Prevent re-initialization
    
    if (initialMode === 'edit' && planId) {
      isInitialized.current = true;
      loadPlanData(planId);
    } else if (initialMode === 'add') {
      isInitialized.current = true;
      // Clear any existing data for new plan and set to add mode
      setEditMode(false);
      clearMealPlan();
      setModeData(prev => ({
        ...prev,
        planName: '',
        planDescription: '',
        planImage: null,
        originalPlanData: null
      }));
    }
  }, [initialMode, planId, loadPlanData, clearMealPlan]);

  // Save plan (create new or update existing)
  const savePlan = useCallback(async (mealPlanData: any) => {
    const { mode, planId, planName, planDescription, planImage, setAsCurrentPlan } = modeData;
    
    console.log('💾 [useMealPlanMode] Starting savePlan process...');
    console.log('🏷️ [useMealPlanMode] Mode:', mode, 'Plan ID:', planId);
    console.log('📝 [useMealPlanMode] Plan metadata:', { planName, planDescription, planImage, setAsCurrentPlan });
    console.log('🍽️ [useMealPlanMode] Meal plan data:', mealPlanData);
    
    if (!planName.trim()) {
      console.log('❌ [useMealPlanMode] Plan name is empty');
      Alert.alert('ข้อผิดพลาด', 'กรุณาใส่ชื่อแผนอาหาร');
      return { success: false, error: 'กรุณาใส่ชื่อแผนอาหาร' };
    }

    try {
      if (mode === 'edit' && planId) {
        console.log('🔄 [useMealPlanMode] Updating existing plan with ID:', planId);
        
        // Update existing plan
        const result = await apiClient.updateUserFoodPlan(planId, {
          name: planName.trim(),
          description: planDescription.trim(),
          plan: mealPlanData,
          image: planImage || undefined
        });
        
        console.log('📤 [useMealPlanMode] Update result:', result);
        
        // If setAsCurrentPlan is true, update user_food_plan_using
        if (result.success && setAsCurrentPlan) {
          console.log('⭐ [useMealPlanMode] Setting as current plan...');
          await apiClient.setCurrentFoodPlan(planId);
        }
        
        return result;
      } else {
        console.log('➕ [useMealPlanMode] Creating new plan');
        
        // Create new plan
        const result = await apiClient.saveFoodPlan({
          name: planName.trim(),
          description: planDescription.trim(),
          plan: mealPlanData,
          image: planImage || undefined
        });
        
        console.log('📤 [useMealPlanMode] Create result:', result);
        
        // If setAsCurrentPlan is true, set as current plan
        if (result.success && setAsCurrentPlan && result.data?.id) {
          console.log('⭐ [useMealPlanMode] Setting new plan as current plan...');
          await apiClient.setCurrentFoodPlan(result.data.id);
        }
        
        return result;
      }
    } catch (error) {
      console.error('💥 [useMealPlanMode] Error saving plan:', error);
      return { success: false, error: 'เกิดข้อผิดพลาดในการบันทึก' };
    }
  }, [modeData, apiClient]);

  // Update plan metadata
  const updatePlanMetadata = useCallback((updates: Partial<Pick<MealPlanModeData, 'planName' | 'planDescription' | 'planImage' | 'setAsCurrentPlan'>>) => {
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
