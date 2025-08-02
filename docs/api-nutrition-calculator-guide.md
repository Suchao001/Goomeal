# API-based Nutrition Calculator Usage Guide

## การเปลี่ยนแปลงที่ทำ

### 1. เปลี่ยนจาก Mock-up เป็น API-based
- ย้ายจาก `getMockupRecommendedNutrition()` เป็นการดึงข้อมูลจาก AuthContext
- ใช้ข้อมูล user profile จริงเพื่อคำนวณโภชนาการที่แนะนำ
- เพิ่ม caching เพื่อไม่ต้องคำนวณใหม่ทุกครั้ง

### 2. ไฟล์ใหม่ที่สร้าง

#### `utils/userProfileMapper.ts`
```typescript
// แปลง User data จาก AuthContext เป็น UserProfileData
export function mapAuthUserToUserProfile(authUser: AuthUser | null): UserProfileData | null
export function isUserProfileComplete(authUser: AuthUser | null): boolean
export function getDefaultNutritionData(): RecommendedNutrition
```

#### `hooks/useRecommendedNutrition.ts`
```typescript
// Custom hook สำหรับการใช้งาน nutrition data
export function useRecommendedNutrition(): {
  nutrition: RecommendedNutrition;
  isCalculated: boolean;
  isProfileComplete: boolean;
}

export function useCalorieProgress(): {
  recommendedCalories: number;
  isCalculated: boolean;
  getProgress: (currentCalories: number) => number;
  getStatus: (currentCalories: number) => string;
}
```

### 3. การอัปเดต MealPlanStore
- เพิ่ม `nutritionCache` สำหรับเก็บข้อมูลที่คำนวณแล้ว
- เพิ่ม `getRecommendedNutrition()` function ที่มี caching
- เพิ่ม `clearNutritionCache()` สำหรับล้าง cache เมื่อข้อมูล user เปลี่ยน

### 4. การอัปเดต AuthContext
- เพิ่มการ clear nutrition cache เมื่อ user profile เปลี่ยน
- เพิ่มการ clear cache เมื่อ logout

### 5. การอัปเดต MealPlanScreen
- ใช้ `useRecommendedNutrition()` hook แทน mockup function
- แสดง indicator เมื่อข้อมูล profile ไม่สมบูรณ์
- แสดงสถานะว่าข้อมูลมาจากการคำนวณจริงหรือค่าเริ่มต้น

## วิธีการใช้งาน

### ในคอมโพเนนต์อื่นๆ
```typescript
import { useRecommendedNutrition } from '../hooks/useRecommendedNutrition';

function MyComponent() {
  const { nutrition, isCalculated, isProfileComplete } = useRecommendedNutrition();
  
  if (!isProfileComplete) {
    return <Text>กรุณาเพิ่มข้อมูลโปรไฟล์</Text>;
  }
  
  return (
    <View>
      <Text>แคลอรี่ที่แนะนำ: {nutrition.cal} kcal</Text>
      <Text>โปรตีน: {nutrition.protein}g</Text>
      {isCalculated && <Text>คำนวณจากข้อมูลโปรไฟล์ของคุณ</Text>}
    </View>
  );
}
```

### ใช้ Progress Calculator
```typescript
import { useCalorieProgress } from '../hooks/useRecommendedNutrition';

function CalorieProgress({ currentCalories }) {
  const { getProgress, getStatus, recommendedCalories } = useCalorieProgress();
  
  const progress = getProgress(currentCalories);
  const status = getStatus(currentCalories);
  
  return (
    <View>
      <Text>Progress: {progress.toFixed(1)}%</Text>
      <Text>Status: {status}</Text>
      <Text>{currentCalories} / {recommendedCalories} kcal</Text>
    </View>
  );
}
```

## Features ที่เพิ่ม

### 1. Smart Caching
- Cache ข้อมูลโภชนาการเป็นเวลา 24 ชั่วโมง
- ล้าง cache อัตโนมัติเมื่อข้อมูล user เปลี่ยน
- ป้องกันการคำนวณซ้ำๆ ที่ไม่จำเป็น

### 2. Fallback Mechanism
- ใช้ค่าเริ่มต้นเมื่อข้อมูล profile ไม่สมบูรณ์
- แสดง warning เมื่อใช้ค่าเริ่มต้น
- ป้องกันไม่ให้แอป crash เมื่อข้อมูลไม่ครบ

### 3. Real-time Updates
- อัปเดตข้อมูลอัตโนมัติเมื่อ user profile เปลี่ยน
- ล้าง cache เมื่อ logout
- รองรับการเปลี่ยนแปลงข้อมูลแบบ real-time

### 4. Performance Optimization
- ไม่คำนวณใหม่ทุกครั้งที่ render
- ใช้ useMemo และ caching อย่างมีประสิทธิภาพ
- ลด API calls ที่ไม่จำเป็น

## ข้อมูลที่ต้องการใน User Profile

```typescript
interface RequiredUserData {
  age: number;           // อายุ
  weight: number;        // น้ำหนักปัจจุบัน
  height: number;        // ส่วนสูง
  gender: string;        // เพศ
  body_fat: string;      // ระดับไขมัน
  target_goal: string;   // เป้าหมาย
  target_weight: number; // น้ำหนักเป้าหมาย
  activity_level: string; // ระดับการออกกำลังกาย
}
```

หากข้อมูลใดไม่ครบ ระบบจะแสดง warning และใช้ค่าเริ่มต้น (2000 kcal)
