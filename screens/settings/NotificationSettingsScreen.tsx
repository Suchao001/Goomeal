// screens/NotificationSettingsScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../../hooks/Navigation';
import { scheduleMealReminders, cancelAllScheduled, listScheduled, ensurePermissionsAndChannel } from '../../utils/notification';

const NotificationSettingsScreen = () => {
  const navigation = useTypedNavigation<'NotificationSettings'>();

  const [mealTimes, setMealTimes] = useState<string[]>(['07:30:00', '12:00:00', '18:30:00']);

  const [notifications, setNotifications] = useState({
    mealReminders: false,
    sound: true,
    vibration: true,
    popup: true, 
  });

  const handleToggle = async (key: keyof typeof notifications) => {
    // ถ้าเป็น sound/vibration ให้ update channel ด้วย
    if (key === 'sound' || key === 'vibration') {
      const next = !notifications[key];
      setNotifications(prev => ({ ...prev, [key]: next }));
      try {
        await ensurePermissionsAndChannel({
          sound: key === 'sound' ? next : notifications.sound,
          vibration: key === 'vibration' ? next : notifications.vibration,
        });
      } catch (e) {
        Alert.alert('แจ้งเตือน', 'ตั้งค่า channel ไม่สำเร็จ');
      }
      return;
    }

    // ถ้าเป็น mealReminders → สร้าง/ยกเลิก
    if (key === 'mealReminders') {
      const next = !notifications.mealReminders;
      setNotifications(prev => ({ ...prev, mealReminders: next }));
      try {
        if (next) {
          await scheduleMealReminders(mealTimes, {
            title: 'ถึงเวลากินข้าวแล้ว 🍚',
            body: 'อย่าลืมบันทึกแคลอรี่วันนี้',
          });
          Alert.alert('ตั้งสำเร็จ', 'ตั้งแจ้งเตือนตามเวลาที่กำหนดแล้ว');
        } else {
          await cancelAllScheduled();
          Alert.alert('ยกเลิกแล้ว', 'ยกเลิกแจ้งเตือนทั้งหมด');
        }
      } catch (e) {
        Alert.alert('ผิดพลาด', 'ตั้งค่าแจ้งเตือนไม่สำเร็จ');
      }
      return;
    }

    // popup: แค่ state ไว้ก่อน (ถ้าจะคุม iOS popup ลึกๆ ใช้ handler ที่ root)
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTestNoti = async () => {
    // “ลอกตามเวลาที่ set ไว้”: สั่ง schedule ทั้งหมดตรงๆ
    try {
      await scheduleMealReminders(mealTimes, {
        title: '🔔 ทดสอบตามเวลาที่ตั้ง',
        body: 'นี่คือการทดสอบแจ้งเตือนตามมื้อ',
      });
      const all = await listScheduled();
      Alert.alert('ทดสอบตั้งแล้ว', `กำหนด ${all.length} แจ้งเตือนตามเวลาที่ตั้งไว้`);
    } catch (e) {
      Alert.alert('ผิดพลาด', 'ตั้งค่าแจ้งเตือนทดสอบไม่สำเร็จ');
    }
  };

  const notificationOptions = [
    { key: 'mealReminders' as const, label: 'แจ้งเตือนตามมื้ออาหาร', description: 'รับการแจ้งเตือนเวลามื้ออาหาร' },
    { key: 'sound' as const, label: 'เปิด/ปิดเสียงแจ้งเตือน', description: 'เปิดเสียงเมื่อมีการแจ้งเตือน' },
    { key: 'vibration' as const, label: 'สั่น', description: 'เปิดการสั่นเมื่อมีการแจ้งเตือน' },
    { key: 'popup' as const, label: 'ป๊อปอัพ', description: 'แสดงป๊อปอัพเมื่อมีการแจ้งเตือน (iOS handler)' },
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

          {/* ปุ่มทดสอบแจ้งเตือน (ตั้งตามเวลา) */}
          <TouchableOpacity
            className="mt-6 rounded-xl p-4 items-center"
            style={{ backgroundColor: '#ffb800' }}
            onPress={handleTestNoti}
            activeOpacity={0.85}
          >
            <View className="flex-row items-center gap-2">
              <Icon name="notifications-outline" size={20} color="#ffffff" />
              <Text className="text-white font-promptBold text-base">ทดสอบตามเวลาที่ตั้งไว้</Text>
            </View>
          </TouchableOpacity>

          {/* debug: ดูรายการที่ตั้งแล้ว */}
          <TouchableOpacity
            className="mt-3 rounded-xl p-3 items-center border border-gray-200"
            onPress={async () => {
              const all = await listScheduled();
              Alert.alert('กำหนดไว้ทั้งหมด', JSON.stringify(all, null, 2));
            }}
          >
            <Text className="text-gray-800">แสดงรายการที่ตั้งไว้</Text>
          </TouchableOpacity>

          {/* ยกเลิกทั้งหมด */}
          <TouchableOpacity
            className="mt-3 rounded-xl p-3 items-center border border-gray-200"
            onPress={async () => {
              await cancelAllScheduled();
              Alert.alert('ยกเลิกแล้ว', 'ยกเลิกแจ้งเตือนทั้งหมด');
            }}
          >
            <Text className="text-gray-800">ยกเลิกแจ้งเตือนทั้งหมด</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default NotificationSettingsScreen;
