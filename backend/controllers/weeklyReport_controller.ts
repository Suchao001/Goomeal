import { Request, Response } from 'express';
import db from '../db_config';

// Format a Date to local YYYY-MM-DD (avoids UTC shift from toISOString)
const formatLocalDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Normalize DB date (string or Date) to YYYY-MM-DD in local time
const normalizeDbDate = (val: any): string => {
  try {
    if (!val) return '';
    if (typeof val === 'string') {
      // assume 'YYYY-MM-DD...' or ISO; take first 10 chars
      return val.slice(0, 10);
    }
    const d = new Date(val);
    return formatLocalDate(d);
  } catch (_) {
    return String(val || '');
  }
};

const shortThaiDayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
const getShortThaiDayName = (date: string): string => {
  try {
    const idx = new Date(date).getDay();
    return shortThaiDayNames[idx] ?? '';
  } catch (_) {
    return '';
  }
};

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    [key: string]: any;
  };
}

interface WeeklyNutritionSummary {
  user_id: number;
  week_start_date: string;
  week_end_date: string;
  days_count: number;
  avg_total_calories: number;
  avg_total_protein: number;
  avg_total_carbs: number;
  avg_total_fat: number;
  avg_target_cal: number;
  avg_target_protein: number;
  avg_target_carb: number;
  avg_target_fat: number;
  avg_recommended_cal: number;
  avg_recommended_protein: number;
  avg_recommended_carb: number;
  avg_recommended_fat: number;
  total_days_with_data: number;
  calories_deficit_surplus: number;
}

interface DayDetail {
  date: string;
  day_name: string;
  total_calories: number;
  target_cal: number;
  recommended_cal: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  weight: number | null;
  has_data: boolean;
}

