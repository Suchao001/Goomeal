import AsyncStorage from '@react-native-async-storage/async-storage';

export type NotificationPrefs = {
  mealReminders: boolean;
  sound: boolean;
  vibration: boolean;
  popup: boolean;
  mealTimes: string[]; 
};

const KEY = 'notif:prefs:v1';

export async function loadNotificationPrefs(): Promise<NotificationPrefs | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as NotificationPrefs;
  } catch (e) {
    return null;
  }
}

export async function saveNotificationPrefs(prefs: NotificationPrefs) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(prefs));
  } catch (e) {
    
  }
}

export async function clearNotificationPrefs() {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {}
}

