
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getBangkokTime } from './bangkokTime';

export const ANDROID_CHANNEL_ID = 'meal-reminder';

export async function ensurePermissionsAndChannel({
  sound = true,
  vibration = true,
}: { sound?: boolean; vibration?: boolean } = {}) {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') throw new Error('permission denied');

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Meal Reminder',
      importance: Notifications.AndroidImportance.HIGH,
      sound: sound ? 'default' : undefined,
      enableVibrate: vibration,
      vibrationPattern: vibration ? [0, 250, 250, 250] : undefined,
      lightColor: '#ffb800',
    });
  }
}

function parseHHmmOrHHmmss(t: string) {
  
  const [h, m] = t.split(':').map((x) => parseInt(x, 10));
  return { hour: isNaN(h) ? 0 : h, minute: isNaN(m) ? 0 : m };
}

export async function scheduleDailyAt({
  title,
  body,
  hour,
  minute,
  idTag,
}: {
  title: string;
  body: string;
  hour: number;
  minute: number;
  idTag: string; 
}) {
  const notifId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
    },
    trigger: {
      hour,
      minute,
      repeats: true,
      channelId: ANDROID_CHANNEL_ID,
    },
  });
  return { notifId, hour, minute, idTag };
}

export async function scheduleOneTimeAtLocal({
  title,
  body,
  hour,
  minute,
  idTag,
}: {
  title: string;
  body: string;
  hour: number;
  minute: number;
  idTag: string;
}) {
  const now = new Date();
  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);
  if (target.getTime() <= now.getTime()) {
    
    target.setDate(target.getDate() + 1);
  }

  const notifId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
      data: { idTag },
    },
    
    trigger: {
      type: 'date',
      timestamp: target.getTime(),
      channelId: ANDROID_CHANNEL_ID,
    } as unknown as Notifications.NotificationTriggerInput,
  });

  return { notifId, fireDate: target, idTag };
}

export function computeNextLocalFireDate(hour: number, minute: number): Date {
  const now = new Date();
  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
  return target;
}

export function getTimeDiagnostics(target?: { hour: number; minute: number }) {
  const now = new Date();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offsetMinutesFromUTC = -now.getTimezoneOffset(); 
  const localDisplay = now.toLocaleString('th-TH', { hour12: false, timeZoneName: 'short' });
  const bkkNow = getBangkokTime();
  const bkkDisplay = bkkNow.toLocaleString('th-TH', { hour12: false, timeZoneName: 'short' });
  const next = target ? computeNextLocalFireDate(target.hour, target.minute) : undefined;
  const nextDisplay = next ? next.toLocaleString('th-TH', { hour12: false, timeZoneName: 'short' }) : undefined;

  return {
    tz,
    offsetMinutesFromUTC,
    nowISO: now.toISOString(),
    localDisplay,
    bangkokDisplay: bkkDisplay,
    nextTargetDisplay: nextDisplay,
  };
}

export async function scheduleOneShotDaily({
  title,
  body,
  hour,
  minute,
  idTag,
}: {
  title: string;
  body: string;
  hour: number;
  minute: number;
  idTag: string;
}) {
  const target = computeNextLocalFireDate(hour, minute);
  const notifId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
      data: { idTag, hour, minute },
    },
    trigger: {
      type: 'date',
      timestamp: target.getTime(),
      channelId: ANDROID_CHANNEL_ID,
    } as unknown as Notifications.NotificationTriggerInput,
  });
  return { notifId, fireDate: target, idTag };
}

export async function scheduleMealReminders(times: string[], opts?: { title?: string; body?: string }) {
  await ensurePermissionsAndChannel();
  const results = [];
  for (let i = 0; i < times.length; i++) {
    const { hour, minute } = parseHHmmOrHHmmss(times[i]);
    const r = await scheduleDailyAt({
      title: opts?.title ?? 'ถึงเวลากินข้าวแล้ว 🍚',
      body: opts?.body ?? 'อย่าลืมบันทึกแคลอรี่วันนี้',
      hour,
      minute,
      idTag: `meal-${i + 1}`,
    });
    results.push(r);
  }
  return results;
}

export async function cancelAllScheduled() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function listScheduled() {
  return Notifications.getAllScheduledNotificationsAsync();
}
