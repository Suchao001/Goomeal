import { useState, useMemo } from 'react';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useMealPlanStore } from '../stores/mealPlanStore';
import { ApiClient } from '../utils/apiClient';

export const useMealPlanActions = () => {
  const apiClient = useMemo(() => new ApiClient(), []);
  const { mealPlanData, clearMealPlan, addMeal } = useMealPlanStore();

  // Save meal plan to backend
  const saveMealPlan = async (
    planName: string,
    planDescription: string,
    selectedPlanImage: string | null
  ) => {
    if (!planName.trim()) {
      Alert.alert('กรุณาใส่ชื่อแผน', 'โปรดระบุชื่อแผนอาหารก่อนบันทึก');
      return { success: false };
    }

    try {
      // Create enhanced data with total calories
      const enhancedMealPlan = Object.keys(mealPlanData).reduce((acc, dayKey) => {
        const day = parseInt(dayKey);
        const dayMeals = mealPlanData[day];
        let dayTotalCal = 0;
        
        const enhancedDayMeals = Object.keys(dayMeals).reduce((mealAcc, mealId) => {
          const meal = dayMeals[mealId];
          const mealTotalCal = meal.items.reduce((total, item) => total + item.cal, 0);
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

      // Create plan metadata
      const planData = {
        planName: planName.trim(),
        planDescription: planDescription.trim(),
        planImage: selectedPlanImage,
        createdAt: new Date().toISOString(),
        totalDays: Object.keys(enhancedMealPlan).length,
        data: enhancedMealPlan
      };

      console.log('=== MEAL PLAN DATA WITH TOTAL CALORIES ===');
      console.log(JSON.stringify(planData, null, 2));

      // Save to backend via API
      const result = await apiClient.saveFoodPlan({
        name: planName.trim(),
        description: planDescription.trim(),
        plan: enhancedMealPlan,
        image: selectedPlanImage || undefined
      });

      if (result.success) {
        // Also save to JSON file for backup/debugging
        try {
          const jsonString = JSON.stringify(planData, null, 2);
          const fileName = `meal-plan-${planName.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
          const fileUri = FileSystem.documentDirectory + fileName;
          await FileSystem.writeAsStringAsync(fileUri, jsonString);
        } catch (fileError) {
          console.warn('Failed to save backup JSON file:', fileError);
        }

        return { 
          success: true, 
          message: result.message || 'บันทึกแผนอาหารเรียบร้อยแล้ว' 
        };
      } else {
        return { 
          success: false, 
          error: result.error || 'ไม่สามารถบันทึกแผนอาหารได้' 
        };
      }
    } catch (error) {
      console.error('Error saving meal plan:', error);
      return { 
        success: false, 
        error: 'ไม่สามารถบันทึกข้อมูลได้' 
      };
    }
  };

  // Clear all meal plan data
  const handleClearMealPlan = () => {
    Alert.alert(
      'เคลียร์ข้อมูล', 
      'คุณต้องการเคลียร์ข้อมูลทั้งหมดหรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'เคลียร์', 
          style: 'destructive', 
          onPress: () => {
            clearMealPlan();
            Alert.alert('เคลียร์ข้อมูล', 'ข้อมูลทั้งหมดถูกลบแล้ว');
          }
        }
      ]
    );
  };

  // Add new meal
  const handleAddMeal = (
    mealName: string,
    mealTime: string,
    selectedDay: number,
    onSuccess: () => void
  ) => {
    if (!mealName.trim() || !mealTime.trim()) {
      Alert.alert('กรุณากรอกข้อมูลให้ครบ', 'โปรดระบุชื่อมื้ออาหารและเวลา');
      return;
    }

    const newMeal = {
      id: `meal_${Date.now()}`,
      name: mealName.trim(),
      icon: 'restaurant',
      time: mealTime.trim()
    };

    addMeal(newMeal, selectedDay);
    onSuccess();
  };

  // Check if has data to save
  const canSave = () => {
    return Object.keys(mealPlanData).length > 0;
  };

  return {
    saveMealPlan,
    handleClearMealPlan,
    handleAddMeal,
    canSave
  };
};
