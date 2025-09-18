
export interface DailyNutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface RecommendedNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutrientAssessment {
  status: 'excellent' | 'good' | 'need_more' | 'insufficient' | 'excessive' | 'needs_adjustment';
  score: number;
  percentage: number;
}

export interface DailyAssessment {
  calories: NutrientAssessment;
  protein: NutrientAssessment;
  carbs: NutrientAssessment;
  fat: NutrientAssessment;
}

export interface DailyRecommendation {
  date: string;
  totalScore: number;
  grade: string;
  assessments: DailyAssessment;
  nutritionAdvice: string[];
  activityAdvice: string[];
  hydrationAdvice: string[];
  timingAdvice: string[];
  tomorrowTips: string[];
  summary: string;
}

export interface UserProfile {
  target_goal: 'decrease' | 'increase' | 'healthy';
  weight: number;
  age: number;
  activity_level: string;
}


export type UserGoal = 'decrease' | 'increase' | 'maintain' | string;

type NormalizedGoal = 'decrease' | 'increase' | 'maintain';

interface NutrientScoreContext {
  caloriePct?: number;
  weightKg?: number;
  goal?: UserGoal | UserProfile['target_goal'];
}

interface DailyPerformanceContext {
  goal?: UserGoal | UserProfile['target_goal'];
  weightKg?: number;
}

interface HuberScoreParams {
  delta: number;     // soft zone width (percent points)
  slope: number;     // penalty multiplier
  minScore: number;  // lower bound of returned score
  asymOver: number;  // penalty weight when actual > target
  asymUnder: number; // penalty weight when actual < target
  maxScore?: number; // optional upper bound (default 25)
}

