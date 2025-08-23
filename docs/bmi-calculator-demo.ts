/**
 * BMI Calculator Demo - เทสต์ระบบคำนวณ BMI ใหม่
 * แสดงตัวอย่างการทำงานสำหรับผู้ใหญ่และเด็ก
 */

// ตัวอย่างการใช้งานระบบ BMI ใหม่

// === ตัวอย่าง 1: ผู้ใหญ่ (อายุ 25 ปี) ===
const adultExample = {
  weight: 70, // kg
  height: 170, // cm
  age: 25,
  gender: 'male'
};

// Result: { bmi: 24.2, category: 'ปกติ', isChild: false, description: '...' }

// === ตัวอย่าง 2: เด็ก (อายุ 15 ปี) ===
const childExample = {
  weight: 50, // kg
  height: 160, // cm
  age: 15,
  gender: 'male'
};

// Result: { 
//   bmi: 19.5, 
//   category: 'ปกติ', 
//   isChild: true, 
//   percentileInfo: 'อยู่ใน percentile ที่ 5-85',
//   description: 'น้ำหนักอยู่ในเกณฑ์ปกติสำหรับเด็กในช่วงอายุนี้'
// }

// === ความแตกต่างระหว่างผู้ใหญ่กับเด็ก ===

// ผู้ใหญ่ (≥20 ปี):
// - ใช้เกณฑ์ BMI มาตรฐาน
// - Underweight: < 18.5
// - Normal: 18.5-24.9
// - Overweight: 25-29.9
// - Obese: 30-34.9
// - Extremely Obese: ≥ 35

// เด็ก (<20 ปี):
// - ใช้ BMI-for-age percentiles
// - น้ำหนักต่ำ: < 5th percentile
// - ปกติ: 5th-85th percentile
// - เกินน้ำหนัก: 85th-95th percentile
// - อ้วน: ≥ 95th percentile

export default {
  adultExample,
  childExample,
  description: 'แยกไฟล์ BMI Calculator สำเร็จ - รองรับทั้งผู้ใหญ่และเด็ก'
};
