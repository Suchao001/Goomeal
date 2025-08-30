// utils/notification.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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
  // รองรับ "07:30" หรือ "07:30:00"
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
  idTag: string; // ไว้ trace/ลบทีหลัง
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
