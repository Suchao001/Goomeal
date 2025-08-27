# ระบบแนะนำการกินอาหารแบบอัจฉริยะ (AI Food Recommendation System)

## ภาพรวมระบบ

ระบบแนะนำการกินอาหารที่ใช้ข้อมูลผู้ใช้และการบริโภคอาหารในอดีตเพื่อสร้างคำแนะนำที่เหมาะสมและมีประโยชน์สูงสุด

---

## 1. ตัวแปรที่ใช้ในการคำนวณ (Variables)

### 📊 ข้อมูลส่วนตัวผู้ใช้ (User Profile Data)
- **อายุ (Age)**: สำหรับคำนวณ BMR และความต้องการโภชนาการ
- **น้ำหนัก (Weight)**: น้ำหนักปัจจุบันในหน่วยกิโลกรัม
- **ส่วนสูง (Height)**: ส่วนสูงในหน่วยเซนติเมตร
- **เพศ (Gender)**: male, female, other - ส่งผลต่อการคำนวณ BMR
- **ระดับไขมัน (Body Fat)**: low, normal, high, don't know
- **เป้าหมาย (Target Goal)**: decrease, increase, healthy
- **น้ำหนักเป้าหมาย (Target Weight)**: น้ำหนักที่ต้องการบรรลุ
- **ระดับกิจกรรม (Activity Level)**: low, moderate, high, very high

### 🍽️ ข้อมูลการบริโภคอาหาร (Eating Data)
- **บันทึกการกิน (Eating Records)**: ประวัติอาหารที่บริโภคแต่ละวัน
- **แคลอรี่รวม (Total Calories)**: แคลอรี่ที่บริโภคในแต่ละวัน
- **สารอาหารหลัก (Macronutrients)**:
  - โปรตีน (Protein): กรัม/วัน
  - คาร์โบไฮเดรต (Carbohydrates): กรัม/วัน
  - ไขมัน (Fat): กรัม/วัน
- **ประเภทมื้ออาหาร (Meal Types)**: เช้า, กลางวัน, เย็น
- **เวลาการกิน (Meal Time)**: เวลาที่บริโภคอาหารแต่ละมื้อ

### 🎯 ข้อมูลเป้าหมายโภชนาการ (Nutritional Targets)
- **แคลอรี่แนะนำ (Recommended Calories)**: คำนวณจากระบบ nutritionCalculator
- **โปรตีนแนะนำ (Recommended Protein)**: คำนวณจากระบบ
- **คาร์โบไฮเดรตแนะนำ (Recommended Carbs)**: คำนวณจากระบบ
- **ไขมันแนะนำ (Recommended Fat)**: คำนวณจากระบบ

### 📈 ข้อมูลพฤติกรรม (Behavioral Data)
- **ความถี่การกิน (Eating Frequency)**: จำนวนมื้อต่อวัน
- **ข้อจำกัดทางอาหาร (Dietary Restrictions)**: เจ, ฮาลาล, ไม่ทานหมู, ฯลฯ

---

## 2. สูตรการคำนวณ (Formulas)

### 🔥 การคำนวณ BMR (Basal Metabolic Rate)
**สูตร Mifflin-St Jeor:**
```
ชาย: BMR = (10 × น้ำหนัก) + (6.25 × ส่วนสูง) - (5 × อายุ) + 5
หญิง: BMR = (10 × น้ำหนัก) + (6.25 × ส่วนสูง) - (5 × อายุ) - 161
```

### ⚡ การคำนวณ TDEE (Total Daily Energy Expenditure)
```
TDEE = BMR × Activity Multiplier
```
**Activity Multipliers:**
- ไม่ออกกำลังกาย (low): 1.2
- ออกกำลังกายปานกลาง (moderate): 1.55
- ออกกำลังกายเป็นหลัก (high): 1.725
- ใช้ร่างกายอย่างหนัก (very high): 1.9