export const getWeeklyNutritionSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
      return;
    }

    // Get week offset from query parameter (default to 0 for current week)
    const weekOffset = parseInt(req.query.weekOffset as string) || 0;
    
    console.log(`📊 [WeeklyReport] Getting weekly summary for user ${user_id}, week offset: ${weekOffset}`);

    // Calculate start and end date for the requested week
    // Week starts on Monday (Thai convention)
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = currentDayOfWeek === 0 ? -6 : -(currentDayOfWeek - 1); // Adjust for Monday start
    
    const startOfCurrentWeek = new Date(today);
    startOfCurrentWeek.setDate(today.getDate() + mondayOffset + (weekOffset * 7));
    startOfCurrentWeek.setHours(0, 0, 0, 0);
    
    const endOfCurrentWeek = new Date(startOfCurrentWeek);
    endOfCurrentWeek.setDate(startOfCurrentWeek.getDate() + 6);
    endOfCurrentWeek.setHours(23, 59, 59, 999);

    const startDateStr = formatLocalDate(startOfCurrentWeek);
    const endDateStr = formatLocalDate(endOfCurrentWeek);

    console.log(`📊 [WeeklyReport] Week range: ${startDateStr} to ${endDateStr}`);

    // Query for weekly summary with aggregated data
    const weeklyQuery = `
      SELECT 
        ? as user_id,
        ? as week_start_date,
        ? as week_end_date,
        COUNT(DISTINCT summary_date) as days_count,
        COALESCE(ROUND(AVG(total_calories), 0), 0) as avg_total_calories,
        COALESCE(ROUND(AVG(total_protein), 1), 0) as avg_total_protein,
        COALESCE(ROUND(AVG(total_carbs), 1), 0) as avg_total_carbs,
        COALESCE(ROUND(AVG(total_fat), 1), 0) as avg_total_fat,
        COALESCE(ROUND(AVG(target_cal), 0), 0) as avg_target_cal,
        COALESCE(ROUND(AVG(target_protein), 1), 0) as avg_target_protein,
        COALESCE(ROUND(AVG(target_carb), 1), 0) as avg_target_carb,
        COALESCE(ROUND(AVG(target_fat), 1), 0) as avg_target_fat,
        COALESCE(ROUND(AVG(recommended_cal), 0), 0) as avg_recommended_cal,
        COALESCE(ROUND(AVG(recommended_protein), 1), 0) as avg_recommended_protein,
        COALESCE(ROUND(AVG(recommended_carb), 1), 0) as avg_recommended_carb,
        COALESCE(ROUND(AVG(recommended_fat), 1), 0) as avg_recommended_fat,
        COUNT(DISTINCT summary_date) as total_days_with_data,
        COALESCE(ROUND(AVG(total_calories) - AVG(COALESCE(recommended_cal, target_cal)), 0), 0) as calories_deficit_surplus
      FROM daily_nutrition_summary 
      WHERE user_id = ? 
        AND summary_date >= ? 
        AND summary_date <= ?
    `;

    const [weeklyResults] = await db.raw(weeklyQuery, [
      user_id, startDateStr, endDateStr, user_id, startDateStr, endDateStr
    ]);

    // Query for daily details within the week
    const dailyQuery = `
      SELECT 
        summary_date as date,
        COALESCE(total_calories, 0) as total_calories,
        COALESCE(target_cal, 0) as target_cal,
        COALESCE(recommended_cal, 0) as recommended_cal,
        COALESCE(total_protein, 0) as total_protein,
        COALESCE(total_carbs, 0) as total_carbs,
        COALESCE(total_fat, 0) as total_fat,
        weight,
        1 as has_data
      FROM daily_nutrition_summary 
      WHERE user_id = ? 
        AND summary_date >= ? 
        AND summary_date <= ?
      ORDER BY summary_date ASC
    `;

    const dailyResults = await db.raw(dailyQuery, [user_id, startDateStr, endDateStr]);
    const dailyRows = (dailyResults[0] || []).map((row: any) => ({
      ...row,
      date: normalizeDbDate(row.date),
    }));

    // Create array of 7 days with Thai day names
    const dayNames = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'];
    const dailyDetails: DayDetail[] = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfCurrentWeek);
      currentDate.setDate(startOfCurrentWeek.getDate() + i);
      const dateStr = formatLocalDate(currentDate);
      
      // Find existing data for this date (normalize both sides)
      const dayData = dailyRows.find((day: any) => day.date === dateStr);
      
      dailyDetails.push({
        date: dateStr,
        day_name: dayNames[i],
        total_calories: dayData?.total_calories || 0,
        target_cal: dayData?.target_cal || 0,
        recommended_cal: dayData?.recommended_cal || 0,
        total_protein: dayData?.total_protein || 0,
        total_carbs: dayData?.total_carbs || 0,
        total_fat: dayData?.total_fat || 0,
        weight: dayData?.weight || null,
        has_data: !!dayData
      });
    }

    // Get weight trend (compare first and last recorded weights in the week)
    const weightTrendQuery = `
      SELECT weight, summary_date as date 
      FROM daily_nutrition_summary 
      WHERE user_id = ? 
        AND summary_date >= ? 
        AND summary_date <= ? 
        AND weight IS NOT NULL 
      ORDER BY summary_date ASC
    `;

    const weightResults = await db.raw(weightTrendQuery, [user_id, startDateStr, endDateStr]);
    const weights = weightResults[0];
    
    let weightChange = null;
    if (weights.length >= 2) {
      const firstWeight = weights[0].weight;
      const lastWeight = weights[weights.length - 1].weight;
      weightChange = {
        start_weight: firstWeight,
        end_weight: lastWeight,
        change: parseFloat((lastWeight - firstWeight).toFixed(1)),
        days_between: weights.length
      };
    } else if (weights.length === 1) {
      weightChange = {
        start_weight: weights[0].weight,
        end_weight: weights[0].weight,
        change: 0,
        days_between: 1
      };
    }

    const summary: WeeklyNutritionSummary = weeklyResults.length > 0 && weeklyResults[0].days_count > 0 ? weeklyResults[0] : {
      user_id,
      week_start_date: startDateStr,
      week_end_date: endDateStr,
      days_count: 0,
      avg_total_calories: 0,
      avg_total_protein: 0,
      avg_total_carbs: 0,
      avg_total_fat: 0,
      avg_target_cal: 0,
      avg_target_protein: 0,
      avg_target_carb: 0,
      avg_target_fat: 0,
      avg_recommended_cal: 0,
      avg_recommended_protein: 0,
      avg_recommended_carb: 0,
      avg_recommended_fat: 0,
      total_days_with_data: 0,
      calories_deficit_surplus: 0
    };

    console.log(`✅ [WeeklyReport] Generated summary for ${dailyDetails.length} days, ${summary.total_days_with_data} days with actual data`);

    res.json({
      success: true,
      data: {
        summary,
        daily_details: dailyDetails,
        weight_change: weightChange,
        week_info: {
          week_offset: weekOffset,
          start_date: startDateStr,
          end_date: endDateStr,
          is_current_week: weekOffset === 0
        }
      }
    });

  } catch (error) {
    console.error('❌ [WeeklyReport] Error getting weekly nutrition summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get weekly nutrition summary',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getWeeklyInsights = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
      return;
    }

    const weekOffset = parseInt(req.query.weekOffset as string) || 0;

    // Calculate start and end date for the requested week
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const mondayOffset = currentDayOfWeek === 0 ? -6 : -(currentDayOfWeek - 1);
    
    const startOfCurrentWeek = new Date(today);
    startOfCurrentWeek.setDate(today.getDate() + mondayOffset + (weekOffset * 7));
    startOfCurrentWeek.setHours(0, 0, 0, 0);
    
    const endOfCurrentWeek = new Date(startOfCurrentWeek);
    endOfCurrentWeek.setDate(startOfCurrentWeek.getDate() + 6);
    endOfCurrentWeek.setHours(23, 59, 59, 999);

    const startDateStr = formatLocalDate(startOfCurrentWeek);
    const endDateStr = formatLocalDate(endOfCurrentWeek);

    // Get insights based on patterns in the week
    const insightsQuery = `
      SELECT 
        COUNT(DISTINCT summary_date) AS days_logged,
        AVG(total_calories) AS avg_calories,
        AVG(COALESCE(recommended_cal, target_cal)) AS avg_target,
        -- Define tolerance: max(100 kcal, 10% of target)
        COUNT(CASE 
          WHEN COALESCE(recommended_cal, target_cal) > 0 AND total_calories > 0 THEN
            CASE 
              WHEN ABS(total_calories - COALESCE(recommended_cal, target_cal)) <= 
                   (CASE WHEN COALESCE(recommended_cal, target_cal) * 0.10 > 100 
                         THEN COALESCE(recommended_cal, target_cal) * 0.10 
                         ELSE 100 END)
              THEN 1 END
        END) AS days_in_range,
        COUNT(CASE 
          WHEN COALESCE(recommended_cal, target_cal) > 0 AND total_calories > 0 THEN
            CASE 
              WHEN (total_calories - COALESCE(recommended_cal, target_cal)) > 
                   (CASE WHEN COALESCE(recommended_cal, target_cal) * 0.10 > 100 
                         THEN COALESCE(recommended_cal, target_cal) * 0.10 
                         ELSE 100 END)
              THEN 1 END
        END) AS days_over_range,
        COUNT(CASE 
          WHEN COALESCE(recommended_cal, target_cal) > 0 AND total_calories > 0 THEN
            CASE 
              WHEN (COALESCE(recommended_cal, target_cal) - total_calories) > 
                   (CASE WHEN COALESCE(recommended_cal, target_cal) * 0.10 > 100 
                         THEN COALESCE(recommended_cal, target_cal) * 0.10 
                         ELSE 100 END)
              THEN 1 END
        END) AS days_under_range,
        AVG(total_calories - COALESCE(recommended_cal, target_cal)) AS avg_calorie_diff,
        AVG(total_protein) AS avg_protein,
        AVG(COALESCE(recommended_protein, target_protein)) AS avg_protein_target,
        MIN(weight) AS min_weight,
        MAX(weight) AS max_weight,
        COUNT(CASE WHEN weight IS NOT NULL THEN 1 END) AS weight_logs
      FROM daily_nutrition_summary 
      WHERE user_id = ? 
        AND summary_date >= ? 
        AND summary_date <= ?
    `;

    const [insightResults] = await db.raw(insightsQuery, [user_id, startDateStr, endDateStr]);
    const insights = insightResults[0];

    const dailyDetailsQuery = `
      SELECT 
        summary_date as date,
        COALESCE(total_calories, 0) as total_calories,
        target_cal,
        recommended_cal
      FROM daily_nutrition_summary 
      WHERE user_id = ? 
        AND summary_date >= ? 
        AND summary_date <= ?
      ORDER BY summary_date ASC
    `;

    const [dailyDetailsResults] = await db.raw(dailyDetailsQuery, [user_id, startDateStr, endDateStr]);
    const dailyDetails = (dailyDetailsResults || []).map((row: any) => ({
      ...row,
      date: normalizeDbDate(row.date),
    }));

    type DayRow = {
      date: string;
      tgt: number;
      cal: number;
      diff: number;
      absDiff: number;
      diffPct: number;
      dow: number;
    };

    const dayRows: DayRow[] = (dailyDetails || [])
      .map((d: any) => {
        const rec = typeof d.recommended_cal === 'number' && Number.isFinite(d.recommended_cal) ? d.recommended_cal : null;
        const tgt = rec ?? (typeof d.target_cal === 'number' && Number.isFinite(d.target_cal) ? d.target_cal : null);
        if (tgt === null) return null;
        const cal = typeof d.total_calories === 'number' && Number.isFinite(d.total_calories) ? d.total_calories : 0;
        const diff = cal - tgt;
        const absDiff = Math.abs(diff);
        const diffPct = tgt > 0 ? Math.abs((diff / tgt) * 100) : 0;
        const dow = new Date(d.date).getDay();
        return { date: d.date, tgt, cal, diff, absDiff, diffPct, dow };
      })
      .filter((row): row is DayRow => row !== null);

    const withTargetDays = dayRows.length;
    const inRangeDays = dayRows.filter((r) => r.absDiff <= Math.max(100, Math.round(r.tgt * 0.10))).length;

    let worst: DayRow | null = null;
    if (dayRows.length) {
      worst = [...dayRows].sort((a, b) => b.absDiff - a.absDiff)[0];
    }

    const avgDiff = dayRows.length ? Math.round(dayRows.reduce((s, r) => s + r.diff, 0) / dayRows.length) : 0;
    const bias: 'neutral' | 'over' | 'under' = avgDiff === 0 ? 'neutral' : (avgDiff > 0 ? 'over' : 'under');

    const weekend = dayRows.filter((r) => r.dow === 0 || r.dow === 6);
    const weekday = dayRows.filter((r) => r.dow >= 1 && r.dow <= 5);
    const wkOver = weekend.length ? Math.round(weekend.reduce((s, r) => s + r.diff, 0) / weekend.length) : 0;
    const wdOver = weekday.length ? Math.round(weekday.reduce((s, r) => s + r.diff, 0) / weekday.length) : 0;

    const ratio = withTargetDays ? inRangeDays / withTargetDays : 0;
    const biasLabel = bias === 'over' ? 'เกินเล็กน้อย' : bias === 'under' ? 'ต่ำเล็กน้อย' : 'สมดุล';
    const worstLine = worst ? `${getShortThaiDayName(worst.date)} ±${worst.absDiff} kcal` : 'ไม่มีวันหลุดชัดเจน';
    const weekendSwing = Math.abs(wkOver - wdOver);
    const weekendHasBoth = weekend.length > 0 && weekday.length > 0;
    const weekendSummary = weekendHasBoth
      ? (weekendSwing >= 120
          ? (wkOver > wdOver
              ? 'สุดสัปดาห์กินมากกว่า ทำเมนูเบากว่านี้วันเสาร์-อาทิตย์'
              : 'วันธรรมดาตึงไปนิด ลองเพิ่มของว่างโปรตีนสูง')
          : 'คงเส้นคงวาดีแล้ว')
      : 'ยังไม่มีข้อมูลเพียงพอสำหรับเปรียบเทียบวันธรรมดา/สุดสัปดาห์';
    const weekendExtra = weekendHasBoth && weekendSwing >= 120
      ? (wkOver > wdOver
          ? ' • สุดสัปดาห์มักเกิน: วางแผนเมนู/งดเครื่องดื่มหวานวันนั้น'
          : ' • วันธรรมดามักต่ำ: เติมของว่างช่วงบ่าย')
      : '';

    let balanceLabel = 'ข้อมูลไม่พอ';

    // Generate dynamic recommendations based on the data
    const recommendations = [];

    // No data recommendation (highest priority)
    if (insights.days_logged === 0) {
      recommendations.push({
        icon: 'clipboard-outline',
        color: '#6b7280',
        title: 'เริ่มบันทึกการกิน',
        message: 'ยังไม่มีการบันทึกการกินในสัปดาห์นี้ เริ่มบันทึกอาหารเพื่อติดตามความคืบหน้า'
      });
    } else {
      // Consistency recommendation
      if (insights.days_logged >= 5) {
        recommendations.push({
          icon: 'checkmark-circle',
          color: '#22c55e',
          title: 'ดีมาก!',
          message: `คุณบันทึกอาหารสม่ำเสมอ ${insights.days_logged} วันในสัปดาห์นี้`
        });
      } else if (insights.days_logged >= 3) {
        recommendations.push({
          icon: 'warning',
          color: '#f59e0b',
          title: 'บันทึกเพิ่มเติม',
          message: 'ควรบันทึกการกินอาหารให้ครบทุกวันเพื่อผลลัพธ์ที่แม่นยำ'
        });
      } else {
        recommendations.push({
          icon: 'alert-circle',
          color: '#ef4444',
          title: 'ต้องปรับปรุง',
          message: 'บันทึกการกินน้อยเกินไป ควรบันทึกทุกวันเพื่อติดตามความคืบหน้า'
        });
      }
    }

    if (insights.days_logged > 0) {
      if (withTargetDays === 0) {
        balanceLabel = 'ต้องระวัง';
        recommendations.push({
          icon: 'information-circle',
          color: '#0ea5e9',
          title: 'ข้อมูลยังไม่พอประเมินความแม่น',
          message: 'เพิ่มเป้าหมายแคลอรี่หรือบันทึกให้ครบมื้อ เพื่อให้ระบบวิเคราะห์คุณภาพสัปดาห์ได้ชัดขึ้น'
        });
      } else if (ratio >= 0.8 && (worst?.absDiff ?? 0) <= 200) {
        balanceLabel = 'ยอดเยี่ยม';
        recommendations.push({
          icon: 'checkmark-circle',
          color: '#22c55e',
          title: 'สัปดาห์นี้แม่นมาก',
          message: `อยู่ในเกณฑ์ ${inRangeDays}/${withTargetDays} วัน • วันหลุดสุด: ${worstLine} • แนวโน้ม ${biasLabel}. ${weekendSummary}`
        });
      } else if (ratio >= 0.6) {
        balanceLabel = 'ค่อนข้างดีแต่มีจุดหลุด';
        const biasAdvice = bias === 'over'
          ? 'โดยรวมมีแนวโน้มเกิน ลองลดของหวาน/น้ำมันในมื้อเย็น และเตรียมของว่างโปรตีนแทนขนม'
          : bias === 'under'
            ? 'โดยรวมต่ำจากเป้า เพิ่มคาร์บเชิงซ้อน/นม/ผลไม้หลังออกกำลังให้ถึงเป้า'
            : 'รักษาระดับวันนี้ แล้วโฟกัสแก้วันหลุดเฉพาะจุด';
        recommendations.push({
          icon: 'alert-circle',
          color: '#f59e0b',
          title: 'ค่อนข้างดี แต่มีจุดให้ปรับ',
          message: `ในเกณฑ์ ${inRangeDays}/${withTargetDays} วัน • วันที่หลุด: ${worstLine}. ${biasAdvice}${weekendExtra}`
        });
      } else {
        balanceLabel = 'ต้องระวัง';
        const biasTail = bias === 'over' ? ' (มักเกิน)' : bias === 'under' ? ' (มักต่ำ)' : '';
        recommendations.push({
          icon: 'warning',
          color: '#ef4444',
          title: 'ต้องระวัง ความแม่นยังต่ำ',
          message: `เข้าเกณฑ์เพียง ${inRangeDays}/${withTargetDays} วัน • วันหลุดสุด: ${worstLine}. แนะนำ: ตั้งเป้าช่วงเวลา/แจ้งเตือนบันทึกให้ครบ 5-6 วัน/สัปดาห์, วางแผนเมนูพื้นฐาน 2-3 เมนูหมุนเวียน, และเตรียมตัวเลือกแคลต่ำ/สูงตามทิศทางที่มักพลาด${biasTail}.`
        });
      }
    }

    // Weight trend recommendation
    if (insights.weight_logs >= 2 && insights.max_weight && insights.min_weight) {
      const weightChange = insights.max_weight - insights.min_weight;
      if (Math.abs(weightChange) < 0.5) {
        recommendations.push({
          icon: 'remove-circle',
          color: '#6b7280',
          title: 'น้ำหนักคงที่',
          message: 'น้ำหนักไม่เปลี่ยนแปลงมาก ดีสำหรับการรักษาระดับ'
        });
      } else if (weightChange < 0) {
        recommendations.push({
          icon: 'trending-down',
          color: '#22c55e',
          title: 'น้ำหนักลดลง',
          message: `น้ำหนักลดลง ${Math.abs(weightChange).toFixed(1)} กก. ในสัปดาห์นี้`
        });
      } else {
        recommendations.push({
          icon: 'trending-up',
          color: '#f59e0b',
          title: 'น้ำหนักเพิ่มขึ้น',
          message: `น้ำหนักเพิ่มขึ้น ${weightChange.toFixed(1)} กก. ควรระวังการกิน`
        });
      }
    } else {
      recommendations.push({
        icon: 'scale',
        color: '#06b6d4',
        title: 'ชั่งน้ำหนัก',
        message: 'ควรชั่งน้ำหนักสม่ำเสมอเพื่อติดตามความคืบหน้า'
      });
    }

    // Protein recommendation
    if (insights.avg_protein && insights.avg_protein_target) {
      const proteinRatio = insights.avg_protein / insights.avg_protein_target;
      if (proteinRatio < 0.8) {
        recommendations.push({
          icon: 'fitness',
          color: '#f59e0b',
          title: 'เพิ่มโปรตีน',
          message: `ควรทานโปรตีนเพิ่มขึ้น ${Math.round((insights.avg_protein_target - insights.avg_protein) * 10) / 10} กรัมต่อวัน`
        });
      }
    }

    res.json({
      success: true,
      data: {
        recommendations,
        insights: {
          days_logged: insights.days_logged,
          consistency_rate: Math.round((insights.days_logged / 7) * 100),
          avg_calories: Math.round(insights.avg_calories || 0),
          avg_target: Math.round(insights.avg_target || 0),
          balance_score: balanceLabel,
          calories_quality: {
            days_in_range: inRangeDays,
            total_days: withTargetDays,
            ratio_pct: Math.round(ratio * 100),
            worst_day: worst ? { date: worst.date, diff: worst.diff, abs_diff: worst.absDiff } : null,
            bias,
            weekend_avg_diff: wkOver,
            weekday_avg_diff: wdOver,
          }
        }
      }
    });

  } catch (error) {
    console.error('❌ [WeeklyReport] Error getting weekly insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get weekly insights',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
