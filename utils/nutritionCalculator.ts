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
  'increase': 1.8,    // เพิ่มน้ำหนัก/สร้างกล้ามเนื้อ - ต้องการโปรตีนสูง
  'decrease': 2.0,    // ลดน้ำหนัก - ต้องการโปรตีนสูงเพื่อรักษากล้ามเนื้อ
  'healthy': 1.4      // รักษาสุขภาพ - ปริมาณมาตรฐาน
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

// ระยะเวลาแผนมาตรฐาน 1 เดือน และค่าคงที่ที่ใช้ในการคำนวณแบบไม่สุดโต่ง
const PLAN_DURATION_DAYS = 30; // 1 เดือน
const CALORIES_PER_KG_WEIGHT = 7700; // 1 kg ≈ 7700 kcal

// ขอบเขตแบบ "กลางๆ" สำหรับส่วนเกิน/ขาดแคลอรี่ต่อวัน (kcal/day)
// - decrease: เน้นลดแบบยั่งยืน 300–600 kcal/วัน (กลางๆ = 500)
// - increase: เพิ่มแบบยั่งยืน 250–500 kcal/วัน (กลางๆ = 350)
const DAILY_ADJUSTMENT_BOUNDS = {
  increase: { min: 250, max: 500, fallback: 350 },
  decrease: { min: 300, max: 600, fallback: 500 }
} as const;

function clampModerate(raw: number, goal: 'increase' | 'decrease') {
  const b = DAILY_ADJUSTMENT_BOUNDS[goal];
  if (!isFinite(raw) || raw <= 0) return b.fallback; // ถ้าไม่มีเป้าหมายที่ชัดเจน ให้ใช้ค่า "กลางๆ"
  return Math.min(Math.max(raw, b.min), b.max);
}

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
 * คำนวณแคลอรี่เป้าหมายตามเป้าหมายของผู้ใช้ (ไม่ผูกกับจำนวนวัน)
 * ใช้การปรับแบบ "กลางๆ" ต่อวัน เพื่อความยั่งยืนและไม่เหวี่ยงค่าแคลอรี่
 */
export function calculateTargetCalories(
  tdee: number,
  currentWeight: number,
  targetWeight: number,
  goal: string
): number {
  let targetCalories = tdee;
  if (goal === 'healthy') {
    // รักษาน้ำหนัก = TDEE
    targetCalories = tdee;
  } else {
    if (goal === 'increase') {
    // เพิ่มน้ำหนักแบบกลางๆ โดยไม่อิงจำนวนวัน
    const surplus = DAILY_ADJUSTMENT_BOUNDS.increase.fallback; // ค่ากลาง ~350 kcal
    targetCalories = tdee + surplus;
    } else if (goal === 'decrease') {
    // ลดน้ำหนักแบบกลางๆ โดยไม่อิงจำนวนวัน
    const deficit = DAILY_ADJUSTMENT_BOUNDS.decrease.fallback; // ค่ากลาง ~500 kcal
    targetCalories = tdee - deficit;
      // ป้องกันไม่ให้แคลอรี่ต่ำเกินไป (ขั้นต่ำ 1200 kcal)
      targetCalories = Math.max(targetCalories, 1200);
    }
  }
  
  return Math.round(targetCalories);
}


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
  
  const bmr = calculateBMR(weight, height, age, userProfile.gender);
  const tdee = calculateTDEE(bmr, userProfile.activity_level);
  const targetCalories = calculateTargetCalories(tdee, weight, targetWeight, userProfile.target_goal);
  const macros = calculateMacronutrients(targetCalories, userProfile.target_goal, targetWeight);
  
  const goal = userProfile.target_goal;
  const defaultAdjustment = goal === 'increase'
    ? DAILY_ADJUSTMENT_BOUNDS.increase.fallback
    : goal === 'decrease'
    ? DAILY_ADJUSTMENT_BOUNDS.decrease.fallback
    : 0;

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
        approach: 'moderate-default-per-day (duration-independent)',
        defaultAdjustment,
        bounds: DAILY_ADJUSTMENT_BOUNDS,
        result: targetCalories
      },
      macronutrients: macros
    }
  };
}
