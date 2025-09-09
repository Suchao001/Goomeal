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

const ACTIVITY_MULTIPLIERS = {
  'low': 1.2,
  'moderate': 1.55,
  'high': 1.725,
  'very high': 1.9
} as const;

/** โปรตีนแบบ simple (เวอร์ชัน practical สำหรับคนไทยทั่วไป) */
const PROTEIN_PER_KG_SIMPLE = {
  'increase': 1.4,
  'decrease': 1.6,
  'healthy': 1.0
} as const;

/** โปรตีนแบบ dynamic (ตาม goal + activity level) */
const PROTEIN_DYNAMIC: Record<
  UserProfileData['target_goal'],
  Record<UserProfileData['activity_level'], number>
> = {
  healthy: {
    'low': 1.0,
    'moderate': 1.2,
    'high': 1.4,
    'very high': 1.6,
  },
  increase: {
    'low': 1.4,
    'moderate': 1.6,
    'high': 1.8,
    'very high': 2.0,
  },
  decrease: {
    'low': 1.4,
    'moderate': 1.6,
    'high': 1.8,
    'very high': 2.0,
  },
};

const REMAINING_ENERGY_RATIOS = {
  'increase': { carb: 0.55, fat: 0.45 },
  'decrease': { carb: 0.45, fat: 0.55 },
  'healthy': { carb: 0.55, fat: 0.45 }
} as const;

const CALORIES_PER_GRAM = {
  carb: 4,
  protein: 4,
  fat: 9
} as const;

const PLAN_DURATION_DAYS = 30;
const CALORIES_PER_KG_WEIGHT = 7700;

const DAILY_ADJUSTMENT_BOUNDS = {
  increase: { min: 150, max: 300, fallback: 200 },  
  decrease: { min: 200, max: 400, fallback: 300 }   
} as const;


function clamp(x: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, x));
}

function clampModerate(raw: number, goal: 'increase' | 'decrease') {
  const b = DAILY_ADJUSTMENT_BOUNDS[goal];
  if (!isFinite(raw) || raw <= 0) return b.fallback;
  return Math.min(Math.max(raw, b.min), b.max);
}

/** เลือกกลยุทธ์โปรตีน: 'dynamic' แนะนำเป็นค่า default */
export type ProteinStrategy = 'dynamic' | 'simple';

/** คำนวณ g โปรตีน/กก. ตาม strategy */
export function getProteinPerKg(
  profile: UserProfileData,
  strategy: ProteinStrategy = 'dynamic'
): number {
  let perKg: number;
  if (strategy === 'dynamic') {
    perKg = PROTEIN_DYNAMIC[profile.target_goal][profile.activity_level];
  } else {
    perKg = PROTEIN_PER_KG_SIMPLE[profile.target_goal];
  }
  // กันค่าแปลก ๆ: ต่ำสุด 1.0 และไม่เกิน 2.2 (ทั่วไป)
  return clamp(perKg, 1.0, 2.2);
}

/** คำนวณ BMR (Mifflin-St Jeor) */
export function calculateBMR(weight: number, height: number, age: number, gender: string): number {
  let bmr: number;
  if (gender === 'male') {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
  return Math.round(bmr);
}

/** คำนวณ TDEE */
export function calculateTDEE(bmr: number, activityLevel: string): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel as keyof typeof ACTIVITY_MULTIPLIERS] || 1.55;
  return Math.round(bmr * multiplier);
}

/** คำนวณแคลอรี่เป้าหมายรายวัน (ไม่ผูกจำนวนวัน) */
export function calculateTargetCalories(
  tdee: number,
  currentWeight: number,
  targetWeight: number,
  goal: string
): number {
  let targetCalories = tdee;
  if (goal === 'healthy') {
    targetCalories = tdee;
  } else if (goal === 'increase') {
    const surplus = DAILY_ADJUSTMENT_BOUNDS.increase.fallback;
    targetCalories = tdee + surplus;
  } else if (goal === 'decrease') {
    const deficit = DAILY_ADJUSTMENT_BOUNDS.decrease.fallback;
    targetCalories = Math.max(tdee - deficit, 1200);
  }
  return Math.round(targetCalories);
}

