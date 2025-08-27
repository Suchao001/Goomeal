// รวม exports สำหรับระบบแนะนำการกินรายวัน

// Core Services
export * from './dailyRecommendationService';
export * from './dailyRecommendationTest';

// React Components
export { default as SmartFoodRecommendation } from '../components/SmartFoodRecommendation';
export { default as DailyRecommendationDisplay, DailyRecommendationTestScreen } from '../components/DailyRecommendationDisplay';

// Types
export type {
  DailyNutritionData,
  RecommendedNutrition,
  NutrientAssessment,
  DailyAssessment,
  DailyRecommendation,
  UserProfile
} from './dailyRecommendationService';

// Quick Access Functions
import { generateDailyRecommendation } from './dailyRecommendationService';
import { testScenarios } from './dailyRecommendationTest';

/**
 * สร้างคำแนะนำรายวันอย่างง่าย
 */
export const createDailyAdvice = (
  actualCalories: number,
  actualProtein: number,
  actualCarbs: number,
  actualFat: number,
  targetCalories: number,
  targetProtein: number,
  targetCarbs: number,
  targetFat: number,
  userWeight: number,
  userGoal: 'decrease' | 'increase' | 'healthy' = 'healthy'
) => {
  return generateDailyRecommendation(
    { calories: actualCalories, protein: actualProtein, carbs: actualCarbs, fat: actualFat },
    { calories: targetCalories, protein: targetProtein, carbs: targetCarbs, fat: targetFat },
    { target_goal: userGoal, weight: userWeight, age: 30, activity_level: 'moderate' }
  );
};

/**
 * รับ test scenario ตัวอย่าง
 */
export const getExampleScenarios = () => testScenarios;

/**
 * รับคำแนะนำตัวอย่างสำหรับ demo
 */
export const getDemoRecommendation = () => {
  const demoScenario = testScenarios[0];
  return generateDailyRecommendation(
    demoScenario.actualIntake,
    demoScenario.recommended,
    demoScenario.userProfile
  );
};
