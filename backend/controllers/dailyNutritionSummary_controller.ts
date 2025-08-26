import { Request, Response } from 'express';
import db from '../db_config';

// Import Bangkok timezone utility
const getBangkokDate = (date: Date) => {
  return new Date(date.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
};

const toBangkokDate = (dateString: string) => {
  // If the string is already in YYYY-MM-DD format, use it directly
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // Otherwise, parse and convert to Bangkok timezone
  const date = new Date(dateString);
  const bangkokDate = getBangkokDate(date);
  return bangkokDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
};

interface DailyNutritionSummary {
  id?: number;
  user_id: number;
  summary_date: string;
  total_calories?: number;
  total_fat?: number;
  total_protein?: number;
  total_carbs?: number;
  recommendation?: string;
  weight?: number;
  // user targets
  target_cal?: number | null;
  target_fat?: number | null;
  target_carb?: number | null;
  target_protein?: number | null;
  // system recommended (duration-independent moderate approach)
  recommended_cal?: number | null;
  recommended_carb?: number | null;
  recommended_protein?: number | null;
  recommended_fat?: number | null;
}

// Calculate recommended macros from calories with simple balanced ratios (doesn't require weight)
const calcRecommendedFromCalories = (cal: number) => {
  // 50% carb, 20% protein, 30% fat
  const carbCal = cal * 0.5;
  const proteinCal = cal * 0.2;
  const fatCal = cal * 0.3;
  return {
    recommended_cal: Math.round(cal),
    recommended_carb: Math.round(carbCal / 4),
    recommended_protein: Math.round(proteinCal / 4),
    recommended_fat: Math.round(fatCal / 9)
  };
};

/**
 * Create or update daily nutrition summary
 */
export const upsertDailyNutritionSummary = async (userId: number, date: string): Promise<DailyNutritionSummary | null> => {
  try {
    const bangkokDate = toBangkokDate(date);
    console.log(`📊 [DailyNutrition] Upserting summary for user ${userId} on ${bangkokDate}`);
    
    // Calculate totals from eating records for this date
    const records = await db('eating_record')
      .where({
        user_id: userId,
        log_date: bangkokDate
      });

    console.log(`📊 [DailyNutrition] Found ${records.length} eating records for ${bangkokDate}`);

    const totals = records.reduce((acc, record) => ({
      total_calories: acc.total_calories + (record.calories || 0),
      total_fat: acc.total_fat + (record.fat || 0),
      total_protein: acc.total_protein + (record.protein || 0),
      total_carbs: acc.total_carbs + (record.carbs || 0)
    }), {
      total_calories: 0,
      total_fat: 0,
      total_protein: 0,
      total_carbs: 0
    });

    console.log(`📊 [DailyNutrition] Calculated totals:`, totals);

    // Check if summary already exists
    const existingSummary = await db('daily_nutrition_summary')
      .where({
        user_id: userId,
        summary_date: bangkokDate
      })
      .first();

    const summaryData: Partial<DailyNutritionSummary> = {
      user_id: userId,
      summary_date: bangkokDate,
      ...totals
    };

    if (existingSummary) {
      // Update existing summary (preserve existing target values)
      await db('daily_nutrition_summary')
        .where({
          user_id: userId,
          summary_date: bangkokDate
        })
        .update(summaryData);
        
      const updated = await db('daily_nutrition_summary')
        .where({
          user_id: userId,
          summary_date: bangkokDate
        })
        .first();
        
      console.log(`📊 [DailyNutrition] Updated existing summary with target_cal: ${updated?.target_cal || 'null'}`);
      return updated;
    } else {
      // Create new summary
      const [summaryId] = await db('daily_nutrition_summary').insert(summaryData);
      
      const created = await db('daily_nutrition_summary')
        .where({ id: summaryId })
        .first();
        
      console.log(`📊 [DailyNutrition] Created new summary with target_cal: ${created?.target_cal || 'null'}`);
      return created;
    }
  } catch (error) {
    console.error('❌ [DailyNutrition] Error upserting daily nutrition summary:', error);
    return null;
  }
};

/**
 * Get daily nutrition summary by date
 */
export const getDailyNutritionSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { date } = req.params;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'ไม่พบข้อมูลผู้ใช้'
      });
      return;
    }

    if (!date) {
      res.status(400).json({
        success: false,
        error: 'กรุณาระบุวันที่'
      });
      return;
    }

    const bangkokDate = toBangkokDate(date);
    console.log(`📊 [DailyNutrition] Getting summary for user ${userId} on ${bangkokDate}`);

    // Try to get existing summary first
    let summary = await db('daily_nutrition_summary')
      .where({
        user_id: userId,
        summary_date: bangkokDate
      })
      .first();

    console.log(`📊 [DailyNutrition] Found summary:`, summary ? 'Yes' : 'No');

    // If no summary exists, create one from eating records
    if (!summary) {
      console.log(`📊 [DailyNutrition] Creating summary from eating records for ${bangkokDate}`);
      summary = await upsertDailyNutritionSummary(userId, bangkokDate);
    }

    // If we have target_cal but missing recommended_*, populate recommended_* using simple ratios
    if (summary && summary.target_cal && (
      summary.recommended_cal == null ||
      summary.recommended_carb == null ||
      summary.recommended_protein == null ||
      summary.recommended_fat == null
    )) {
      const rec = calcRecommendedFromCalories(summary.target_cal);
      try {
        await db('daily_nutrition_summary')
          .where({ user_id: userId, summary_date: bangkokDate })
          .update(rec);
        // Reflect changes in memory
        summary = { ...summary, ...rec } as any;
        console.log(`✅ [DailyNutrition] Auto-filled recommended_* from target_cal for ${bangkokDate}`);
      } catch (err) {
        console.warn('⚠️ [DailyNutrition] Failed to update recommended_*:', err);
      }
    }

    if (summary) {
      console.log(`📊 [DailyNutrition] Returning summary with target_cal: ${summary.target_cal || 'null'}, recommended_cal: ${summary.recommended_cal || 'null'}`);
    }

    res.status(200).json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('❌ [DailyNutrition] Error getting daily nutrition summary:', error);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสรุป'
    });
  }
};

