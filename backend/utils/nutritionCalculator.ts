// Backend Nutrition Calculator
// คำนวณค่าโภชนาการที่แนะนำตามข้อมูลผู้ใช้ (สำหรับ Backend)

export interface UserProfileData {
  age: number;
  weight: number;
  height: number;
  gender: 'male' | 'female' | 'other';
  body_fat?: 'low' | 'normal' | 'high' | 'unknown';
  target_goal: 'decrease' | 'increase' | 'healthy';
  target_weight: number;
  activity_level: 'low' | 'moderate' | 'high' | 'very high';
}

export interface RecommendedNutrition {
  cal: number;
  carb: number;
  protein: number;
  fat: number;
  bmr: number;
  tdee: number;
}

// Activity Level Multipliers
const ACTIVITY_MULTIPLIERS = {
  'low': 1.2,          // ไม่ออกกำลังกาย
  'moderate': 1.55,    // ออกกำลังกาย ระดับปานกลาง
  'high': 1.725,       // ออกกำลังกายเป็นหลัก
  'very high': 1.9     // ใช้ร่างกายอย่างหนัก
};

// Protein Requirements by Goal (กรัม/กิโลกรัมน้ำหนักตัว)
const PROTEIN_PER_KG = {
  'increase': 1.8,    // เพิ่มน้ำหนัก/สร้างกล้ามเนื้อ
  'decrease': 2.0,    // ลดน้ำหนัก - รักษากล้ามเนื้อ
  'healthy': 1.4      // รักษาสุขภาพ
};

// สัดส่วนพลังงานที่เหลือ (คาร์บ : ไขมัน)
const REMAINING_ENERGY_RATIOS = {
  'increase': { carb: 0.65, fat: 0.35 },  // เน้นคาร์บ
  'decrease': { carb: 0.50, fat: 0.50 },  // สมดุล
  'healthy': { carb: 0.60, fat: 0.40 }    // เน้นคาร์บเล็กน้อย
};

// Calories per gram
const CALORIES_PER_GRAM = {
  carb: 4,
  protein: 4,
  fat: 9
};

/**
 * คำนวณ BMR (Basal Metabolic Rate) ด้วยสูตร Mifflin-St Jeor
 */
export function calculateBMR(weight: number, height: number, age: number, gender: string): number {
  let bmr: number;
  
  if (gender === 'male') {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
  
  return Math.round(bmr);
}

/**
 * คำนวณ TDEE (Total Daily Energy Expenditure)
 */
export function calculateTDEE(bmr: number, activityLevel: string): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel as keyof typeof ACTIVITY_MULTIPLIERS] || 1.55;
  return Math.round(bmr * multiplier);
}

/**
 * คำนวณแคลอรี่เป้าหมายตามเป้าหมายของผู้ใช้
 */
export function calculateTargetCalories(
  tdee: number,
  currentWeight: number,
  targetWeight: number,
  goal: string
): number {
  let targetCalories = tdee;
  const PLAN_DURATION_DAYS = 30; // 1 เดือน
  
  if (goal === 'healthy') {
    targetCalories = tdee;
  } else {
    const weightDifference = Math.abs(targetWeight - currentWeight);
    const totalCaloriesDifference = weightDifference * 7700; // 1 kg = 7700 kcal
    const dailyCaloriesDifference = totalCaloriesDifference / PLAN_DURATION_DAYS;
    
    if (goal === 'increase') {
      targetCalories = tdee + dailyCaloriesDifference;
    } else if (goal === 'decrease') {
      targetCalories = tdee - dailyCaloriesDifference;
      targetCalories = Math.max(targetCalories, 1200); // ขั้นต่ำ 1200 kcal
    }
  }
  
  return Math.round(targetCalories);
}

/**
 * คำนวณ Macronutrients
 */
export function calculateMacronutrients(targetCalories: number, goal: string, targetWeight: number) {
  const proteinPerKg = PROTEIN_PER_KG[goal as keyof typeof PROTEIN_PER_KG] || PROTEIN_PER_KG.healthy;
  const proteinGrams = Math.round(targetWeight * proteinPerKg);
  const proteinCalories = proteinGrams * CALORIES_PER_GRAM.protein;
  
  const remainingCalories = targetCalories - proteinCalories;
  const ratios = REMAINING_ENERGY_RATIOS[goal as keyof typeof REMAINING_ENERGY_RATIOS] || REMAINING_ENERGY_RATIOS.healthy;
  
  const carbCalories = remainingCalories * ratios.carb;
  const fatCalories = remainingCalories * ratios.fat;
  
  return {
    protein: proteinGrams,
    carb: Math.round(carbCalories / CALORIES_PER_GRAM.carb),
    fat: Math.round(fatCalories / CALORIES_PER_GRAM.fat)
  };
}

/**
 * ฟังก์ชันหลักสำหรับคำนวณโภชนาการที่แนะนำ
 */
export function calculateRecommendedNutrition(userProfile: UserProfileData): RecommendedNutrition {
  const { age, weight, height, gender, target_goal, target_weight, activity_level } = userProfile;
  
  // คำนวณ BMR
  const bmr = calculateBMR(weight, height, age, gender);
  
  // คำนวณ TDEE
  const tdee = calculateTDEE(bmr, activity_level);
  
  // คำนวณแคลอรี่เป้าหมาย
  const targetCalories = calculateTargetCalories(tdee, weight, target_weight, target_goal);
  
  // คำนวณสัดส่วนสารอาหาร
  const macros = calculateMacronutrients(targetCalories, target_goal, target_weight);
  
  return {
    cal: targetCalories,
    carb: macros.carb,
    protein: macros.protein,
    fat: macros.fat,
    bmr,
    tdee
  };
}

/**
 * ฟังก์ชันสำหรับแสดงรายละเอียดการคำนวณ
 */
export function getCalculationSummary(userProfile: UserProfileData): string {
  const nutrition = calculateRecommendedNutrition(userProfile);
  
  return `
Nutritional Requirements Summary:
- Daily Calories: ${nutrition.cal} kcal
- Protein: ${nutrition.protein} g (${(nutrition.protein * 4)} kcal)
- Carbohydrates: ${nutrition.carb} g (${(nutrition.carb * 4)} kcal)
- Fat: ${nutrition.fat} g (${(nutrition.fat * 9)} kcal)
- BMR: ${nutrition.bmr} kcal
- TDEE: ${nutrition.tdee} kcal
- Goal: ${userProfile.target_goal} (${userProfile.weight} kg → ${userProfile.target_weight} kg)
`;
}
