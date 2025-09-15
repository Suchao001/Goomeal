
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

export function assessNutrient(actual: number, target: number, type: 'calories' | 'protein' | 'carbs' | 'fat'): NutrientAssessment {
  if (target === 0) {
    return { status: 'needs_adjustment', score: 0, percentage: 0 };
  }

  const percentage = (actual / target) * 100;
  
  switch(type) {
    case 'protein':
      if (percentage >= 90 && percentage <= 110) return { status: 'excellent', score: 25, percentage };
      if (percentage >= 70 && percentage < 90) return { status: 'need_more', score: 18, percentage };
      if (percentage < 70) return { status: 'insufficient', score: 10, percentage };
      return { status: 'excessive', score: 15, percentage };
      
    case 'calories':
      if (percentage >= 95 && percentage <= 105) return { status: 'excellent', score: 25, percentage };
      if (percentage >= 85 && percentage <= 115) return { status: 'good', score: 20, percentage };
      return { status: 'needs_adjustment', score: 12, percentage };
      
    case 'carbs':
      if (percentage >= 80 && percentage <= 120) return { status: 'excellent', score: 25, percentage };
      if (percentage >= 70 && percentage < 80) return { status: 'need_more', score: 18, percentage };
      if (percentage < 70) return { status: 'insufficient', score: 10, percentage };
      return { status: 'excessive', score: 15, percentage };
      
    case 'fat':
      if (percentage >= 80 && percentage <= 120) return { status: 'excellent', score: 25, percentage };
      if (percentage >= 60 && percentage < 80) return { status: 'need_more', score: 18, percentage };
      if (percentage < 60) return { status: 'insufficient', score: 10, percentage };
      return { status: 'excessive', score: 15, percentage };
      
    default:
      return { status: 'needs_adjustment', score: 0, percentage };
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
export function generateNutritionAdvice(assessments: DailyAssessment): string[] {
  const advice: string[] = [];
  
  // คำแนะนำด้านแคลอรี่
  const caloriePercent = assessments.calories.percentage;
  if (assessments.calories.status === 'excellent') {
    advice.push(`✅ แคลอรี่: ${caloriePercent.toFixed(0)}% - เหมาะสม (ใกล้เป้าหมาย)`);
  } else if (assessments.calories.status === 'good') {
    advice.push(`✅ แคลอรี่: ${caloriePercent.toFixed(0)}% - เหมาะสม`);
  } else {
    advice.push(`⚠️ แคลอรี่: ${caloriePercent.toFixed(0)}% - ควรปรับปรุง`);
  }
  
  // คำแนะนำด้านโปรตีน
  const proteinPercent = assessments.protein.percentage;
  switch (assessments.protein.status) {
    case 'excellent':
      advice.push(`✅ โปรตีน: ${proteinPercent.toFixed(0)}% - ทำได้ดีมาก! ปริมาณโปรตีนเพียงพอสำหรับร่างกาย`);
      break;
    case 'need_more':
      advice.push(`⚠️ โปรตีน: ${proteinPercent.toFixed(0)}% - ควรเสริมโปรตีน เช่น ไข่, ไก่, ปลา, ถั่ว หรือนมถั่วเหลือง`);
      break;
    case 'insufficient':
      advice.push(`🔴 โปรตีน: ${proteinPercent.toFixed(0)}% - โปรตีนไม่เพียงพอ แนะนำเพิ่มอาหารโปรตีนในมื้อถัดไป`);
      break;
    case 'excessive':
      advice.push(`⚠️ โปรตีน: ${proteinPercent.toFixed(0)}% - โปรตีนเกินความต้องการ ลองเพิ่มผักและคาร์บแทน`);
      break;
  }
  
  // คำแนะนำด้านคาร์บ
  const carbPercent = assessments.carbs.percentage;
  switch (assessments.carbs.status) {
    case 'excellent':
      advice.push(`✅ คาร์บ: ${carbPercent.toFixed(0)}% - พลังงานเพียงพอ ร่างกายได้รับคาร์บที่เหมาะสม`);
      break;
    case 'need_more':
    case 'insufficient':
      advice.push(`⚠️ คาร์บ: ${carbPercent.toFixed(0)}% - ควรทานข้าว ขนมปัง หรือผลไม้เพิ่ม`);
      break;
    case 'excessive':
      advice.push(`⚠️ คาร์บ: ${carbPercent.toFixed(0)}% - คาร์บมากไป ลองลดข้าวและเพิ่มผักแทน`);
      break;
  }
  
  // คำแนะนำด้านไขมัน
  const fatPercent = assessments.fat.percentage;
  switch (assessments.fat.status) {
    case 'excellent':
      advice.push(`✅ ไขมัน: ${fatPercent.toFixed(0)}% - ไขมันดีอยู่ในเกณฑ์ที่เหมาะสม`);
      break;
    case 'need_more':
    case 'insufficient':
      advice.push(`⚠️ ไขมัน: ${fatPercent.toFixed(0)}% - ควรเพิ่มไขมันดี เช่น อะโวคาโด, ถั่ว, น้ำมันมะกอก`);
      break;
    case 'excessive':
      advice.push(`⚠️ ไขมัน: ${fatPercent.toFixed(0)}% - ไขมันเกิน ลองลดการทอด เปลี่ยนเป็นนึ่ง ต้ม`);
      break;
  }
  
  return advice;
}

/**
 * สร้างคำแนะนำด้านกิจกรรม
 */
export function generateActivityAdvice(caloriePercent: number, userGoal: string): string[] {
  const advice: string[] = [];
  
  if (userGoal === 'decrease') {
    if (caloriePercent > 110) {
      advice.push("🏃‍♂️ แคลอรี่เกินเป้าหมาย แนะนำเดิน 30 นาที หรือขึ้นลงบันได");
    } else if (caloriePercent < 80) {
      advice.push("⚠️ แคลอรี่น้อยเกินไป ควรทานเพิ่มและออกกำลังกายเบาๆ");
    } else {
      advice.push("✅ ออกกำลังกายเบาๆ 20-30 นาที จะช่วยเผาผลาญดีขึ้น");
    }
  } else if (userGoal === 'increase') {
    if (caloriePercent < 90) {
      advice.push("💪 ควรทานเพิ่มและออกกำลังกายแบบต้านทาน เช่น ยกน้ำหนัก");
    } else if (caloriePercent > 120) {
      advice.push("🚶‍♂️ แคลอรี่เกินไป ควรเดินหรือออกกำลังกายเบาๆ");
    } else {
      advice.push("💪 ออกกำลังกายแบบต้านทานจะช่วยสร้างกล้ามเนื้อ");
    }
  } else {
    advice.push("🏃‍♂️ ออกกำลังกาย 30 นาที จะช่วยเผาผลาญและสุขภาพดี");
  }
  
  return advice;
}

/**
 * สร้างคำแนะนำด้านน้ำ
 */
export function generateHydrationAdvice(weight: number): string[] {
  const minWaterMl = Math.round(weight * 35);
  const recommendedGlasses = Math.ceil(minWaterMl / 250); // 1 แก้ว = 250ml
  
  return [
    `💧 ดื่มน้ำอย่างน้อย ${recommendedGlasses} แก้ว/วัน (${minWaterMl}ml)`,
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
export function calculateDailyScore(assessments: DailyAssessment): { totalScore: number; grade: string } {
  // คำนวณคะแนนรวมจาก 4 สารอาหาร (แต่ละอย่างคะแนนเต็ม 25)
  const nutritionScore = assessments.calories.score + assessments.protein.score + assessments.carbs.score + assessments.fat.score;
  const totalScore = Math.round(nutritionScore);
  
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
  
  // เคล็ดลับตามสารอาหารที่ขาด
  if (assessments.protein.status === 'need_more' || assessments.protein.status === 'insufficient') {
    tips.push("🥚 เพิ่มโปรตีน: ใส่ไข่ต้มในสลัด หรือทานปลาเผา");
  }
  
  if (assessments.carbs.status === 'need_more' || assessments.carbs.status === 'insufficient') {
    tips.push("🍌 เพิ่มพลังงาน: ทานผลไม้หรือข้าวกล้องในมื้อเช้า");
  }
  
  if (assessments.fat.status === 'need_more' || assessments.fat.status === 'insufficient') {
    tips.push("🥑 เพิ่มไขมันดี: ใส่อะโวคาโดในสลัด หรือถั่วในขนม");
  }
  
  // เคล็ดลับตามเป้าหมาย
  if (userProfile.target_goal === 'decrease') {
    tips.push("🚶‍♀️ เดินขึ้นลงบันไดในออฟฟิศ แทนลิฟต์");
  } else if (userProfile.target_goal === 'increase') {
    tips.push("💪 ออกกำลังกายต้านทาน 2-3 ครั้ง/สัปดาห์");
  }
  
  // เคล็ดลับทั่วไป
  tips.push("💧 ตั้งปลุกดื่มน้ำทุก 2 ชั่วโมง");
  tips.push("⏰ วางแผนมื้ออาหารล่วงหน้า");
  
  return tips.slice(0, 4); // จำกัดไว้ที่ 4 เคล็ดลับ
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
  const { totalScore, grade } = calculateDailyScore(assessments);
  const nutritionAdvice = generateNutritionAdvice(assessments);
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