export const AdviceTH = {
  calories: {
    low_mild: "แคลอรี่ยังต่ำเล็กน้อย ลองเพิ่ม `{nextMeal}` อีกนิด เช่นคาร์บเชิงซ้อนหรือโปรตีน 1 ส่วน",
    low_severe: "วันนี้แคลอรี่ขาดไปพอควร เติมมื้อเล็กๆ ที่ย่อยง่ายก่อนนอน เช่นนม/โยเกิร์ต/กล้วย 1 ผล",
    ok: "แคลอรี่รวมโอเคแล้ว รักษาจังหวะนี้ต่อไปได้เลย",
    high_mild: "แคลอรี่เกินเล็กน้อย ไม่ต้องรีบตัดมื้อ ลองลดซอสหวาน/น้ำมันในมื้อต่อไป",
    high_severe: "แคลอรี่เกินเยอะวันนี้ คุม portion ใน `{nextMeal}` และเพิ่มการเคลื่อนไหวเบาๆ 15–20 นาที"
  },
  protein: {
    low_mild: "โปรตีนยังไม่ถึงเป้า เติมไข่/เต้าหู้/ไก่ไร้มัน 1 ส่วนใน `{nextMeal}`",
    low_severe: "โปรตีนขาดค่อนข้างมากวันนี้ วางแผนเพิ่มโปรตีนทุกมื้อเล็กน้อยพรุ่งนี้",
    ok: "โปรตีนกำลังดี ร่างกายได้ซ่อมแซมกล้ามเนื้อครบ",
    high_mild_cal_ok: "โปรตีนเกินเล็กน้อยแต่ยังอยู่ในกรอบรวม ไม่ต้องลดทันที แค่บาลานซ์คาร์บ/ไขมันในมื้อต่อไป",
    high_mild_cal_high: "โปรตีนเกินเล็กน้อยและแคลอรี่สูง ลองลดน้ำมัน/ซอส แล้วคงโปรตีนไว้พอดี",
    high_cap: "โปรตีนเกินเพดานราว `{cap} g` ต่อวัน ลด portion โปรตีนเล็กน้อยและเพิ่มผัก/คาร์บเชิงซ้อนแทน"
  },
  carbs: {
    low_mild: "คาร์บยังน้อยไปบ้าง ถ้าเพิ่มข้าวหรือผลไม้เล็กน้อยจะช่วยให้อิ่มและมีแรงต่อเนื่อง",
    low_severe: "คาร์บขาดค่อนข้างเยอะ อาจทำให้หมดแรงช่วงบ่าย ลองเพิ่มข้าวหรือมันในมื้อถัดไป",
    ok: "คาร์บอยู่ในช่วงพอดี พลังงานน่าจะนิ่งทั้งวัน",
    high_mild: "คาร์บมากกว่าที่ตั้งใจนิดหน่อย ลดของหวาน น้ำหวาน หรือขนมจุบจิบก็ช่วยได้",
    high_severe: "คาร์บสูงเกินไปวันนี้ ถ้ามื้อต่อไปเน้นโปรตีนกับผักจะช่วยบาลานซ์ได้"
  },
  fat: {
    low: "ไขมันค่อนข้างน้อย ถ้ามีถั่วหรือน้ำมันดีติดครัว กินเพิ่มเล็กน้อยช่วยให้อิ่มนานขึ้น",
    ok: "ไขมันวันนี้กำลังดี ทำให้อิ่มและช่วยดูดซึมสารอาหาร",
    high_mild: "ไขมันเยอะกว่าที่ตั้งใจนิดหน่อย เลี่ยงของทอดหรือใช้น้ำมันน้อยลงในมื้อถัดไป",
    high_severe: "ไขมันสูงเกินไปวันนี้ ลดของทอดหรือซอสที่มัน ๆ จะช่วยให้สมดุลขึ้น"
  },
  hydration: {
    low_mild: "วันนี้น้ำน้อยไปหน่อย ลองจิบน้ำเพิ่มอีกสักแก้วสองแก้ว",
    low_severe: "ร่างกายขาดน้ำพอควร จิบน้ำทุกชั่วโมงแก้วเล็ก ๆ จะช่วยได้",
    ok: "ถ้าดื่มได้ครบตามเป้าหมาย รักษาจังหวะการจิบตลอดวันต่อไป"
  },
  timing: {
    late_heavy: "มื้อดึกค่อนข้างหนัก ถ้าเลื่อนไวกว่านี้สักชั่วโมง หรือทำเป็นมื้อเบา ร่างกายจะย่อยสบายขึ้น",
    long_gap: "ช่วงห่างระหว่างมื้อค่อนข้างยาว อาจทำให้หิวจัดตอนกิน ลองใส่มื้อว่างเล็ก ๆ กันไว้ก็ได้",
    ok: "จังหวะมื้ออาหารวันนี้ดี ร่างกายคาดเดาได้ง่าย"
  },
  activity: {
    baseline: "ถ้าได้ขยับตัวเบา ๆ เช่นเดินเร็วหรือยืดเหยียดสัก 15 นาที จะช่วยให้ร่างกายสดชื่นขึ้น",
    after_high_cal: "วันนี้ได้พลังงานเยอะ การเดินเพิ่มหรือทำกิจกรรมกลางแจ้งจะช่วยบาลานซ์ได้",
    build_muscle: "ถ้าอยากเสริมกล้าม ลองออกกำลังต้านทานเบา ๆ เช่นยกน้ำหนักหรือวิดพื้น"
  },
  tomorrow: [
    "เตรียมของว่างโปรตีนง่าย ๆ ติดตัว เช่น โยเกิร์ตหรือถั่ว จะช่วยกันหิวจัด",
    "เริ่มวันด้วยน้ำ 1 แก้วใหญ่ก่อนกาแฟ ทำให้ร่างกายสดชื่นขึ้น",
    "ลองสลับเป็นข้าวกล้องหรือมันเทศตอนกลางวัน จะช่วยให้อิ่มนานขึ้น",
    "จดแพลนกินคร่าว ๆ ก่อนนอน ลดการตัดสินใจระหว่างวัน"
  ],
  summary: {
    balanced: "วันนี้สมดุลดีมาก รักษาจังหวะนี้ต่อไป เติมผักผลไม้หลากสีเพิ่มได้ก็ยิ่งดี",
    needs_tweak: "มีบางอย่างแกว่งเล็กน้อย โฟกัสที่ {focus1} และ {focus2} ในมื้อต่อไปก็กลับเข้าที่ได้",
    reset: "ตัวเลขไม่เป๊ะก็ไม่เป็นไร ใช้มื้อต่อไปเป็นจุดรีเซ็ต กินเบา ๆ แต่ครบหมู่ก็พอ"
  }
} as const;

