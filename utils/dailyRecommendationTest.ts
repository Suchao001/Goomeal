// Test file สำหรับระบบแนะนำการกินรายวัน
import { 
  generateDailyRecommendation,
  assessDailyPerformance,
  calculateDailyScore,
  type DailyNutritionData,
  type RecommendedNutrition,
  type UserProfile
} from './dailyRecommendationService';

// Mock Data สำหรับทดสอบ
export const mockUserProfiles: UserProfile[] = [
  {
    target_goal: 'decrease',
    weight: 70,
    age: 28,
    activity_level: 'moderate'
  },
  {
    target_goal: 'increase',
    weight: 60,
    age: 25,
    activity_level: 'high'
  },
  {
    target_goal: 'healthy',
    weight: 65,
    age: 30,
    activity_level: 'low'
  }
];

export const mockRecommendedNutrition: RecommendedNutrition[] = [
  // สำหรับคนที่ต้องการลดน้ำหนัก
  {
    calories: 1800,
    protein: 90,   // 1.3g/kg × 70kg
    carbs: 225,    // 50% ของแคลอรี่
    fat: 60        // 30% ของแคลอรี่
  },
  // สำหรับคนที่ต้องการเพิ่มน้ำหนัก
  {
    calories: 2200,
    protein: 84,   // 1.4g/kg × 60kg
    carbs: 330,    // 60% ของแคลอรี่
    fat: 61        // 25% ของแคลอรี่
  },
  // สำหรับคนที่ต้องการรักษาสุขภาพ
  {
    calories: 2000,
    protein: 78,   // 1.2g/kg × 65kg
    carbs: 275,    // 55% ของแคลอรี่
    fat: 67        // 30% ของแคลอรี่
  }
];

export const mockActualIntake: DailyNutritionData[] = [
  // วันที่กินดี - บรรลุเป้าหมายส่วนใหญ่
  {
    calories: 1847,  // 103% ของเป้าหมาย
    protein: 85,     // 94% ของเป้าหมาย
    carbs: 234,      // 104% ของเป้าหมาย
    fat: 62          // 103% ของเป้าหมาย
  },
  // วันที่กินน้อย - ขาดสารอาหาร
  {
    calories: 1450,  // 81% ของเป้าหมาย
    protein: 65,     // 72% ของเป้าหมาย
    carbs: 180,      // 80% ของเป้าหมาย
    fat: 45          // 75% ของเป้าหมาย
  },
  // วันที่กินมาก - เกินเป้าหมาย
  {
    calories: 2100,  // 117% ของเป้าหมาย
    protein: 95,     // 106% ของเป้าหมาย
    carbs: 280,      // 124% ของเป้าหมาย
    fat: 85          // 142% ของเป้าหมาย
  },
  // วันที่สมดุลดี - เหมาะสมทุกด้าน
  {
    calories: 1980,  // 99% ของเป้าหมาย
    protein: 79,     // 101% ของเป้าหมาย
    carbs: 272,      // 99% ของเป้าหมาย
    fat: 66          // 99% ของเป้าหมาย
  },
  // วันที่โปรตีนสูง - เหมาะสำหรับคนออกกำลังกาย
  {
    calories: 2150,  // 98% ของเป้าหมาย
    protein: 110,    // 131% ของเป้าหมาย
    carbs: 300,      // 91% ของเป้าหมาย
    fat: 70          // 115% ของเป้าหมาย
  }
];

// Test scenarios
export const testScenarios = [
  {
    name: "คนลดน้ำหนัก - กินดี",
    userProfile: mockUserProfiles[0],
    recommended: mockRecommendedNutrition[0],
    actualIntake: mockActualIntake[0]
  },
  {
    name: "คนลดน้ำหนัก - กินน้อย",
    userProfile: mockUserProfiles[0],
    recommended: mockRecommendedNutrition[0],
    actualIntake: mockActualIntake[1]
  },
  {
    name: "คนลดน้ำหนัก - กินมาก",
    userProfile: mockUserProfiles[0],
    recommended: mockRecommendedNutrition[0],
    actualIntake: mockActualIntake[2]
  },
  {
    name: "คนรักษาสุขภาพ - สมดุลดี",
    userProfile: mockUserProfiles[2],
    recommended: mockRecommendedNutrition[2],
    actualIntake: mockActualIntake[3]
  },
  {
    name: "คนเพิ่มน้ำหนัก - โปรตีนสูง",
    userProfile: mockUserProfiles[1],
    recommended: mockRecommendedNutrition[1],
    actualIntake: mockActualIntake[4]
  }
];

