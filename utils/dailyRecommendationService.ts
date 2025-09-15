
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

// Activity advice types and API
export type UserGoal = 'decrease' | 'increase' | 'maintain' | string;

export interface ActivityAdviceParams {
  userGoal: UserGoal;
  caloriePercent: number;     // แคลวันนี้เทียบเป้าหมายเป็น %
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  minutesAvailable?: 10 | 20 | 30;  // ถ้าไม่ส่ง จะเลือกช่วงเวลามาตรฐานให้
  seed?: string;              // แนะนำส่ง YYYY-MM-DD เพื่อให้สุ่มแบบคงที่ต่อวัน
}

export function assessNutrient(actual: number, target: number, type: 'calories' | 'protein' | 'carbs' | 'fat'): NutrientAssessment {
  if (target === 0) {
    return { status: 'needs_adjustment', score: 0, percentage: 0 };
  }

  const percentage = (actual / target) * 100;
  const off = Math.abs(percentage - 100);

  // Piecewise-linear scoring by deviation from 100%
  const scoreRaw = (() => {
    if (off <= 10) return 25 - 0.3 * off; // 0–10% off: 25 → 22
    if (off <= 20) return 22 - 0.4 * (off - 10); // 10–20%: 22 → 18
    return Math.max(10, 18 - 0.5 * (off - 20)); // >20%: decrease to min 10
  })();
  const score = parseFloat(scoreRaw.toFixed(2));

  // Keep status classification per nutrient, but use the continuous score above
  switch (type) {
    case 'protein': {
      if (percentage >= 90 && percentage <= 110) return { status: 'excellent', score, percentage };
      if (percentage >= 70 && percentage < 90) return { status: 'need_more', score, percentage };
      if (percentage < 70) return { status: 'insufficient', score, percentage };
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
export function assessDailyPerformance(actualIntake: DailyNutritionData, recommended: RecommendedNutrition): DailyAssessment {
  return {
    calories: assessNutrient(actualIntake.calories, recommended.calories, 'calories'),
    protein: assessNutrient(actualIntake.protein, recommended.protein, 'protein'),
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

  // ประมาณความคืบหน้าของวันจากเวลา + แคลอรี่ที่กิน
  const hour = new Date().getHours();
  const dayProgByTime = Math.max(0, Math.min(1, (hour - 6) / (21 - 6))); // 06:00–21:00
  const dayProgByIntake = Math.max(0, Math.min(1, pct.cal / 100));
  const dayProgress = Math.max(dayProgByTime * 0.6, dayProgByIntake * 0.9);

  const tone: 'mild' | 'standard' | 'strong' = (() => {
    const bigDeviation = pct.cal > 120 || pct.pro < 70 || pct.carb > 140 || pct.fat > 140;
    if (dayProgress > 0.8 || bigDeviation) return 'strong';
    if (dayProgress < 0.5 && pct.cal < 60) return 'mild';
    return 'standard';
  })();

  const maxItems = dayProgress < 0.5 ? 2 : tone === 'strong' ? 4 : 3;

  const say = (m: string) => {
    if (tone === 'mild') return m.replace(/^/, 'ลอง ').replace('แนะนำ', 'ลอง');
    if (tone === 'strong') return m.replace(/^/, ' ');
    return m;
  };

  // Helper: map grams to simple portions
  const toProteinPortions = (g: number) => {
    const eggs = Math.max(1, Math.round(g / 6)); // egg ~6g protein
    const chickenG = Math.max(50, Math.round((g / 30) * 100)); // 100g chicken ~30g protein
    const tofuG = Math.max(100, Math.round((g / 18) * 150)); // 150g firm tofu ~18g
    return `เช่น ไข่ ${eggs} ฟอง หรือ อกไก่ ${chickenG}g หรือ เต้าหู้แข็ง ${tofuG}g`;
  };
  const toCarbPortions = (g: number) => {
    const halfSpoons = Math.max(1, Math.round(g / 20)); // 1/2 ทัพพี ~20g carb
    const spoons = (halfSpoons / 2).toFixed(1).replace(/\.0$/, '');
    const bananas = Math.max(1, Math.round(g / 23));
    return `ลดข้าว ~${spoons} ทัพพี หรือ เลี่ยงกล้วย ${bananas} ผล`; 
  };
  const toFatPortions = (g: number) => {
    const almondsG = Math.max(10, Math.round((g / 10) * 15)); // 15g almonds ~10g fat
    return `ลดถั่ว ~${almondsG}g หรือเลี่ยงกะทิ/ของทอดในมื้อถัดไป`;
  };

  // 1) Protein deficit with/without kcal headroom → concrete grams/portions
  if (advice.length < maxItems && pct.pro < 95) {
    const deficitProG = Math.max(0, Math.round((recommended.protein || 0) - (actual.protein || 0)));
    if (deficitProG > 0) {
      if (pct.cal <= 105) {
        // Can add some protein directly
        const addG = Math.max(10, Math.min(30, Math.round(deficitProG * (tone === 'mild' ? 0.4 : tone === 'strong' ? 0.7 : 0.5))));
        advice.push(say(`โปรตีนขาด ~${deficitProG}g → เพิ่มโปรตีน ~${addG}g (${toProteinPortions(addG)})`));
      } else {
        // kcal high → swap within kcal budget
        const addG = Math.max(10, Math.min(25, Math.round(deficitProG * 0.5)));
        const reduceKcal = addG * 4;
        const preferCarb = pct.carb > 105 || pct.fat <= 105;
        if (preferCarb) {
          const reduceCarbG = Math.round(reduceKcal / 4);
          advice.push(say(`สลับ portion: ลดคาร์บ ~${reduceCarbG}g แล้วเพิ่มโปรตีน ~${addG}g (${toProteinPortions(addG)})`));
        } else {
          const reduceFatG = Math.round(reduceKcal / 9);
          advice.push(say(`สลับ portion: ลดไขมัน ~${reduceFatG}g แล้วเพิ่มโปรตีน ~${addG}g (${toProteinPortions(addG)})`));
        }
      }
    }
  }

  // 1.5) Swap rule: kcal เกิน + โปรตีนต่ำ → สลับภายใน kcal เดิม (คงไว้สำหรับกรณี deficitPro เล็กมาก)
  if (pct.cal > 110 && pct.pro < 90) {
    const proDeficitG = Math.max(0, Math.round(recommended.protein * Math.max(0, (100 - pct.pro)) / 100));
    const addProG = Math.max(10, Math.min(30, Math.round(proDeficitG * 0.5))); // เติมครึ่งช่องว่างแต่พอทำได้จริง
    const overCarb = Math.max(0, Math.round(recommended.carbs * Math.max(0, (pct.carb - 100)) / 100));
    const overFat = Math.max(0, Math.round(recommended.fat * Math.max(0, (pct.fat - 100)) / 100));
    const preferCarb = overCarb >= Math.ceil((4 * addProG) / 9) || overFat === 0;
    if (preferCarb) {
      const reduceCarbG = addProG; // 4 kcal/g ↔ 4 kcal/g
      advice.push(say(`สลับในแคลอรี่เดิม: ลดคาร์บ ~${reduceCarbG}g แล้วเพิ่มโปรตีน ~${addProG}g`));
    } else {
      const reduceFatG = Math.max(1, Math.round((4 * addProG) / 9));
      advice.push(say(`สลับในแคลอรี่เดิม: ลดไขมัน ~${reduceFatG}g แล้วเพิ่มโปรตีน ~${addProG}g`));
    }
  }

  // 2) kcal ต่ำ + โปรตีนต่ำ → snack โปรตีน 150–250 kcal
  if (advice.length < maxItems && pct.cal < 85 && pct.pro < 90) {
    const snackKcal = tone === 'mild' ? 150 : tone === 'strong' ? 250 : 200;
    const proG = Math.round(snackKcal / 10) * 2; // ~30g @ 250kcal, ~20g @ 200kcal
    advice.push(say(`เพิ่มของว่างโปรตีน ${snackKcal} kcal (~${proG}g โปรตีน) เช่น โยเกิร์ตโปรตีน, นมถั่วเหลือง + ไข่ต้ม`));
  }

  // 2.5) Protein upper bound by bodyweight (g/kg) + goal flexibility
  if (advice.length < maxItems) {
    const pctCal = pct.cal;
    const pctPro = pct.pro;
    const weightKg = Math.max(1, user.weight || 1);
    const capPerKg = user.target_goal === 'increase' ? 2.2 : 2.0;
    const proCap = capPerKg * weightKg; // g
    const upperPro = Math.max(1.1 * (recommended.protein || 0), proCap);
    const isExcess = (actual.protein || 0) > upperPro || pctPro > 120;

    if (!isExcess) {
      // benign tip about distributing protein across meals
      const tip = 'โปรตีนอยู่ในช่วงปลอดภัย — กระจายโปรตีน ≥25–30g ให้ได้ 2–3 มื้อ';
      if (advice.length < maxItems) advice.push(say(tip));
    } else {
      if (pctCal > 105) {
        advice.push(say('โปรตีนสูง + แคลอรี่เกิน: ลด portion โปรตีนที่ไขมันสูง และเลือกโปรตีนลีน (อกไก่/ปลา/ไข่ขาว/เต้าหู้)'));
      } else if (pctCal >= 95 && pctCal <= 105) {
        advice.push(say('โปรตีนสูงแต่แคลอรี่พอดี: ลดโปรตีนเล็กน้อย แล้วเติมคาร์บเชิงซ้อน/ไขมันดีให้สมดุลมาโคร'));
      } else {
        advice.push(say('โปรตีนสูงแต่แคลอรี่ขาด: คงโปรตีนไว้และเพิ่มคาร์บเชิงซ้อน/ไขมันดีเล็กน้อยเพื่อพลังงานพอเพียง'));
      }
    }
  }

  // 3) Excess carbs/fat → concrete reductions
  if (advice.length < maxItems && pct.carb > 110) {
    const overCarbG = Math.max(0, Math.round((actual.carbs || 0) - (recommended.carbs || 0)));
    if (overCarbG > 0) {
      advice.push(say(`คาร์บเกิน ~${overCarbG}g → ${toCarbPortions(overCarbG)} และเพิ่มผัก 1–2 กำมือ`));
    }
  }
  if (advice.length < maxItems && pct.fat > 110) {
    const overFatG = Math.max(0, Math.round((actual.fat || 0) - (recommended.fat || 0)));
    if (overFatG > 0) {
      advice.push(say(`ไขมันเกิน ~${overFatG}g → ${toFatPortions(overFatG)} (เปลี่ยนทอดเป็นย่าง/นึ่ง)`));
    }
  }

  // 3.5) เสริมด้วยข้อความสถานะ (ย่อ) ตามความจำเป็น
  const pushIf = (cond: boolean, msg: string) => { if (cond && advice.length < maxItems) advice.push(say(msg)); };

  // แคลอรี่
  pushIf(assessments.calories.status === 'excellent', `แคลอรี่ ${pct.cal.toFixed(0)}% เหมาะสม`);
  pushIf(assessments.calories.status === 'good', `แคลอรี่ ${pct.cal.toFixed(0)}% ใกล้เคียงเป้า`);
  pushIf(assessments.calories.status === 'needs_adjustment' && pct.cal > 115, `แคลอรี่สูง ลดขนมหวาน/ของทอดในมื้อถัดไป`);
  pushIf(assessments.calories.status === 'needs_adjustment' && pct.cal < 85, `แคลอรี่ต่ำ เติมคาร์บเชิงซ้อนเล็กน้อย`);

  // โปรตีน
  pushIf(assessments.protein.status === 'excellent', `โปรตีน ${pct.pro.toFixed(0)}% เพียงพอ`);
  pushIf(assessments.protein.status === 'need_more', `โปรตีนยังไม่พอ เพิ่มโปรตีนไม่ติดมันเล็กน้อย`);
  pushIf(assessments.protein.status === 'insufficient', `โปรตีนต่ำ เพิ่มโปรตีนคุณภาพดีในมื้อถัดไป`);
  pushIf(assessments.protein.status === 'excessive', `โปรตีนเกิน ลดปริมาณในมื้อถัดไป หรือออกำลังกายเพิ่ม`);

  // คาร์บ
  pushIf(assessments.carbs.status === 'excellent', `คาร์บ ${pct.carb.toFixed(0)}% พอดี`);
  pushIf(assessments.carbs.status === 'need_more' || assessments.carbs.status === 'insufficient', `เพิ่มคาร์บเชิงซ้อนเล็กน้อย (ข้าวกล้อง/มันหวาน)`);
  pushIf(assessments.carbs.status === 'excessive', `คาร์บสูง ลดน้ำตาล/ของหวาน`);

  // ไขมัน
  pushIf(assessments.fat.status === 'excellent', `ไขมัน ${pct.fat.toFixed(0)}% พอดี`);
  pushIf(assessments.fat.status === 'need_more' || assessments.fat.status === 'insufficient', `เพิ่มไขมันดีเล็กน้อย (อะโวคาโด/ถั่ว/น้ำมันมะกอก)`);
  pushIf(assessments.fat.status === 'excessive', `ไขมันสูง ลดของทอด/อาหารมัน`);

  return advice;
}

/**
 * สร้างคำแนะนำด้านกิจกรรม
 */
export function getActivityAdvice({
  userGoal,
  caloriePercent,
  timeOfDay,
  minutesAvailable,
  seed = new Date().toISOString().slice(0,10), // YYYY-MM-DD
}: ActivityAdviceParams): string[] {
  const goal: 'decrease'|'increase'|'maintain' =
    userGoal === 'decrease' ? 'decrease'
    : userGoal === 'increase' ? 'increase'
    : 'maintain';

  // จัด bucket ตาม "ความรุนแรง"
  const sev =
    caloriePercent > 130 ? 'over_heavy' :
    caloriePercent > 120 ? 'over_mid'   :
    caloriePercent > 110 ? 'over_light' :
    caloriePercent < 70  ? 'under_heavy':
    caloriePercent < 80  ? 'under_mid'  :
    caloriePercent < 90  ? 'under_light': 'ok';

  // helper เลือกข้อความแบบสุ่มคงที่ด้วย seed
  const rng = seeded(seed + goal + sev + (timeOfDay ?? '') + (minutesAvailable ?? ''));
  const pick = <T,>(arr: T[], n = 1): T[] => {
    const chosen: T[] = [];
    const pool = [...arr];
    for (let i = 0; i < Math.min(n, pool.length); i++) {
      const idx = Math.floor(rng() * pool.length);
      chosen.push(pool[idx]);
      pool.splice(idx, 1);
    }
    return chosen;
  };

  const M = (def: number) => minutesAvailable ?? def; // นาที default ต่อสถานการณ์

  // ตัวเลือกคำแนะนำ (ไทย + อีโมจิ) — แยกตามเป้าหมาย × ความรุนแรง
  const pools: Record<typeof goal, Record<string, string[]>> = {
    decrease: {
      over_heavy: [
        `🏃‍♂️ เดินเร็ว ${M(40)}–${M(45)} นาที หลังมื้อเย็น`,
        `🔥 HIIT ${M(12)}–${M(15)} นาที แล้วเดินคูลดาวน์ 10 นาที`,
        `🚴‍♂️ ปั่นจักรยาน ${M(35)} นาที หรือว่ายน้ำ ${M(25)} นาที`,
        `🏋️‍♀️ Circuit เวทน้ำหนักตัว ${M(20)} นาที + เดินหลังอาหาร 15 นาที`,
        `🧹 ทำงานบ้านเร็ว ๆ ${M(30)} นาที (NEAT) แทนการนั่งนิ่ง`,
      ],
      over_mid: [
        `🚶‍♂️ เดินเร็ว ${M(30)} นาที โดยเฉพาะหลังมื้อใหญ่`,
        `🔥 Tabata/HIIT สั้น ๆ ${M(10)}–${M(12)} นาที ถ้าเวลาน้อย`,
        `🚴 ปั่นชิล ${M(25)}–${M(30)} นาที`,
        `🤸‍♂️ ยืดเหยียด 10 นาที + เดิน ${M(20)} นาที`,
      ],
      over_light: [
        `🚶 เดินหลังมื้ออาหาร ${M(15)}–${M(20)} นาที ช่วยจัดการกลูโคส`,
        `🏃‍♂️ เดินเร็ว/จ็อก ${M(20)}–${M(25)} นาที`,
        `🪜 ขึ้นลงบันไดต่อเนื่อง ${M(10)}–${M(12)} นาที`,
      ],
      under_heavy: [
        `⚠️ แคลขาดมาก: เติมพลังงานก่อน แล้วออกกำลังกายเบา ๆ ${M(10)}–${M(15)} นาที`,
        `🍌+🥛 snack 150–250 kcal จากนั้นเดินเบา ${M(10)}–${M(15)} นาที`,
        `🛌 เน้นพักผ่อนคุณภาพคืนนี้ แล้วค่อยเวทพรุ่งนี้`,
      ],
      under_mid: [
        `🥪 เติมคาร์บเชิงซ้อนเล็กน้อยก่อน แล้วเดินเบา ${M(15)} นาที`,
        `🏋️ เวทเบา ๆ แบบ full-body ${M(15)} นาที + เดินคูลดาวน์ 10 นาที`,
      ],
      under_light: [
        `🤸‍♀️ ยืดเหยียด 10 นาที + เดิน ${M(15)} นาที`,
        `🚶 เดินชิล ${M(20)} นาที รักษาการเผาผลาญ`,
      ],
      ok: [
        `✅ เดินเร็ว ${M(20)}–${M(30)} นาที รักษาจังหวะการเผาผลาญ`,
        `🏋️‍♂️ เวทวงจร ${M(20)} นาที หรือปั่น ${M(25)} นาที`,
        `🧘 โยคะ/Flow ${M(20)} นาที + เดินหลังมื้อเย็น 10 นาที`,
      ],
    },
    increase: {
      under_heavy: [
        `💪 เวทเน้น compound ${M(40)}–${M(45)} นาที แล้วคาร์ดิโอเบา 10 นาที`,
        `🥤 เติมพลังงาน 300–500 kcal ก่อนซ้อม แล้วฝึกต้านทานคุณภาพ`,
        `🏋️‍♀️ Progressive overload ${M(35)} นาที + โปรตีนหลังซ้อม`,
      ],
      under_mid: [
        `💪 เวท ${M(30)} นาที + เดินคูลดาวน์ 10 นาที`,
        `🏋️ Superset เบา ๆ ${M(20)}–${M(25)} นาที`,
        `🍚 เติมคาร์บก่อนซ้อมเล็กน้อย แล้วฝึกต้านทาน`,
      ],
      under_light: [
        `💪 เวทน้ำหนักตัว/ยางยืด ${M(20)} นาที`,
        `🚶‍♂️ เดินอุ่นเครื่อง 10 นาที + เวท ${M(20)} นาที`,
      ],
      over_heavy: [
        `🚶 แคลเกินมาก: เดินเร็ว ${M(30)}–${M(40)} นาที เพื่อบาลานซ์พลังงาน`,
        `🚴 ปั่นเบา ${M(30)} นาที หรือว่ายน้ำ ${M(20)} นาที`,
      ],
      over_mid: [
        `🚶 แคลเกิน: เดินเร็ว ${M(20)}–${M(30)} นาที`,
        `🤸‍♂️ Mobility/ยืดเหยียด 10 นาที + เดิน ${M(15)} นาที`,
      ],
      over_light: [
        `🚶 เดินหลังอาหาร ${M(15)}–${M(20)} นาที รักษาฟอร์ม`,
        `🏃‍♂️ จ็อกช้า ${M(20)} นาที`,
      ],
      ok: [
        `💪 เวทแบบ progressive overload ${M(30)} นาที`,
        `🏋️ Compound (สควอต/ดัน/ดึง) ${M(25)} นาที + เดิน 10 นาที`,
        `🚶 คาร์ดิโอเบา ${M(20)}–${M(25)} นาที เพื่อระบบหัวใจ`,
      ],
    },
    maintain: {
      over_heavy: [
        `🏃‍♂️ เดินเร็ว ${M(35)}–${M(45)} นาที`,
        `🔥 HIIT ${M(12)} นาที + เดิน 10 นาที`,
      ],
      over_mid: [
        `🚶 เดินหลังมื้อใหญ่ ${M(20)}–${M(30)} นาที`,
        `🚴 ปั่นชิล ${M(25)} นาที`,
      ],
      over_light: [
        `🚶 เดิน ${M(20)}–${M(25)} นาที`,
        `🪜 ขึ้นลงบันได ${M(10)}–${M(12)} นาที`,
      ],
      under_heavy: [
        `⚠️ เติมพลังงานก่อน แล้วทำคาร์ดิโอเบา ${M(10)}–${M(15)} นาที`,
        `🍽️ วางมื้อถัดไปให้ครบหมวด + เดินเบา 10 นาที`,
      ],
      under_mid: [
        `🤸‍♂️ ยืดเหยียด 10 นาที + เดิน ${M(15)} นาที`,
        `🚶 เดินชิล ${M(20)} นาที`,
      ],
      under_light: [
        `🚶 เดินหลังอาหาร ${M(15)} นาที`,
        `🧘 โยคะ/หายใจลึก ${M(15)} นาที`,
      ],
      ok: [
        `✅ เดินเร็ว ${M(20)}–${M(30)} นาที`,
        `🏋️ เวทน้ำหนักตัว ${M(20)} นาที`,
        `🚴 ปั่นสบาย ๆ ${M(25)} นาที`,
      ],
    },
  };

  // บางข้อความเฉพาะช่วงเวลา (เพิ่มรสชาติเล็กน้อย)
  const timeHints: Record<NonNullable<typeof timeOfDay>, string[]> = {
    morning: [
      '🌤️ รับแดดอ่อน ๆ 5–10 นาที แล้วเดินสั้น ๆ ก่อนเริ่มวัน',
      '🥤 ดื่มน้ำ 1–2 แก้วก่อนออกกำลัง',
    ],
    afternoon: [
      '☀️ หลังมื้อกลางวัน เดิน 10–15 นาที ช่วยลดง่วงบ่าย',
    ],
    evening: [
      '🌙 หลังมื้อเย็น เดิน 15–20 นาที ช่วยย่อยและนอนดีขึ้น',
      '🛌 เว้นระยะออกกำลังกายหนักก่อนนอน 3 ชม.',
    ],
  };

  const base = pools[goal][sev] ?? pools.maintain.ok;
  const picks = pick(base, sev.includes('heavy') ? 2 : 1); // เบี่ยงเบนหนัก → ให้ 2 ข้อ
  if (timeOfDay) {
    picks.push(...pick(timeHints[timeOfDay], 1));
  }
  return picks;
}

// Backward-compatible wrapper with old API
export function generateActivityAdvice(caloriePercent: number, userGoal: string): string[] {
  return getActivityAdvice({ userGoal, caloriePercent });
}

// PRNG แบบง่ายสำหรับการสุ่มคงที่ตาม seed
function seeded(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return function rand() {
    // LCG
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
    return (h >>> 0) / 0xFFFFFFFF;
  };
}

/**
 * สร้างคำแนะนำด้านน้ำ
 */
export function generateHydrationAdvice(weight: number): string[] {
  const minWaterMl = Math.round(weight * 35);
  const recommendedGlasses = Math.ceil(minWaterMl / 250); // 1 แก้ว = 250ml
  
  return [
    `💧 ดื่มน้ำอย่างน้อย ${recommendedGlasses} แก้ว/วัน (${minWaterMl}ml)`,
    `➕ ถ้ามีออกกำลังกาย/อากาศร้อน เพิ่มอีก ~500–1000 ml วันนี้`,
    `🚰 เช็คสีปัสสาวะ: ใสเหลืองอ่อน = ดื่มน้ำเพียงพอ`,
    `⏰ ตั้งปลุกดื่มน้ำทุก 2 ชั่วโมง`
  ];
}

/**
 * สร้างคำแนะนำด้านเวลา
 */
export function generateTimingAdvice(): string[] {
  const currentHour = new Date().getHours();
  const advice: string[] = [];
  
  if (currentHour >= 6 && currentHour <= 10) {
    advice.push("🌅 เช้านี้: ควรทานอาหารเช้าภายใน 2 ชั่วโมงหลังตื่น");
    advice.push("☕ เริ่มวันด้วยน้ำเปล่า 1-2 แก้วก่อนอาหารเช้า");
  } else if (currentHour >= 11 && currentHour <= 14) {
    advice.push("🌞 กลางวัน: ช่วงที่ร่างกายต้องการพลังงานมากสุด");
    advice.push("🍚 มื้อกลางวันควรมีคาร์บและโปรตีนครบถ้วน");
  } else if (currentHour >= 17 && currentHour <= 20) {
    advice.push("🌆 เย็นนี้: ควรทานอาหารเย็นก่อน 19:30");
    advice.push("🥗 มื้อเย็นควรเบาและย่อยง่าย");
  } else {
    advice.push("🌙 หลีกเลี่ยงทานหลัง 21:00 เพื่อการนอนหลับดี");
  }
  
  return advice;
}

/**
 * คำนวณคะแนนรวมรายวัน
 */
export function calculateDailyScore(
  assessments: DailyAssessment,
  goal: UserProfile['target_goal']
): { totalScore: number; grade: string } {
  // น้ำหนักคะแนนตามเป้าหมายผู้ใช้
  const weights = goal === 'decrease'
    ? { cal: 0.35, pro: 0.30, carb: 0.20, fat: 0.15 }
    : goal === 'increase'
      ? { cal: 0.30, pro: 0.35, carb: 0.20, fat: 0.15 }
      : { cal: 0.30, pro: 0.30, carb: 0.20, fat: 0.20 };

  // แปลงคะแนนแต่ละส่วนเป็นสัดส่วนของ 25
  const calR = Math.max(0, Math.min(1, assessments.calories.score / 25));
  const proR = Math.max(0, Math.min(1, assessments.protein.score / 25));
  const carbR = Math.max(0, Math.min(1, assessments.carbs.score / 25));
  const fatR = Math.max(0, Math.min(1, assessments.fat.score / 25));

  // รวมแบบถ่วงน้ำหนัก แล้วสเกลกลับเป็นเต็ม 100
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
  const tips: string[] = [];
  const pct = {
    cal: assessments.calories.percentage || 100,
    pro: assessments.protein.percentage || 100,
    carb: assessments.carbs.percentage || 100,
    fat: assessments.fat.percentage || 100,
  };
  // หาปัญหาใหญ่สุดจากระยะเบี่ยงเบน
  const deviations = [
    { key: 'cal', off: Math.abs(pct.cal - 100) },
    { key: 'pro', off: Math.abs(pct.pro - 100) },
    { key: 'carb', off: Math.abs(pct.carb - 100) },
    { key: 'fat', off: Math.abs(pct.fat - 100) },
  ].sort((a, b) => b.off - a.off);
  const top = deviations[0]?.key;

  if (top === 'pro' && pct.pro < 95) {
    tips.push('🥚 พรุ่งนี้เริ่มวันด้วยโปรตีน ≥25–30g (เช่น ไข่ 3 ฟอง หรือ อกไก่ 100–120g)');
  }
  if (top === 'carb' && pct.carb > 110) {
    tips.push('🍬 ลดของหวาน/น้ำหวาน และเดิน 20–30 นาทีหลังมื้อใหญ่');
  }
  if (top === 'fat' && pct.fat > 110) {
    tips.push('🍳 เลือกย่าง/นึ่งแทนทอดในมื้อเที่ยง/เย็น');
  }
  if (top === 'cal' && pct.cal > 110) {
    tips.push('🔥 เลี่ยงของหวานก่อนนอน และเดินเร็ว 20–30 นาทีหลังอาหารเย็น');
  }
  if (top === 'cal' && pct.cal < 90) {
    tips.push('🍽️ เติมของว่างโปรตีน ~200 kcal ในครึ่งแรกของวัน');
  }

  // เป้าหมายเฉพาะ
  if (userProfile.target_goal === 'increase') {
    tips.push('💪 ออกกำลังกายต้านทาน 2–3 ครั้ง/สัปดาห์ เพื่อเสริมกล้ามเนื้อ');
  } else if (userProfile.target_goal === 'decrease') {
    tips.push('🚶‍♀️ เดิน 7–10k ก้าว/วัน ร่วมกับควบคุมขนมหวาน');
  }

  // ทั่วไป
  tips.push('💧 ดื่มน้ำสม่ำเสมอ และจบมื้อเย็น ≥ 3 ชม.ก่อนนอน');

  return tips.slice(0, 4);
}

/**
 * สร้างคำแนะนำรายวันแบบครบถ้วน
 */
export function generateDailyRecommendation(
  actualIntake: DailyNutritionData, 
  recommended: RecommendedNutrition, 
  userProfile: UserProfile
): DailyRecommendation {
  const assessments = assessDailyPerformance(actualIntake, recommended);
  const { totalScore, grade } = calculateDailyScore(assessments, userProfile.target_goal);
  const nutritionAdvice = generateNutritionAdvice(assessments, actualIntake, recommended, userProfile);
  const activityAdvice = generateActivityAdvice(assessments.calories.percentage, userProfile.target_goal);
  const hydrationAdvice = generateHydrationAdvice(userProfile.weight);
  const timingAdvice = generateTimingAdvice();
  const tomorrowTips = generateTomorrowTips(assessments, userProfile);
  
  // สร้างสรุป
  const summary = `📊 คะแนนรวม: ${totalScore}/100 (${grade})`;
  
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
