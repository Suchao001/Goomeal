import { base_url, seconde_url } from '../config';
import { FoodItem } from '../stores/mealPlanStore';

/**
 * Get image URL based on food source
 */
export const getImageUrl = (food: FoodItem): string => {
  if (!food.img) return '';
  
  if (food.isUserFood || food.source === 'user_food') {
    return `${base_url}${food.img}`;
  } else {
    return `${seconde_url}${food.img}`;
  }
};

/**
 * Format time for display
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

/**
 * Get current date info (simplified - just day numbers)
 */
export const getCurrentDate = (selectedDay: number) => {
  return {
    dayName: `วันที่ ${selectedDay}`,
    fullDate: `วันที่ ${selectedDay}`,
    shortDate: `วันที่ ${selectedDay}`
  };
};

/**
 * Generate days array for date picker
 */
export const generateDays = (count = 30): number[] => {
  return Array.from({ length: count }, (_, i) => i + 1);
};
