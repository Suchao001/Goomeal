import { Request, Response } from 'express';
import db from '../db_config';

interface MealPlanDetail {
  detail_id: number;
  plan_id: number;
  day_number: number;
  meal_type: string;
  meal_name: string;
  meal_time: string;
  calories: number;
  protein: number;
  carb: number;
  fat: number;
  food_id: number;
  img: string;
}

export const getMealPlanWithDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const planId = parseInt(req.params.planId as string);
    
    if (!planId) {
      res.status(400).json({
        success: false,
        error: 'Plan ID is required'
      });
      return;
    }

    console.log('=== Starting to fetch meal plan details for plan_id:', planId, '===');

    // 1. Get global food plan info
    const globalPlan = await db('global_food_plan')
      .where('plan_id', planId)
      .first();

    console.log('Global Plan Info:', globalPlan);

    if (!globalPlan) {
      res.status(404).json({
        success: false,
        error: 'Global food plan not found'
      });
      return;
    }

    // 2. Get meal plan details with img column
    const mealDetails = await db('meal_plan_detail')
      .where('plan_id', planId)
      .select('detail_id', 'plan_id', 'day_number', 'meal_type', 'meal_name', 'meal_time', 'calories', 'protein', 'carb', 'fat', 'food_id', 'img')
      .orderBy(['day_number', 'meal_time']);

    console.log('Raw Meal Details from DB:', mealDetails);
    console.log('Total meal details found:', mealDetails.length);

    // 3. Transform data to required JSON format (no need to join foods table)
    const transformedData: any = {};

    // Group by day_number
    const dayGroups = mealDetails.reduce((groups: any, detail: MealPlanDetail) => {
      const day = detail.day_number;
      if (!groups[day]) {
        groups[day] = [];
      }
      groups[day].push(detail);
      return groups;
    }, {});

    console.log('Day groups:', dayGroups);

    // Transform each day
    Object.keys(dayGroups).forEach(dayKey => {
      const dayNumber = parseInt(dayKey);
      const dayMeals = dayGroups[dayKey];
      
      console.log(`Processing day ${dayNumber}:`, dayMeals);

      // Group meals by meal_type for this day
      const mealTypeGroups = dayMeals.reduce((groups: any, meal: MealPlanDetail) => {
        const mealType = meal.meal_type;
        if (!groups[mealType]) {
          groups[mealType] = [];
        }
        groups[mealType].push(meal);
        return groups;
      }, {});

      console.log(`Meal type groups for day ${dayNumber}:`, mealTypeGroups);

      const dayData: any = {
        totalCal: 0,
        meals: {}
      };

      // Process each meal type
      Object.keys(mealTypeGroups).forEach(mealType => {
        const meals = mealTypeGroups[mealType];
        const mealData: any = {
          time: meals[0]?.meal_time || "00:00",
          name: meals[0]?.meal_name || `อาหารมื้อ${mealType}`,
          items: [],
          totalCal: 0
        };

        // Process each meal item
        meals.forEach((meal: MealPlanDetail) => {
          // Use data directly from meal_plan_detail table
          const itemData: any = {
            id: `global_${meal.food_id}`,
            name: meal.meal_name || "Unknown Food",
            cal: Number(meal.calories),
            carb: Number(meal.carb),
            fat: Number(meal.fat),
            protein: Number(meal.protein),
            img: meal.img || "",
            ingredient: "", // Set to empty as requested
            source: "foods",
            isUserFood: false
          };

          mealData.items.push(itemData);
          mealData.totalCal += Number(meal.calories);
        });

        dayData.meals[mealType] = mealData;
        dayData.totalCal += mealData.totalCal;
      });

      transformedData[dayNumber] = dayData;
    });

    console.log('=== Final Transformed Data ===');
    console.log(JSON.stringify(transformedData, null, 2));

    res.status(200).json({
      success: true,
      data: {
        planInfo: globalPlan,
        mealPlan: transformedData
      },
      message: 'Meal plan details fetched and transformed successfully'
    });

  } catch (error) {
    console.error('Error fetching meal plan details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch meal plan details',
      message: 'Internal server error'
    });
  }
};

