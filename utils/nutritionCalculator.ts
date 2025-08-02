// Nutrition Calculator Utility
// คำนวณค่าโภชนาการที่แนะนำตามข้อมูลผู้ใช้

export interface UserProfileData {
  age: string;
  weight: string;
  height: string;
  gender: 'male' | 'female' | 'other';
  body_fat: 'low' | 'normal' | 'high' | 'don\'t know';
  target_goal: 'decrease' | 'increase' | 'healthy';
  target_weight: string;
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
  'increase': 2.0,    // เพิ่มน้ำหนัก/สร้างกล้ามเนื้อ - ต้องการโปรตีนสูง
  'decrease': 2.2,    // ลดน้ำหนัก - ต้องการโปรตีนสูงเพื่อรักษากล้ามเนื้อ
  'healthy': 1.6      // รักษาสุขภาพ - ปริมาณมาตรฐาน
};

// สัดส่วนสำหรับ "พลังงานที่เหลือ" หลังหักโปรตีนแล้ว (คาร์บ : ไขมัน)
const REMAINING_ENERGY_RATIOS = {
  'increase': { carb: 0.65, fat: 0.35 },  // เน้นคาร์บสำหรับพลังงานในการสร้างกล้ามเนื้อ
  'decrease': { carb: 0.50, fat: 0.50 },  // สมดุลเพื่อการเผาผลาญไขมัน
  'healthy': { carb: 0.60, fat: 0.40 }    // เน้นคาร์บเล็กน้อยเพื่อสุขภาพทั่วไป
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
    // สูตรสำหรับผู้ชาย: BMR = (10 * น้ำหนัก kg) + (6.25 * ส่วนสูง cm) - (5 * อายุ) + 5
    bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    // สูตรสำหรับผู้หญิง: BMR = (10 * น้ำหนัก kg) + (6.25 * ส่วนสูง cm) - (5 * อายุ) - 161
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
 * ใช้ระยะเวลา 1 เดือน (30 วัน) เป็นมาตรฐาน
 */
export function calculateTargetCalories(
  tdee: number,
  currentWeight: number,
  targetWeight: number,
  goal: string
): number {
  let targetCalories = tdee;
  const PLAN_DURATION_DAYS = 30; // คาดหวัง 1 เดือน
  
  if (goal === 'healthy') {
    // รักษาน้ำหนัก = TDEE
    targetCalories = tdee;
  } else {
    // คำนวณน้ำหนักที่ต้องเปลี่ยน
    const weightDifference = Math.abs(targetWeight - currentWeight);
    
    // การเปลี่ยนแปลงน้ำหนัก 1 kg ≈ 7700 kcal
    const totalCaloriesDifference = weightDifference * 7700;
    
    // แคลอรี่ส่วนเกิน/ขาดแคลนต่อวัน (ใน 1 เดือน)
    const dailyCaloriesDifference = totalCaloriesDifference / PLAN_DURATION_DAYS;
    
    if (goal === 'increase') {
      // เพิ่มน้ำหนัก = TDEE + แคลอรี่ส่วนเกิน
      targetCalories = tdee + dailyCaloriesDifference;
    } else if (goal === 'decrease') {
      // ลดน้ำหนัก = TDEE - แคลอรี่ขาดแคลน
      targetCalories = tdee - dailyCaloriesDifference;
      // ป้องกันไม่ให้แคลอรี่ต่ำเกินไป (ขั้นต่ำ 1200 kcal)
      targetCalories = Math.max(targetCalories, 1200);
    }
  }
  
  return Math.round(targetCalories);
}

/**
 * คำนวณสัดส่วนสารอาหารหลัก (Macronutrients) ด้วยวิธี Hybrid Method
 * 
 * วิธีการใหม่:
 * 1. คำนวณโปรตีนก่อน: ใช้หลักการ "อิงตามน้ำหนักตัว" 
 * 2. คำนวณพลังงานจากโปรตีน: แปลงโปรตีนจากกรัมเป็นแคลอรี่
 * 3. หาพลังงานที่เหลือ: แคลอรี่เป้าหมาย - แคลอรี่โปรตีน
 * 4. แบ่งพลังงานที่เหลือ: แบ่งให้คาร์บและไขมันตามสัดส่วนที่เหมาะสม
 */
export function calculateMacronutrients(targetCalories: number, goal: string, targetWeight: number) {
  // ขั้นตอนที่ 1: คำนวณโปรตีนตามน้ำหนักตัว
  const proteinPerKg = PROTEIN_PER_KG[goal as keyof typeof PROTEIN_PER_KG] || PROTEIN_PER_KG.healthy;
  const proteinGrams = Math.round(targetWeight * proteinPerKg);
  
  // ขั้นตอนที่ 2: คำนวณแคลอรี่จากโปรตีน
  const proteinCalories = proteinGrams * CALORIES_PER_GRAM.protein;
  
  // ขั้นตอนที่ 3: หาแคลอรี่ที่เหลือสำหรับคาร์บและไขมัน
  const remainingCalories = targetCalories - proteinCalories;
  
  // ขั้นตอนที่ 4: แบ่งแคลอรี่ที่เหลือตามสัดส่วน
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
  // แปลงข้อมูลเป็นตัวเลข
  const age = parseInt(userProfile.age);
  const weight = parseFloat(userProfile.weight);
  const height = parseFloat(userProfile.height);
  const targetWeight = parseFloat(userProfile.target_weight);
  
  // ขั้นตอนที่ 1: คำนวณ BMR
  const bmr = calculateBMR(weight, height, age, userProfile.gender);
  
  // ขั้นตอนที่ 2: คำนวณ TDEE
  const tdee = calculateTDEE(bmr, userProfile.activity_level);
  
  // ขั้นตอนที่ 3: คำนวณแคลอรี่เป้าหมาย (ใช้ระยะเวลา 1 เดือน)
  const targetCalories = calculateTargetCalories(
    tdee,
    weight,
    targetWeight,
    userProfile.target_goal
  );
  
  // ขั้นตอนที่ 4: คำนวณสัดส่วนสารอาหาร (ใช้ Hybrid Method)
  const macros = calculateMacronutrients(targetCalories, userProfile.target_goal, targetWeight);
  
  return {
    cal: targetCalories,
    carb: macros.carb,
    protein: macros.protein,
    fat: macros.fat,
    bmr,
    tdee
  };
}

// Mockup Data สำหรับทดสอบ (ใช้ตัวอย่างเดิม: เพิ่มน้ำหนัก 52->54 kg)
export const MOCKUP_USER_PROFILE: UserProfileData = {
  age: "22",
  weight: "52",
  height: "170",
  gender: "male",
  body_fat: "normal",
  target_goal: "increase",  // เปลี่ยนเป็น increase เพื่อทดสอบตามตัวอย่าง
  target_weight: "54",
  activity_level: "moderate"
};

// ตัวอย่างการใช้งาน
export function getMockupRecommendedNutrition(): RecommendedNutrition {
  return calculateRecommendedNutrition(MOCKUP_USER_PROFILE);
}

// ฟังก์ชันสำหรับแสดงรายละเอียดการคำนวณ (สำหรับ Debug)
export function getCalculationDetails(userProfile: UserProfileData) {
  const age = parseInt(userProfile.age);
  const weight = parseFloat(userProfile.weight);
  const height = parseFloat(userProfile.height);
  const targetWeight = parseFloat(userProfile.target_weight);
  const PLAN_DURATION_DAYS = 30; // คาดหวัง 1 เดือน
  
  const bmr = calculateBMR(weight, height, age, userProfile.gender);
  const tdee = calculateTDEE(bmr, userProfile.activity_level);
  const targetCalories = calculateTargetCalories(tdee, weight, targetWeight, userProfile.target_goal);
  const macros = calculateMacronutrients(targetCalories, userProfile.target_goal, targetWeight);
  
  return {
    userProfile,
    calculations: {
      bmr: {
        formula: userProfile.gender === 'male' 
          ? `(10 * ${weight}) + (6.25 * ${height}) - (5 * ${age}) + 5`
          : `(10 * ${weight}) + (6.25 * ${height}) - (5 * ${age}) - 161`,
        result: bmr
      },
      tdee: {
        formula: `${bmr} * ${ACTIVITY_MULTIPLIERS[userProfile.activity_level as keyof typeof ACTIVITY_MULTIPLIERS]}`,
        result: tdee
      },
      targetCalories: {
        weightDifference: Math.abs(targetWeight - weight),
        totalCaloriesDifference: Math.abs(targetWeight - weight) * 7700,
        dailyCaloriesDifference: (Math.abs(targetWeight - weight) * 7700) / PLAN_DURATION_DAYS,
        planDuration: PLAN_DURATION_DAYS,
        result: targetCalories
      },
      macronutrients: macros
    }
  };
}
