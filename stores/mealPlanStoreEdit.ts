import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Alert } from 'react-native';

export interface FoodItem {
  id: string;
  name: string;
  cal: number;
  carb: number;
  fat: number;
  protein: number;
  img: string | null;
  ingredient: string;
  source: 'user_food' | 'foods';
  isUserFood: boolean;
}

export interface MealData {
  time: string;
  name: string;
  items: FoodItem[];
}

export interface DayMeals {
  [mealId: string]: MealData;
}

export interface MealPlanData {
  [day: number]: DayMeals;
}

export interface Meal {
  id: string;
  name: string;
  icon: string;
  time: string;
}

// Custom meals per day
export interface CustomMealsPerDay {
  [day: number]: Meal[];
}

interface MealPlanStoreEdit {
  planId: number | null;
  planName: string;
  planDescription: string;
  planImage: string | null;
  setAsCurrentPlan: boolean;

  mealPlanData: MealPlanData;
  meals: Meal[]; // Default meals
  customMeals: CustomMealsPerDay; // Custom meals per day
  isEditMode: boolean; 
  
  // เพิ่ม state สำหรับเก็บข้อมูลเดิมจาก API
  originalPlanData: any | null; // ข้อมูลเดิมจาก API

  
  // Actions
  addFoodToMeal: (food: FoodItem, mealId: string, day: number, mealInfo?: { name: string; time: string }) => void;
  removeFoodFromMeal: (foodId: string, mealId: string, day: number) => void;
  updateFoodInMeal: (updatedFood: FoodItem, mealId: string, day: number) => void; // New function to update food
  clearMealPlan: () => void;
  clearEditSession: () => void; // ล้างข้อมูล edit session
  clearDay: (day: number) => void;
  addMeal: (meal: Meal, day: number) => void; // Updated to include day
  getAllMealsForDay: (day: number) => Meal[]; // New function to get all meals for a specific day
  getMealData: (day: number, mealId: string) => MealData | undefined;
  getDayMeals: (day: number) => DayMeals;
  loadMealPlanData: (planData: any) => void; // New function to load meal plan data from API
  setEditMode: (isEdit: boolean) => void; // New function to set edit mode
  setPlanId: (id: number | null) => void; // เซ็ต plan ID
  setPlanMetadata: (data: any) => void; // Action ใหม่สำหรับอัปเดตข้อมูลเมตาของแผน
  
  // Nutrition calculations
  getMealNutrition: (day: number, mealId: string) => { cal: number; carb: number; fat: number; protein: number };
  getDayNutrition: (day: number) => { cal: number; carb: number; fat: number; protein: number };
}

// Default meal information
const defaultMealInfo = {
  'breakfast': { name: 'อาหารมื้อเช้า', time: '07:00' },
  'lunch': { name: 'อาหารมื้อกลางวัน', time: '12:00' },
  'dinner': { name: 'อาหารมื้อเย็น', time: '18:00' }
};