export const getAllMealPlansWithDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== Fetching all global food plans with details ===');

    // Get all global food plans
    const globalPlans = await db('global_food_plan')
      .select('plan_id', 'plan_name', 'duration', 'description', 'created_at', 'image');

    console.log('Found global plans:', globalPlans.length);

    const results = [];

    for (const plan of globalPlans) {
      console.log(`\n--- Processing plan: ${plan.plan_name} (ID: ${plan.plan_id}) ---`);

      // Get meal details for this plan
      const mealDetails = await db('meal_plan_detail')
        .where('plan_id', plan.plan_id)
        .select('detail_id', 'plan_id', 'day_number', 'meal_type', 'meal_name', 'meal_time', 'calories', 'protein', 'carb', 'fat', 'food_id', 'img')
        .orderBy(['day_number', 'meal_time']);

      console.log(`Meal details for plan ${plan.plan_id}:`, mealDetails.length, 'items');

      if (mealDetails.length > 0) {
        // Transform data (no need to join foods table)
        const transformedData: any = {};
        const dayGroups = mealDetails.reduce((groups: any, detail: MealPlanDetail) => {
          const day = detail.day_number;
          if (!groups[day]) {
            groups[day] = [];
          }
          groups[day].push(detail);
          return groups;
        }, {});

        Object.keys(dayGroups).forEach(dayKey => {
          const dayNumber = parseInt(dayKey);
          const dayMeals = dayGroups[dayKey];
          
          const mealTypeGroups = dayMeals.reduce((groups: any, meal: MealPlanDetail) => {
            const mealType = meal.meal_type;
            if (!groups[mealType]) {
              groups[mealType] = [];
            }
            groups[mealType].push(meal);
            return groups;
          }, {});

          const dayData: any = {
            totalCal: 0,
            meals: {}
          };

          Object.keys(mealTypeGroups).forEach(mealType => {
            const meals = mealTypeGroups[mealType];
            const mealData: any = {
              time: meals[0]?.meal_time || "00:00",
              name: meals[0]?.meal_name || `อาหารมื้อ${mealType}`,
              items: [],
              totalCal: 0
            };

            meals.forEach((meal: MealPlanDetail) => {
              // Use data directly from meal_plan_detail table
              const itemData: any = {
                id: `global_${meal.food_id}`,
                name: meal.meal_name || "Unknown Food",
                cal: Number(meal.calories),
                carb: Number(meal.carb),
                fat: Number(meal.fat),
                protein: Number(meal.protein),
                img: meal.img || "",
                ingredient: "", // Set to empty as requested
                source: "foods",
                isUserFood: false
              };

              mealData.items.push(itemData);
              mealData.totalCal += Number(meal.calories);
            });

            dayData.meals[mealType] = mealData;
            dayData.totalCal += mealData.totalCal;
          });

          transformedData[dayNumber] = dayData;
        });

        results.push({
          planInfo: plan,
          mealPlan: transformedData
        });

        console.log(`Completed processing plan ${plan.plan_id}`);
      } else {
        console.log(`No meal details found for plan ${plan.plan_id}`);
        results.push({
          planInfo: plan,
          mealPlan: {}
        });
      }
    }

    console.log('\n=== Final Results Summary ===');
    console.log(`Total plans processed: ${results.length}`);
    results.forEach((result, index) => {
      console.log(`Plan ${index + 1}: ${result.planInfo.plan_name} - ${Object.keys(result.mealPlan).length} days`);
    });

    res.status(200).json({
      success: true,
      data: results,
      message: 'All meal plans fetched and transformed successfully'
    });

  } catch (error) {
    console.error('Error fetching all meal plans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch all meal plans',
      message: 'Internal server error'
    });
  }
};
