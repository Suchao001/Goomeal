import { apiClient } from './apiClient';
import { base_url, seconde_url } from '../config';

// Interface for meal items
export interface TodayMealItem {
  name: string;
  calories: number;
  protein: number;
  carb: number;
  fat: number;
  image?: string;
}

export interface TodayMealData {
  breakfast: TodayMealItem[];
  lunch: TodayMealItem[];
  dinner: TodayMealItem[];
  totalCalories: number;
  planDay: number | null;
  planName: string | null;
  mealsMap?: Record<string, TodayMealItem[]>; // dynamic categories incl. custom
  mealsMeta?: Record<string, { time?: string; label?: string }>; // per-meal metadata
}

/**
 * Calculate which day of the plan the selected date represents
 */
const calculatePlanDay = (selectedDate: Date, startDate: Date, isRepeat: boolean, planDuration: number) => {
  const timeDiff = selectedDate.getTime() - startDate.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  if (daysDiff < 0) {
    // Selected date is before plan start date
    return null;
  }
  
  if (isRepeat) {
    // If repeating, cycle through plan days
    return (daysDiff % planDuration) + 1;
  } else {
    // If not repeating, only show if within plan duration
    if (daysDiff >= planDuration) {
      return null;
    }
    return daysDiff + 1;
  }
};

/**
 * Get image URL for meal items
 */
const getImageUrl = (imagePath?: string) => {
  if (!imagePath) {
    return 'https://via.placeholder.com/60x60/E5E7EB/6B7280?text=Food';
  }
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Check if path starts with /images/ -> use base_url
  if (imagePath.startsWith('/images/')) {
    return `${base_url}${imagePath}`;
  }
  
  // Check if path starts with /foods/ -> use seconde_url
  if (imagePath.startsWith('/foods/')) {
    return `${seconde_url}${imagePath}`;
  }

  if (imagePath.startsWith('assets/')) {
    return `${base_url}/${imagePath}`;
  }
  
  // Default fallback - use seconde_url for other paths
  return `${seconde_url}${imagePath}`;
};

/**
 * Helper function to categorize meal types (supports case variations and custom names)
 */
const categorizeMealType = (mealTypeName: string) => {
  const lowerName = mealTypeName.toLowerCase();
  
  if (lowerName.includes('breakfast') || lowerName.includes('เช้า') || lowerName === 'breakfast') {
    return 'breakfast';
  } else if (lowerName.includes('lunch') || lowerName.includes('กลางวัน') || lowerName === 'lunch') {
    return 'lunch';
  } else if (lowerName.includes('dinner') || lowerName.includes('เย็น') || lowerName === 'dinner') {
    return 'dinner';
  } else {
    // Keep custom meal as its own category
    return mealTypeName;
  }
};

/**
 * Transform meal data from API response
 */
const transformMealData = (mealsData: any): { breakfast: TodayMealItem[], lunch: TodayMealItem[], dinner: TodayMealItem[], mealsMap: Record<string, TodayMealItem[]>, mealsMeta: Record<string, { time?: string; label?: string }> } => {
  const transformedMealData = {
    breakfast: [] as TodayMealItem[],
    lunch: [] as TodayMealItem[],
    dinner: [] as TodayMealItem[],
    mealsMap: {} as Record<string, TodayMealItem[]>,
    mealsMeta: {} as Record<string, { time?: string; label?: string }>
  };

  if (!mealsData) {
    return transformedMealData;
  }

  // Handle case where meals might be a JSON string
  let parsedMealsData = mealsData;
  if (typeof mealsData === 'string') {
    try {
      parsedMealsData = JSON.parse(mealsData);
    } catch (error) {
      console.error('❌ [TodayMealApi] Error parsing meals data:', error);
      return transformedMealData;
    }
  }
  
  // Process each meal type dynamically
  Object.keys(parsedMealsData).forEach(mealKey => {
    const mealData = parsedMealsData[mealKey];
    const category = categorizeMealType(mealKey);
    // collect meta
    transformedMealData.mealsMeta[category] = { time: mealData?.time, label: mealKey };
    
    if (mealData && mealData.items && Array.isArray(mealData.items)) {
      const transformedItems = mealData.items.map((item: any) => ({
        name: item.name || 'ไม่ระบุชื่อ',
        calories: parseFloat(item.cal) || 0,
        protein: parseFloat(item.protein) || 0,
        carb: parseFloat(item.carb) || 0,
        fat: parseFloat(item.fat) || 0,
        image: getImageUrl(item.img)
      }));
      
      // Add to appropriate category (or combine if multiple map to same category)
      if (!transformedMealData.mealsMap[category]) transformedMealData.mealsMap[category] = [];
      transformedMealData.mealsMap[category].push(...transformedItems);
      if (category === 'breakfast' || category === 'lunch' || category === 'dinner') {
        transformedMealData[category].push(...transformedItems);
      }
    }
  });

  return transformedMealData;
};