// Rename store hook for edit mode
export const useMealPlanStoreEdit = create<MealPlanStoreEdit>()((set, get) => ({

  planId: null,
  planName: '',
  planDescription: '',
  planImage: null,
  setAsCurrentPlan: true,

  mealPlanData: {},
  meals: [
    { id: 'breakfast', name: 'อาหารมื้อเช้า', icon: 'sunny', time: '07:00' },
    { id: 'lunch', name: 'อาหารมื้อกลางวัน', icon: 'partly-sunny', time: '12:00' },
    { id: 'dinner', name: 'อาหารมื้อเย็น', icon: 'moon', time: '18:00' },
  ],
  customMeals: {}, // Initialize custom meals
  isEditMode: false, // Initialize edit mode flag
  originalPlanData: null, // เก็บข้อมูลเดิมจาก API
  
      setEditMode: (isEdit: boolean) => {
        set((state) => ({
          ...state,
          isEditMode: isEdit
        }));
      },

      setPlanId: (id: number | null) => {
        set((state) => ({
          ...state,
          planId: id
        }));
      },
      
      setPlanMetadata: (data) => set((state) => ({ ...state, ...data })),

      getAllMealsForDay: (day: number) => {
        const state = get();
        const defaultMeals = state.meals;
        const customMealsForDay = state.customMeals[day] || [];
        return [...defaultMeals, ...customMealsForDay];
      },

      addMeal: (meal: Meal, day: number) => {
        set((state) => ({
          ...state,
          customMeals: {
            ...state.customMeals,
            [day]: [...(state.customMeals[day] || []), meal],
          },
        }));
      },

      addFoodToMeal: (food: FoodItem, mealId: string, day: number, mealInfo?: { name: string; time: string }) => {
        
        
        set((state) => {
          console.log('📝 [mealPlanStoreEdit] Current state before adding food:', {
            currentMealPlanData: state.mealPlanData,
            targetDay: state.mealPlanData[day],
            targetMeal: state.mealPlanData[day]?.[mealId]
          });
          
          // Get existing items for this meal and day
          const existingItems = state.mealPlanData[day]?.[mealId]?.items || [];
          console.log('🔍 [mealPlanStoreEdit] Existing items:', existingItems);
          
          // สร้าง unique ID ใหม่สำหรับอาหารที่เพิ่มเข้ามา เพื่อป้องกัน duplicate
          const foodToAdd = {
            ...food,
            id: `${food.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          };
          
          console.log('🆔 [mealPlanStoreEdit] Generated new unique ID for food:', foodToAdd.id);

          // Get meal info - first try passed mealInfo, then existing data, then from all meals for this day, then default
          let finalMealInfo = mealInfo;
          if (!finalMealInfo) {
            // Try to get existing meal data
            finalMealInfo = {
              name: state.mealPlanData[day]?.[mealId]?.name,
              time: state.mealPlanData[day]?.[mealId]?.time
            };
            
            // If no existing data, try to find in all meals for this day (default + custom)
            if (!finalMealInfo.name || !finalMealInfo.time) {
              const allMealsForDay = get().getAllMealsForDay(day);
              const mealFromArray = allMealsForDay.find(m => m.id === mealId);
              if (mealFromArray) {
                finalMealInfo = {
                  name: mealFromArray.name,
                  time: mealFromArray.time
                };
              } else {
                // Fallback to default
                const defaultInfo = defaultMealInfo[mealId as keyof typeof defaultMealInfo] || { name: 'มื้ออาหาร', time: '00:00' };
                finalMealInfo = {
                  name: finalMealInfo.name || defaultInfo.name,
                  time: finalMealInfo.time || defaultInfo.time
                };
              }
            }
          }

          // Create new state with immutable pattern
          const newMealPlanData = {
            ...state.mealPlanData,
            [day]: {
              ...(state.mealPlanData[day] || {}),
              [mealId]: {
                time: finalMealInfo.time,
                name: finalMealInfo.name,
                items: [...existingItems, foodToAdd],
              },
            },
          };

          console.log('✅ [mealPlanStoreEdit] Food added successfully:', {
            addedFood: foodToAdd.name,
            addedFoodId: foodToAdd.id,
            finalMealInfo,
            newItemsCount: newMealPlanData[day][mealId].items.length,
            newMealPlanData
          });

          return {
            ...state,
            mealPlanData: newMealPlanData,
          };
        });
      },

      removeFoodFromMeal: (foodId: string, mealId: string, day: number) => {
        set((state) => {
          const existingItems = state.mealPlanData[day]?.[mealId]?.items || [];
          const updatedItems = existingItems.filter(item => item.id !== foodId);

          // If no items left, remove the meal entirely
          if (updatedItems.length === 0) {
            const { [mealId]: removedMeal, ...restMeals } = state.mealPlanData[day] || {};
            
            // If no meals left for the day, remove the day entirely
            if (Object.keys(restMeals).length === 0) {
              const { [day]: removedDay, ...restDays } = state.mealPlanData;
              return {
                ...state,
                mealPlanData: restDays,
              };
            }

            return {
              ...state,
              mealPlanData: {
                ...state.mealPlanData,
                [day]: restMeals,
              },
            };
          }

          // Update meal with new items list
          return {
            ...state,
            mealPlanData: {
              ...state.mealPlanData,
              [day]: {
                ...state.mealPlanData[day],
                [mealId]: {
                  ...state.mealPlanData[day][mealId],
                  items: updatedItems,
                },
              },
            },
          };
        });
      },

      updateFoodInMeal: (updatedFood: FoodItem, mealId: string, day: number) => {
        set((state) => {
          const existingItems = state.mealPlanData[day]?.[mealId]?.items || [];
          const updatedItems = existingItems.map(item => 
            item.id === updatedFood.id ? updatedFood : item
          );

          return {
            ...state,
            mealPlanData: {
              ...state.mealPlanData,
              [day]: {
                ...state.mealPlanData[day],
                [mealId]: {
                  ...state.mealPlanData[day][mealId],
                  items: updatedItems,
                },
              },
            },
          };
        });
      },

      clearMealPlan: () => {
        set((state) => ({
          ...state,
          mealPlanData: {},
        }));
      },

      clearEditSession: () => {
        set({
          mealPlanData: {},
          customMeals: {},
          isEditMode: false,
          originalPlanData: null,
          planId: null,
          planName: '',
          planDescription: '',
          planImage: null,
          setAsCurrentPlan: true,
        });
      },

      clearDay: (day: number) => {
        set((state) => {
          const { [day]: removedDay, ...restDays } = state.mealPlanData;
          return {
            ...state,
            mealPlanData: restDays,
          };
        });
      },

      loadMealPlanData: (planData: any) => {
        
        if (!planData || !planData.plan) {
          console.log('❌ [mealPlanStoreEdit] No full plan object provided');
          return;
        }
        const fullPlan = planData.plan;
        const planContents = typeof fullPlan.plan === 'string'
          ? JSON.parse(fullPlan.plan)
          : fullPlan.plan;
        const { convertedMealPlanData, convertedCustomMeals } = parsePlanContents(planContents);
        set({
          originalPlanData: fullPlan,
          planId: fullPlan.id,
          planName: fullPlan.name || '',
          planDescription: fullPlan.description || '',
          planImage: fullPlan.img || null,
          mealPlanData: convertedMealPlanData,
          customMeals: convertedCustomMeals,
          isEditMode: true,
        });
       
      },

      getMealData: (day: number, mealId: string) => {
        const state = get();
        return state.mealPlanData[day]?.[mealId];
      },

      getDayMeals: (day: number) => {
        const state = get();
        return state.mealPlanData[day] || {};
      },

      getMealNutrition: (day: number, mealId: string) => {
        const state = get();
        const mealData = state.mealPlanData[day]?.[mealId];
        
        if (!mealData || !mealData.items.length) {
          return { cal: 0, carb: 0, fat: 0, protein: 0 };
        }

        return mealData.items.reduce((totals, item) => ({
          cal: totals.cal + item.cal,
          carb: totals.carb + item.carb,
          fat: totals.fat + item.fat,
          protein: totals.protein + item.protein
        }), { cal: 0, carb: 0, fat: 0, protein: 0 });
      },

      getDayNutrition: (day: number) => {
        const state = get();
        const dayMeals = state.mealPlanData[day] || {};
        
        return Object.values(dayMeals).reduce((totals, meal) => {
          const mealNutrition = meal.items.reduce((mealTotals, item) => ({
            cal: mealTotals.cal + item.cal,
            carb: mealTotals.carb + item.carb,
            fat: mealTotals.fat + item.fat,
            protein: mealTotals.protein + item.protein
          }), { cal: 0, carb: 0, fat: 0, protein: 0 });

          return {
            cal: totals.cal + mealNutrition.cal,
            carb: totals.carb + mealNutrition.carb,
            fat: totals.fat + mealNutrition.fat,
            protein: totals.protein + mealNutrition.protein
          };
        }, { cal: 0, carb: 0, fat: 0, protein: 0 });
      },
    }));

// Helper function for parsing plan contents
function parsePlanContents(parsedPlanData: any) {
  const convertedMealPlanData: MealPlanData = {};
  const convertedCustomMeals: CustomMealsPerDay = {};

  Object.keys(parsedPlanData).forEach(dayKey => {
    const dayNumber = parseInt(dayKey);
    const dayData = parsedPlanData[dayKey];
    
    console.log(`📅 [mealPlanStoreEdit] Processing day ${dayNumber}:`, dayData);
    
    if (dayData && dayData.meals) {
      convertedMealPlanData[dayNumber] = {};
      convertedCustomMeals[dayNumber] = [];
      
      Object.keys(dayData.meals).forEach(mealId => {
        const mealData = dayData.meals[mealId];
        
        console.log(`🍽️ [mealPlanStoreEdit] Processing meal ${mealId}:`, mealData);
        
        if (mealData && mealData.items && Array.isArray(mealData.items)) {
          // Add to meal plan data
          convertedMealPlanData[dayNumber][mealId] = {
            name: mealData.name || 'มื้ออาหาร',
            time: mealData.time || '00:00',
            items: mealData.items.map((item: any) => {
              const convertedItem = {
                id: item.id || item.food_id || `${Date.now()}_${Math.random()}`,
                name: item.name || item.food_name || 'Unknown Food',
                cal: parseFloat(item.cal || item.calories || 0),
                carb: parseFloat(item.carb || item.carbohydrates || 0),
                fat: parseFloat(item.fat || item.fats || 0),
                protein: parseFloat(item.protein || item.proteins || 0),
                img: item.img || item.image || null,
                ingredient: item.ingredient || item.ingredients || '',
                source: item.source || (item.isUserFood ? 'user_food' : 'foods'),
                isUserFood: Boolean(item.isUserFood || item.is_user_food || false)
              };
              console.log(`🥘 [mealPlanStoreEdit] Converted food item:`, convertedItem);
              return convertedItem;
            })
          };
          
          console.log(`✅ [mealPlanStoreEdit] Added meal ${mealId} to day ${dayNumber} with ${mealData.items.length} items`);
          
          // Add to custom meals if not a default meal
          if (!['breakfast', 'lunch', 'dinner', 'snack'].includes(mealId)) {
            convertedCustomMeals[dayNumber].push({
              id: mealId,
              name: mealData.name || 'มื้ออาหาร',
              icon: 'restaurant',
              time: mealData.time || '00:00'
            });
            console.log(`🆕 [mealPlanStoreEdit] Added custom meal ${mealId} to day ${dayNumber}`);
          }
        } else {
          console.log(`⚠️ [mealPlanStoreEdit] Skipping meal ${mealId} - no items or invalid data`);
        }
      });
    } else {
      console.log(`⚠️ [mealPlanStoreEdit] Skipping day ${dayNumber} - no meals data`);
    }
  });

  

  return { convertedMealPlanData, convertedCustomMeals };
}