### 🎯 การคำนวณแคลอรี่เป้าหมาย (Target Calories)
```
เพิ่มน้ำหนัก: Target = TDEE + 350 kcal/day
ลดน้ำหนัก: Target = TDEE - 500 kcal/day (ขั้นต่ำ 1200 kcal)
รักษาสุขภาพ: Target = TDEE
```

### 🥗 การคำนวณสารอาหารหลัก (Macronutrients)
**หมายเหตุ**: ระบบใช้ `nutritionCalculator` ที่มีอยู่แล้วในการคำนวณค่าแนะนำ

**สัดส่วนโปรตีนสำหรับคนไทยทั่วไป**:
```
เพิ่มน้ำหนัก: โปรตีน = น้ำหนักเป้าหมาย × 1.2-1.4 g/kg
ลดน้ำหนัก: โปรตีน = น้ำหนักเป้าหมาย × 1.4-1.6 g/kg  
รักษาสุขภาพ: โปรตีน = น้ำหนักเป้าหมาย × 1.0-1.2 g/kg
```

**การแบ่งสัดส่วนพลังงาน**:
```
เพิ่มน้ำหนัก: คาร์บ 60-65% : โปรตีน 15-20% : ไขมัน 20-25%
ลดน้ำหนัก: คาร์บ 45-50% : โปรตีน 25-30% : ไขมัน 25-30%
รักษาสุขภาพ: คาร์บ 55-60% : โปรตีน 15-20% : ไขมัน 25-30%
```

### 📊 การคำนวณคะแนนความเหมาะสม (Suitability Score)
```
Score = (NutritionMatch × 0.4) + (PreferenceMatch × 0.3) + 
        (BudgetMatch × 0.2) + (VarietyMatch × 0.1)

โดยที่:
- NutritionMatch: ความใกล้เคียงกับเป้าหมายโภชนาการ (0-100)
- PreferenceMatch: ความตรงกับความชอบ (0-100)
- BudgetMatch: ความเหมาะสมของงบประมาณ (0-100)
- VarietyMatch: ความหลากหลายตามต้องการ (0-100)
```

### 📈 การคำนวณแนวโน้มการบริโภค (Consumption Trend)
```
DailyAverage = Σ(DailyIntake) / NumberOfDays
WeeklyTrend = (ThisWeek - LastWeek) / LastWeek × 100%
ComplianceRate = DaysMetTarget / TotalDays × 100%
```

---

## 3. คำแนะนำรายวันที่สร้างได้ (Daily Recommendations)

### 🎯 คำแนะนำด้านโภชนาการ (Nutritional Advice)

#### ✅ **การประเมินผลการกินวันนี้**
```javascript
function assessDailyNutrition(actualIntake, recommendedIntake) {
  const caloriePercent = (actualIntake.calories / recommendedIntake.calories) * 100;
  const proteinPercent = (actualIntake.protein / recommendedIntake.protein) * 100;
  const carbPercent = (actualIntake.carbs / recommendedIntake.carbs) * 100;
  const fatPercent = (actualIntake.fat / recommendedIntake.fat) * 100;
  
  return generateDailyAdvice(caloriePercent, proteinPercent, carbPercent, fatPercent);
}
```

#### 💪 **คำแนะนำด้านโปรตีน**
- **ดีเยี่ยม (90-110%)**: "ทำได้ดีมาก! ปริมาณโปรตีนเพียงพอสำหรับร่างกาย"
- **ต้องเสริม (70-89%)**: "ควรเสริมโปรตีน เช่น ไข่, ไก่, ปลา, ถั่ว หรือนมถั่วเหลือง"
- **น้อยเกินไป (<70%)**: "โปรตีนไม่เพียงพอ แนะนำเพิ่มอาหารโปรตีนในมื้อถัดไป"
- **มากเกินไป (>110%)**: "โปรตีนเกินความต้องการ ลองเพิ่มผักและคาร์บแทน"