/**
 * รันการทดสอบทั้งหมด
 */
export function runAllTests() {
  console.log('🧪 เริ่มทดสอบระบบแนะนำการกินรายวัน\n');
  console.log('='.repeat(60));
  
  testScenarios.forEach((scenario, index) => {
    console.log(`\n📋 ทดสอบที่ ${index + 1}: ${scenario.name}`);
    console.log('-'.repeat(40));
    
    const recommendation = generateDailyRecommendation(
      scenario.actualIntake,
      scenario.recommended,
      scenario.userProfile
    );
    
    console.log(`📅 วันที่: ${recommendation.date}`);
    console.log(`${recommendation.summary}`);
    console.log(`\n💪 โภชนาการ:`);
    recommendation.nutritionAdvice.forEach(advice => console.log(`  ${advice}`));
    
    console.log(`\n🏃‍♂️ กิจกรรม:`);
    recommendation.activityAdvice.forEach(advice => console.log(`  ${advice}`));
    
    console.log(`\n💧 น้ำ:`);
    recommendation.hydrationAdvice.forEach(advice => console.log(`  ${advice}`));
    
    console.log(`\n⏰ เวลา:`);
    recommendation.timingAdvice.forEach(advice => console.log(`  ${advice}`));
    
    console.log(`\n🎯 เคล็ดลับพรุ่งนี้:`);
    recommendation.tomorrowTips.forEach(tip => console.log(`  ${tip}`));
    
    console.log('\n' + '='.repeat(60));
  });
  
  console.log('\n✅ ทดสอบเสร็จสิ้น!');
}

/**
 * ทดสอบการประเมินสารอาหาร
 */
export function testNutrientAssessment() {
  console.log('🔬 ทดสอบการประเมินสารอาหาร\n');
  
  const testCases = [
    { actual: 90, target: 100, type: 'protein', expected: 'need_more' },
    { actual: 95, target: 100, type: 'calories', expected: 'excellent' },
    { actual: 120, target: 100, type: 'carbs', expected: 'excellent' },
    { actual: 150, target: 100, type: 'fat', expected: 'excessive' }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`ทดสอบ ${index + 1}: ${testCase.type} = ${testCase.actual}/${testCase.target}`);
    
    const assessment = assessDailyPerformance(
      { calories: testCase.actual, protein: testCase.actual, carbs: testCase.actual, fat: testCase.actual },
      { calories: testCase.target, protein: testCase.target, carbs: testCase.target, fat: testCase.target }
    );
    
    const result = assessment[testCase.type as keyof typeof assessment];
    console.log(`  ✓ สถานะ: ${result.status}`);
    console.log(`  ✓ คะแนน: ${result.score}/25`);
    console.log(`  ✓ เปอร์เซ็นต์: ${result.percentage.toFixed(1)}%\n`);
  });
}

/**
 * ทดสอบคะแนนรวม
 */
export function testScoreCalculation() {
  console.log('📊 ทดสอบการคำนวณคะแนน\n');
  
  const testAssessments = [
    // คะแนนดีเยี่ยม
    { calories: { score: 25 }, protein: { score: 25 }, carbs: { score: 25 }, fat: { score: 25 } },
    // คะแนนดี
    { calories: { score: 20 }, protein: { score: 20 }, carbs: { score: 20 }, fat: { score: 20 } },
    // คะแนนพอใช้
    { calories: { score: 15 }, protein: { score: 15 }, carbs: { score: 15 }, fat: { score: 15 } },
    // คะแนนต่ำ
    { calories: { score: 10 }, protein: { score: 10 }, carbs: { score: 10 }, fat: { score: 10 } }
  ];
  
  testAssessments.forEach((assessment, index) => {
    const { totalScore, grade } = calculateDailyScore(assessment as any);
    console.log(`ทดสอบ ${index + 1}: คะแนน ${totalScore}/100 - ${grade}`);
  });
}

// Export function สำหรับใช้ในไฟล์อื่น
export { generateDailyRecommendation, assessDailyPerformance };
