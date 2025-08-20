import { Request, Response } from 'express';
import db from '../db_config';

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
}

/**
 * Create or update daily nutrition summary
 */
export const upsertDailyNutritionSummary = async (userId: number, date: string): Promise<DailyNutritionSummary | null> => {
  try {
    // Calculate totals from eating records for this date
    const records = await db('eating_record')
      .where({
        user_id: userId,
        log_date: date
      });

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

    // Check if summary already exists
    const existingSummary = await db('daily_nutrition_summary')
      .where({
        user_id: userId,
        summary_date: date
      })
      .first();

    const summaryData: Partial<DailyNutritionSummary> = {
      user_id: userId,
      summary_date: date,
      ...totals
    };

    if (existingSummary) {
      // Update existing summary
      await db('daily_nutrition_summary')
        .where({
          user_id: userId,
          summary_date: date
        })
        .update(summaryData);
        
      return await db('daily_nutrition_summary')
        .where({
          user_id: userId,
          summary_date: date
        })
        .first();
    } else {
      // Create new summary
      const [summaryId] = await db('daily_nutrition_summary').insert(summaryData);
      
      return await db('daily_nutrition_summary')
        .where({ id: summaryId })
        .first();
    }
  } catch (error) {
    console.error('Error upserting daily nutrition summary:', error);
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

    // Try to get existing summary first
    let summary = await db('daily_nutrition_summary')
      .where({
        user_id: userId,
        summary_date: date
      })
      .first();

    // If no summary exists, create one from eating records
    if (!summary) {
      summary = await upsertDailyNutritionSummary(userId, date);
    }

    res.status(200).json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Error getting daily nutrition summary:', error);
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
 * Update weight for a specific date
 */
export const updateDailyWeight = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { date } = req.params;
    const { weight } = req.body;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'ไม่พบข้อมูลผู้ใช้'
      });
      return;
    }

    if (!date || weight === undefined) {
      res.status(400).json({
        success: false,
        error: 'กรุณาระบุวันที่และน้ำหนัก'
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

    // Update weight
    await db('daily_nutrition_summary')
      .where({
        user_id: userId,
        summary_date: date
      })
      .update({ weight });

    const updatedSummary = await db('daily_nutrition_summary')
      .where({
        user_id: userId,
        summary_date: date
      })
      .first();

    console.log(`⚖️ [DailyNutrition] User ${userId} updated weight for ${date}: ${weight}kg`);

    res.status(200).json({
      success: true,
      data: updatedSummary,
      message: 'อัปเดตน้ำหนักเรียบร้อยแล้ว'
    });

  } catch (error) {
    console.error('Error updating daily weight:', error);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการอัปเดตน้ำหนัก'
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
