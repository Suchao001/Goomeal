import { Request, Response } from 'express';
import db from '../db_config';

type MealRow = {
  id: number;
  user_id: number;
  meal_name: string;
  meal_time: string;    // 'HH:mm'
  sort_order: number | null;
  is_active: number | boolean | null;
  created_at?: any;
  updated_at?: any;
};

const toHHMM = (t: any) => {
  const s = String(t ?? '');
  const parts = s.split(':'); 
  if (parts.length >= 2) {
    const hh = parts[0].padStart(2, '0');
    const mm = parts[1].padStart(2, '0');
    return `${hh}:${mm}`;
  }
  return '00:00';
};

export const getMealTime = async (userId: number) => {
  if (!userId) throw new Error('Unauthorized');

  try {
    // ดึงรายการมื้ออาหารทั้งหมดของผู้ใช้
    const rows: MealRow[] = await db<MealRow>('user_meal_time')
      .select('*')
      .where({ user_id: userId })
      .orderBy('sort_order', 'asc');

    // ถ้ามีตาราง user_settings เก็บ toggle การแจ้งเตือน
    let notify_on_time = true; // ค่าเริ่มต้น
    try {
      const setting = await db('user_settings')
        .select('notify_on_time')
        .where({ user_id: userId })
        .first();
      if (setting && setting.notify_on_time != null) {
        // รองรับทั้ง boolean และ 0/1
        notify_on_time = !!Number(setting.notify_on_time);
      }
    } catch { /* ถ้าไม่มีตาราง/คอลัมน์ ก็ปล่อยค่า default */ }

    const meals = (rows || []).map((m, idx) => ({
      id: m.id,
      meal_name: m.meal_name,
      meal_time:  toHHMM(m.meal_time),
      sort_order: m.sort_order ?? idx + 1,
      is_active: typeof m.is_active === 'boolean' ? m.is_active : !!Number(m.is_active ?? 1),
    }));

    return {
      success: true,
      data: {
        meals,
        notify_on_time,
      },
    };
  } catch (error) {
    console.error('Error fetching meal times:', error);
    throw new Error('Internal server error');
  }
};

export const setMealTime = async (
  userId: number,
  payload: { meals: any[]; notify_on_time?: boolean }
) => {
  try {
    await db.transaction(async trx => {
      await trx('user_meal_time').where({ user_id: userId }).del();

      await trx('user_meal_time').insert(
        payload.meals.map((m, i) => ({
          user_id: userId,
          meal_name: m.meal_name,
          meal_time: m.meal_time,
          sort_order: m.sort_order ?? i + 1,
          is_active: m.is_active ? 1 : 0,
          created_at: trx.fn.now(),
          updated_at: trx.fn.now(),
        }))
      );
    });

    return { success: true, message: 'Meal times saved.' };
  } catch (err) {
    console.error('Error setting meal times:', err);
    throw new Error('Internal server error');
  }
};
