import { useState, useEffect, useCallback } from 'react';
import { ApiClient } from '../utils/apiClient';
import { useMealPlanStoreEdit } from '../stores/mealPlanStoreEdit';

/**
 * Hook สำหรับโหมดแก้ไขแผนอาหารเท่านั้น (edit-only)
 * ใช้ร่วมกับ useMealPlanStoreEdit store
 */
export const useMealPlanEdit = () => {
  const apiClient = new ApiClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get all required state and actions from the edit store
  const {
    planId,
    planName,
    planDescription,
    planImage,
    setAsCurrentPlan,
    mealPlanData,
    loadMealPlanData,
    clearEditSession,
    setPlanMetadata,
  } = useMealPlanStoreEdit();

  // Initialize edit mode by loading plan data
  const initializeEditMode = useCallback(async (id: number) => {
    if (!id) {
      console.log('❌ [useMealPlanEdit] No plan ID provided');
      return { success: false, error: 'ไม่พบรหัสแผนอาหาร' };
    }

    setIsLoading(true);
    try {
      console.log('🔄 [useMealPlanEdit] Loading plan data for ID:', id);
      const result = await apiClient.getUserFoodPlanById(id);
      
      if (result.success && result.data) {
        console.log('✅ [useMealPlanEdit] API response successful:', result.data);
        
        // Load data into store - this will set planId, planName, etc.
        loadMealPlanData({ plan: result.data });
        
        console.log('🎯 [useMealPlanEdit] Plan data loaded into store');
        return { success: true };
      } else {
        console.log('❌ [useMealPlanEdit] API response failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('💥 [useMealPlanEdit] Exception in initializeEditMode:', error);
      return { success: false, error: 'เกิดข้อผิดพลาดในการโหลดข้อมูล' };
    } finally {
      setIsLoading(false);
    }
  }, [apiClient, loadMealPlanData]);
  
  // Save plan (update only - no create mode)
  const savePlan = useCallback(async () => {
    if (!planId) {
      console.log('❌ [useMealPlanEdit] No planId available for saving');
      return { success: false, error: 'ไม่พบรหัสแผนอาหาร' };
    }

    if (!planName.trim()) {
      console.log('❌ [useMealPlanEdit] Plan name is empty');
      return { success: false, error: 'กรุณาใส่ชื่อแผนอาหาร' };
    }
    
    setIsSaving(true);
    console.log('💾 [useMealPlanEdit] Starting save plan process...');
    console.log('📝 [useMealPlanEdit] Saving plan with ID:', planId);
    
    // Prepare meal plan data with enhanced nutrition info, similar to the original screen
    const enhancedMealPlan = Object.keys(mealPlanData).reduce((acc, dayKey) => {
      const dayMeals = mealPlanData[parseInt(dayKey, 10)];
      if (!dayMeals) return acc;

      let dayTotalCal = 0;
      
      const enhancedDayMeals = Object.keys(dayMeals).reduce((mealAcc, mealId) => {
        const meal = dayMeals[mealId];
        const mealTotalCal = meal.items.reduce((total, item) => total + (item.cal || 0), 0);
        dayTotalCal += mealTotalCal;
        
        mealAcc[mealId] = {
          ...meal,
          totalCal: mealTotalCal
        };
        
        return mealAcc;
      }, {} as any);
      
      acc[dayKey] = {
        totalCal: dayTotalCal,
        meals: enhancedDayMeals
      };
      
      return acc;
    }, {} as any);

    // Prepare plan data for API
    const planToSave = {
      name: planName.trim(),
      description: planDescription.trim(),
      image: planImage || undefined,
      plan: enhancedMealPlan, // Use the enhanced data
    };
    
    console.log('📤 [useMealPlanEdit] Plan data to save:', JSON.stringify(planToSave, null, 2));
    
    try {
      // Update existing plan
      const result = await apiClient.updateUserFoodPlan(planId, planToSave);
      
      console.log('📥 [useMealPlanEdit] Update result:', result);
      
      if (result.success && setAsCurrentPlan) {
        console.log('⭐ [useMealPlanEdit] Setting as current plan...');
        await apiClient.setCurrentFoodPlan(planId);
      }
      
      return result;
    } catch (error) {
      console.error('💥 [useMealPlanEdit] Error saving plan:', error);
      return { success: false, error: 'เกิดข้อผิดพลาดในการบันทึก' };
    } finally {
      setIsSaving(false);
    }
  }, [planId, planName, planDescription, planImage, mealPlanData, setAsCurrentPlan, apiClient]);

  return {
    // State
    isLoading,
    isSaving,
    
    // Actions
    initializeEditMode,
    savePlan,
    clearEditSession,
  };
};

// Also export as useMealPlanMode for backward compatibility
export const useMealPlanMode = useMealPlanEdit;
