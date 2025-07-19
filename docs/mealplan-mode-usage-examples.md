# MealPlan Mode Usage Examples

## Overview
MealPlanScreen ตอนนี้รองรับสองโหมด:

1. **Add Mode** - สร้างแผนอาหารใหม่
2. **Edit Mode** - แก้ไขแผนอาหารที่มีอยู่

## Usage Examples

### 1. Add Mode (สร้างแผนใหม่)

```typescript
// Navigate to MealPlan screen for creating new plan
navigation.navigate('MealPlan', {
  mode: 'add'
});

// หรือไม่ต้องส่ง parameters เลย (จะเป็น add mode โดยอัตโนมัติ)
navigation.navigate('MealPlan');
```

### 2. Edit Mode (แก้ไขแผนที่มีอยู่)

```typescript
// Navigate to MealPlan screen for editing existing plan
navigation.navigate('MealPlan', {
  mode: 'edit',
  foodPlanId: 123  // ID ของแผนอาหารที่ต้องการแก้ไข
});
```

## Features Comparison

| Feature | Add Mode | Edit Mode |
|---------|----------|-----------|
| หัวข้อหน้า | "วางแผนเมนูอาหาร" | "แก้ไขแผนอาหาร" |
| ข้อมูลเริ่มต้น | หน้าว่างเปล่า | โหลดจาก API ด้วย foodPlanId |
| ปุ่มบันทึก | "บันทึกแผน" | "อัพเดทแผน" |
| Loading Screen | ไม่มี | แสดงขณะโหลดข้อมูล |
| API Call | `saveFoodPlan()` | `updateUserFoodPlan()` |
| การกลับ | อยู่ในหน้าเดิม | กลับไปหน้าเดิมหลังอัพเดท |

## API Integration

### Loading Plan Data (Edit Mode)
```typescript
// Hook จะเรียก API อัตโนมัติเมื่อเป็น edit mode
const result = await apiClient.getUserFoodPlanById(foodPlanId);

// ข้อมูลที่ได้จะถูกโหลดลงใน Zustand store
useMealPlanStore.loadMealPlanData(result.data);
```

### Saving Plan Data
```typescript
// Add Mode
const result = await apiClient.saveFoodPlan({
  name: planName,
  description: planDescription,
  plan: mealPlanData,
  image: planImage
});

// Edit Mode  
const result = await apiClient.updateUserFoodPlan(foodPlanId, {
  name: planName,
  description: planDescription,
  plan: mealPlanData,
  image: planImage
});
```

## Navigation Parameters Type

```typescript
type MealPlanParams = {
  selectedFood?: any;
  mealId?: string;
  selectedDay?: number;
  mode?: 'add' | 'edit';        // โหมดการทำงาน
  foodPlanId?: number;          // ID สำหรับ edit mode
  planData?: any;               // (Optional) ข้อมูลเผื่อไว้
} | undefined;
```

## State Management

### useMealPlanMode Hook
```typescript
const mealPlanMode = useMealPlanMode(mode, foodPlanId);

// Properties
mealPlanMode.mode              // 'add' | 'edit'
mealPlanMode.isLoading         // boolean
mealPlanMode.planName          // string
mealPlanMode.planDescription   // string
mealPlanMode.planImage         // string | null

// Methods
mealPlanMode.savePlan(data)           // Save or update plan
mealPlanMode.updatePlanMetadata({})   // Update plan metadata
mealPlanMode.getScreenTitle()         // Get screen title
mealPlanMode.getSaveButtonText()      // Get save button text
```

### Zustand Store Updates
```typescript
// New function added to store
loadMealPlanData(planData: any) => void

// Convert API data format to internal format automatically
// Handle both string and object plan_data
// Clear existing data before loading new data
```

## Error Handling

1. **Loading Error (Edit Mode)**
   - แสดง Alert เมื่อโหลดข้อมูลไม่สำเร็จ
   - กลับไปหน้าเดิมหรือให้ user retry

2. **Save Error**
   - แสดง Alert ข้อผิดพลาด
   - ไม่ปิด modal ให้ user ลองใหม่

3. **Validation Error**
   - เช็คชื่อแผนอาหารว่างเปล่า
   - เช็คว่ามีข้อมูลอาหารหรือไม่

## UI Enhancements

1. **Loading Screen** - แสดงเมื่อโหลดข้อมูลใน edit mode
2. **Dynamic Titles** - หัวข้อและปุ่มเปลี่ยนตามโหมด
3. **Mode Indicators** - ผู้ใช้รู้ว่าอยู่ในโหมดไหน
4. **Auto Navigation** - กลับไปหน้าเดิมหลังอัพเดทใน edit mode

## Example Implementation

### From Plan List Screen
```typescript
const handleEditPlan = (planId: number) => {
  navigation.navigate('MealPlan', {
    mode: 'edit',
    foodPlanId: planId
  });
};

const handleCreateNewPlan = () => {
  navigation.navigate('MealPlan', {
    mode: 'add'
  });
};
```

### From Home Screen
```typescript
const handlePlanMeal = () => {
  // Always create new plan from home
  navigation.navigate('MealPlan', {
    mode: 'add'
  });
};
```

## Testing Scenarios

1. **Add Mode Test**
   - เริ่มต้นด้วยหน้าว่าง ✓
   - เพิ่มอาหารได้ ✓
   - บันทึกแผนใหม่ได้ ✓
   - หัวข้อแสดง "วางแผนเมนูอาหาร" ✓

2. **Edit Mode Test**
   - โหลดข้อมูลแผนที่มีอยู่ ✓
   - แสดง loading screen ✓
   - แก้ไขข้อมูลได้ ✓
   - อัพเดทแผนได้ ✓
   - หัวข้อแสดง "แก้ไขแผนอาหาร" ✓
   - กลับไปหน้าเดิมหลังอัพเดท ✓

3. **Error Handling Test**
   - แสดง error เมื่อโหลดไม่สำเร็จ ✓
   - แสดง error เมื่อบันทึกไม่สำเร็จ ✓
   - Validation error handling ✓
