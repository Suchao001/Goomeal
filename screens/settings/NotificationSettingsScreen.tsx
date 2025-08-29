import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../../hooks/Navigation';
import * as Notifications from 'expo-notifications';

const ANDROID_CHANNEL_ID = 'general-noti'; // ต้องตรงกับที่ตั้งใน App.tsx

const NotificationSettingsScreen = () => {
  const navigation = useTypedNavigation<'NotificationSettings'>();

  const [notifications, setNotifications] = useState({
    mealReminders: false,
    sound: false,
    vibration: false,
    popup: false,
  });

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const notificationOptions = [
    { key: 'mealReminders' as const, label: 'แจ้งเตือนตามมื้ออาหาร', description: 'รับการแจ้งเตือนเวลามื้ออาหาร' },
    { key: 'sound' as const, label: 'เปิด/ปิดเสียงแจ้งเตือน', description: 'เปิดเสียงเมื่อมีการแจ้งเตือน' },
    { key: 'vibration' as const, label: 'สั่น', description: 'เปิดการสั่นเมื่อมีการแจ้งเตือน' },
    { key: 'popup' as const, label: 'ป๊อปอัพ', description: 'แสดงป๊อปอัพเมื่อมีการแจ้งเตือน' },
  ];

  const handleTestNoti = async () => {
   
    await Notifications.requestPermissionsAsync();

    // อัปเดต/สร้าง Android channel ให้ตรงกับสวิตช์ปัจจุบัน
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
        name: 'General',
        importance: Notifications.AndroidImportance.HIGH,
        sound: notifications.sound ? 'default' : undefined,
        enableVibrate: notifications.vibration,
        vibrationPattern: notifications.vibration ? [0, 250, 250, 250] : undefined,
        lightColor: '#ffb800',
      });
    }

    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'ทดสอบแจ้งเตือน',
        body: 'เด้งแล้วนะ 👋',
      },
      trigger: null, // immediate
    });
  };

  return (
    <View className="flex-1 bg-gray-100">
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

          {/* ปุ่มทดสอบแจ้งเตือน */}
          <TouchableOpacity
            className="mt-6 rounded-xl p-4 items-center"
            style={{ backgroundColor: '#ffb800' }}
            onPress={handleTestNoti}
            activeOpacity={0.85}
          >
            <View className="flex-row items-center gap-2">
              <Icon name="notifications-outline" size={20} color="#ffffff" />
              <Text className="text-white font-promptBold text-base">ทดสอบแจ้งเตือน</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default NotificationSettingsScreen;