/**
 * Get daily nutrition summaries by date range
 */
export const getDailyNutritionSummariesByRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { start_date, end_date } = req.query;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'ไม่พบข้อมูลผู้ใช้'
      });
      return;
    }

    if (!start_date || !end_date) {
      res.status(400).json({
        success: false,
        error: 'กรุณาระบุช่วงวันที่'
      });
      return;
    }

    const summaries = await db('daily_nutrition_summary')
      .where('user_id', userId)
      .whereBetween('summary_date', [start_date as string, end_date as string])
      .orderBy('summary_date', 'desc');

    // Calculate averages
    const totalDays = summaries.length || 1;
    const averages = summaries.reduce((acc, summary) => ({
      avg_calories: acc.avg_calories + (summary.total_calories || 0),
      avg_fat: acc.avg_fat + (summary.total_fat || 0),
      avg_protein: acc.avg_protein + (summary.total_protein || 0),
      avg_carbs: acc.avg_carbs + (summary.total_carbs || 0)
    }), {
      avg_calories: 0,
      avg_fat: 0,
      avg_protein: 0,
      avg_carbs: 0
    });

    const stats = {
      avg_calories: Math.round(averages.avg_calories / totalDays),
      avg_fat: Math.round(averages.avg_fat / totalDays),
      avg_protein: Math.round(averages.avg_protein / totalDays),
      avg_carbs: Math.round(averages.avg_carbs / totalDays)
    };

    res.status(200).json({
      success: true,
      data: {
        summaries,
        period_stats: {
          start_date,
          end_date,
          total_days: totalDays,
          ...stats
        }
      }
    });

  } catch (error) {
    console.error('Error getting daily nutrition summaries by range:', error);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสรุป'
    });
  }
};


/**
 * Update recommendation for a specific date
 */
export const updateDailyRecommendation = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { date } = req.params;
    const { recommendation } = req.body;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'ไม่พบข้อมูลผู้ใช้'
      });
      return;
    }

    if (!date || !recommendation) {
      res.status(400).json({
        success: false,
        error: 'กรุณาระบุวันที่และคำแนะนำ'
      });
      return;
    }

    // Ensure summary exists for this date
    let summary = await db('daily_nutrition_summary')
      .where({
        user_id: userId,
        summary_date: date
      })
      .first();

    if (!summary) {
      // Create summary if it doesn't exist
      summary = await upsertDailyNutritionSummary(userId, date);
    }

    // Update recommendation
    await db('daily_nutrition_summary')
      .where({
        user_id: userId,
        summary_date: date
      })
      .update({ recommendation });

    const updatedSummary = await db('daily_nutrition_summary')
      .where({
        user_id: userId,
        summary_date: date
      })
      .first();

    console.log(`💡 [DailyNutrition] User ${userId} updated recommendation for ${date}`);

    res.status(200).json({
      success: true,
      data: updatedSummary,
      message: 'อัปเดตคำแนะนำเรียบร้อยแล้ว'
    });

  } catch (error) {
    console.error('Error updating daily recommendation:', error);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการอัปเดตคำแนะนำ'
    });
  }
};
