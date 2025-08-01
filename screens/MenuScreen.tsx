import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../hooks/Navigation';
import { useAuth } from '../AuthContext';
import Menu from './material/Menu';


/**
 * MenuScreen Component
 * หน้าเมนู - เมนูหลักของแอปพลิเคชัน
 */
const MenuScreen = () => {
  const navigation = useTypedNavigation<'Menu'>(); 
  const { logout, user } = useAuth();

  const handleProfilePress = useCallback(() => {
    navigation.navigate('ProfileDetail');
  }, [navigation]);

  const handleAccountSettingsPress = useCallback(() => {
    navigation.navigate('EditAccountSettings');
  }, [navigation]);

  const handleFirstTimeSetupPress = useCallback(() => {
    navigation.navigate('PersonalSetup');
  }, [navigation]);

  const handlePlanSelectionPress = useCallback(() => {
    navigation.navigate('PlanSelection');
  }, [navigation]);

  const handleEatingReportPress = useCallback(() => {
    navigation.navigate('EatingReport');
  }, [navigation]);

  const handleEatingStyleSettingsPress = useCallback(() => {
    navigation.navigate('EatingStyleSettings');
  }, [navigation]);

  const handleNotificationSettingsPress = useCallback(() => {
    navigation.navigate('NotificationSettings');
  }, [navigation]);

  const handleRecordSettingsPress = useCallback(() => {
    navigation.navigate('RecordSettings');
  }, [navigation]);

  const handleMealTimeSettingsPress = useCallback(() => {
    navigation.navigate('MealTimeSettings');
  }, [navigation]);

  // สำหรับ handleLogout มี dependency เป็นฟังก์ชัน logout จาก useAuth
  // ซึ่งเราได้แก้ไขให้คงที่ด้วย useCallback ใน AuthContext แล้ว
  const handleLogout = useCallback(() => {
    Alert.alert(
      'ออกจากระบบ',
      'คุณต้องการออกจากระบบหรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ออกจากระบบ',
          style: 'destructive',
          onPress: logout, // เรียกใช้ logout โดยตรง
        },
      ],
      { cancelable: true }
    );
  }, [logout]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      
      {/* Main Content */}
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* User Profile Section */}
        <View className="bg-white mx-4 mt-8 rounded-xl shadow-sm p-6">
          <View className="flex-row items-center">
        {/* Avatar with gradient background */}
        <View className="relative">
          <View className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full items-center justify-center shadow-lg">
            <View className="w-14 h-14 bg-white/20 rounded-full items-center justify-center backdrop-blur-sm">
              <Icon name="person" size={24} color="black" />
            </View>
          </View>
          
          <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full items-center justify-center shadow-sm">
            <View className="w-3 h-3 bg-green-500 rounded-full"></View>
          </View>
        </View>

  <View className="ml-4 flex-1">
    <Text className="text-xl font-bold text-gray-800" numberOfLines={1}>
      {user?.username || user?.name || user?.email || 'ผู้ใช้งาน'}
    </Text>
    <View className="flex-row items-center mt-1">
      <Text className="text-sm text-green-600 font-medium">ออนไลน์</Text>
      <View className="w-1 h-1 bg-gray-300 rounded-full mx-2"></View>
      <Text className="text-xs text-gray-500">พร้อมใช้งาน</Text>
    </View>
  </View>
  
  {/* Settings button with better styling */}
  <TouchableOpacity 
    className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-full items-center justify-center shadow-sm active:bg-gray-100"
    onPress={handleAccountSettingsPress}
  >
    <Icon name="settings" size={18} color="#6b7280" />
  </TouchableOpacity>
