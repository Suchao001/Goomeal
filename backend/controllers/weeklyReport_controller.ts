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

    // Calorie balance recommendation using tolerance window
    const over = insights.days_over_range || 0;
    const under = insights.days_under_range || 0;
    const inRange = insights.days_in_range || 0;
    const withTargetDays = over + under + inRange;

    // Refine decision logic using average diff and proportion
    const avgTarget = Math.round(insights.avg_target || 0);
    const avgDiff = Math.round(insights.avg_calorie_diff || 0); // actual - target
    const tol = Math.max(100, Math.round(avgTarget * 0.10));
    const overThreshold = Math.max(2, Math.ceil(withTargetDays * 0.4));
    const underThreshold = overThreshold; // same threshold for symmetry
    const balancedThreshold = Math.max(2, Math.ceil(withTargetDays * 0.5));

    if (
      over >= overThreshold ||
      avgDiff > Math.floor(tol / 2)
    ) {
      recommendations.push({
        icon: 'trending-up',
        color: '#ef4444',
        title: 'แคลอรี่เกิน',
        message: `เกินเป้าหมายชัดเจน ${over}/${withTargetDays} วัน (เฉลี่ย +${avgDiff} kcal/วัน)`
      });
    } else if (
      under >= underThreshold ||
      avgDiff < -Math.floor(tol / 2)
    ) {
      recommendations.push({
        icon: 'trending-down',
        color: '#3b82f6',
        title: 'แคลอรี่น้อย',
        message: `ต่ำกว่าเป้าหมายหลายวัน ${under}/${withTargetDays} วัน (เฉลี่ย ${avgDiff} kcal/วัน) ลองเพิ่มของว่างที่โปรตีนสูง`
      });
    } else if (withTargetDays > 0 && inRange >= balancedThreshold) {
      recommendations.push({
        icon: 'checkmark-circle',
        color: '#22c55e',
        title: 'สมดุลดี',
        message: `แคลอรี่ในเกณฑ์ที่เหมาะสม ${inRange}/${withTargetDays} วัน`
      });
    } else {
      recommendations.push({
        icon: 'information-circle',
        color: '#10b981',
        title: 'ค่อนข้างดี',
        message: `โดยรวมใกล้เคียงเป้า มีบางวันที่เกิน/ต่ำกว่าเล็กน้อย (${inRange}/${withTargetDays} วันในเกณฑ์)`
      });
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
          balance_score: (inRange >= Math.max(1, Math.floor(withTargetDays * 0.5))) ? 'ดีมาก' :
                         (over > under ? 'เกินเป้า' : (under > over ? 'ต่ำกว่าเป้า' : 'ค่อนข้างดี'))
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
