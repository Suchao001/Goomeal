import { Request, Response } from 'express';
import db from '../db_config';
import { upsertDailyNutritionSummary } from './dailyNutritionSummary_controller';

interface EatingRecord {
  id?: number;
  user_id: number;
  log_date: string;
  food_name: string;
  meal_type?: string;
  calories?: number;
  carbs?: number;
  fat?: number;
  protein?: number;
  meal_time?: string;
  image?: string;
  unique_id?: string; 
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Create new eating record
 */
export const createEatingRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'ไม่พบข้อมูลผู้ใช้'
      });
      return;
    }

    const {
      log_date,
      food_name,
      meal_type,
      calories,
      carbs,
      fat,
      protein,
      meal_time,
      image,
      unique_id
    } = req.body;

    // Validation
    if (!log_date || !food_name) {
      res.status(400).json({
        success: false,
        error: 'กรุณาระบุวันที่และชื่ออาหาร'
      });
      return;
    }

    const recordData: EatingRecord = {
      user_id: userId,
      log_date,
      food_name,
      meal_type: meal_type || null,
      calories: calories || null,
      carbs: carbs || null,
      fat: fat || null,
      protein: protein || null,
      meal_time: meal_time || null,
      image: image || null,
      unique_id: unique_id || null
    };

    const [recordId] = await db('eating_record').insert(recordData);

    const newRecord = await db('eating_record')
      .where({ id: recordId })
      .first();

    console.log(`🍽️ [EatingRecord] User ${userId} recorded: "${food_name}" on ${log_date}`);

    // Update daily nutrition summary
    await upsertDailyNutritionSummary(userId, log_date);

    res.status(201).json({
      success: true,
      data: newRecord,
      message: 'บันทึกการกินเรียบร้อยแล้ว'
    });

  } catch (error) {
    console.error('Error creating eating record:', error);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
    });
  }
};

/**
 * Get eating records by date
 */
export const getEatingRecordsByDate = async (req: Request, res: Response): Promise<void> => {
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

    const records = await db('eating_record')
      .where({
        user_id: userId,
        log_date: date
      })
      .orderBy('meal_time', 'asc')
      .orderBy('id', 'asc');

    // Calculate total nutrients for the day
    const totalNutrients = records.reduce((total, record) => ({
      calories: total.calories + (record.calories || 0),
      carbs: total.carbs + (record.carbs || 0),
      fat: total.fat + (record.fat || 0),
      protein: total.protein + (record.protein || 0)
    }), { calories: 0, carbs: 0, fat: 0, protein: 0 });

    res.status(200).json({
      success: true,
      data: {
        records,
        summary: {
          date,
          total_records: records.length,
          total_nutrients: totalNutrients
        }
      }
    });

  } catch (error) {
    console.error('Error getting eating records:', error);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
    });
  }
};

/**
 * Get eating records by date range
 */
export const getEatingRecordsByDateRange = async (req: Request, res: Response): Promise<void> => {
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

    const records = await db('eating_record')
      .where('user_id', userId)
      .whereBetween('log_date', [start_date as string, end_date as string])
      .orderBy('log_date', 'desc')
      .orderBy('meal_time', 'asc');

    // Group by date and calculate daily totals
    const groupedByDate = records.reduce((acc: any, record) => {
      const date = record.log_date;
      if (!acc[date]) {
        acc[date] = {
          date,
          records: [],
          total_nutrients: { calories: 0, carbs: 0, fat: 0, protein: 0 }
        };
      }
      
      acc[date].records.push(record);
      acc[date].total_nutrients.calories += record.calories || 0;
      acc[date].total_nutrients.carbs += record.carbs || 0;
      acc[date].total_nutrients.fat += record.fat || 0;
      acc[date].total_nutrients.protein += record.protein || 0;
      
      return acc;
    }, {});

    const dailyRecords = Object.values(groupedByDate);

    res.status(200).json({
      success: true,
      data: {
        daily_records: dailyRecords,
        summary: {
          start_date,
          end_date,
          total_days: dailyRecords.length,
          total_records: records.length
        }
      }
    });

  } catch (error) {
    console.error('Error getting eating records by range:', error);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
    });
  }
};

/**
 * Update eating record
 */