</View>

          {/* Quick Actions */}
          <View className="mt-4 pt-4 border-t border-gray-100">
            <TouchableOpacity 
              className="flex-row items-center p-3 bg-gray-50 rounded-lg"
              onPress={handleProfilePress}
            >
              <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
                <Icon name="person" size={16} color="#3b82f6" />
              </View>
              <Text className="text-sm font-medium text-gray-700 flex-1">ข้อมูลส่วนตัว</Text>
              <Icon name="chevron-forward" size={16} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {user?.first_time_setting == false && (
          <View className="mx-4 mt-6">
            <Text className="text-lg font-bold text-gray-800 mb-3">เริ่มต้นใช้งาน</Text>
            <TouchableOpacity 
              className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex-row items-center"
              onPress={handleFirstTimeSetupPress}
          >
            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
              <Icon name="document-text" size={24} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-blue-800">กรอกข้อมูลครั้งแรก</Text>
              <Text className="text-sm text-blue-600 mt-1">กรอกข้อมูลส่วนตัวเพื่อเริ่มใช้งาน</Text>
            </View>
            <Icon name="chevron-forward" size={20} color="#3b82f6" />
          </TouchableOpacity>
        </View>
        )}

       
            {/* Main Menu */}
        <View className="mx-4 mt-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">เมนูหลัก </Text>
          <View className="bg-white rounded-xl shadow-sm overflow-hidden">
            
          <TouchableOpacity 
                className="flex-row items-center p-4 border-b border-gray-100 bg-green-50"
                onPress={() => navigation.navigate('OptionPlan')}
              >
                <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-4">
                  <Icon name="add-circle" size={20} color="#22c55e" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-800">เพิ่มแผนอาหาร</Text>
                  <Text className="text-xs text-gray-500">สร้างแผนอาหารใหม่อย่างรวดเร็ว</Text>
                </View>
                <Icon name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>


             <TouchableOpacity 
              className="flex-row items-center p-4 border-b border-gray-100"
              onPress={handleEatingReportPress}
            >
              <View className="w-10 h-10 bg-yellow-100 rounded-full items-center justify-center mr-4">
                <Icon name="analytics" size={20} color="#f59e0b" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-800">รายงานการกิน</Text>
                <Text className="text-xs text-gray-500">ดูสถิติและรายงานการบริโภคอาหาร</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center p-4 border-b border-gray-100"
              onPress={handlePlanSelectionPress}
            >
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-4">
                <Icon name="restaurant" size={20} color="#22c55e" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-800">เลือกแพลนการกิน</Text>
                <Text className="text-xs text-gray-500">เลือกแพลนอาหารที่เหมาะสมกับคุณ</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>


            <TouchableOpacity 
              className="flex-row items-center p-4 border-b border-gray-100"
              onPress={handleEatingStyleSettingsPress}
            >
              <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-4">
                <Icon name="options" size={20} color="#8b5cf6" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-800">ตั้งค่าการรูปแบบการกิน</Text>
                <Text className="text-xs text-gray-500">กำหนดรูปแบบการกินที่เหมาะสม</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center p-4 border-b border-gray-100"
              onPress={handleNotificationSettingsPress}
            >
              <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-4">
                <Icon name="notifications" size={20} color="#f97316" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-800">ตั้งค่าการแจ้งเตือน</Text>
                <Text className="text-xs text-gray-500">จัดการการแจ้งเตือนต่างๆ</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center p-4 border-b border-gray-100"
              onPress={handleRecordSettingsPress}
            >
              <View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center mr-4">
                <Icon name="create" size={20} color="#6366f1" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-800">ตั้งค่าบันทึกการกิน</Text>
                <Text className="text-xs text-gray-500">กำหนดวิธีการบันทึกอาหาร</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center p-4"
              onPress={handleMealTimeSettingsPress}
            >
              <View className="w-10 h-10 bg-teal-100 rounded-full items-center justify-center mr-4">
                <Icon name="time" size={20} color="#14b8a6" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-800">ตั้งเวลามื้ออาหาร</Text>
                <Text className="text-xs text-gray-500">กำหนดเวลาสำหรับแต่ละมื้อ</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>
        

        {/* Additional Options */}
        <View className="mx-4 mt-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">อื่นๆ</Text>
          <View className="bg-white rounded-xl shadow-sm overflow-hidden">
            <TouchableOpacity 
              className="flex-row items-center p-4"
              onPress={handleLogout}
            >
              <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-4">
                <Icon name="log-out" size={20} color="#ef4444" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-red-500">ออกจากระบบ</Text>
                <Text className="text-xs text-red-400">ลงชื่อออกจากบัญชี</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Version */}
        <View className="mx-4 mt-6 mb-4">
          <Text className="text-center text-sm text-gray-400">
            GoodMeal App v1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <Menu />
    </SafeAreaView>
  );
};

export default MenuScreen;