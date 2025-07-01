# WeeklyReportScreen Documentation

## ภาพรวม

หน้ารายงานการกินรายสัปดาห์ที่แสดงข้อมูลสถิติ 7 วัน กราฟแคลอรี่ ความคืบหน้าน้ำหนัก และคำแนะนำ

## Features หลัก

### 1. 📊 กราฟแคลอรี่ 7 วัน
- **Interactive Chart**: แต่ละแท่งคลิกได้ไปหน้ารายละเอียดวัน
- **Visual Indicators**:
  - แท่งสีเหลือง: แคลอรี่ปกติ
  - แท่งสีแดง: แคลอรี่เกินเป้าหมาย
  - เส้นประ: เป้าหมายแคลอรี่
- **Daily Values**: แสดงค่าแคลอรี่แต่ละวัน
- **Legend**: คำอธิบายสัญลักษณ์

### 2. 📈 ความคืบหน้าน้ำหนัก
- **น้ำหนักปัจจุบัน**: น้ำหนักล่าสุด
- **การเปลี่ยนแปลง**: น้ำหนักที่เพิ่ม/ลดในสัปดาห์
- **เป้าหมาย**: น้ำหนักที่ตั้งเป้าไว้
- **Progress Bar**: แสดงความคืบหน้าสู่เป้าหมาย
- **Visual Indicators**: ไอคอนและสีแสดงทิศทางการเปลี่ยนแปลง

### 3. 💡 คำแนะนำอัจฉริยะ
- **Personalized Tips**: คำแนะนำตามข้อมูลส่วนบุคคล
- **Action Items**: สิ่งที่ควรปรับปรุง
- **Positive Reinforcement**: ชมเชยสิ่งที่ทำได้ดี
- **Icon Categories**: แต่ละคำแนะนำมีไอคอนและสีประจำ

### 4. 📅 Week Navigation
- **Week Selector**: เลือกดูสัปดาห์ที่ต้องการ
- **Date Range**: แสดงช่วงวันที่ของสัปดาห์
- **Boundary Controls**: ปุ่มจะ disabled เมื่อถึงขอบเขต

## การใช้งาน

### Navigation
```typescript
// จาก EatingReportScreen
navigation.navigate('WeeklyReport');

// จาก WeeklyReportScreen ไป DailyReport
navigation.navigate('EatingReport');
```

### Data Structure
```typescript
interface WeeklyData {
  day: string;           // วันในสัปดาห์ (จ, อ, พ, ...)
  date: string;         // วันที่
  calories: number;     // แคลอรี่ที่บริโภค
  target: number;       // เป้าหมายแคลอรี่
  protein: number;      // โปรตีน (g)
  carbs: number;        // คาร์โบไฮเดรต (g)
  fat: number;          // ไขมัน (g)
}

interface WeightProgress {
  current: number;      // น้ำหนักปัจจุบัน
  previous: number;     // น้ำหนักสัปดาห์ก่อน
  change: number;       // การเปลี่ยนแปลง (+/-)
  goal: number;         // เป้าหมาย
}

interface Recommendation {
  icon: string;         // Ionicons name
  color: string;        // สี hex
  title: string;        // หัวข้อ
  message: string;      // รายละเอียด
}
```

## UI Components

### 1. Weekly Summary Cards
```typescript
// แสดงค่าเฉลี่ยต่อวัน
- แคลอรี่เฉลี่ย: kcal/วัน
- โปรตีนเฉลี่ย: g/วัน
```

### 2. Interactive Chart
```typescript
// คุณสมบัติของกราฟ
- Responsive width based on screen size
- Touch feedback สำหรับแต่ละแท่ง
- Color coding ตามสถานะ
- Horizontal target line
```

### 3. Weight Progress Card
```typescript
// Layout แบบ 3 คอลัมน์
- ปัจจุบัน | เปลี่ยนแปลง | เป้าหมาย
- Progress bar แสดงความคืบหน้า
- Status text บอกระยะทางที่เหลือ
```

### 4. Recommendations List
```typescript
// แต่ละรายการประกอบด้วย
- Icon circle พร้อมสี background
- Title ที่โดดเด่น
- Message ที่อธิบายรายละเอียด
```

## Color Scheme

### Chart Colors
- **Primary (#fbbf24)**: แคลอรี่ปกติ
- **Red (#ef4444)**: แคลอรี่เกิน
- **Gray Dashed**: เส้นเป้าหมาย

### Progress Colors
- **Green (#22c55e)**: น้ำหนักลด / ดีขึ้น
- **Red (#ef4444)**: น้ำหนักเพิ่ม / แย่ลง
- **Blue (#3b82f6)**: เป้าหมาย

### Recommendation Colors
- **Green (#22c55e)**: ชมเชย / สิ่งที่ดี
- **Blue (#3b82f6)**: ข้อมูล / สถิติ
- **Cyan (#06b6d4)**: คำแนะนำเรื่องน้ำ
- **Amber (#f59e0b)**: คำแนะนำเรื่องโภชนาการ

## Sample Data

### Mock Weekly Data
```typescript
const weeklyData = [
  { day: 'จ', calories: 1200, target: 1500, protein: 60 },
  { day: 'อ', calories: 1350, target: 1500, protein: 65 },
  // ... 7 days total
];
```

### Sample Recommendations
- ✅ **ดีมาก!** - คุณทานอาหารสม่ำเสมอ
- 📉 **น้ำหนักลดลง** - ลดลง 0.7 กก.
- 💧 **ดื่มน้ำเพิ่ม** - ควรดื่มน้ำมากขึ้น
- 🏋️ **เพิ่มโปรตีน** - ควรทานโปรตีนเพิ่ม

## การต่อยอด

### 1. Real Data Integration
- เชื่อมต่อ API สำหรับข้อมูลจริง
- Cache data สำหรับ offline viewing
- Sync กับ fitness trackers

### 2. Advanced Analytics
- เพิ่มกราฟแสดงแนวโน้ม
- Comparison กับสัปดาห์ก่อน
- Goal achievement metrics

### 3. Interactive Features
- Swipe gestures สำหรับเปลี่ยนสัปดาห์
- Long press สำหรับ quick actions
- Share report functionality

### 4. Personalization
- Custom goal setting
- Smart recommendations ตาม behavior
- Achievement badges

## Files ที่เกี่ยวข้อง

- `screens/reports/WeeklyReportScreen.tsx` - หน้ารายงานสัปดาห์
- `screens/reports/EatingReportScreen.tsx` - หน้ารายงานรายวัน (updated)
- `types/navigation.ts` - เพิ่ม WeeklyReport route

## Navigation Flow

```
EatingReportScreen
├── Header Calendar Icon → WeeklyReportScreen
├── "ดูรายสัปดาห์" Button → WeeklyReportScreen
└── Back Button → Previous Screen

WeeklyReportScreen
├── Chart Day Bars → EatingReportScreen
├── Back Button → EatingReportScreen
└── Week Navigation → Change Week Data
```