function applyTemplate(template: string, values: Record<string, string | number | undefined>): string {
  return Object.keys(values).reduce((acc, key) => {
    const token = `{${key}}`;
    if (acc.includes(token) && values[key] !== undefined) {
      return acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(values[key]));
    }
    return acc;
  }, template);
}

function getNextMealLabel(): string {
  const hour = new Date().getHours();
  if (hour < 10) return 'มื้อเช้า';
  if (hour < 14) return 'มื้อกลางวัน';
  if (hour < 18) return 'มื้อบ่าย/ว่าง';
  if (hour < 21) return 'มื้อเย็น';
  return 'มื้อถัดไป';
}

const focusLabels: Record<'cal' | 'pro' | 'carb' | 'fat', string> = {
  cal: 'พลังงานรวม',
  pro: 'โปรตีน',
  carb: 'คาร์บ',
  fat: 'ไขมัน'
};

function getFocusLabel(key: 'cal' | 'pro' | 'carb' | 'fat'): string {
  return focusLabels[key];
}

function normalizeGoal(goal?: UserGoal | UserProfile['target_goal']): NormalizedGoal {
  if (goal === 'decrease') return 'decrease';
  if (goal === 'increase') return 'increase';
  return 'maintain';
}

function huberScoreFromPct(pct: number, {
  delta,
  slope,
  minScore,
  asymOver,
  asymUnder,
  maxScore = 25,
}: HuberScoreParams): number {
  if (!isFinite(pct)) return minScore;

  const diff = pct - 100;
  const absDiff = Math.abs(diff);
  const safeDelta = Math.max(1, delta);
  const weight = diff >= 0 ? asymOver : asymUnder;

  const huber = absDiff <= safeDelta
    ? (absDiff * absDiff) / (2 * safeDelta)
    : absDiff - safeDelta / 2;

  const penalty = slope * weight * huber;
  const raw = maxScore - penalty;

  return Math.max(minScore, Math.min(maxScore, parseFloat(raw.toFixed(2))));
}

function proteinScore(
  actual: number,
  target: number,
  weightKg: number | undefined,
  caloriePct: number,
  goal: 'decrease' | 'increase' | 'maintain'
): number {
  if (!isFinite(target) || target <= 0) return 0;

  const cap = (weightKg && weightKg > 0)
    ? ((goal === 'increase' ? 2.2 : 2.0) * weightKg)
    : Number.POSITIVE_INFINITY;

  const pct = (actual / Math.max(target, 1)) * 100;

  
   let score = huberScoreFromPct(pct, {
    delta: 10,
    slope: 0.4,
    minScore: 12,
    asymOver: 0.5,
    asymUnder: goal === 'increase' ? 1.2 : 1.0,
  });


  const calOk = caloriePct >= 95 && caloriePct <= 105;
  if (pct >= 100 && pct <= 115 && calOk && actual <= cap) {
    score = Math.min(25, score + 1.5);
  }

  return +score.toFixed(2);
}


