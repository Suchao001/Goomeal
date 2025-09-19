// utils/autoNotifications.ts
import * as Notifications from 'expo-notifications';
import { ensurePermissionsAndChannel, scheduleDailyAt, scheduleOneShotDaily } from './notification';
import { apiClient } from './apiClient';
import { loadNotificationPrefs } from './notificationStorage';

const MEAL_TAG_PREFIX = 'meal-';
const DEFAULT_BODY = 'อย่าลืมบันทึกแคลอรี่ของคุณ';

type MealReminderConfig = {
  tag: string;
  hhmm: string;
  title: string;
  body?: string;
};

function parseHHmm(hhmm: string): { hour: number; minute: number } | null {
  const match = String(hhmm ?? '').trim().match(/^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/);
  if (!match) return null;
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

function normalizeHHmm(hhmm: string): string | null {
  const parsed = parseHHmm(hhmm);
  if (!parsed) return null;
  const hour = String(parsed.hour).padStart(2, '0');
  const minute = String(parsed.minute).padStart(2, '0');
  return `${hour}:${minute}`;
}

export async function scheduleMealItemRecurring(
  tag: string,
  hhmm: string,
  title: string,
  body: string,
  opts?: { soundEnabled?: boolean }
) {
  const parsed = parseHHmm(hhmm);
  if (!parsed) return;

  await scheduleDailyAt({
    idTag: tag,
    title,
    body,
    hour: parsed.hour,
    minute: parsed.minute,
    soundEnabled: opts?.soundEnabled ?? true,
  });
}

async function cancelObsoleteMealReminders(keepTags: Set<string>) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const req of scheduled) {
    const tag = typeof req?.content?.data?.idTag === 'string' ? req.content.data.idTag : undefined;
    if (!tag) continue;
    if (tag.startsWith(MEAL_TAG_PREFIX) && !keepTags.has(tag)) {
      try {
        await Notifications.cancelScheduledNotificationAsync(req.identifier);
      } catch (_) {}
    }
  }
}

export async function applyMealReminderSchedule(
  configs: MealReminderConfig[],
  opts?: { soundEnabled?: boolean; vibrationEnabled?: boolean }
) {
  try {
    await ensurePermissionsAndChannel({
      sound: opts?.soundEnabled ?? true,
      vibration: opts?.vibrationEnabled ?? true,
    });
  } catch (err) {
    console.warn('⚠️ cannot ensure permissions/channel for meal reminders', err);
    throw err;
  }

  const sanitized: MealReminderConfig[] = [];
  for (const cfg of configs) {
    const normalizedTime = normalizeHHmm(cfg.hhmm);
    if (!normalizedTime) continue;
    const tag = String(cfg.tag || '').trim();
    if (!tag.startsWith(MEAL_TAG_PREFIX)) continue;
    sanitized.push({
      tag,
      hhmm: normalizedTime,
      title: cfg.title || 'ถึงเวลา มื้ออาหาร 🍽️',
      body: cfg.body || DEFAULT_BODY,
    });
  }

  const keepTags = new Set(sanitized.map((c) => c.tag));
  console.log('🧹 syncing meal reminders', {
    incoming: sanitized.map((c) => ({ tag: c.tag, hhmm: c.hhmm })),
  });

  await cancelObsoleteMealReminders(keepTags);

  for (const cfg of sanitized) {
    await scheduleMealItemRecurring(cfg.tag, cfg.hhmm, cfg.title, cfg.body || DEFAULT_BODY, {
      soundEnabled: opts?.soundEnabled,
    });
  }
}

export async function scheduleMealRemindersForTimes(
  times: string[],
  opts?: {
    names?: string[];
    baseTag?: string;
    body?: string;
    soundEnabled?: boolean;
    vibrationEnabled?: boolean;
  }
) {
  const sanitizedBase = opts?.baseTag ? opts.baseTag.replace(/[^a-zA-Z0-9_-]/g, '') : 'custom';
  const base = sanitizedBase || 'custom';
  console.log('⏱️ scheduleMealRemindersForTimes called', { times, base, names: opts?.names });
  let soundEnabled = opts?.soundEnabled;
  let vibrationEnabled = opts?.vibrationEnabled;
  if (soundEnabled === undefined || vibrationEnabled === undefined) {
    try {
      const prefs = await loadNotificationPrefs();
      if (soundEnabled === undefined) soundEnabled = prefs?.sound !== false;
      if (vibrationEnabled === undefined) vibrationEnabled = prefs?.vibration !== false;
    } catch (_) {
      if (soundEnabled === undefined) soundEnabled = true;
      if (vibrationEnabled === undefined) vibrationEnabled = true;
    }
  }
  const configs: MealReminderConfig[] = times.map((time, index) => ({
    tag: `${MEAL_TAG_PREFIX}${base}-${index + 1}`,
    hhmm: time,
    title: `ถึงเวลา ${opts?.names?.[index] ?? `มื้อที่ ${index + 1}`} 🍽️`,
    body: opts?.body ?? DEFAULT_BODY,
  }));
  console.log('📋 derived reminder configs', configs);
  await applyMealReminderSchedule(configs, { soundEnabled: soundEnabled ?? true, vibrationEnabled: vibrationEnabled ?? true });
}

export async function scheduleMealRemindersFromServer() {
  console.log('🌐 fetching meal times for reminders');
  const [resp, localPrefs] = await Promise.all([
    apiClient.getMealTimes(),
    loadNotificationPrefs(),
  ]);

  const root = resp?.data?.data ?? resp?.data ?? {};
  const meals = Array.isArray(root?.meals) ? root.meals : [];
  const notify = root?.notify_on_time ?? true;
  const localToggle = localPrefs?.mealReminders ?? true;

  const soundEnabled = localPrefs?.sound !== false;
  const vibrationEnabled = localPrefs?.vibration !== false;

  if (!notify || !localToggle) {
    console.log('🚫 skipping reminders, notify flag or local toggle off', { notify, localToggle });
    await applyMealReminderSchedule([], { soundEnabled, vibrationEnabled });
    return;
  }

  const activeMeals = meals.filter((m: any) => m?.is_active);
  if (!activeMeals.length) {
    console.log('ℹ️ no active meals returned from server');
    await applyMealReminderSchedule([], { soundEnabled, vibrationEnabled });
    return;
  }

  const configs: MealReminderConfig[] = activeMeals.map((m: any) => {
    const hhmm = String(m?.meal_time || '');
    const name = (String(m?.meal_name || '').trim()) || 'มื้ออาหาร';
    const idOrName = m?.id ?? name ?? hhmm;
    return {
      tag: `${MEAL_TAG_PREFIX}${String(idOrName)}`,
      hhmm,
      title: `ถึงเวลา ${name} 🍽️`,
      body: DEFAULT_BODY,
    };
  });

  await applyMealReminderSchedule(configs, { soundEnabled, vibrationEnabled });
  console.log('✅ meal reminders updated from server', configs.length);
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

    let soundEnabled = true;
    try {
      const prefs = await loadNotificationPrefs();
      soundEnabled = prefs?.sound !== false;
    } catch (_) {}

    await scheduleOneShotDaily({
      idTag,
      title: n.request.content.title || 'มื้ออาหาร',
      body: n.request.content.body || '',
      hour,
      minute,
      soundEnabled,
    });
  });
}
