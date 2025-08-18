# Eating Record API Documentation

## Overview
Backend API for recording and managing user eating data in the `eating_record` table.

## Database Schema
```sql
eating_record (
  id int(11) NOT NULL,
  user_id int(11) NOT NULL,
  log_date date NOT NULL,
  food_name varchar(255) NOT NULL,
  meal_type varchar(50) DEFAULT NULL,
  calories int(11) DEFAULT NULL,
  carbs int(11) DEFAULT NULL,
  fat int(11) DEFAULT NULL,
  protein int(11) DEFAULT NULL,
  meal_time time DEFAULT NULL,
  image varchar(255) DEFAULT NULL
)
```

## API Endpoints

### Base URL: `/api/eating-records`

All endpoints require authentication (Bearer token).

### 1. Create Eating Record
- **POST** `/api/eating-records`
- **Body**: 
```json
{
  "log_date": "2025-08-18",
  "food_name": "ข้าวผัดกุ้ง",
  "meal_type": "อาหารเช้า", // optional
  "calories": 450, // optional
  "carbs": 65, // optional
  "fat": 12, // optional
  "protein": 25, // optional
  "meal_time": "07:30:00", // optional
  "image": "path/to/image.jpg" // optional
}
```
- **Response**: 
```json
{
  "success": true,
  "data": {...},
  "message": "บันทึกการกินเรียบร้อยแล้ว"
}
```

### 2. Get Records by Date
- **GET** `/api/eating-records/date/:date`
- **Params**: `date` (YYYY-MM-DD format)
- **Response**: 
```json
{
  "success": true,
  "data": {
    "records": [...],
    "summary": {
      "date": "2025-08-18",
      "total_records": 3,
      "total_nutrients": {
        "calories": 1250,
        "carbs": 150,
        "fat": 40,
        "protein": 80
      }
    }
  }
}
```

### 3. Get Records by Date Range
- **GET** `/api/eating-records/range`
- **Query**: `start_date=2025-08-10&end_date=2025-08-18`
- **Response**: 
```json
{
  "success": true,
  "data": {
    "daily_records": [
      {
        "date": "2025-08-18",
        "records": [...],
        "total_nutrients": {...}
      }
    ],
    "summary": {
      "start_date": "2025-08-10",
      "end_date": "2025-08-18",
      "total_days": 5,
      "total_records": 15
    }
  }
}
```

### 4. Update Eating Record
- **PUT** `/api/eating-records/:id`
- **Body**: (same as create, all fields optional)
- **Response**: 
```json
{
  "success": true,
  "data": {...},
  "message": "แก้ไขข้อมูลการกินเรียบร้อยแล้ว"
}
```

### 5. Delete Eating Record
- **DELETE** `/api/eating-records/:id`
- **Response**: 
```json
{
  "success": true,
  "message": "ลบข้อมูลการกินเรียบร้อยแล้ว"
}
```

### 6. Get Eating Statistics
- **GET** `/api/eating-records/stats`
- **Query**: `period=7` (number of days, default: 7)
- **Response**: 
```json
{
  "success": true,
  "data": {
    "period_days": 7,
    "total_records": 21,
    "daily_averages": {
      "calories": 1800,
      "carbs": 220,
      "fat": 60,
      "protein": 120,
      "meals": 3.2
    },
    "daily_data": [...]
  }
}
```

## Frontend Usage

Import the API client:
```typescript
import {
  createEatingRecord,
  getEatingRecordsByDate,
  getEatingRecordsByDateRange,
  updateEatingRecord,
  deleteEatingRecord,
  getEatingStats,
  EatingRecord
} from '../utils/api/eatingRecordApi';
```

### Example Usage:
```typescript
// Create a record
const newRecord = await createEatingRecord({
  log_date: '2025-08-18',
  food_name: 'ข้าวผัดกุ้ง',
  calories: 450,
  carbs: 65,
  fat: 12,
  protein: 25,
  meal_time: '07:30:00'
});

// Get today's records
const todayRecords = await getEatingRecordsByDate('2025-08-18');

// Get weekly stats
const weeklyStats = await getEatingStats(7);
```

## Files Created/Modified:

### Backend:
1. `/backend/controllers/eatingRecord_controller.ts` - Main controller with CRUD operations
2. `/backend/routes/eatingRecord_routes.ts` - Route definitions
3. `/backend/app.ts` - Added route registration

### Frontend:
1. `/utils/api/eatingRecordApi.ts` - Frontend API client with TypeScript types

## Features:
- ✅ Full CRUD operations for eating records
- ✅ Date-based filtering and searching
- ✅ Nutritional statistics and summaries
- ✅ User authentication and authorization
- ✅ Comprehensive error handling
- ✅ TypeScript support with proper types
- ✅ Logging for debugging
- ✅ Data validation
- ✅ Daily/weekly statistics calculation
- ✅ Proper API response formatting

## Notes:
- `meal_type` field is left optional as requested
- All nutrition fields (calories, carbs, fat, protein) are optional
- Image field supports file path storage
- Meal time supports HH:MM:SS format
- Statistics include daily averages and trends
- Full user data isolation (users can only access their own records)
