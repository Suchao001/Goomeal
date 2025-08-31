import axios from 'axios';
import OpenAI from 'openai';
import db from '../db_config';
import { calculateRecommendedNutrition, getCalculationSummary, UserProfileData } from '../utils/nutritionCalculator';
import {yearOfBirthToAge } from '../utils/ageCal';

const url = process.env.AI_API || 'http://localhost:11434';

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY
});

const getUserInfo = async (userId: number) => {
  try {
    const user = await db('users').where({ id: userId }).first();
    if (!user) {
      throw new Error('User not found');
    }
    return {
      age: user.age ? yearOfBirthToAge(user.age) : null,
      weight: user.weight,
      height: user.height,
      gender: user.gender,
      body_fat: user.body_fat,
      target_goal: user.target_goal,
      target_weight: user.target_weight,
      activity_level: user.activity_level,
      additional_requirements: user.additional_requirements,
      dietary_restrictions: user.dietary_restrictions ? user.dietary_restrictions.split(',').map((r: string) => r.trim()) : [],
      eating_type: user.eating_type

    };
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
};

const getUserMealTime = async (userId: number) => {
  try {
    const mealtime = await db('user_meal_time').where({ user_id: userId });
    if (!mealtime) {
      throw new Error('User not found');
    }
    return mealtime;
  } catch (error) {
    console.error('Error fetching user meal time:', error);
    throw error;
  }
};

// Helper: map Thai meal names to our keys and format HH:mm
const toHHMM = (t: any) => {
  const s = String(t ?? '');
  const parts = s.split(':');
  if (parts.length >= 2) {
    const hh = parts[0].padStart(2, '0');
    const mm = parts[1].padStart(2, '0');
    return `${hh}:${mm}`;
  }
  return '00:00';
};

const getDefaultMealTimes = async (userId: number) => {
  try {
    const rows = await db('user_meal_time')
      .select('*')
      .where({ user_id: userId })
      .orderBy('sort_order', 'asc');

    let breakfast = '07:00';
    let lunch = '12:00';
    let dinner = '18:00';

    const active = (rows || []).filter((r: any) => (typeof r.is_active === 'boolean' ? r.is_active : !!Number(r.is_active)));

    // Build meal defs (default + custom)
    const mealDefs: Array<{ key: string; name: string; time: string; isDefault: boolean; sort: number }> = [];
    for (const r of active) {
      const name = String(r.meal_name || '').trim();
      const hhmm = toHHMM(r.meal_time);
      if (name === 'มื้อเช้า') {
        breakfast = hhmm;
        mealDefs.push({ key: 'breakfast', name, time: hhmm, isDefault: true, sort: r.sort_order || 0 });
      } else if (name === 'มื้อกลางวัน') {
        lunch = hhmm;
        mealDefs.push({ key: 'lunch', name, time: hhmm, isDefault: true, sort: r.sort_order || 0 });
      } else if (name === 'มื้อเย็น') {
        dinner = hhmm;
        mealDefs.push({ key: 'dinner', name, time: hhmm, isDefault: true, sort: r.sort_order || 0 });
      } else {
        const key = r.id ? `custom-${r.id}` : `custom-${(r.sort_order || '')}`;
        mealDefs.push({ key, name, time: hhmm, isDefault: false, sort: r.sort_order || 0 });
      }
    }

    const mealsText = active
      .map((r: any) => `- ${String(r.meal_name || '').trim()}: ${toHHMM(r.meal_time)}`)
      .join('\n');

    mealDefs.sort((a, b) => a.sort - b.sort);

    return { breakfast, lunch, dinner, mealsText, mealDefs };
  } catch (_) {
    return { breakfast: '07:00', lunch: '12:00', dinner: '18:00', mealsText: '', mealDefs: [
      { key: 'breakfast', name: 'มื้อเช้า', time: '07:00', isDefault: true, sort: 1 },
      { key: 'lunch', name: 'มื้อกลางวัน', time: '12:00', isDefault: true, sort: 2 },
      { key: 'dinner', name: 'มื้อเย็น', time: '18:00', isDefault: true, sort: 3 },
    ] };
  }
};
export async function suggestFood(userId: number, payload?: any) {
  try {
    const {
      mealType,
      hungerLevel,
      ingredients,
      foodType,
      budget,
      complexityLevel
    } = payload || {};

    const { dietary_restrictions } = await getUserInfo(userId);

    const foodSuggestionPrompt = `You are an AI assistant that generates default for Thai food menu suggestion.
Your response MUST be a single, valid JSON object.
It MUST NOT be a JSON array.
It MUST NOT be wrapped in markdown backticks like \`\`\`json.
The JSON object MUST only contain these exact keys: "name", "cal", "carbs", "protein", "fat", "ingredients".

Here is an example of the required format:
{
  "name": "ต้มยำกุ้ง",
  "cal": 200,
  "carbs": 10,
  "protein": 30,
  "fat": 5,
  "ingredients": ["กุ้ง", "ตะไคร้", "ใบมะกรูด", "พริกขี้หนู", "น้ำมะนาว"]
}

Now, generate a single food suggestion based on these user preferences:
- Meal Type: ${mealType}
- Hunger Level: ${hungerLevel}
- Available Ingredients: ${ingredients}
- Food Type: ${foodType}
- Budget: ${budget}
- Dietary Restrictions: ${dietary_restrictions || 'None'}
- Complexity: ${complexityLevel}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: foodSuggestionPrompt
        }
      ]
    });

    const content = response.choices[0].message.content;

    // ล้าง backticks หรือคำตอบแปลกๆ ที่ AI อาจใส่มา
    const cleaned = content?.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();

    try {
      return JSON.parse(cleaned || '');
    } catch (e) {
      console.error('Failed to parse JSON from AI response:', cleaned);
      throw new Error('Invalid JSON returned from AI');
    }

  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      console.error('Error calling AI API:', err.response.data);
    } else if (err instanceof Error) {
      console.error('Error calling AI API:', err.message);
    } else {
      console.error('An unknown error occurred:', err);
    }
    throw err;
  }
}


export async function getFoodPlanSuggestions(userId: number, payload?: any) {
  let recommendedNutrition: any;
  let totalPlanDay: number = 3; // default value
  
  try {
    const {
      target_goal,
      target_weight,
      activity_level,
      eating_type,
      dietary_restrictions,
      additional_requirements,
      totalPlanDay: planDays
    } = payload || {};

    totalPlanDay = planDays || 3;

    const {
      age,
      weight,
      height,
      gender,
      body_fat
    } = await getUserInfo(userId);

    // สร้าง user profile สำหรับการคำนวณ
    const userProfile: UserProfileData = {
      age,
      weight,
      height,
      gender,
      body_fat,
      target_goal,
      target_weight: target_goal === 'increase' ? weight + target_weight : 
                    target_goal === 'decrease' ? weight - target_weight : weight,
      activity_level
    };

    // คำนวณโภชนาการที่แนะนำ
    recommendedNutrition = calculateRecommendedNutrition(userProfile);
    const calculationSummary = getCalculationSummary(userProfile);

    const { breakfast: bfTime, lunch: lnTime, dinner: dnTime, mealsText, mealDefs } = await getDefaultMealTimes(userId);

    // Calculate per-meal calorie targets based on active meals (default + custom)
    const baseShare: Record<string, number> = { breakfast: 0.3, lunch: 0.4, dinner: 0.3 };
    const shares: Record<string, number> = {};
    const customCount = mealDefs.filter(m => !m.isDefault).length;
    const customShare = customCount > 0 ? Math.min(0.1, 0.2 / customCount) : 0; // distribute small portion to customs
    let totalShare = 0;
    for (const m of mealDefs) {
      if (m.isDefault) shares[m.key] = baseShare[m.key] ?? 0.3; else shares[m.key] = customShare || 0.1;
      totalShare += shares[m.key];
    }
    // Normalize to 1.0
    if (totalShare > 0) {
      for (const k of Object.keys(shares)) shares[k] = shares[k] / totalShare;
    }
    const perMealKcal: Record<string, number> = {};
    for (const m of mealDefs) perMealKcal[m.key] = Math.round(recommendedNutrition.cal * (shares[m.key] || 0.3));
    const mealsDistributionBlock = mealDefs.map(m => `- ${m.name}: ${perMealKcal[m.key]} kcal at ${m.time}`).join('\n');
    const mealsExampleBlock = mealDefs.map(m => `      "${m.key}": {\n        "name": "${m.name}",\n        "time": "${m.time}",\n        "totalCal": ${perMealKcal[m.key]},\n        "items": [{\n          "name": "${m.name}",\n          "cal": ${perMealKcal[m.key]},\n          "carb": 45,\n          "fat": 12,\n          "protein": 25,\n          "img": "",\n          "ingredient": "",\n          "source": "ai",\n          "isUserFood": false\n        }]\n      }`).join(',\n');

    const foodPlanPrompt = `You are a nutritionist creating a ${totalPlanDay}-day default for thai food plan. Return ONLY a valid JSON object.

NUTRITIONAL TARGETS (per day):
- Calories: ${recommendedNutrition.cal} kcal
- Protein: ${recommendedNutrition.protein}g
- Carbohydrates: ${recommendedNutrition.carb}g  
- Fat: ${recommendedNutrition.fat}g

USER INFO:
- Age: ${age}, Weight: ${weight}kg → ${userProfile.target_weight}kg
- Goal: ${target_goal}, Activity: ${activity_level}
- Avoid: ${dietary_restrictions}
\nUSER MEAL TIMES (use these times exactly if applicable):
${mealsText || `- มื้อเช้า: ${bfTime}\n- มื้อกลางวัน: ${lnTime}\n- มื้อเย็น: ${dnTime}`}

MEAL DISTRIBUTION:
${mealsDistributionBlock}

JSON FORMAT (return this structure exactly):
{
  "1": {
    "totalCal": ${recommendedNutrition.cal},
    "meals": {
${mealsExampleBlock}
    }
  }
}

RULES:
1. Create ${totalPlanDay} days (keys "1" to "${totalPlanDay}")
2. Each meal must have ONE item only
3. All food names in Thai
4. Each day's totalCal = sum of meal totalCal
5. Each meal's totalCal = sum of item cal
6. Daily nutrition should match targets ±50 kcal
7. NO markdown formatting, NO explanations
8. Ensure JSON is complete and valid

Generate the complete JSON now:`;

    // Try with a more reliable model if available
    const modelToUse = 'gpt-3.5-turbo';
    const response = await openai.chat.completions.create({
      model: modelToUse,
      messages: [
        {
          role: 'system',
          content: 'You are a professional nutritionist who creates precise food plans. Always return valid JSON without any explanations or formatting.'
        },
        {
          role: 'user',
          content: foodPlanPrompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7
    });

    const content = response.choices[0].message.content;
    const cleaned = content?.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
    
    console.log('🤖 Raw AI Response Length:', content?.length);
    console.log('🧹 Cleaned Response Length:', cleaned?.length);
    
    if (cleaned && cleaned.length < 100) {
      console.warn('⚠️ AI response seems too short:', cleaned);
    }
    
    try {
      const parsedResult = JSON.parse(cleaned || '');
      
      // Validate the structure
      if (!parsedResult || typeof parsedResult !== 'object') {
        throw new Error('Response is not a valid object');
      }
      
      // Check if we have at least one day
      const dayKeys = Object.keys(parsedResult);
      if (dayKeys.length === 0) {
        throw new Error('No days found in the food plan');
      }
      
      // Validate first day structure
      const firstDay = parsedResult[dayKeys[0]];
      if (!firstDay.meals || !firstDay.totalCal) {
        throw new Error('Invalid day structure - missing meals or totalCal');
      }
      
      console.log('🎯 Nutritional Targets for Food Plan:');
      console.log(`Daily Calories: ${recommendedNutrition.cal} kcal`);
      console.log(`Protein: ${recommendedNutrition.protein}g | Carbs: ${recommendedNutrition.carb}g | Fat: ${recommendedNutrition.fat}g`);
      console.log('✅ AI Response parsed successfully with', dayKeys.length, 'days');
      console.log('full prompt:', foodPlanPrompt.substring(0, 500) + '...[truncated]');
      
      return parsedResult;
    } catch (e) {
      console.error('❌ Failed to parse JSON from AI response:');
      console.error('Raw content length:', content?.length);
      console.error('Cleaned content length:', cleaned?.length);
      console.error('Last 200 chars of cleaned content:', cleaned?.slice(-200));
      console.error('Parse error:', e);
      
      // Log the full prompt for debugging
      console.error('🔍 Full prompt sent to AI:');
      console.error(foodPlanPrompt.substring(0, 500) + '...[truncated]');
      
      throw new Error(`Invalid JSON returned from AI. Length: ${cleaned?.length}, Error: ${e}`);
    }

  } catch (err) {
    // If AI fails, try to provide a fallback plan
    if (err instanceof Error && err.message.includes('Invalid JSON')) {
      console.warn('🔄 AI failed, creating fallback plan...');
      try {
        const times = await getDefaultMealTimes(userId);
        const fallbackPlan = createFallbackPlan(recommendedNutrition, totalPlanDay || 3, times);
        console.log('✅ Fallback plan created successfully');
        return fallbackPlan;
      } catch (fallbackErr) {
        console.error('❌ Fallback plan creation failed:', fallbackErr);
      }
    }
    
    if (axios.isAxiosError(err) && err.response) {
      console.error('Error calling AI API:', err.response.data);
    } else if (err instanceof Error) {
      console.error('Error calling AI API:', err.message);
    } else {
      console.error('An unknown error occurred:', err);
    }
    throw err;
  }
}



export async function getFoodPlanSuggestionsByPrompt(userId: number, payload?: any) {
  let recommendedNutrition: any;
  let totalPlanDay: number = 7; // default value
  
  try {
    const userInfo = await getUserInfo(userId);
    const {
      planDuration,
      selectedCategories,
      selectedBudget,
      varietyLevel,
      selectedIngredients,
      additionalRequirements,
      selectedRestrictions,
      selectedGoals
    } = payload || {};

    totalPlanDay = parseInt(planDuration) || 7;

    const {
      age,
      weight,
      height,
      gender,
      body_fat,
      target_goal,
      target_weight,
      activity_level,
      dietary_restrictions: userDietaryRestrictions,
      eating_type
    } = userInfo;

    // สร้าง user profile สำหรับการคำนวณ
    const userProfile: UserProfileData = {
      age,
      weight,
      height,
      gender,
      body_fat,
      target_goal,
      target_weight: target_goal === 'increase' ? weight + target_weight : 
                    target_goal === 'decrease' ? weight - target_weight : weight,
      activity_level
    };

    // คำนวณโภชนาการที่แนะนำ
    recommendedNutrition = calculateRecommendedNutrition(userProfile);
    const calculationSummary = getCalculationSummary(userProfile);

    // แปลงข้อมูลจาก prompt
    const budgetText = selectedBudget === 'low' ? 'งบประมาณประหยัด 50-150 บาท/มื้อ' :
                      selectedBudget === 'medium' ? 'งบประมาณปานกลาง 150-300 บาท/มื้อ' :
                      selectedBudget === 'high' ? 'งบประมาณหรูหรา 300+ บาท/มื้อ' :
                      selectedBudget === 'flexible' ? 'งบประมาณยืดหยุ่น ปรับตามสถานการณ์' : 'ไม่ระบุ';

    const varietyText = varietyLevel === 'low' ? 'หลากหลายน้อย - อาหารคุ้นเคย ทำง่าย' :
                       varietyLevel === 'medium' ? 'หลากหลายปานกลาง - ผสมผสานอาหารใหม่ๆ' :
                       varietyLevel === 'high' ? 'หลากหลายมาก - ลองของใหม่ทุกมื้อ' : 'ไม่ระบุ';

    const ingredientsText = selectedIngredients && selectedIngredients.length > 0 ? 
                           selectedIngredients.join(', ') : 'ไม่มีการระบุวัตถุดิบเฉพาะ';

    const categoriesText = selectedCategories && selectedCategories.length > 0 ? 
                          selectedCategories.join(', ') : 'ไม่มีการระบุประเภทอาหาร';

    const restrictionsText = selectedRestrictions && selectedRestrictions.length > 0 ? 
                            selectedRestrictions.join(', ') : 'ไม่มีข้อจำกัด';

    const goalsText = selectedGoals && selectedGoals.length > 0 ? 
                     selectedGoals.join(', ') : 'ไม่มีเป้าหมายเฉพาะ';

    const { breakfast: bfTime2, lunch: lnTime2, dinner: dnTime2, mealsText: mealsText2, mealDefs: mealDefs2 } = await getDefaultMealTimes(userId);

    // Build distribution and example for dynamic meals (including custom)
    const baseShare2: Record<string, number> = { breakfast: 0.3, lunch: 0.4, dinner: 0.3 };
    const shares2: Record<string, number> = {};
    const customCount2 = mealDefs2.filter(m => !m.isDefault).length;
    const customShare2 = customCount2 > 0 ? Math.min(0.1, 0.2 / customCount2) : 0;
    let totalShare2 = 0;
    for (const m of mealDefs2) {
      if (m.isDefault) shares2[m.key] = baseShare2[m.key] ?? 0.3; else shares2[m.key] = customShare2 || 0.1;
      totalShare2 += shares2[m.key];
    }
    if (totalShare2 > 0) for (const k of Object.keys(shares2)) shares2[k] = shares2[k] / totalShare2;
    const perMealKcal2: Record<string, number> = {};
    for (const m of mealDefs2) perMealKcal2[m.key] = Math.round(recommendedNutrition.cal * (shares2[m.key] || 0.3));
    const mealsDistributionBlock2 = mealDefs2.map(m => `- ${m.name}: ${perMealKcal2[m.key]} kcal at ${m.time}`).join('\\n');
    const mealsExampleBlock2 = mealDefs2.map(m => `      \"${m.key}\": {\\n        \"name\": \"${m.name}\",\\n        \"time\": \"${m.time}\",\\n        \"totalCal\": ${perMealKcal2[m.key]},\\n        \"items\": [{\\n          \"name\": \"${m.name}\",\\n          \"cal\": ${perMealKcal2[m.key]},\\n          \"carb\": 45,\\n          \"fat\": 12,\\n          \"protein\": 25,\\n          \"img\": \"\",\\n          \"ingredient\": \"\",\\n          \"source\": \"ai\",\\n          \"isUserFood\": false\\n        }]\\n      }`).join(',\\n');

    const foodPlanPrompt = `You are a nutritionist creating a ${totalPlanDay}-day default for Thai food plan based on user's detailed preferences. Return ONLY a valid JSON object.

NUTRITIONAL TARGETS (per day):
- Calories: ${recommendedNutrition.cal} kcal
- Protein: ${recommendedNutrition.protein}g
- Carbohydrates: ${recommendedNutrition.carb}g  
- Fat: ${recommendedNutrition.fat}g

USER PROFILE:
- Age: ${age}, Weight: ${weight}kg → ${userProfile.target_weight}kg
- Goal: ${target_goal}, Activity: ${activity_level}
- Gender: ${gender}

USER PREFERENCES FROM PROMPT:
- ระยะเวลา: ${planDuration} วัน
- งบประมาณ: ${budgetText}
- ความหลากหลาย: ${varietyText}
- ประเภทอาหารที่ชอบ: ${categoriesText}
- วัตถุดิบที่ชอบ: ${ingredientsText}
- ข้อจำกัดการกิน: ${restrictionsText}
- เป้าหมายสุขภาพ: ${goalsText}
- ความต้องการเพิ่มเติม: ${additionalRequirements || 'ไม่มี'}

EXISTING DIETARY RESTRICTIONS: ${userDietaryRestrictions?.join(', ') || 'ไม่มี'}

USER MEAL TIMES (use these times exactly if applicable):
${mealsText2 || `- มื้อเช้า: ${bfTime2}\n- มื้อกลางวัน: ${lnTime2}\n- มื้อเย็น: ${dnTime2}`}

MEAL DISTRIBUTION:
${mealDefs2.map(m => `- ${m.name}: ${perMealKcal2[m.key]} kcal at ${m.time}`).join('\\n')}

JSON FORMAT (return this structure exactly):
{
  "1": {
    "totalCal": ${recommendedNutrition.cal},
    "meals": {
${mealsExampleBlock2}
    }
  }
}

RULES:
1. Create ${totalPlanDay} days (keys "1" to "${totalPlanDay}")
2. Each meal must have ONE item only
3. All food names in Thai
4. Each day's totalCal = sum of meal totalCal
5. Each meal's totalCal = sum of item cal
6. Daily nutrition should match targets ±50 kcal
7. Consider user's budget, variety preference, ingredients, and restrictions
8. NO markdown formatting, NO explanations
9. Ensure JSON is complete and valid

Generate the complete JSON now:`;

    console.log('🎯 Food Plan Prompt Generated:');
    console.log('='.repeat(80));
    console.log(foodPlanPrompt);
    console.log('='.repeat(80));
    console.log(`📊 Nutritional Targets: ${recommendedNutrition.cal} kcal, P:${recommendedNutrition.protein}g, C:${recommendedNutrition.carb}g, F:${recommendedNutrition.fat}g`);
    console.log(`🎯 User Preferences Summary:`);
    console.log(`- Duration: ${planDuration} days`);
    console.log(`- Budget: ${budgetText}`);
    console.log(`- Variety: ${varietyText}`);
    console.log(`- Categories: ${categoriesText}`);
    console.log(`- Ingredients: ${ingredientsText}`);
    console.log(`- Restrictions: ${restrictionsText}`);
    console.log(`- Goals: ${goalsText}`);

    // ส่ง prompt ไป OpenAI
    console.log('🚀 Sending prompt to OpenAI...');
    const modelToUse = 'gpt-3.5-turbo';
    const response = await openai.chat.completions.create({
      model: modelToUse,
      messages: [
        {
          role: 'system',
          content: 'You are a professional Thai nutritionist who creates precise food plans based on user preferences. Always return valid JSON without any explanations or formatting.'
        },
        {
          role: 'user',
          content: foodPlanPrompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7
    });

    const content = response.choices[0].message.content;
    const cleaned = content?.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
    
    console.log('🤖 Raw AI Response Length:', content?.length);
    console.log('🧹 Cleaned Response Length:', cleaned?.length);
    
    if (cleaned && cleaned.length < 100) {
      console.warn('⚠️ AI response seems too short:', cleaned);
    }
    
    try {
      const parsedResult = JSON.parse(cleaned || '');
      
      // Validate the structure
      if (!parsedResult || typeof parsedResult !== 'object') {
        throw new Error('Response is not a valid object');
      }
      
      // Check if we have at least one day
      const dayKeys = Object.keys(parsedResult);
      if (dayKeys.length === 0) {
        throw new Error('No days found in the food plan');
      }
      
      // Validate first day structure
      const firstDay = parsedResult[dayKeys[0]];
      if (!firstDay.meals || !firstDay.totalCal) {
        throw new Error('Invalid day structure - missing meals or totalCal');
      }
      
      console.log('✅ AI Response parsed successfully with', dayKeys.length, 'days');
      console.log('🍽️ Sample meal from day 1:', firstDay.meals.breakfast?.name || 'N/A');
      
      return parsedResult;
    } catch (e) {
      console.error('❌ Failed to parse JSON from AI response:');
      console.error('Raw content length:', content?.length);
      console.error('Cleaned content length:', cleaned?.length);
      console.error('Last 200 chars of cleaned content:', cleaned?.slice(-200));
      console.error('Parse error:', e);
      
      throw new Error(`Invalid JSON returned from AI. Length: ${cleaned?.length}, Error: ${e}`);
    }

  } catch (err) {
    console.error('Error in getFoodPlanSuggestionsByPrompt:', err);
    
    // If AI fails, try to provide a fallback plan
    if (err instanceof Error && err.message.includes('Invalid JSON')) {
      console.warn('🔄 AI failed, creating fallback plan...');
      try {
        const fallbackPlan = createFallbackPlan(recommendedNutrition, totalPlanDay || 7);
        console.log('✅ Fallback plan created successfully');
        return fallbackPlan;
      } catch (fallbackErr) {
        console.error('❌ Fallback plan creation failed:', fallbackErr);
      }
    }
    
    if (axios.isAxiosError(err) && err.response) {
      console.error('Error calling OpenAI API:', err.response.data);
    } else if (err instanceof Error) {
      console.error('Error calling OpenAI API:', err.message);
    } else {
      console.error('An unknown error occurred:', err);
    }
    throw err;
  }
}


function createFallbackPlan(recommendedNutrition: any, totalPlanDay: number, times?: { breakfast: string; lunch: string; dinner: string }) {
  const fallbackPlan: any = {};
  const bfTime = times?.breakfast || '07:00';
  const lnTime = times?.lunch || '12:00';
  const dnTime = times?.dinner || '18:00';
  
  for (let day = 1; day <= totalPlanDay; day++) {
    const breakfastCal = Math.round(recommendedNutrition.cal * 0.3);
    const lunchCal = Math.round(recommendedNutrition.cal * 0.4);
    const dinnerCal = Math.round(recommendedNutrition.cal * 0.3);
    
    fallbackPlan[day.toString()] = {
      totalCal: recommendedNutrition.cal,
      meals: {
        breakfast: {
          name: "ข้าวต้มไข่ไก่",
          time: bfTime,
          totalCal: breakfastCal,
          items: [{
            name: "ข้าวต้มไข่ไก่",
            cal: breakfastCal,
            carb: Math.round(recommendedNutrition.carb * 0.3),
            fat: Math.round(recommendedNutrition.fat * 0.3),
            protein: Math.round(recommendedNutrition.protein * 0.3),
            img: "",
            ingredient: "",
            source: "ai",
            isUserFood: false
          }]
        },
        lunch: {
          name: "ผัดกะเพราหมูสับ",
          time: lnTime,
          totalCal: lunchCal,
          items: [{
            name: "ผัดกะเพราหมูสับ",
            cal: lunchCal,
            carb: Math.round(recommendedNutrition.carb * 0.4),
            fat: Math.round(recommendedNutrition.fat * 0.4),
            protein: Math.round(recommendedNutrition.protein * 0.4),
            img: "",
            ingredient: "",
            source: "ai",
            isUserFood: false
          }]
        },
        dinner: {
          name: "ต้มยำกุ้ง",
          time: dnTime,
          totalCal: dinnerCal,
          items: [{
            name: "ต้มยำกุ้ง",
            cal: dinnerCal,
            carb: Math.round(recommendedNutrition.carb * 0.3),
            fat: Math.round(recommendedNutrition.fat * 0.3),
            protein: Math.round(recommendedNutrition.protein * 0.3),
            img: "",
            ingredient: "",
            source: "ai",
            isUserFood: false
          }]
        }
      }
    };
  }
  
  return fallbackPlan;
}
