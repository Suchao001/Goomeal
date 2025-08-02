// ไฟล์ทดสอบ Nutrition Calculator (อัปเดตใหม่)
// เพื่อแสดงการคำนวณตามหลักโภชนาการที่ถูกต้อง

import { 
  calculateRecommendedNutrition, 
  getCalculationDetails,
  MOCKUP_USER_PROFILE,
  type UserProfileData 
} from './nutritionCalculator';

console.log('=== Nutrition Calculator Test (Updated) ===\n');

// ทดสอบด้วยข้อมูล Mockup ใหม่
console.log('📊 ข้อมูลผู้ใช้ (Mockup):');
console.log(`อายุ: ${MOCKUP_USER_PROFILE.age} ปี`);
console.log(`น้ำหนักปัจจุบัน: ${MOCKUP_USER_PROFILE.weight} kg`);
console.log(`น้ำหนักเป้าหมาย: ${MOCKUP_USER_PROFILE.target_weight} kg`);
console.log(`ส่วนสูง: ${MOCKUP_USER_PROFILE.height} cm`);
console.log(`เพศ: ${MOCKUP_USER_PROFILE.gender}`);
console.log(`เป้าหมาย: ${MOCKUP_USER_PROFILE.target_goal} (เพิ่มน้ำหนัก)`);
console.log(`ระดับกิจกรรม: ${MOCKUP_USER_PROFILE.activity_level}`);

console.log('\n🧮 รายละเอียดการคำนวณ:');
const details = getCalculationDetails(MOCKUP_USER_PROFILE);

console.log('\n1. การคำนวณ BMR:');
console.log(`   สูตร: ${details.calculations.bmr.formula}`);
console.log(`   ผลลัพธ์: ${details.calculations.bmr.result} kcal`);

console.log('\n2. การคำนวณ TDEE:');
console.log(`   สูตร: ${details.calculations.tdee.formula}`);
console.log(`   ผลลัพธ์: ${details.calculations.tdee.result} kcal`);

console.log('\n3. การคำนวณแคลอรี่เป้าหมาย:');
console.log(`   น้ำหนักที่ต้องเพิ่ม: ${details.calculations.targetCalories.weightDifference} kg`);
console.log(`   พลังงานส่วนเกินทั้งหมด: ${details.calculations.targetCalories.totalCaloriesDifference} kcal`);
console.log(`   พลังงานส่วนเกินต่อวัน: ${Math.round(details.calculations.targetCalories.dailyCaloriesDifference)} kcal/วัน`);
console.log(`   ระยะเวลา: ${details.calculations.targetCalories.planDuration} วัน`);
console.log(`   แคลอรี่เป้าหมาย: ${details.calculations.targetCalories.result} kcal`);

console.log('\n4. สัดส่วนสารอาหารหลัก (Hybrid Method):');
console.log(`   📍 วิธีใหม่: คำนวณโปรตีนก่อนตามน้ำหนักตัว แล้วแบ่งพลังงานที่เหลือ`);

const finalResult = calculateRecommendedNutrition(MOCKUP_USER_PROFILE);
const targetCal = finalResult.cal;
const targetWeight = parseFloat(MOCKUP_USER_PROFILE.target_weight);

// คำนวณรายละเอียดเพื่อแสดงการทำงานของ Hybrid Method
const proteinPerKg = 2.0; // สำหรับ increase goal
const proteinGrams = Math.round(targetWeight * proteinPerKg);
const proteinCalories = proteinGrams * 4;
const remainingCalories = targetCal - proteinCalories;
const carbCalories = Math.round(remainingCalories * 0.65);
const fatCalories = Math.round(remainingCalories * 0.35);

console.log(`\n   🥩 โปรตีน (คำนวณก่อน):`);
console.log(`      สูตร: น้ำหนักเป้าหมาย × โปรตีนต่อกิโลกรัม`);
console.log(`      คำนวณ: ${targetWeight} kg × ${proteinPerKg} g/kg = ${proteinGrams} กรัม`);
console.log(`      แคลอรี่จากโปรตีน: ${proteinGrams} × 4 = ${proteinCalories} kcal`);

console.log(`\n   🔥 พลังงานที่เหลือ:`);
console.log(`      แคลอรี่เป้าหมาย - แคลอรี่โปรตีน = ${targetCal} - ${proteinCalories} = ${remainingCalories} kcal`);

