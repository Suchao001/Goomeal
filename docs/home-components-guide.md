# HomeScreen Components Documentation

## ภาพรวม

ได้เพิ่มคอมโพเนนต์ใหม่ 2 ตัวในหน้า HomeScreen เพื่อแสดงข้อมูลแคลอรี่และมื้ออาหารประจำวัน

## คอมโพเนนต์ที่เพิ่ม

### 1. CaloriesSummary

แสดงสรุปแคลอรี่และสารอาหารประจำวัน

#### Props
```typescript
interface CaloriesSummaryProps {
  caloriesConsumed: number;    // แคลอรี่ที่กินไปแล้ว
  caloriesTarget: number;      // เป้าหมายแคลอรี่ต่อวัน
  protein: NutritionData;      // ข้อมูลโปรตีน
  carbs: NutritionData;        // ข้อมูลคาร์โบไฮเดรต
  fat: NutritionData;          // ข้อมูลไขมัน
}

interface NutritionData {
  current: number;    // ปริมาณปัจจุบัน
  target: number;     // เป้าหมาย
  unit: string;       // หน่วย (g, mg)
  color: string;      // สีแทน nutrient
  icon: string;       // ไอคอน Ionicons
}
```

#### Features
- **Circular Progress**: แสดงความคืบหน้าแคลอรี่แบบวงกลม
- **Nutrition Breakdown**: แสดงโปรตีน คาร์บ ไขมัน พร้อม progress bar
- **Smart Status**: บอกแคลอรี่ที่เหลือ หรือเกินเป้าหมาย
- **Responsive Colors**: เปลี่ยนสีตามสถานะ (ปกติ/เกิน)

### 2. TodayMeals

แสดงรายการมื้ออาหารประจำวัน แบ่งตามประเภท

#### Props
```typescript
interface TodayMealsProps {
  meals: MealData[];                                    // รายการอาหาร
  onAddMeal: (mealType: MealData['mealType']) => void; // เพิ่มอาหาร
  onEditMeal: (meal: MealData) => void;               // แก้ไขอาหาร
}

interface MealData {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodName: string;
  calories: number;
  image?: any;        // รูปภาพ local (require)
  imageUrl?: string;  // รูปภาพ URL
  time?: string;      // เวลา
}
```

#### Features
- **Meal Categories**: แบ่งตามมื้อ (เช้า/เที่ยง/เย็น/ของว่าง)
- **Visual Icons**: ไอคอนและสีที่แตกต่างกันตามมื้อ
- **Add/Edit Actions**: ปุ่มเพิ่มและแก้ไขอาหาร
- **Image Support**: รองรับรูปภาพแบบ local และ URL
- **Calorie Summary**: สรุปแคลอรี่ต่อมื้อและรวม
- **Empty States**: แสดง placeholder เมื่อไม่มีอาหาร

## การใช้งานใน HomeScreen

```typescript
// Mock data
const caloriesData = {
  consumed: 800,
  target: 1500,
  protein: { current: 45, target: 75, unit: 'g', color: '#ef4444', icon: 'fitness' },
  carbs: { current: 120, target: 200, unit: 'g', color: '#22c55e', icon: 'leaf' },
  fat: { current: 30, target: 60, unit: 'g', color: '#f59e0b', icon: 'water' }
};

const todayMeals: MealData[] = [
  {
    id: '1',
    mealType: 'breakfast',
    foodName: 'ข้าวโอ๊ตกับผลไม้',
    calories: 250,
    image: require('../../assets/images/Foodtype_1.png'),
    time: '07:30'
  }
  // ... more meals
];

// Render
<CaloriesSummary
  caloriesConsumed={caloriesData.consumed}
  caloriesTarget={caloriesData.target}
  protein={caloriesData.protein}
  carbs={caloriesData.carbs}
  fat={caloriesData.fat}
/>

<TodayMeals
  meals={todayMeals}
  onAddMeal={handleAddMeal}
  onEditMeal={handleEditMeal}
/>
```

## Meal Type Mapping

| Type | Thai Label | Icon | Color |
|------|------------|------|-------|
| breakfast | มื้อเช้า | sunny | #f59e0b |
| lunch | มื้อเที่ยง | partly-sunny | #10b981 |
| dinner | มื้อเย็น | moon | #6366f1 |
| snack | ของว่าง | cafe | #f97316 |

## UI Design Features

### CaloriesSummary
- วงกลม progress สำหรับแคลอรี่หลัก
- Progress bars สำหรับสารอาหาร
- สีที่เปลี่ยนตามสถานะ
- Typography ที่ชัดเจน

### TodayMeals
- Group อาหารตามมื้อ
- แสดงรูปภาพอาหาร (หรือ placeholder)
- ปุ่ม + สำหรับเพิ่มอาหาร
- Dashed border สำหรับ empty state
- สรุปแคลอรี่ต่อมื้อ

## การต่อยอด

1. **API Integration**: เชื่อมต่อกับ backend เพื่อดึงข้อมูลจริง
2. **Real-time Updates**: อัปเดตข้อมูลเมื่อเพิ่ม/แก้ไขอาหาร
3. **Charts**: เพิ่มกราฟแสดงแนวโน้มแคลอรี่
4. **Notifications**: แจ้งเตือนเมื่อใกล้เป้าหมายหรือเกิน
5. **Export**: ส่งออกข้อมูลเป็น PDF หรือ Excel

## Files ที่เกี่ยวข้อง

- `components/CaloriesSummary.tsx` - คอมโพเนนต์สรุปแคลอรี่
- `components/TodayMeals.tsx` - คอมโพเนนต์มื้ออาหาร
- `screens/home/HomeScreen.tsx` - หน้าหลักที่ใช้งาน
