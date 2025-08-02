// Custom Hook for Nutrition Data
// ใช้ดึงและ cache ข้อมูลโภชนาการที่แนะนำจาก user profile

import { useMemo } from 'react';
import { useAuth } from '../AuthContext';
import { useMealPlanStore } from '../stores/mealPlanStore';
import { mapAuthUserToUserProfile, getDefaultNutritionData } from '../utils/userProfileMapper';
import { RecommendedNutrition } from '../utils/nutritionCalculator';

export function useRecommendedNutrition(): {
  nutrition: RecommendedNutrition;
  isCalculated: boolean;
  isProfileComplete: boolean;
} {
  const { user } = useAuth();
  const { getRecommendedNutrition } = useMealPlanStore();

  const result = useMemo(() => {
    // Map auth user to user profile
    const userProfile = mapAuthUserToUserProfile(user);
    
    if (!userProfile) {
      console.log('⚠️ [useRecommendedNutrition] Using default nutrition data (incomplete profile)');
      return {
        nutrition: getDefaultNutritionData(),
        isCalculated: false,
        isProfileComplete: false
      };
    }

    // Get calculated nutrition (with caching)
    const nutrition = getRecommendedNutrition(userProfile);
    
    console.log('✅ [useRecommendedNutrition] Using calculated nutrition data:', {
      cal: nutrition.cal,
      carb: nutrition.carb,
      protein: nutrition.protein,
      fat: nutrition.fat
    });

    return {
      nutrition,
      isCalculated: true,
      isProfileComplete: true
    };
  }, [user, getRecommendedNutrition]);

  return result;
}

// Hook specifically for calorie progress
export function useCalorieProgress() {
  const { nutrition, isCalculated } = useRecommendedNutrition();
  
  return {
    recommendedCalories: nutrition.cal,
    isCalculated,
    getProgress: (currentCalories: number) => {
      if (nutrition.cal === 0) return 0;
      return Math.min((currentCalories / nutrition.cal) * 100, 100);
    },
    getStatus: (currentCalories: number) => {
      const progress = Math.min((currentCalories / nutrition.cal) * 100, 100);
      if (progress < 50) return 'low';
      if (progress < 90) return 'good';
      if (progress <= 110) return 'perfect';
      return 'high';
    }
  };
}
