import * as Notifications from 'expo-notifications';
import { ensurePermissionsAndChannel, scheduleOneShotDaily } from './notification';
import { apiClient } from './apiClient';
import { loadNotificationPrefs } from './notificationStorage';

function parseHHmm(hhmm: string): { hour: number; minute: number } | null {
  const m = hhmm?.match?.(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!m) return null;
  return { hour: Number(m[1]), minute: Number(m[2]) };
}

async function scheduleMealItemOnce(tag: string, hhmm: string, title: string, body: string) {
  const t = parseHHmm(hhmm);
  if (!t) return;
  await scheduleOneShotDaily({ title, body, hour: t.hour, minute: t.minute, idTag: tag });
}

export async function scheduleMealRemindersFromServer() {
  try {
    await ensurePermissionsAndChannel();
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

    const existing = await Notifications.getAllScheduledNotificationsAsync();
    const existingTags = new Set<string>(existing.map((n: any) => String(n?.content?.data?.idTag || '')));

    for (const m of activeMeals) {
      const hhmm = String(m?.meal_time || '');
      if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(hhmm)) continue;
      const name = String(m?.meal_name || '').trim();
      const idOrName = (m?.id ?? name);
      const tagKey = (idOrName || hhmm);
      const tag = `meal-${String(tagKey)}`;
      if (existingTags.has(tag)) continue;
      await scheduleMealItemOnce(tag, hhmm, `ถึงเวลา ${name || 'มื้ออาหาร'} 🍽️`, 'อย่าลืมบันทึกแคลอรี่ของคุณ');
    }
  } catch (_) {
    // silence debug logs
  }
}

export function initMealReminderRescheduler() {
  // เมื่อแจ้งเตือนของมื้อใดถูกส่ง ให้ตั้งของวันถัดไป
  const sub = Notifications.addNotificationReceivedListener(async (n) => {
    const data: any = n?.request?.content?.data || {};
    const idTag = data?.idTag as string | undefined;
    const hour = typeof data?.hour === 'number' ? data.hour : undefined;
    const minute = typeof data?.minute === 'number' ? data.minute : undefined;
    if (!idTag || !idTag.startsWith('meal-')) return;
    if (hour == null || minute == null) return;
    try {
      await scheduleOneShotDaily({
        title: n?.request?.content?.title || 'มื้ออาหาร',
        body: n?.request?.content?.body || '',
        hour,
        minute,
        idTag,
      });
    } catch (_) {}
  });
  return sub;
}