/**
 * Calculate total calories from meals data
 */
const calculateTotalCalories = (mealsData: any): number => {
  if (!mealsData) {
    return 0;
  }

  // Handle case where meals might be a JSON string
  let parsedMealsData = mealsData;
  if (typeof mealsData === 'string') {
    try {
      parsedMealsData = JSON.parse(mealsData);
    } catch (error) {
      console.error('❌ [TodayMealApi] Error parsing meals for total calories:', error);
      return 0;
    }
  }
  
  let totalCal = 0;
  
  // Sum up totalCal from all meals dynamically
  Object.keys(parsedMealsData).forEach(mealKey => {
    if (parsedMealsData[mealKey]?.totalCal) {
      totalCal += parsedMealsData[mealKey].totalCal;
    }
  });
  
  return totalCal;
};

/**
 * Fetch today's meal data from current food plan
 * @param targetDate - Optional date to fetch meals for (defaults to today)
 * @returns Promise<TodayMealData | null>
 */
export const fetchTodayMeals = async (targetDate?: Date): Promise<TodayMealData | null> => {
  try {
    const today = targetDate || new Date();
    
    // Call API to get current active food plan
    const response = await apiClient.get('/user-food-plans/current');
    
    if (!response.data.success) {
      return null;
    }

    const planData = response.data.data;
    
    // Set up plan info
    const currentFoodPlan = {
      id: planData.food_plan_id,
      name: planData.name,
      description: planData.description,
      plan: planData.plan_data,
      img: planData.img,
      usingInfo: {
        start_date: planData.start_date,
        is_repeat: planData.is_repeat
      }
    };

    if (!currentFoodPlan.usingInfo) {
      return null;
    }
    
    const startDate = new Date(currentFoodPlan.usingInfo.start_date);
    let planJsonData = currentFoodPlan.plan;
    
    // Handle case where plan data might be a JSON string
    if (typeof planJsonData === 'string') {
      try {
        planJsonData = JSON.parse(planJsonData);
      } catch (error) {
        console.error('❌ [TodayMealApi] Error parsing plan data:', error);
        return null;
      }
    }
    
    const planDuration = Object.keys(planJsonData || {}).length;
    
    const planDay = calculatePlanDay(
      today, 
      startDate, 
      currentFoodPlan.usingInfo.is_repeat,
      planDuration
    );
    
    if (!planDay || !planJsonData) {
      return null;
    }
    
    let dayData = planJsonData[planDay.toString()];
    
    // Handle case where day data might also be a JSON string
    if (typeof dayData === 'string') {
      try {
        dayData = JSON.parse(dayData);
      } catch (error) {
        console.error('❌ [TodayMealApi] Error parsing day data:', error);
        return null;
      }
    }

    const mealsData = dayData?.meals || dayData || null;
    
    if (!mealsData) {
      return null;
    }

    // Transform the meal data
    const transformedMeals = transformMealData(mealsData);
    const totalCalories = calculateTotalCalories(mealsData);

    const result: TodayMealData = {
      breakfast: transformedMeals.breakfast,
      lunch: transformedMeals.lunch,
      dinner: transformedMeals.dinner,
      totalCalories,
      planDay,
      planName: currentFoodPlan.name,
      mealsMap: transformedMeals.mealsMap,
      mealsMeta: transformedMeals.mealsMeta
    };

    
    return result;

  } catch (error: any) {
    console.error('❌ [TodayMealApi] Error fetching today\'s meals:', error);
    return null;
  }
};

/**
 * Get a summary of today's nutrition
 */
export const getTodayNutritionSummary = (todayMealData: TodayMealData) => {
  const allMeals = [
    ...todayMealData.breakfast,
    ...todayMealData.lunch,
    ...todayMealData.dinner
  ];

  const totalProtein = allMeals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarb = allMeals.reduce((sum, meal) => sum + meal.carb, 0);
  const totalFat = allMeals.reduce((sum, meal) => sum + meal.fat, 0);

  return {
    calories: todayMealData.totalCalories,
    protein: Math.round(totalProtein * 10) / 10,
    carbs: Math.round(totalCarb * 10) / 10,
    fat: Math.round(totalFat * 10) / 10,
    mealCount: allMeals.length
  };
};