/** คำนวณ Macro จาก targetCalories + โปรไฟล์ผู้ใช้ (รองรับเลือก strategy โปรตีน) */
export function calculateMacronutrients(
  targetCalories: number,
  userProfile: UserProfileData,
  strategy: ProteinStrategy = 'dynamic'
) {
  const targetWeight = parseFloat(userProfile.target_weight);
  const proteinPerKg = getProteinPerKg(userProfile, strategy);
  const proteinGrams = Math.round(targetWeight * proteinPerKg);

  const proteinCalories = proteinGrams * CALORIES_PER_GRAM.protein;
  const remainingCalories = Math.max(targetCalories - proteinCalories, 0);

  const ratios = REMAINING_ENERGY_RATIOS[userProfile.target_goal as keyof typeof REMAINING_ENERGY_RATIOS]
    || REMAINING_ENERGY_RATIOS.healthy;

  const carbCalories = remainingCalories * ratios.carb;
  const fatCalories = remainingCalories * ratios.fat;

  return {
    protein: proteinGrams,
    carb: Math.round(carbCalories / CALORIES_PER_GRAM.carb),
    fat: Math.round(fatCalories / CALORIES_PER_GRAM.fat)
  };
}

/** ฟังก์ชันหลัก */
export function calculateRecommendedNutrition(
  userProfile: UserProfileData,
  proteinStrategy: ProteinStrategy = 'dynamic'
): RecommendedNutrition {
  const age = parseInt(userProfile.age);
  const weight = parseFloat(userProfile.weight);
  const height = parseFloat(userProfile.height);
  const targetWeight = parseFloat(userProfile.target_weight);

  const bmr = calculateBMR(weight, height, age, userProfile.gender);
  const tdee = calculateTDEE(bmr, userProfile.activity_level);
  const targetCalories = calculateTargetCalories(
    tdee,
    weight,
    targetWeight,
    userProfile.target_goal
  );

  const macros = calculateMacronutrients(targetCalories, userProfile, proteinStrategy);

  return {
    cal: targetCalories,
    carb: macros.carb,
    protein: macros.protein,
    fat: macros.fat,
    bmr,
    tdee
  };
}

/** Mock data */
export const MOCKUP_USER_PROFILE: UserProfileData = {
  age: "22",
  weight: "52",
  height: "170",
  gender: "male",
  body_fat: "normal",
  target_goal: "increase",
  target_weight: "54",
  activity_level: "moderate"
};

export function getMockupRecommendedNutrition(): RecommendedNutrition {
  return calculateRecommendedNutrition(MOCKUP_USER_PROFILE); // default: dynamic
}

/** ออกรายละเอียดการคำนวณ (ระบุ strategy ได้) */
export function getCalculationDetails(userProfile: UserProfileData, proteinStrategy: ProteinStrategy = 'dynamic') {
  const age = parseInt(userProfile.age);
  const weight = parseFloat(userProfile.weight);
  const height = parseFloat(userProfile.height);
  const targetWeight = parseFloat(userProfile.target_weight);

  const bmr = calculateBMR(weight, height, age, userProfile.gender);
  const tdee = calculateTDEE(bmr, userProfile.activity_level);
  const targetCalories = calculateTargetCalories(tdee, weight, targetWeight, userProfile.target_goal);
  const proteinPerKg = getProteinPerKg(userProfile, proteinStrategy);
  const macros = calculateMacronutrients(targetCalories, userProfile, proteinStrategy);

  const defaultAdjustment =
    userProfile.target_goal === 'increase'
      ? DAILY_ADJUSTMENT_BOUNDS.increase.fallback
      : userProfile.target_goal === 'decrease'
      ? DAILY_ADJUSTMENT_BOUNDS.decrease.fallback
      : 0;

  return {
    userProfile,
    proteinStrategy,
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
      proteinPerKg,
      macronutrients: macros
    }
  };
}