#### 🍚 **คำแนะนำด้านพลังงาน (คาร์โบไฮเดรต)**
- **สมดุลดี (85-115%)**: "พลังงานเพียงพอ ร่างกายได้รับคาร์บที่เหมาะสม"
- **ต้องเสริมพลังงาน (<85%)**: "ควรทานข้าว ขนมปัง หรือผลไม้เพิ่ม"
- **พลังงานเกิน (>115%)**: "คาร์บมากไป ลองลดข้าวและเพิ่มผักแทน"

#### 🥑 **คำแนะนำด้านไขมัน**
- **เหมาะสม (80-120%)**: "ไขมันดีอยู่ในเกณฑ์ที่เหมาะสม"
- **ควรเพิ่ม (<80%)**: "ควรเพิ่มไขมันดี เช่น อะโวคาโด, ถั่ว, น้ำมันมะกอก"
- **มากเกินไป (>120%)**: "ไขมันเกิน ลองลดการทอด เปลี่ยนเป็นนึ่ง ต้ม"

### �‍♂️ คำแนะนำด้านกิจกรรม (Activity Advice)

#### 📊 **ตามระดับการบริโภคแคลอรี่**
```javascript
function getActivityAdvice(caloriePercent, userGoal) {
  if (userGoal === 'decrease') {
    if (caloriePercent > 110) return "แคลอรี่เกินเป้าหมาย แนะนำเดิน 30 นาที หรือขึ้นลงบันได";
    if (caloriePercent < 80) return "แคลอรี่น้อยเกินไป ควรทานเพิ่มและออกกำลังกายเบาๆ";
  }
  
  if (userGoal === 'increase') {
    if (caloriePercent < 90) return "ควรทานเพิ่มและออกกำลังกายแบบต้านทาน เช่น ยกน้ำหนัก";
    if (caloriePercent > 120) return "แคลอรี่เกินไป ควรเดินหรือออกกำลังกายเบาๆ";
  }
  
  return "ออกกำลังกาย 30 นาที จะช่วยเผาผลาญและสุขภาพดี";
}
```

### 💧 คำแนะนำด้านน้ำและพฤติกรรม (Hydration & Behavior)

#### 🚰 **การดื่มน้ำ**
- **น้ำหนัก × 35 ml**: เป้าหมายน้ำขั้นต่ำต่อวัน
- **เพิ่ม 500ml**: หากออกกำลังกายหรืออากาศร้อน
- **เช็คสี**: ปัสสาวะใสเหลืองอ่อน = ดื่มน้ำเพียงพอ

#### ⏰ **เวลาการกิน**
- **มื้อเช้า (7:00-9:00)**: "ควรทานภายใน 2 ชั่วโมงหลังตื่น"
- **มื้อกลางวัน (11:30-13:30)**: "ช่วงที่ร่างกายต้องการพลังงานมากสุด"
- **มื้อเย็น (17:30-19:30)**: "หลีกเลี่ยงทานหลัง 3 ทุ่ม เพื่อการนอนหลับดี"

### � คำแนะนำแบบบูรณาการ (Integrated Daily Tips)

#### 🏆 **ระบบให้คะแนนรายวัน**
```javascript
function calculateDailyScore(nutrition, timing, hydration, activity) {
  const nutritionScore = (nutrition.protein + nutrition.carbs + nutrition.fat + nutrition.calories) / 4;
  const timingScore = timing.mealsOnTime ? 25 : 15;
  const hydrationScore = hydration.adequate ? 25 : 10;
  const activityScore = activity.completed ? 25 : 0;
  
  return {
    totalScore: (nutritionScore * 0.5) + (timingScore * 0.2) + (hydrationScore * 0.15) + (activityScore * 0.15),
    grade: getGrade(totalScore)
  };
}
```

