# MealPlanScreenEdit UI และ useRecommendedNutrition Upgrade Guide

## การเปลี่ยนแปลงที่ทำ

### 1. เพิ่ม import useRecommendedNutrition
```typescript
import { useRecommendedNutrition } from '../../hooks/useRecommendedNutrition';
```

### 2. เพิ่มการใช้งาน hook
```typescript
// Get recommended nutrition from user profile with caching
const { nutrition: recommendedNutrition, isCalculated, isProfileComplete } = useRecommendedNutrition();
```

### 3. อัปเดต Daily Calories Summary UI

#### เพิ่ม Profile Status Indicator
- แสดง warning เมื่อข้อมูล profile ไม่สมบูรณ์
- แสดงสถานะว่าข้อมูลมาจากการคำนวณจริงหรือค่าเริ่มต้น

#### เพิ่ม Progress Bars
- Progress bar สำหรับแคลอรี่
- Progress bars แยกสำหรับ คาร์บ, โปรตีน, ไขมัน
- แสดงค่าเป้าหมายและค่าปัจจุบัน

#### สีและสไตล์
- คาร์บ: สีส้ม (orange)
- โปรตีน: สีเขียว (green)  
- ไขมัน: สีม่วง (purple)

### 4. อัปเดต Meal Card UI

#### Nutrition Summary
- ใช้ layout แนวนอนแบบกะทัดรัด
- แสดงค่าโภชนาการแยกเป็น คาร์บ, โปรตีน, ไขมัน
- แสดงแคลอรี่รวมด้านขวา

#### Food Items
- เพิ่มขนาดรูปภาพจาก 8x8 เป็น 12x12
- ปรับ layout ให้สวยงามและใช้พื้นที่ได้ดีขึ้น
- ลบหัวข้อ "รายการอาหาร" เพื่อประหยัดพื้นที่

#### Add More Meals Button  
- ลดขนาด icon จาก 48 เป็น 22 เพื่อความสมดุล
- ใช้สไตล์เดียวกับ MealPlanScreen

## ผลลัพธ์

### ✅ Features ที่เพิ่ม
1. **API-based Nutrition Data** - ใช้ข้อมูลจาก user profile จริง
2. **Smart Caching** - ไม่ต้องคำนวณใหม่ทุกครั้ง
3. **Profile Status Indicator** - แจ้งเตือนเมื่อข้อมูลไม่สมบูรณ์
4. **Enhanced Progress Tracking** - แสดง progress bars แยกตามประเภทโภชนาการ
5. **Better Visual Hierarchy** - UI ที่สวยงามและใช้งานง่ายขึ้น

### 🎨 UI Improvements
1. **Consistent Design** - UI เหมือนกับ MealPlanScreen ธรรมดา
2. **Compact Layout** - ใช้พื้นที่ได้ดีขึ้น
3. **Better Visual Feedback** - แสดงสถานะและความคืบหน้าชัดเจน
4. **Improved Accessibility** - ข้อมูลแสดงผลเข้าใจง่าย

### 📊 Data Features
- **Real-time Calculation** - คำนวณจากข้อมูล user จริง
- **Fallback Support** - ใช้ค่าเริ่มต้นเมื่อข้อมูลไม่ครบ
- **Cache Optimization** - เก็บผลลัพธ์การคำนวณไว้ใช้ซ้ำ
- **Auto Updates** - อัปเดตอัตโนมัติเมื่อ profile เปลี่ยน

## การใช้งาน

หน้า MealPlanScreenEdit ตอนนี้มี features เหมือนกับ MealPlanScreen:

1. **แสดงค่าโภชนาการที่แนะนำ** จากข้อมูล user profile
2. **Progress tracking แบบ real-time** สำหรับแคลอรี่และมาโครนิวเตรียนต์
3. **Warning indicators** เมื่อข้อมูล profile ไม่สมบูรณ์
4. **Consistent UI/UX** กับหน้าอื่นๆ ในแอป

## เปรียบเทียบ Before vs After

### Before
- UI แบบพื้นฐาน ไม่มี progress tracking
- ไม่มีการแสดงค่าแนะนำ
- ไม่มี profile status indicator
- Layout ใช้พื้นที่ไม่มีประสิทธิภาพ

### After  
- UI ที่สมบูรณ์พร้อม progress bars
- ใช้ข้อมูลจาก API และมี caching
- แสดงสถานะ profile และ fallback
- Layout ที่กะทัดรัดและสวยงาม

ตอนนี้ MealPlanScreenEdit และ MealPlanScreen มี functionality และ UI ที่เหมือนกัน ทำให้ user experience สอดคล้องกันทั้งในโหมดสร้างแผนใหม่และแก้ไขแผนเก่า!
