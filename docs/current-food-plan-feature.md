# Current Food Plan Feature Documentation

## Overview
ฟีเจอร์ "ตั้งเป็นแผนปัจจุบัน" ช่วยให้ผู้ใช้สามารถเลือกแผนอาหารใดแผนหนึ่งเป็นแผนหลักที่ใช้งานในปัจจุบัน

## Database Schema

### Table: user_food_plan_using
```sql
CREATE TABLE user_food_plan_using (
    id INT AUTO_INCREMENT PRIMARY KEY,
    food_plan_id INT NOT NULL,
    user_id INT NOT NULL,
    start_date DATE NOT NULL,
    is_repeat BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (food_plan_id) REFERENCES user_food_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_current_plan (user_id)
);
```

### Fields Description:
- `id`: Primary key
- `food_plan_id`: ID ของแผนอาหารที่เลือกเป็นปัจจุบัน
- `user_id`: ID ของผู้ใช้
- `start_date`: วันที่เริ่มใช้แผนนี้
- `is_repeat`: ระบุว่าแผนนี้จะซ้ำหรือไม่ (สำหรับอนาคต)
- `created_at`: วันที่สร้างระเบียน
- `updated_at`: วันที่อัพเดทระเบียนล่าสุด

### Constraints:
- แต่ละผู้ใช้สามารถมีแผนปัจจุบันได้เพียงแผนเดียว (UNIQUE constraint)

## API Endpoints

### 1. Set Current Food Plan
```
POST /user-food-plans/set-current
```

**Request Body:**
```json
{
  "food_plan_id": 123
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "ตั้งเป็นแผนปัจจุบันเรียบร้อยแล้ว",
  "data": {
    "food_plan_id": 123,
    "user_id": 456
  }
}
```

### 2. Get Current Food Plan
```
GET /user-food-plans/current
```

**Response (Success):**
```json
{
  "success": true,
  "message": "ดึงข้อมูลแผนปัจจุบันสำเร็จ",
  "data": {
    "id": 1,
    "food_plan_id": 123,
    "user_id": 456,
    "start_date": "2025-07-19",
    "is_repeat": false,
    "name": "แผนลดน้ำหนัก",
    "description": "แผนอาหารสำหรับลดน้ำหนัก",
    "plan_data": { /* plan object */ },
    "img": "/images/plan.jpg",
    "created_at": "2025-07-19T10:00:00.000Z"
  }
}
```

## Frontend Integration

### 1. SavePlanModal Component
เพิ่ม checkbox "ตั้งเป็นแผนปัจจุบัน":

```tsx
interface SavePlanModalProps {
  // ... existing props
  setAsCurrentPlan: boolean;
  setSetAsCurrentPlan: (value: boolean) => void;
}
```

### 2. useMealPlanMode Hook
เพิ่ม state และ logic สำหรับจัดการ current plan:

```tsx
interface MealPlanModeData {
  // ... existing fields
  setAsCurrentPlan: boolean; // Default: true
}

const savePlan = async (mealPlanData: any) => {
  // Save plan first
  const result = await apiClient.saveFoodPlan(data);
  
  // If setAsCurrentPlan is true, set as current
  if (result.success && setAsCurrentPlan && result.data?.id) {
    await apiClient.setCurrentFoodPlan(result.data.id);
  }
  
  return result;
};
```

### 3. ApiClient Methods
เพิ่ม methods สำหรับ current plan:

```tsx
async setCurrentFoodPlan(foodPlanId: number) {
  // POST /user-food-plans/set-current
}

async getCurrentFoodPlan() {
  // GET /user-food-plans/current  
}
```

## Business Logic

### Setting Current Plan:
1. ผู้ใช้สร้างหรือแก้ไขแผนอาหาร
2. เลือก checkbox "ตั้งเป็นแผนปัจจุบัน" (default: checked)
3. เมื่อบันทึกแผน:
   - บันทึกแผนอาหารก่อน
   - ถ้า checkbox checked: เรียก API ตั้งเป็นแผนปัจจุบัน
4. ระบบจะ:
   - อัพเดทระเบียนเดิม (ถ้ามี) หรือสร้างใหม่
   - ตั้ง start_date เป็นวันปัจจุบัน

### Getting Current Plan:
1. เรียก API ดึงแผนปัจจุบัน
2. ระบบ JOIN ตาราง user_food_plan_using กับ user_food_plans
3. ส่งข้อมูลแผนที่สมบูรณ์กลับไป

## UI/UX Flow

### Add Mode:
1. ผู้ใช้สร้างแผนใหม่
2. ใน SavePlanModal จะมี checkbox "ตั้งเป็นแผนปัจจุบัน" (checked by default)
3. ผู้ใช้สามารถ uncheck ได้ถ้าไม่ต้องการตั้งเป็นปัจจุบัน
4. เมื่อบันทึก จะตั้งเป็นแผนปัจจุบันอัตโนมัติ (ถ้า checked)

### Edit Mode:
1. ผู้ใช้แก้ไขแผนที่มีอยู่
2. ใน SavePlanModal จะมี checkbox เดียวกัน
3. ถ้า checked จะตั้งแผนนี้เป็นปัจจุบัน (แม้ว่าเดิมจะไม่ใช่ก็ตาม)

## Error Handling

### Validation:
- ตรวจสอบว่า food_plan_id มีอยู่จริง
- ตรวจสอบว่าแผนนั้นเป็นของผู้ใช้คนนี้
- ตรวจสอบ authentication

### Error Responses:
```json
{
  "success": false,
  "error": "ไม่พบแผนอาหารที่ระบุ"
}
```

## Testing Scenarios

### 1. New User (No Current Plan):
- สร้างแผนใหม่ with checkbox checked
- ควรสร้างระเบียนใหม่ใน user_food_plan_using

### 2. Existing User (Has Current Plan):
- สร้างแผนใหม่ with checkbox checked  
- ควรอัพเดทระเบียนเดิมเป็นแผนใหม่

### 3. Unchecked Checkbox:
- สร้างแผนใหม่ with checkbox unchecked
- ไม่ควรเปลี่ยนแผนปัจจุบัน

### 4. Edit Mode:
- แก้ไขแผนและ check checkbox
- ควรตั้งแผนนี้เป็นปัจจุบัน

## Future Enhancements

1. **is_repeat Field**: สำหรับการวนซ้ำแผนอาหาร
2. **Plan History**: เก็บประวัติการใช้แผนต่างๆ
3. **Plan Scheduling**: กำหนดเวลาเริ่มต้นแผนในอนาคต
4. **Plan Templates**: สร้าง template จากแผนปัจจุบัน
5. **Notification**: แจ้งเตือนเมื่อเปลี่ยนแผนปัจจุบัน
