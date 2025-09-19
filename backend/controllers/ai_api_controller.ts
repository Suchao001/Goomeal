import axios from 'axios';
import OpenAI from 'openai';
import db from '../db_config';
import { calculateRecommendedNutrition, getCalculationSummary, UserProfileData } from '../utils/nutritionCalculator';
import {yearOfBirthToAge } from '../utils/ageCal';

const url = process.env.AI_API || 'http://localhost:11434';
const suggestPlanModel = "gpt-5";
const suggestFoodModel = "gpt-5-mini";

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
        // ใช้ชื่อจริงแทน key สำหรับ custom meals
        const key = name.replace(/\s+/g, '_').toLowerCase(); // ใช้ชื่อเป็น key แต่ปรับรูปแบบ
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

    const foodSuggestionPrompt = `คุณคือ AI ผู้ช่วยที่สร้างเมนูอาหารไทยแนะนำโดยอัตโนมัติ
            คำตอบของคุณต้องเป็น JSON object ที่ถูกต้องเพียงหนึ่งเดียวเท่านั้น
            ห้ามส่งกลับเป็น JSON array
            JSON object ต้องมีเฉพาะคีย์ดังต่อไปนี้: "name", "cal", "carbs", "protein", "fat", "ingredients", "serving"

            ตัวอย่างรูปแบบที่ต้องการ:
            {
              "name": "ต้มยำกุ้ง",
              "cal": 200,
              "carbs": 10,
              "protein": 30,
              "fat": 5,
              "img": "/assets/images/menuplaceholder.png",
              "ingredients": ["กุ้ง", "ตะไคร้", "ใบมะกรูด", "พริกขี้หนู", "น้ำมะนาว"],
              "serving": "1 ถ้วย (250 กรัม)"
            }

            img fixed to /assets/images/menuplaceholder.png

            ตอนนี้ให้สร้างเมนูอาหารแนะนำเพียง 1 เมนู โดยอ้างอิงจากความต้องการของผู้ใช้ดังนี้:
            - ประเภทมื้ออาหาร: ${mealType}
            - ระดับความหิว: ${hungerLevel}
            - วัตถุดิบที่มี: ${ingredients}
            - ประเภทอาหาร: ${foodType}
            - งบประมาณ: ${budget}
            - ข้อจำกัดด้านอาหาร: ${dietary_restrictions || 'ไม่มี'}
            - ระดับความซับซ้อน: ${complexityLevel}
            `;

      const response = await openai.chat.completions.create({
      model: suggestFoodModel,
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


export async function getFoodPlanSuggestions(userId: number, payload?: any) {}

export async function getFoodPlanSuggestionsByPrompt(userId: number, payload?: any) {
  let recommendedNutrition: any;
  let totalPlanDay: number = 7; 
  
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

    // Convert string values to numbers
    const weightNum = typeof weight === 'string' ? parseFloat(weight) : weight;
    const heightNum = typeof height === 'string' ? parseFloat(height) : height;
    const targetWeightNum = typeof target_weight === 'string' ? parseFloat(target_weight) : target_weight;
    const ageNum = typeof age === 'string' ? parseInt(age) : age;

    // สร้าง user profile สำหรับการคำนวณ
    const userProfile: UserProfileData = {
      age: ageNum,
      weight: weightNum,
      height: heightNum,
      gender,
      body_fat,
      target_goal,
      target_weight: targetWeightNum, // ใช้ target_weight จาก database โดยตรง
      activity_level
    };

    
    console.log('🔍 [DEBUG] User Profile Data:', {
      age: ageNum,
      weight: weightNum,
      height: heightNum,
      gender,
      body_fat,
      target_goal,
      target_weight: targetWeightNum,
      activity_level,
      original_target_weight: target_weight,
      final_target_weight: userProfile.target_weight
    });

    // คำนวณโภชนาการที่แนะนำ
    recommendedNutrition = calculateRecommendedNutrition(userProfile);
  
    console.log('🔍 [DEBUG] Recommended Nutrition Result:', recommendedNutrition);
    
    // แปลงข้อมูลจาก prompt
    const budgetText = selectedBudget === 'low' ? 'งบประมาณประหยัด 50-150 บาท/มื้อ' :
                      selectedBudget === 'medium' ? 'งบประมาณปานกลาง 150-300 บาท/มื้อ' :
                      selectedBudget === 'high' ? 'งบประมาณหรูหรา 300+ บาท/มื้อ' :
                      selectedBudget === 'flexible' ? 'งบประมาณยืดหยุ่น ปรับตามสถานการณ์' : 'ไม่ระบุ';

    const varietyText = varietyLevel === 'low' ? 'หลากหลายน้อย - เน้นเมนูเดิมๆ ไม่หลากหลายมาก' :
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
    const mealsExampleBlock2 = mealDefs2.map(m => `      \"${m.key}\": {\\n        \"name\": \"${m.name}\",\\n        \"time\": \"${m.time}\",\\n        \"totalCal\": ${perMealKcal2[m.key]},\\n        \"items\": [{\\n          \"name\": \"ตัวอย่างอาหาร${m.name}\",\\n          \"cal\": ${perMealKcal2[m.key]},\\n          \"carb\": 45,\\n          \"fat\": 12,\\n          \"protein\": 25,\\n          \"img\": \"assets/images/menuplaceholder.png\",\\n          \"serving\": \",\\n          \"source\": \"ai\",\\n          \"isUserFood\": false\\n        }]\\n      }`).join(',\\n');

    const foodPlanPrompt = `คุณคือโภชนากรที่ต้องสร้างแผนอาหารสำหรับผู้ใช้ค่าเริ่มต้นเป็นอาหารไทย เป็นจำนวน ${totalPlanDay} วัน โดยต้องส่งกลับมาเป็น JSON ที่ถูกต้องเท่านั้น ห้ามมีคำอธิบายอื่น ๆ
                            เป้าหมายโภชนาการ (ต่อวัน):
                            - พลังงาน: ${recommendedNutrition.cal} กิโลแคลอรี
                            - โปรตีน: ${recommendedNutrition.protein} กรัม
                            - คาร์โบไฮเดรต: ${recommendedNutrition.carb} กรัม
                            - ไขมัน: ${recommendedNutrition.fat} กรัม
                            *** ให้ค่าพลังงาน ใกล้เคียงเป้าหมายมากที่สุด ให้ได้มากที่สุด ***
                            *** ให้ค่า โปรตีน คาร์บ ไขมัน ตามเป้าหมาย ±5 กรัม ***

                            ความต้องการจากผู้ใช้:
                            - ระยะเวลา: ${planDuration} วัน
                            - งบประมาณ: ${budgetText}
                            - ความหลากหลาย: ${varietyText}
                            - ประเภทอาหารที่ชอบ: ${categoriesText}
                            - วัตถุดิบที่ชอบ: ${ingredientsText}
                            - ข้อจำกัดการกิน: ${restrictionsText}
                            - เป้าหมายสุขภาพ: ${goalsText}
                            - ความต้องการเพิ่มเติม: ${additionalRequirements || 'ไม่มี'}
                            - รูปแบบการกิน: ${eating_type || 'ไม่ระบุ'}

                            ข้อจำกัดอาหารที่มีอยู่แล้ว: ${userDietaryRestrictions?.join(', ') || 'ไม่มี'}

                            เวลามื้ออาหาร (ใช้เวลานี้เท่านั้นถ้ามี):
                            ${mealsText2 || `- มื้อเช้า: ${bfTime2}\n- มื้อกลางวัน: ${lnTime2}\n- มื้อเย็น: ${dnTime2}`}

                            การกระจายพลังงาน:
                            ${mealDefs2.map(m => `- ${m.name}: ${perMealKcal2[m.key]} kcal เวลา ${m.time}`).join('\n')}

                            รูปแบบ JSON (ต้องส่งกลับตามนี้เท่านั้น):
                            {
                              "1": {
                                "totalCal": ${recommendedNutrition.cal},
                                "meals": {
                            ${mealsExampleBlock2}
                                }
                              }
                            }

                            กฎ:
                            1. สร้าง ${totalPlanDay} วัน (key "1" ถึง "${totalPlanDay}")
                            2. แต่ละมื้อต้องมีอาหารได้่ 1 อย่างเท่านั้น
                            3. ชื่ออาหารทุกชื่อเป็นภาษาไทย
                            4. คำนึงถึงงบประมาณ ความหลากหลาย วัตถุดิบ ข้อจำกัด และเป้าหมายของผู้ใช้
                            5. ห้ามมี markdown หรือคำอธิบายใด ๆ เพิ่มเติม
                            6. ต้องเป็น JSON ที่สมบูรณ์และถูกต้อง 100%
                            7. เวลาแต่ละมื้อให้ตรงตามเวลาที่ผู้ใช้กำหนด
                            8. serving ต้องระบุหน่วยและปริมาณเสมอ เช่น "1 ถ้วย (200 กรัม)" หรือ "150 กรัม"

                            กรุณาสร้าง JSON ให้ครบทั้งหมด:
                            `;    

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
  
    const response = await openai.chat.completions.create({
      model: suggestPlanModel,
      messages: [
        {
          role: 'system',
          content: 'You are a professional Thai nutritionist who creates precise food plans based on user preferences. Always return valid JSON without any explanations or formatting.'
        },
        {
          role: 'user',
          content: foodPlanPrompt
        }
      ]
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
