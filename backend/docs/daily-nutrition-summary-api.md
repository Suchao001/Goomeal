# Daily Nutrition Summary API Documentation

## Overview
API endpoints สำหรับจัดการสรุปโภชนาการรายวัน (Daily Nutrition Summary)

Base URL: `http://localhost:3001/api/daily-summary`

## Authentication
ทุก endpoint ต้องใช้ Bearer Token ใน Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get Daily Nutrition Summary
**GET** `/api/daily-summary/:date`

ดึงข้อมูลสรุปโภชนาการสำหรับวันที่กำหนด

**Parameters:**
- `date` (string, required): วันที่ในรูปแบบ YYYY-MM-DD

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 123,
    "summary_date": "2025-01-20",
    "total_calories": 1850,
    "total_fat": 65,
    "total_protein": 95,
    "total_carbs": 220,
    "recommendation": null,
    "weight": null,
    "created_at": "2025-01-20T07:00:00.000Z",
    "updated_at": "2025-01-20T14:30:00.000Z"
  }
}
```

### 2. Get Daily Nutrition Summaries by Range
**GET** `/api/daily-summary/range`

ดึงข้อมูลสรุปโภชนาการสำหรับช่วงวันที่กำหนด

**Query Parameters:**
- `start_date` (string, required): วันที่เริ่มต้น YYYY-MM-DD
- `end_date` (string, required): วันที่สิ้นสุด YYYY-MM-DD

**Example:**
```
GET /api/daily-summary/range?start_date=2025-01-15&end_date=2025-01-20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summaries": [
      {
        "id": 1,
        "user_id": 123,
        "summary_date": "2025-01-20",
        "total_calories": 1850,
        "total_fat": 65,
        "total_protein": 95,
        "total_carbs": 220,
        "recommendation": null,
        "weight": 68.5,
        "created_at": "2025-01-20T07:00:00.000Z",
        "updated_at": "2025-01-20T14:30:00.000Z"
      }
    ],
    "period_stats": {
      "start_date": "2025-01-15",
      "end_date": "2025-01-20",
      "total_days": 6,
      "avg_calories": 1756.67,
      "avg_fat": 62.33,
      "avg_protein": 89.17,
      "avg_carbs": 205.83
    }
  }
}
```

### 3. Update Daily Weight
**PUT** `/api/daily-summary/:date/weight`

อัปเดตน้ำหนักสำหรับวันที่กำหนด

**Parameters:**
- `date` (string, required): วันที่ในรูปแบบ YYYY-MM-DD

**Request Body:**
```json
{
  "weight": 68.5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 123,
    "summary_date": "2025-01-20",
    "total_calories": 1850,
    "total_fat": 65,
    "total_protein": 95,
    "total_carbs": 220,
    "recommendation": null,
    "weight": 68.5,
    "created_at": "2025-01-20T07:00:00.000Z",
    "updated_at": "2025-01-20T14:35:00.000Z"
  }
}
```

### 4. Update Daily Recommendation
**PUT** `/api/daily-summary/:date/recommendation`

อัปเดตคำแนะนำสำหรับวันที่กำหนด

**Parameters:**
- `date` (string, required): วันที่ในรูปแบบ YYYY-MM-DD

**Request Body:**
```json
{
  "recommendation": "ควรเพิ่มการออกกำลังกาย 30 นาที และลดการบริโภคไขมัน"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 123,
    "summary_date": "2025-01-20",
    "total_calories": 1850,
    "total_fat": 65,
    "total_protein": 95,
    "total_carbs": 220,
    "recommendation": "ควรเพิ่มการออกกำลังกาย 30 นาที และลดการบริโภคไขมัน",
    "weight": 68.5,
    "created_at": "2025-01-20T07:00:00.000Z",
    "updated_at": "2025-01-20T14:40:00.000Z"
  }
}
```

## Auto-Update Behavior

### การอัปเดตอัตโนมัติ
Daily Nutrition Summary จะถูกอัปเดตอัตโนมัติเมื่อ:

1. **สร้าง Eating Record ใหม่**: เมื่อผู้ใช้บันทึกอาหาร
2. **อัปเดต Eating Record**: เมื่อมีการแก้ไขข้อมูลอาหาร
3. **ลบ Eating Record**: เมื่อมีการลบข้อมูลอาหาร

### การคำนวณ
Summary จะถูกคำนวณจาก `eating_record` table โดย:
- `total_calories`: รวมแคลอรี่ทั้งหมดในวันนั้น
- `total_fat`: รวมไขมันทั้งหมดในวันนั้น
- `total_protein`: รวมโปรตีนทั้งหมดในวันนั้น  
- `total_carbs`: รวมคาร์โบไฮเดรตทั้งหมดในวันนั้น

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "กรุณาระบุวันที่"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "ไม่พบข้อมูลผู้ใช้"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "เกิดข้อผิดพลาดในการดึงข้อมูลสรุป"
}
```

## Usage Example

### Frontend Integration
```typescript
import { getDailyNutritionSummary } from '../../utils/api/dailyNutritionSummaryApi';

// Get today's summary
const loadTodaySummary = async () => {
  const today = new Date().toISOString().split('T')[0];
  const summary = await getDailyNutritionSummary(today);
  
  if (summary.success && summary.data) {
    console.log('Today calories:', summary.data.total_calories);
    // Use data in your UI
  }
};
```
