// screens/NotificationSettingsScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../../hooks/Navigation';
import { cancelAllScheduled, ensurePermissionsAndChannel } from '../../utils/notification';
import { scheduleMealRemindersForTimes } from '../../utils/autoNotifications';
import { loadNotificationPrefs, saveNotificationPrefs } from '../../utils/notificationStorage';

const NotificationSettingsScreen = () => {
  const navigation = useTypedNavigation<'NotificationSettings'>();

  const [mealTimes, setMealTimes] = useState<string[]>(['07:30:00', '12:00:00', '18:30:00']);

  const [notifications, setNotifications] = useState({
    mealReminders: false,
    sound: true,
    vibration: true,
    popup: true, 
  });

  React.useEffect(() => {
    // โหลดค่าที่บันทึกไว้ ถ้ามี
    (async () => {
      const saved = await loadNotificationPrefs();
      if (saved) {
        setNotifications({
          mealReminders: !!saved.mealReminders,
          sound: !!saved.sound,
          vibration: !!saved.vibration,
          popup: !!saved.popup,
        });
        if (Array.isArray(saved.mealTimes) && saved.mealTimes.length > 0) {
          setMealTimes(saved.mealTimes);
        }
      } else {
        // เก็บค่าเริ่มต้นครั้งแรก
        await saveNotificationPrefs({ ...notifications, mealTimes });
      }
    })();
  }, []);

  const handleToggle = async (key: keyof typeof notifications) => {
    // ถ้าเป็น sound/vibration ให้ update channel ด้วย
    if (key === 'sound' || key === 'vibration') {
      const next = !notifications[key];
      setNotifications(prev => ({ ...prev, [key]: next }));
      try {
        const soundNext = key === 'sound' ? next : notifications.sound;
        const vibrationNext = key === 'vibration' ? next : notifications.vibration;
        await ensurePermissionsAndChannel({
          sound: soundNext,
          vibration: vibrationNext,
        });
        await saveNotificationPrefs({
          mealReminders: notifications.mealReminders,
          sound: soundNext,
          vibration: vibrationNext,
          popup: notifications.popup,
          mealTimes,
        });

        if (notifications.mealReminders) {
          console.log('🔁 reapplying scheduled reminders after channel toggle', { soundNext, vibrationNext });
          await scheduleMealRemindersForTimes(mealTimes, {
            soundEnabled: soundNext,
            vibrationEnabled: vibrationNext,
          });
        }
      } catch (e) {
        Alert.alert('แจ้งเตือน', 'ตั้งค่า channel ไม่สำเร็จ');
        // revert state
        setNotifications(prev => ({ ...prev, [key]: !next }));
      }
      return;
    }

    // ถ้าเป็น mealReminders → สร้าง/ยกเลิก
    if (key === 'mealReminders') {
      const next = !notifications.mealReminders;
      setNotifications(prev => ({ ...prev, mealReminders: next }));
      try {
        if (next) {
          console.log('🔁 enabling meal reminders with times', mealTimes);
          await scheduleMealRemindersForTimes(mealTimes, {
            soundEnabled: notifications.sound,
            vibrationEnabled: notifications.vibration,
          });
          Alert.alert('ตั้งสำเร็จ', 'ตั้งแจ้งเตือนตามเวลาที่กำหนดแล้ว');
        } else {
          console.log('🛑 disabling all scheduled notifications');
          await cancelAllScheduled();
          Alert.alert('ยกเลิกแล้ว', 'ยกเลิกแจ้งเตือนทั้งหมด');
        }
        await saveNotificationPrefs({
          mealReminders: next,
          sound: notifications.sound,
          vibration: notifications.vibration,
          popup: notifications.popup,
          mealTimes,
        });
      } catch (e) {
        Alert.alert('ผิดพลาด', 'ตั้งค่าแจ้งเตือนไม่สำเร็จ');
        // revert
        setNotifications(prev => ({ ...prev, mealReminders: !next }));
      }
      return;
    }

    // popup: เก็บค่าไว้ใน storage สำหรับ Android
    if (key === 'popup') {
      const next = !notifications.popup;
      setNotifications(prev => ({ ...prev, popup: next }));
      await saveNotificationPrefs({
        mealReminders: notifications.mealReminders,
        sound: notifications.sound,
        vibration: notifications.vibration,
        popup: next,
        mealTimes,
      });
      return;
    }

    // default fallback
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // removed test handlers

  const notificationOptions = [
    { key: 'mealReminders' as const, label: 'แจ้งเตือนตามมื้ออาหาร', description: 'รับการแจ้งเตือนเวลามื้ออาหาร' },
    { key: 'sound' as const, label: 'เปิด/ปิดเสียงแจ้งเตือน', description: 'เปิดเสียงเมื่อมีการแจ้งเตือน' },
    { key: 'vibration' as const, label: 'สั่น', description: 'เปิดการสั่นเมื่อมีการแจ้งเตือน' },
    { key: 'popup' as const, label: 'ป๊อปอัพ', description: 'แสดงป๊อปอัพเมื่อมีการแจ้งเตือน' },
  ];

  return (
    <View className="flex-1 bg-gray-100">
      {/* header */}
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4 bg-white">
        <TouchableOpacity 
          className="w-10 h-10 rounded-full items-center justify-center"
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#9ca3af" />
        </TouchableOpacity>
        <View className="flex-row items-center gap-2">
          <Icon name="notifications" size={32} color="#9ca3af" />
          <Text className="text-lg font-semibold text-gray-800">การแจ้งเตือน</Text>
        </View>
        <Text className="text-base font-semibold text-gray-800"></Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="bg-white mx-4 my-4 rounded-xl p-5 shadow-lg shadow-slate-800">
          <Text className="text-xl font-promptSemiBold text-gray-800 mb-6">การแจ้งเตือน</Text>
          
          {notificationOptions.map((option) => (
            <View key={option.key} className="flex-row items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
              <View className="flex-1">
                <Text className="text-lg font-promptMedium text-gray-800">{option.label}</Text>
                <Text className="text-sm font-promptLight text-gray-600">{option.description}</Text>
              </View>
              <Switch
                value={notifications[option.key]}
                onValueChange={() => handleToggle(option.key)}
                trackColor={{ false: '#e5e7eb', true: '#ffb800' }}
                thumbColor="#ffffff"
                ios_backgroundColor="#e5e7eb"
              />
            </View>
          ))}
        
        </View>
      </ScrollView>
    </View>
  );
};

export default NotificationSettingsScreen;