#### 🌟 **คำแนะนำตามคะแนน**
- **90-100 คะแนน**: "เยี่ยมมาก! คุณดูแลตัวเองได้ดีเยี่ยม"
- **80-89 คะแนน**: "ดีมาก มีเพียงไม่กี่จุดที่ปรับปรุงได้"
- **70-79 คะแนน**: "ดี แต่ยังปรับปรุงได้ในบางด้าน"
- **60-69 คะแนน**: "พอใช้ ลองปรับปรุงการกินและออกกำลังกาย"
- **<60 คะแนน**: "ควรปรับเปลี่ยน ให้ความสำคัญกับสุขภาพมากขึ้น"

### 🎯 ตัวอย่างคำแนะนำรายวันที่สมบูรณ์

```
🗓️ สรุปวันนี้ (27 สิงหาคม 2025)

📊 คะแนนรวม: 82/100 (ดีมาก)

💪 โภชนาการ:
✅ แคลอรี่: 1,847/1,800 kcal (103%) - เหมาะสม
⚠️ โปรตีน: 65/80g (81%) - ควรเสริมโปรตีน
✅ คาร์บ: 234/225g (104%) - สมดุลดี
✅ ไขมัน: 62/60g (103%) - เหมาะสม

🏃‍♂️ กิจกรรม:
⚠️ ยังไม่ได้ออกกำลังกาย - แนะนำเดิน 20-30 นาที

💧 น้ำ:
✅ ดื่มไปแล้ว 6/8 แก้ว - เกือบครบเป้าหมาย

⏰ เวลาการกิน:
✅ ทานมื้อเช้า: 08:15 (เหมาะสม)
✅ ทานมื้อกลางวัน: 12:30 (เหมาะสม)  
⚠️ ยังไม่ทานมื้อเย็น

🎯 คำแนะนำสำหรับพรุ่งนี้:
1. เพิ่มโปรตีน: ใส่ไข่ต้มในสลัด หรือทานปลาเผา
2. ออกกำลังกาย: เดินขึ้นลงบันไดในออฟฟิศ หรือปั่นจักรยาน
3. ดื่มน้ำ: ตั้งปลุกดื่มน้ำทุก 2 ชั่วโมง
4. มื้อเย็น: ทานก่อน 19:30 เพื่อการนอนหลับดี
```

---

## 4. อัลกอริทึมการสร้างคำแนะนำรายวัน (Daily Recommendation Algorithm)

### ขั้นตอนที่ 1: เก็บและวิเคราะห์ข้อมูลรายวัน
```javascript
function collectDailyData(userId, date) {
  return {
    nutritionData: getDailyNutritionSummary(userId, date),
    recommendedIntake: getRecommendedNutrition(userId), // จาก nutritionCalculator
    eatingRecords: getEatingRecords(userId, date),
    activityData: getActivityLog(userId, date),
    hydrationLog: getHydrationLog(userId, date)
  };
}
```

### ขั้นตอนที่ 2: คำนวณคะแนนและประเมินผล
```javascript
function assessDailyPerformance(actualIntake, recommended) {
  const assessments = {
    calories: assessNutrient(actualIntake.calories, recommended.calories, 'calories'),
    protein: assessNutrient(actualIntake.protein, recommended.protein, 'protein'),
    carbs: assessNutrient(actualIntake.carbs, recommended.carbs, 'carbs'),
    fat: assessNutrient(actualIntake.fat, recommended.fat, 'fat')
  };
  
  return assessments;
}

function assessNutrient(actual, target, type) {
  const percentage = (actual / target) * 100;
  
  switch(type) {
    case 'protein':
      if (percentage >= 90 && percentage <= 110) return { status: 'excellent', score: 25 };
      if (percentage >= 70 && percentage < 90) return { status: 'need_more', score: 18 };
      if (percentage < 70) return { status: 'insufficient', score: 10 };
      return { status: 'excessive', score: 15 };
      
    case 'calories':
      if (percentage >= 95 && percentage <= 105) return { status: 'perfect', score: 25 };
      if (percentage >= 85 && percentage <= 115) return { status: 'good', score: 20 };
      return { status: 'needs_adjustment', score: 12 };
      
    // Similar logic for carbs and fat...
  }
}
```

