// utils/autoNotifications.ts
import * as Notifications from 'expo-notifications';
import { ensurePermissionsAndChannel, scheduleDailyAt, scheduleOneShotDaily } from './notification';
import { apiClient } from './apiClient';
import { loadNotificationPrefs } from './notificationStorage';

function parseHHmm(hhmm: string): { hour: number; minute: number } | null {
  const m = hhmm?.match?.(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!m) return null;
  return { hour: Number(m[1]), minute: Number(m[2]) };
}

async function scheduleMealItemRecurring(tag: string, hhmm: string, title: string, body: string) {
  const t = parseHHmm(hhmm);
  if (!t) return;
  console.log('📆 scheduling daily meal reminder', { tag, hhmm, hour: t.hour, minute: t.minute });
  await scheduleDailyAt({ idTag: tag, title, body, hour: t.hour, minute: t.minute });
}

export async function scheduleMealRemindersFromServer() {
  const granted = await ensurePermissionsAndChannel();
  if (!granted) return;

  const [resp, localPrefs] = await Promise.all([
    apiClient.getMealTimes(),
    loadNotificationPrefs(),
  ]);

  const root = resp?.data?.data ?? resp?.data ?? {};
  const meals = Array.isArray(root?.meals) ? root.meals : [];
  const notify = root?.notify_on_time ?? true;
  const localToggle = localPrefs?.mealReminders ?? true;

  if (!notify || !localToggle) return;

  const activeMeals = meals.filter((m: any) => m?.is_active);
  if (!activeMeals.length) return;

  for (const m of activeMeals) {
    const hhmm = String(m?.meal_time || '');
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(hhmm)) continue;

    const name = (String(m?.meal_name || '').trim()) || 'มื้ออาหาร';
    const tag = `meal-${m?.id ?? name ?? hhmm}`; // tag ต้องไม่ซ้ำ
    await scheduleMealItemRecurring(tag, hhmm, `ถึงเวลา ${name} 🍽️`, 'อย่าลืมบันทึกแคลอรี่ของคุณ');
  }
}

/** ใช้สำหรับ one-shot เท่านั้น (repeats ไม่ต้อง re-schedule) */
export function initMealReminderRescheduler() {
  return Notifications.addNotificationReceivedListener(async (n) => {
    const data: any = n?.request?.content?.data || {};
    if (data?.repeating) return; // ถ้าเป็น repeats: true ไม่ต้องทำอะไร
    const idTag = data?.idTag as string | undefined;
    const hour = typeof data?.hour === 'number' ? data.hour : undefined;
    const minute = typeof data?.minute === 'number' ? data.minute : undefined;
    if (!idTag || hour == null || minute == null) return;

    await scheduleOneShotDaily({
      idTag,
      title: n.request.content.title || 'มื้ออาหาร',
      body: n.request.content.body || '',
      hour,
      minute,
    });
  });
}