export function assessNutrient(
  actual: number,
  target: number,
  type: 'calories' | 'protein' | 'carbs' | 'fat',
  context: NutrientScoreContext = {}
): NutrientAssessment {
  if (target === 0) {
    return { status: 'needs_adjustment', score: 0, percentage: 0 };
  }

  const percentage = (actual / target) * 100;
  const off = Math.abs(percentage - 100);

  let score: number;
  if (type === 'protein') {
    const goal = normalizeGoal(context.goal);
    const caloriePct = context.caloriePct ?? 100;
    score = proteinScore(actual, target, context.weightKg, caloriePct, goal);
  } else {
    const scoreRaw = (() => {
      if (off <= 10) return 25 - 0.3 * off; 
      if (off <= 20) return 22 - 0.4 * (off - 10); 
      return Math.max(10, 18 - 0.5 * (off - 20)); 
    })();
    score = parseFloat(scoreRaw.toFixed(2));
  }

  switch (type) {
    case 'protein': {
      const goal = normalizeGoal(context.goal);
      const weightKg = context.weightKg;
      const caloriePct = context.caloriePct ?? 100;

      const cap = (weightKg && weightKg > 0)
        ? ((goal === 'increase' ? 2.2 : 2.0) * weightKg)
        : Number.POSITIVE_INFINITY;

      const calOk = caloriePct >= 95 && caloriePct <= 105;
      const mildOver = percentage <= 120 && actual <= cap; // ขยายจาก 115 → 120

      if (percentage >= 90 && percentage <= 110) return { status: 'excellent', score, percentage };
      if (percentage >= 80 && percentage < 90)   return { status: 'need_more', score, percentage };
      if (percentage < 80)                       return { status: 'insufficient', score, percentage };

      // เกินฝั่งโปรตีน
      if (mildOver && calOk) return { status: 'good', score, percentage };              // เกินนิด แคลอรีตรง → good
      if (mildOver)          return { status: 'needs_adjustment', score, percentage };  // เกินนิด แต่แคลอรีไม่นิ่ง → ปรับนิดหน่อย
      return { status: 'excessive', score, percentage };
    }
    case 'calories': {
      if (percentage >= 95 && percentage <= 105) return { status: 'excellent', score, percentage };
      if (percentage >= 85 && percentage <= 115) return { status: 'good', score, percentage };
      return { status: 'needs_adjustment', score, percentage };
    }
    case 'carbs': {
      if (percentage >= 80 && percentage <= 120) return { status: 'excellent', score, percentage };
      if (percentage >= 70 && percentage < 80) return { status: 'need_more', score, percentage };
      if (percentage < 70) return { status: 'insufficient', score, percentage };
      return { status: 'excessive', score, percentage };
    }
    case 'fat': {
      if (percentage >= 80 && percentage <= 120) return { status: 'excellent', score, percentage };
      if (percentage >= 60 && percentage < 80) return { status: 'need_more', score, percentage };
      if (percentage < 60) return { status: 'insufficient', score, percentage };
      return { status: 'excessive', score, percentage };
    }
    default:
      return { status: 'needs_adjustment', score, percentage };
  }
}

/**
 * ประเมินผลการบริโภคอาหารรายวัน
 */
export function assessDailyPerformance(
  actualIntake: DailyNutritionData,
  recommended: RecommendedNutrition,
  context: DailyPerformanceContext = {}
): DailyAssessment {
  const caloriePct = recommended.calories > 0
    ? (actualIntake.calories / Math.max(recommended.calories, 1)) * 100
    : 100;
  const goal = normalizeGoal(context.goal);

  return {
    calories: assessNutrient(actualIntake.calories, recommended.calories, 'calories'),
    protein: assessNutrient(actualIntake.protein, recommended.protein, 'protein', {
      caloriePct,
      weightKg: context.weightKg,
      goal,
    }),
    carbs: assessNutrient(actualIntake.carbs, recommended.carbs, 'carbs'),
    fat: assessNutrient(actualIntake.fat, recommended.fat, 'fat')
  };
}

/**
 * สร้างคำแนะนำด้านโภชนาการ
 */