### ขั้นตอนที่ 3: สร้างคำแนะนำเฉพาะบุคคล
```javascript
function generatePersonalizedAdvice(assessments, userProfile, currentTime) {
  const advice = {
    nutrition: generateNutritionAdvice(assessments),
    activity: generateActivityAdvice(assessments.calories, userProfile.target_goal),
    hydration: generateHydrationAdvice(userProfile.weight),
    timing: generateTimingAdvice(currentTime),
    tomorrowTips: generateTomorrowTips(assessments, userProfile)
  };
  
  return formatDailyAdvice(advice);
}
```

### ขั้นตอนที่ 4: ปรับแต่งตามบริบทและเวลา
```javascript
function contextualizeAdvice(advice, timeOfDay, dayOfWeek, season) {
  // ปรับคำแนะนำตามเวลา
  if (timeOfDay === 'morning') {
    advice.priority = ['breakfast_tips', 'hydration', 'daily_goals'];
  } else if (timeOfDay === 'evening') {
    advice.priority = ['dinner_planning', 'exercise_reminder', 'tomorrow_prep'];
  }
  
  // ปรับตามวันในสัปดาห์
  if (['saturday', 'sunday'].includes(dayOfWeek)) {
    advice.activity.suggestions.push('weekend_cooking', 'family_activities');
  }
  
  return advice;
}
```

---

## 5. ตัวชี้วัดความสำเร็จรายวัน (Daily Success Metrics)

### � ตัวชี้วัดหลัก (Primary Metrics)
- **คะแนนโภชนาการ (Nutrition Score)**: 0-100 คะแนน
  - แคลอรี่ตรงเป้า (25%)
  - โปรตีนเพียงพอ (25%) 
  - คาร์บสมดุล (25%)
  - ไขมันเหมาะสม (25%)

- **คะแนนพฤติกรรม (Behavior Score)**: 0-100 คะแนน
  - เวลาการกินสม่ำเสมอ (40%)
  - ดื่มน้ำเพียงพอ (30%)
  - ออกกำลังกาย (30%)

### � การติดตามแนวโน้ม (Trend Tracking)
```javascript
function calculateTrends(last7Days) {
  return {
    nutritionTrend: calculateNutritionTrend(last7Days),
    weightProgress: calculateWeightProgress(last7Days),
    consistencyScore: calculateConsistency(last7Days),
    improvementAreas: identifyImprovementAreas(last7Days)
  };
}
```

### 🎯 เป้าหมายรายวัน (Daily Goals)
- **ความสำเร็จขั้นต่ำ**: คะแนนรวม ≥ 60
- **ความสำเร็จดี**: คะแนนรวม ≥ 75  
- **ความสำเร็จเยี่ยม**: คะแนนรวม ≥ 85

---

## 6. การติดตามและปรับปรุงระบบ (System Monitoring & Optimization)

### � Implementation ในแอป
```javascript
// Daily Recommendation Service
class DailyRecommendationService {
  async generateDailyAdvice(userId) {
    const today = new Date().toISOString().split('T')[0];
    const userData = await this.getUserData(userId);
    const dailyData = await this.getDailyData(userId, today);
    
    return this.createDailyRecommendation(userData, dailyData);
  }
  
  async createDailyRecommendation(userData, dailyData) {
    const assessment = this.assessDailyPerformance(dailyData);
    const advice = this.generateAdviceMessages(assessment, userData);
    const score = this.calculateDailyScore(assessment);
    
    return {
      date: new Date(),
      score: score,
      advice: advice,
      priorities: this.getPriorities(assessment),
      tomorrowTips: this.getTomorrowTips(assessment, userData)
    };
  }
}
```

### 🔄 การปรับปรุงอัลกอริทึม
```javascript
// Learning from user feedback
function adaptRecommendations(userId, feedback, outcomes) {
  const userPreferences = analyzeUserBehavior(userId);
  const effectiveAdvice = identifySuccessfulRecommendations(outcomes);
  
  return {
    personalizedWeights: calculatePersonalWeights(userPreferences),
    recommendationPriority: adjustPriority(effectiveAdvice),
    messageStyle: adaptMessageStyle(feedback)
  };
}
```