console.log(`\n   🍞 คาร์โบไฮเดรต (จากพลังงานที่เหลือ 65%):`);
console.log(`      แคลอรี่จากคาร์บ: ${remainingCalories} × 0.65 = ${carbCalories} kcal`);
console.log(`      ปริมาณคาร์บ: ${carbCalories} ÷ 4 = ${finalResult.carb} กรัม`);

console.log(`\n   🥑 ไขมัน (จากพลังงานที่เหลือ 35%):`);
console.log(`      แคลอรี่จากไขมัน: ${remainingCalories} × 0.35 = ${fatCalories} kcal`);
console.log(`      ปริมาณไขมัน: ${fatCalories} ÷ 9 = ${finalResult.fat} กรัม`);

// ผลลัพธ์สุดท้าย
console.log('\n✅ ผลลัพธ์สุดท้าย:');
console.log(`📈 แคลอรี่เป้าหมาย: ${finalResult.cal} kcal/วัน`);
console.log(`🍞 คาร์โบไฮเดรต: ${finalResult.carb} กรัม`);
console.log(`🥩 โปรตีน: ${finalResult.protein} กรัม`);
console.log(`🥑 ไขมัน: ${finalResult.fat} กรัม`);
console.log(`⚡ BMR: ${finalResult.bmr} kcal`);
console.log(`🔥 TDEE: ${finalResult.tdee} kcal`);

// ทดสอบกรณีอื่นๆ
console.log('\n\n=== ทดสอบกรณีอื่นๆ (Hybrid Method) ===');

// กรณีลดน้ำหนัก (โปรตีน 2.2 g/kg, คาร์บ:ไขมัน = 50:50)
const weightLossProfile: UserProfileData = {
  ...MOCKUP_USER_PROFILE,
  target_goal: 'decrease',
  weight: '70',
  target_weight: '65'
};

console.log('\n📉 กรณีลดน้ำหนัก:');
console.log(`   โปรตีน: 2.2 g/kg น้ำหนักเป้าหมาย`);
console.log(`   พลังงานที่เหลือ: คาร์โบไฮเดรต 50%, ไขมัน 50%`);
const weightLossResult = calculateRecommendedNutrition(weightLossProfile);
console.log(`   แคลอรี่เป้าหมาย: ${weightLossResult.cal} kcal`);
console.log(`   โปรตีน: ${weightLossResult.protein}g, คาร์บ: ${weightLossResult.carb}g, ไขมัน: ${weightLossResult.fat}g`);

// กรณีรักษาสุขภาพ (โปรตีน 1.6 g/kg, คาร์บ:ไขมัน = 60:40)
const healthyProfile: UserProfileData = {
  ...MOCKUP_USER_PROFILE,
  target_goal: 'healthy',
  target_weight: '52' // น้ำหนักเดิม
};

console.log('\n💚 กรณีรักษาสุขภาพ:');
console.log(`   โปรตีน: 1.6 g/kg น้ำหนักเป้าหมาย`);
console.log(`   พลังงานที่เหลือ: คาร์โบไฮเดรต 60%, ไขมัน 40%`);
const healthyResult = calculateRecommendedNutrition(healthyProfile);
console.log(`   แคลอรี่เป้าหมาย: ${healthyResult.cal} kcal`);
console.log(`   โปรตีน: ${healthyResult.protein}g, คาร์บ: ${healthyResult.carb}g, ไขมัน: ${healthyResult.fat}g`);

console.log('\n\n=== เปรียบเทียบวิธีเดิมกับ Hybrid Method ===');
console.log('สำหรับเป้าหมาย "เพิ่มน้ำหนัก" 52→54 kg:');
console.log('วิธีเดิม (เปอร์เซ็นต์): โปรตีน ~210g, คาร์บ ~315g, ไขมัน ~78g');
console.log(`Hybrid Method (แนะนำ): โปรตีน ${finalResult.protein}g, คาร์บ ${finalResult.carb}g, ไขมัน ${finalResult.fat}g`);
console.log('👉 Hybrid Method ให้โปรตีนที่เหมาะสมกว่าและคาร์บสูงขึ้นเพื่อการสร้างกล้ามเนื้อ');

export { details, finalResult, weightLossResult, healthyResult };