export function generateNutritionAdvice(
  assessments: DailyAssessment,
  actual: DailyNutritionData,
  recommended: RecommendedNutrition,
  user: UserProfile
): string[] {
  const advice: string[] = [];
  const pct = {
    cal: assessments.calories.percentage || 0,
    pro: assessments.protein.percentage || 0,
    carb: assessments.carbs.percentage || 0,
    fat: assessments.fat.percentage || 0,
  };

  const nextMeal = getNextMealLabel();
  const maxItems = 4;

  const pushAdvice = (message: string | null | undefined) => {
    if (!message) return;
    if (advice.length >= maxItems) return;
    if (!advice.includes(message)) {
      advice.push(message);
    }
  };

  const calorieMessage = (() => {
    if (pct.cal < 85) return applyTemplate(AdviceTH.calories.low_severe, { nextMeal });
    if (pct.cal < 95) return applyTemplate(AdviceTH.calories.low_mild, { nextMeal });
    if (pct.cal <= 105) return AdviceTH.calories.ok;
    if (pct.cal <= 115) return applyTemplate(AdviceTH.calories.high_mild, { nextMeal });
    return applyTemplate(AdviceTH.calories.high_severe, { nextMeal });
  })();
  pushAdvice(calorieMessage);

  const goal = normalizeGoal(user.target_goal);
  const capPerKg = goal === 'increase' ? 2.2 : 2.0;
  const cap = user.weight > 0 ? Math.round(user.weight * capPerKg) : undefined;
  const actualProtein = actual.protein || 0;
  const calOk = pct.cal >= 95 && pct.cal <= 105;

  const proteinMessage = (() => {
    if (pct.pro < 80) return applyTemplate(AdviceTH.protein.low_severe, { nextMeal });
    if (pct.pro < 95) return applyTemplate(AdviceTH.protein.low_mild, { nextMeal });
    if (pct.pro <= 110) return AdviceTH.protein.ok;
    if (cap && actualProtein > cap) {
      return applyTemplate(AdviceTH.protein.high_cap, { cap });
    }
    if (pct.pro <= 120) {
      return calOk
        ? AdviceTH.protein.high_mild_cal_ok
        : AdviceTH.protein.high_mild_cal_high;
    }
    return applyTemplate(AdviceTH.protein.high_cap, { cap: cap ?? Math.round(actualProtein) });
  })();
  pushAdvice(proteinMessage);

  const carbMessage = (() => {
    if (pct.carb < 70) return AdviceTH.carbs.low_severe;
    if (pct.carb < 90) return AdviceTH.carbs.low_mild;
    if (pct.carb <= 120) return AdviceTH.carbs.ok;
    if (pct.carb <= 135) return AdviceTH.carbs.high_mild;
    return AdviceTH.carbs.high_severe;
  })();
  pushAdvice(carbMessage);

  const fatMessage = (() => {
    if (pct.fat < 70) return AdviceTH.fat.low;
    if (pct.fat <= 110) return AdviceTH.fat.ok;
    if (pct.fat <= 130) return AdviceTH.fat.high_mild;
    return AdviceTH.fat.high_severe;
  })();
  pushAdvice(fatMessage);

  return advice;
}

/**
 * สร้างคำแนะนำด้านกิจกรรม
 */
export function generateActivityAdvice(caloriePercent: number, userGoal: string): string[] {
  const advice: string[] = [AdviceTH.activity.baseline];
  if (caloriePercent > 110) {
    advice.push(AdviceTH.activity.after_high_cal);
  }
  if (normalizeGoal(userGoal as UserGoal) === 'increase') {
    advice.push(AdviceTH.activity.build_muscle);
  }
  return advice;
}

/**
 * สร้างคำแนะนำด้านน้ำ
 */
export function generateHydrationAdvice(weight: number): string[] {
  const minWaterMl = Math.round(weight * 35);
  const recommendedGlasses = Math.ceil(minWaterMl / 250); 
  
  return [
    AdviceTH.hydration.low_mild,
    AdviceTH.hydration.low_severe,
    `${AdviceTH.hydration.ok} (~${recommendedGlasses} แก้ว หรือประมาณ ${minWaterMl} ml ต่อวัน)`
  ];
}

/**
 * สร้างคำแนะนำด้านเวลา
 */
export function generateTimingAdvice(): string[] {
  const currentHour = new Date().getHours();
  const advice: string[] = [AdviceTH.timing.ok];

  if (currentHour >= 20) {
    advice.unshift(AdviceTH.timing.late_heavy);
  } else if (currentHour >= 14) {
    advice.unshift(AdviceTH.timing.long_gap);
  }

  return Array.from(new Set(advice));
}

/**
 * คำนวณคะแนนรวมรายวัน
 */
export function calculateDailyScore(
  assessments: DailyAssessment,
  goal: UserProfile['target_goal']
): { totalScore: number; grade: string } {
  
  const weights = goal === 'decrease'
    ? { cal: 0.35, pro: 0.30, carb: 0.20, fat: 0.15 }
    : goal === 'increase'
      ? { cal: 0.30, pro: 0.35, carb: 0.20, fat: 0.15 }
      : { cal: 0.30, pro: 0.30, carb: 0.20, fat: 0.20 };

  
  const calR = Math.max(0, Math.min(1, assessments.calories.score / 25));
  const proR = Math.max(0, Math.min(1, assessments.protein.score / 25));
  const carbR = Math.max(0, Math.min(1, assessments.carbs.score / 25));
  const fatR = Math.max(0, Math.min(1, assessments.fat.score / 25));

  
  const totalWeighted = weights.cal * calR + weights.pro * proR + weights.carb * carbR + weights.fat * fatR;
  const totalScore = parseFloat((totalWeighted * 100).toFixed(2));

  let grade: string;
  if (totalScore >= 90) grade = "เยี่ยมมาก";
  else if (totalScore >= 80) grade = "ดีมาก";
  else if (totalScore >= 70) grade = "ดี";
  else if (totalScore >= 60) grade = "พอใช้";
  else grade = "ควรปรับปรุง";

  return { totalScore, grade };
}