### 📊 การรายงานและแจ้งเตือน
```javascript
// Push notification for daily tips
function scheduleDailyNotifications(userId, preferences) {
  const notifications = [
    { time: '08:00', message: getMorningTip(userId) },
    { time: '12:00', message: getLunchReminder(userId) },
    { time: '18:00', message: getEveningAdvice(userId) },
    { time: '21:00', message: getDaySummary(userId) }
  ];
  
  return scheduleNotifications(notifications, preferences);
}
```

---

## 7. การนำไปใช้จริงและข้อจำกัด (Implementation & Limitations)

### ⚠️ ข้อจำกัดปัจจุบัน
- ต้องอาศัยข้อมูลผู้ใช้ที่ถูกต้องและครบถ้วน
- ไม่สามารถทดแทนคำแนะนำจากแพทย์หรือนักโภชนาการ
- ความแม่นยำขึ้นกับการบันทึกข้อมูลอย่างสม่ำเสมอ
- คำแนะนำเป็นแนวทางทั่วไป ไม่ใช่การรักษาโรค

### � การนำไปใช้ในแอป Goodmeal
```javascript
// Integration with existing systems
const dailyRecommendationIntegration = {
  // ใช้ข้อมูลจาก daily_nutrition_summary table
  nutritionSource: 'daily_nutrition_summary',
  
  // ใช้ nutritionCalculator ที่มีอยู่
  calculatorService: 'utils/nutritionCalculator.ts',
  
  // เชื่อมต่อกับ eating_record
  foodLogSource: 'eating_record',
  
  // แสดงผลใน EatingReportScreen
  displayLocation: 'screens/reports/EatingReportScreen.tsx'
};
```

### 🚀 แผนการพัฒนาต่อยอด
- **Phase 1**: คำแนะนำรายวันพื้นฐาน (2-4 สัปดาห์)
- **Phase 2**: การเรียนรู้จากพฤติกรรมผู้ใช้ (1-2 เดือน)
- **Phase 3**: คำแนะนำเชิงปฏิบัติการ เช่น สูตรอาหาร (3-4 เดือน)
- **Phase 4**: AI/ML สำหรับการทำนายและปรับแต่งอัตโนมัติ (6+ เดือน)

---

## สรุป

ระบบแนะนำการกินอาหารรายวันนี้เน้นการให้คำแนะนำเชิงปฏิบัติที่สามารถนำไปใช้ได้จริงในชีวิตประจำวันของคนไทย โดยใช้ข้อมูลจาก `nutritionCalculator` ที่มีอยู่แล้วในแอป

**หลักการสำคัญ:**
1. **ใช้งานง่าย**: คำแนะนำที่เข้าใจง่าย ไม่ซับซ้อน
2. **เฉพาะบุคคล**: ปรับตามข้อมูลส่วนตัวและเป้าหมาย
3. **ทันท่วงที**: คำแนะนำรายวันที่ตอบสนองสถานการณ์ปัจจุบัน
4. **วิทยาศาสตร์**: อิงจากหลักโภชนาการที่ถูกต้อง แต่ปรับให้เหมาะกับคนไทย
5. **แรงจูงใจ**: สร้างแรงจูงใจด้วยคะแนนและการติดตามความก้าวหน้า

**ผลลัพธ์ที่คาดหวัง:**
- ผู้ใช้เข้าใจสถานภาพโภชนาการของตนเองในแต่ละวัน
- ได้รับคำแนะนำที่ปฏิบัติได้จริงและเหมาะสมกับวิถีชีวิต
- สร้างนิสัยการกินที่ดีและยั่งยืนในระยะยาว
- เพิ่มความสำเร็จในการบรรลุเป้าหมายสุขภาพและน้ำหนัก