export const updateEatingRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'ไม่พบข้อมูลผู้ใช้'
      });
      return;
    }

    // Check if record exists and belongs to user
    const existingRecord = await db('eating_record')
      .where({ id, user_id: userId })
      .first();

    if (!existingRecord) {
      res.status(404).json({
        success: false,
        error: 'ไม่พบข้อมูลการกินที่ต้องการแก้ไข'
      });
      return;
    }

    const {
      log_date,
      food_name,
      meal_type,
      calories,
      carbs,
      fat,
      protein,
      meal_time,
      image
    } = req.body;

    const updateData: Partial<EatingRecord> = {};
    
    if (log_date !== undefined) updateData.log_date = log_date;
    if (food_name !== undefined) updateData.food_name = food_name;
    if (meal_type !== undefined) updateData.meal_type = meal_type;
    if (calories !== undefined) updateData.calories = calories;
    if (carbs !== undefined) updateData.carbs = carbs;
    if (fat !== undefined) updateData.fat = fat;
    if (protein !== undefined) updateData.protein = protein;
    if (meal_time !== undefined) updateData.meal_time = meal_time;
    if (image !== undefined) updateData.image = image;

    await db('eating_record')
      .where({ id, user_id: userId })
      .update(updateData);

    const updatedRecord = await db('eating_record')
      .where({ id })
      .first();

    console.log(`🍽️ [EatingRecord] User ${userId} updated record ${id}: "${updatedRecord.food_name}"`);

    // Update daily nutrition summary
    await upsertDailyNutritionSummary(userId, updatedRecord.log_date);

    res.status(200).json({
      success: true,
      data: updatedRecord,
      message: 'แก้ไขข้อมูลการกินเรียบร้อยแล้ว'
    });

  } catch (error) {
    console.error('Error updating eating record:', error);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล'
    });
  }
};

/**
 * Delete eating record
 */
export const deleteEatingRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'ไม่พบข้อมูลผู้ใช้'
      });
      return;
    }

    // Check if record exists and belongs to user
    const existingRecord = await db('eating_record')
      .where({ id, user_id: userId })
      .first();

    if (!existingRecord) {
      res.status(404).json({
        success: false,
        error: 'ไม่พบข้อมูลการกินที่ต้องการลบ'
      });
      return;
    }

    await db('eating_record')
      .where({ id, user_id: userId })
      .del();

    console.log(`🍽️ [EatingRecord] User ${userId} deleted record ${id}: "${existingRecord.food_name}"`);

    // Update daily nutrition summary
    await upsertDailyNutritionSummary(userId, existingRecord.log_date);

    res.status(200).json({
      success: true,
      message: 'ลบข้อมูลการกินเรียบร้อยแล้ว'
    });

  } catch (error) {
    console.error('Error deleting eating record:', error);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการลบข้อมูล'
    });
  }
};

/**
 * Get eating statistics
 */
export const getEatingStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { period = '7' } = req.query; // Default 7 days
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'ไม่พบข้อมูลผู้ใช้'
      });
      return;
    }

    const days = parseInt(period as string) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const records = await db('eating_record')
      .where('user_id', userId)
      .where('log_date', '>=', startDate.toISOString().split('T')[0])
      .select('log_date', 'calories', 'carbs', 'fat', 'protein');

    // Calculate daily averages
    const dailyTotals = records.reduce((acc: any, record) => {
      const date = record.log_date;
      if (!acc[date]) {
        acc[date] = { calories: 0, carbs: 0, fat: 0, protein: 0, count: 0 };
      }
      
      acc[date].calories += record.calories || 0;
      acc[date].carbs += record.carbs || 0;
      acc[date].fat += record.fat || 0;
      acc[date].protein += record.protein || 0;
      acc[date].count += 1;
      
      return acc;
    }, {});

    const dailyData = Object.entries(dailyTotals).map(([date, totals]: [string, any]) => ({
      date,
      ...totals
    }));

    const totalDays = dailyData.length || 1;
    const averages = dailyData.reduce((acc, day: any) => ({
      calories: acc.calories + day.calories,
      carbs: acc.carbs + day.carbs,
      fat: acc.fat + day.fat,
      protein: acc.protein + day.protein,
      meals: acc.meals + day.count
    }), { calories: 0, carbs: 0, fat: 0, protein: 0, meals: 0 });

    const stats = {
      period_days: days,
      total_records: records.length,
      daily_averages: {
        calories: Math.round(averages.calories / totalDays),
        carbs: Math.round(averages.carbs / totalDays),
        fat: Math.round(averages.fat / totalDays),
        protein: Math.round(averages.protein / totalDays),
        meals: Math.round(averages.meals / totalDays * 10) / 10
      },
      daily_data: dailyData
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error getting eating stats:', error);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงสถิติ'
    });
  }
};

/**
 * Check if plan items are saved by unique_ids
 */
export const checkSavedPlanItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { unique_ids } = req.body;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'ไม่พบข้อมูลผู้ใช้'
      });
      return;
    }

    if (!unique_ids || !Array.isArray(unique_ids)) {
      res.status(400).json({
        success: false,
        error: 'กรุณาระบุ unique_ids'
      });
      return;
    }

    const savedRecords = await db('eating_record')
      .where('user_id', userId)
      .whereIn('unique_id', unique_ids)
      .select('unique_id', 'id');

    // สร้าง object ที่บอกว่า unique_id ไหนถูก save แล้ว
    const savedStatus = unique_ids.reduce((acc: any, id: string) => {
      acc[id] = { saved: false };
      return acc;
    }, {});

    savedRecords.forEach((record: any) => {
      if (record.unique_id) {
        savedStatus[record.unique_id] = { 
          saved: true, 
          recordId: record.id 
        };
      }
    });

    res.status(200).json({
      success: true,
      data: savedStatus
    });

  } catch (error) {
    console.error('Error checking saved plan items:', error);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการตรวจสอบ'
    });
  }
};