export function generateTomorrowTips(assessments: DailyAssessment, userProfile: UserProfile): string[] {
  const pct = {
    cal: assessments.calories.percentage || 100,
    pro: assessments.protein.percentage || 100,
    carb: assessments.carbs.percentage || 100,
    fat: assessments.fat.percentage || 100,
  };

  const deviations = [
    { key: 'cal', off: Math.abs(pct.cal - 100) },
    { key: 'pro', off: Math.abs(pct.pro - 100) },
    { key: 'carb', off: Math.abs(pct.carb - 100) },
    { key: 'fat', off: Math.abs(pct.fat - 100) },
  ].sort((a, b) => b.off - a.off);
  const top = deviations[0]?.key;

  const tipsSet = new Set<string>();

  if (top === 'pro' && pct.pro < 95) {
    tipsSet.add(AdviceTH.tomorrow[0]);
  }
  if (top === 'cal') {
    tipsSet.add(AdviceTH.tomorrow[3]);
  }
  if (top === 'carb') {
    tipsSet.add(AdviceTH.tomorrow[2]);
  }
  if (tipsSet.size < 2) {
    tipsSet.add(AdviceTH.tomorrow[1]);
  }

  AdviceTH.tomorrow.forEach(tip => {
    if (tipsSet.size < 4) {
      tipsSet.add(tip);
    }
  });

  return Array.from(tipsSet).slice(0, 4);
}

/**
 * สร้างคำแนะนำรายวันแบบครบถ้วน
 */
export function generateDailyRecommendation(
  actualIntake: DailyNutritionData, 
  recommended: RecommendedNutrition, 
  userProfile: UserProfile
): DailyRecommendation {
  const assessments = assessDailyPerformance(actualIntake, recommended, {
    goal: userProfile.target_goal,
    weightKg: userProfile.weight,
  });
  const { totalScore, grade } = calculateDailyScore(assessments, userProfile.target_goal);
  const nutritionAdvice = generateNutritionAdvice(assessments, actualIntake, recommended, userProfile);
  const activityAdvice = generateActivityAdvice(assessments.calories.percentage, userProfile.target_goal);
  const hydrationAdvice = generateHydrationAdvice(userProfile.weight);
  const timingAdvice = generateTimingAdvice();
  const tomorrowTips = generateTomorrowTips(assessments, userProfile);
  
  
  const focusDeviations = [
    { key: 'cal' as const, off: Math.abs((assessments.calories.percentage || 100) - 100) },
    { key: 'pro' as const, off: Math.abs((assessments.protein.percentage || 100) - 100) },
    { key: 'carb' as const, off: Math.abs((assessments.carbs.percentage || 100) - 100) },
    { key: 'fat' as const, off: Math.abs((assessments.fat.percentage || 100) - 100) },
  ].sort((a, b) => b.off - a.off);
  const summaryTemplate = totalScore >= 85
    ? AdviceTH.summary.balanced
    : totalScore >= 70
      ? AdviceTH.summary.needs_tweak
      : AdviceTH.summary.reset;

  const focus1 = focusDeviations[0]?.key ?? 'cal';
  const focus2 = focusDeviations[1]?.key ?? focus1;
  const summaryText = applyTemplate(summaryTemplate, {
    focus1: getFocusLabel(focus1),
    focus2: getFocusLabel(focus2),
  });

  const summary = `📊 คะแนนรวม: ${totalScore}/100 (${grade})\n${summaryText}`;
  
  return {
    date: new Date().toISOString().split('T')[0],
    totalScore,
    grade,
    assessments,
    nutritionAdvice,
    activityAdvice,
    hydrationAdvice,
    timingAdvice,
    tomorrowTips,
    summary
  };
}
