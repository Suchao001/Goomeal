# ระบบแนะนำการกินรายวัน (Daily Food Recommendation System)

ระบบแนะนำการกินอาหารอัจฉริยะที่ช่วยวิเคราะห์และให้คำแนะนำรายวันตามข้อมูลโภชนาการและเป้าหมายของผู้ใช้

## 📁 ไฟล์ที่เกี่ยวข้อง

```
utils/
├── dailyRecommendationService.ts    # Core service และ functions
├── dailyRecommendationTest.ts       # Mock data และการทดสอบ
└── dailyRecommendationIndex.ts      # Export รวมและ helper functions

components/
├── SmartFoodRecommendation.tsx      # Component หลักสำหรับแอป
└── DailyRecommendationDisplay.tsx   # Component สำหรับทดสอบ

docs/
└── food-recommendation-system.md    # เอกสารรายละเอียดฉบับเต็ม
```

## 🚀 วิธีการใช้งาน

### 1. การใช้งานพื้นฐาน

```typescript
import { createDailyAdvice } from '../utils/dailyRecommendationIndex';

// สร้างคำแนะนำแบบง่าย
const advice = createDailyAdvice(
  1847, 85, 234, 62,    // ข้อมูลที่กินจริง (แคลอรี่, โปรตีน, คาร์บ, ไขมัน)
  1800, 90, 225, 60,    // ข้อมูลเป้าหมาย
  70,                   // น้ำหนักตัว (kg)
  'decrease'            // เป้าหมาย: 'decrease', 'increase', 'healthy'
);

console.log(advice.summary);           // "📊 คะแนนรวม: 100/100 (เยี่ยมมาก)"
console.log(advice.nutritionAdvice);   // ["✅ แคลอรี่: 103% - เหมาะสม", ...]
console.log(advice.tomorrowTips);      // ["🚶‍♀️ เดินขึ้นลงบันไดในออฟฟิศ แทนลิฟต์", ...]
```

### 2. การใช้งานใน React Component

```typescript
import React from 'react';
import SmartFoodRecommendation from '../components/SmartFoodRecommendation';

const MyScreen = () => {
  return (
    <SmartFoodRecommendation 
      userId="user123" 
      date="2025-08-27" 
    />
  );
};
```

### 3. การทดสอบด้วย Mock Data

```typescript
import { DailyRecommendationTestScreen } from '../components/DailyRecommendationDisplay';

// ใช้ในแอปเพื่อทดสอบ scenarios ต่างๆ
export default function TestScreen() {
  return <DailyRecommendationTestScreen />;
}
```

## 🧪 การทดสอบ

### รันการทดสอบใน Terminal

```bash
cd /path/to/goodmeal-app
npx ts-node -e "
import { runAllTests } from './utils/dailyRecommendationTest';
runAllTests();
"
```

### ทดสอบ Scenarios ต่างๆ

```typescript
import { getExampleScenarios } from '../utils/dailyRecommendationIndex';

const scenarios = getExampleScenarios();
console.log(`มี ${scenarios.length} scenarios ในการทดสอบ`);

scenarios.forEach(scenario => {
  console.log(`- ${scenario.name}`);
});
```

## 📊 ผลลัพธ์ที่ได้รับ

### คะแนนและเกรด
- **90-100**: เยี่ยมมาก 🌟
- **80-89**: ดีมาก ✅  
- **70-79**: ดี 👍
- **60-69**: พอใช้ ⚠️
- **<60**: ควรปรับปรุง 🔄

### คำแนะนำที่ได้รับ
- **โภชนาการ**: วิเคราะห์แคลอรี่ โปรตีน คาร์บ ไขมัน
- **กิจกรรม**: แนะนำการออกกำลังกายตามเป้าหมาย
- **น้ำ**: คำนวณความต้องการน้ำตามน้ำหนัก
- **เวลา**: คำแนะนำเวลาการกินที่เหมาะสม
- **เคล็ดลับ**: เคล็ดลับปฏิบัติสำหรับพรุ่งนี้

## 🔧 การปรับแต่ง

### เปลี่ยนเกณฑ์การประเมิน

```typescript
// ในไฟล์ dailyRecommendationService.ts
export function assessNutrient(actual: number, target: number, type: string) {
  const percentage = (actual / target) * 100;
  
  // ปรับเกณฑ์การให้คะแนนได้ที่นี่
  if (percentage >= 90 && percentage <= 110) return { status: 'excellent', score: 25, percentage };
  // ...
}
```

### เพิ่มคำแนะนำใหม่

```typescript
// ในไฟล์ dailyRecommendationService.ts
export function generateNutritionAdvice(assessments: DailyAssessment): string[] {
  const advice: string[] = [];
  
  // เพิ่มคำแนะนำใหม่ได้ที่นี่
  advice.push("🆕 คำแนะนำใหม่ของคุณ");
  
  return advice;
}
```

## 📱 การใช้งานในแอป Goodmeal

### เชื่อมต่อกับข้อมูลจริง

```typescript
// แทนที่ mock functions ด้วย API จริง
const getUserData = async (userId: string) => {
  // เรียก API หรือ database จริง
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
};

const getDailyNutritionSummary = async (userId: string, date: string) => {
  // เรียกข้อมูลจาก daily_nutrition_summary table
  const response = await fetch(`/api/nutrition/daily/${userId}/${date}`);
  return response.json();
};
```

### รวมเข้ากับ EatingReportScreen

```typescript
// ในไฟล์ screens/reports/EatingReportScreen.tsx
import SmartFoodRecommendation from '../../components/SmartFoodRecommendation';

export default function EatingReportScreen() {
  return (
    <ScrollView>
      {/* เนื้อหาเดิม */}
      
      {/* เพิ่มระบบแนะนำ */}
      <SmartFoodRecommendation 
        userId={currentUser.id} 
        date={selectedDate}
      />
    </ScrollView>
  );
}
```

## 🎯 ตัวอย่างผลลัพธ์

```
📅 2025-08-27
📊 คะแนนรวม: 82/100 (ดีมาก)

💪 โภชนาการ:
✅ แคลอรี่: 103% - เหมาะสม
⚠️ โปรตีน: 81% - ควรเสริมโปรตีน เช่น ไข่, ไก่, ปลา, ถั่ว หรือนมถั่วเหลือง
✅ คาร์บ: 104% - พลังงานเพียงพอ ร่างกายได้รับคาร์บที่เหมาะสม
✅ ไขมัน: 103% - ไขมันดีอยู่ในเกณฑ์ที่เหมาะสม

🏃‍♂️ กิจกรรม:
✅ ออกกำลังกายเบาๆ 20-30 นาที จะช่วยเผาผลาญดีขึ้น

💧 น้ำ:
💧 ดื่มน้ำอย่างน้อย 10 แก้ว/วัน (2450ml)

🎯 เคล็ดลับพรุ่งนี้:
1. เพิ่มโปรตีน: ใส่ไข่ต้มในสลัด หรือทานปลาเผา
2. เดินขึ้นลงบันไดในออฟฟิศ แทนลิฟต์
3. ตั้งปลุกดื่มน้ำทุก 2 ชั่วโมง
```

## 📚 เอกสารเพิ่มเติม

ดูเอกสารฉบับเต็มได้ที่ `docs/food-recommendation-system.md` สำหรับรายละเอียดเชิงลึกเกี่ยวกับ:
- สูตรการคำนวณ
- อัลกอริทึม
- ตัวชี้วัด
- การพัฒนาต่อยอด
