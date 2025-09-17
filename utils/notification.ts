import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getBangkokTime } from './bangkokTime';

export const ANDROID_CHANNEL_ID = 'general-noti';

function keyFor(idTag: string) {
  return `NOTI_ID__${idTag}`;
}

export async function ensurePermissionsAndChannel({
  sound = true,
  vibration = true,
}: { sound?: boolean; vibration?: boolean } = {}) {
  if (Platform.OS === 'web') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'General',
      importance: Notifications.AndroidImportance.HIGH,
      sound: sound ? 'default' : undefined,
      enableVibrate: vibration,
      vibrationPattern: vibration ? [0, 250, 250, 250] : undefined,
      lightColor: '#ffb800',
    });
  }

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') throw new Error('permission denied');
  return true;
}

function parseHHmmOrHHmmss(t: string) {
  const s = String(t || '').trim();
  const m = s.match(/^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/);
  if (!m) return { hour: 0, minute: 0 };
  return { hour: Number(m[1]), minute: Number(m[2]) };
}


export async function scheduleDailyAt({
  title,
  body,
  hour,
  minute,
  idTag,
  soundEnabled = true,
}: {
  title: string;
  body: string;
  hour: number;
  minute: number;
  idTag: string;
  soundEnabled?: boolean;
}) {
  // ยกเลิกของเดิม (ถ้ามี) ด้วย id ที่เก็บไว้
  const oldId = await AsyncStorage.getItem(keyFor(idTag));
  if (oldId) {
    try { await Notifications.cancelScheduledNotificationAsync(oldId); } catch (_) {}
  }

  // คำนวณ "ครั้งถัดไป" ให้เป็นอนาคตเสมอ
  const now = new Date();
  const target = new Date();
  target.setSeconds(0, 0);
  target.setHours(hour, minute, 0, 0);
  if (target <= now) {
    target.setDate(target.getDate() + 1);
    target.setHours(hour, minute, 0, 0);
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: soundEnabled ? 'default' : undefined,
      data: { idTag, hour, minute, repeating: false }, // ✅ one-shot
    },
    trigger: target // ✅ absolute timestamp avoids deprecated Date trigger
  });

  await AsyncStorage.setItem(keyFor(idTag), id);
  return id;
}


export async function scheduleOneTimeAtLocal({
  title,
  body,
  hour,
  minute,
  idTag,
  soundEnabled = true,
}: {
  title: string;
  body: string;
  hour: number;
  minute: number;
  idTag: string;
  soundEnabled?: boolean;
}) {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);
  if (target.getTime() <= now.getTime() + 2000) {
    target.setDate(target.getDate() + 1);
    target.setHours(hour, minute, 0, 0);
  }

  const oldId = await AsyncStorage.getItem(keyFor(idTag));
  if (oldId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(oldId);
    } catch (_) {}
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: soundEnabled ? 'default' : undefined,
      data: { idTag, hour, minute, repeating: false },
    },
    trigger: target // ✅ absolute timestamp avoids deprecated Date trigger
  });

  await AsyncStorage.setItem(keyFor(idTag), id);
  return id;
}

export function computeNextLocalFireDate(hour: number, minute: number): Date {
  const now = new Date();
  const target = new Date();
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
  soundEnabled = true,
}: {
  title: string;
  body: string;
  hour: number;
  minute: number;
  idTag: string;
  soundEnabled?: boolean;
}) {
  return scheduleOneTimeAtLocal({ title, body, hour, minute, idTag, soundEnabled });
}

export async function scheduleMealReminders(
  times: string[],
  opts?: { title?: string; body?: string; soundEnabled?: boolean; vibrationEnabled?: boolean }
) {
  await ensurePermissionsAndChannel({
    sound: opts?.soundEnabled ?? true,
    vibration: opts?.vibrationEnabled ?? true,
  });
  const results: string[] = [];
  for (let i = 0; i < times.length; i++) {
    const { hour, minute } = parseHHmmOrHHmmss(times[i]);
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) continue; // skip ผิดรูป
    const r = await scheduleDailyAt({
      title: opts?.title ?? 'ถึงเวลากินข้าวแล้ว 🍚',
      body: opts?.body ?? 'อย่าลืมบันทึกแคลอรี่วันนี้',
      hour,
      minute,
      idTag: `meal-${i + 1}`,
      soundEnabled: opts?.soundEnabled ?? true,
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
