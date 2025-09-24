import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, SafeAreaView, Modal, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTypedNavigation } from '../hooks/Navigation';
import { useAuth } from '../AuthContext';
import Menu from './material/Menu';

// Avatar images mapping
const avatarImages = {
  1: require('./../assets/images/avatar/0.png'),
  2: require('./../assets/images/avatar/1.png'),
  3: require('./../assets/images/avatar/2.png'),
  4: require('./../assets/images/avatar/3.png'),
  5: require('./../assets/images/avatar/4.png'),
  6: require('./../assets/images/avatar/5.png'),
};


/**
 * MenuScreen Component
 * หน้าเมนู - เมนูหลักของแอปพลิเคชัน
 */
const MenuScreen = () => {
  const navigation = useTypedNavigation<'Menu'>(); 
  const { logout, user } = useAuth();
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(1); // Default to avatar 1

  // Load avatar from AsyncStorage on component mount
  useEffect(() => {
    const loadAvatar = async () => {
      try {
        const storedAvatar = await AsyncStorage.getItem('selectedAvatar');
        if (storedAvatar) {
          setSelectedAvatar(parseInt(storedAvatar, 10));
        }
      } catch (error) {
        console.error('Error loading avatar from AsyncStorage:', error);
      }
    };

    loadAvatar();
  }, []);

  // Save avatar to AsyncStorage
  const saveAvatarToStorage = async (avatarId: number) => {
    try {
      await AsyncStorage.setItem('selectedAvatar', avatarId.toString());
      console.log('Avatar saved to AsyncStorage:', avatarId);
    } catch (error) {
      console.error('Error saving avatar to AsyncStorage:', error);
    }
  };

  const handleProfilePress = useCallback(() => {
    navigation.navigate('ProfileDetail');
  }, [navigation]);

  // Avatar functions
  const handleAvatarPress = useCallback(() => {
    setShowAvatarModal(true);
  }, []);

  const handleSelectAvatar = useCallback(async (avatarId: number) => {
    setSelectedAvatar(avatarId);
    await saveAvatarToStorage(avatarId);
    setShowAvatarModal(false);
  }, []);

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

  const handleNutritionPrinciplesPress = useCallback(() => {
    navigation.navigate('NutritionPrinciples');
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
        <View className="bg-white mx-4 mt-8 rounded-xl shadow-md shadow-slate-600 p-6 ">
          <View className="flex-row items-center">
        {/* Avatar with gradient background */}
        <View className="relative">
          <TouchableOpacity onPress={handleAvatarPress}>
            <View className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full items-center justify-center shadow-lg">
              <Image 
                source={avatarImages[selectedAvatar as keyof typeof avatarImages]}
                className="w-14 h-14 rounded-full"
                resizeMode="cover"
              />
            </View>
          </TouchableOpacity>
          
          {/* Edit icon */}
          <TouchableOpacity 
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full items-center justify-center shadow-sm border border-gray-200"
            onPress={handleAvatarPress}
          >
            <Icon name="pencil" size={12} color="#6b7280" />
          </TouchableOpacity>
        </View>

  <View className="ml-4 flex-1">
    <Text className="text-xl font-promptBold text-myBlack" numberOfLines={1}>
      {user?.username || user?.name || user?.email || 'ผู้ใช้งาน'}
    </Text>
    <View className="flex-row items-center mt-1">
      <Text className="text-sm text-green-600 font-promptMedium">ออนไลน์</Text>
      <View className="w-1 h-1 bg-gray-300 rounded-full mx-2"></View>
     {!user?.is_verified && (<View className="bg-red-100 px-2 py-0.5 rounded-full mr-2"><Text className="text-xs text-red-600 font-promptMedium">ยังไม่ยืนยันบัญชี</Text></View>)}
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
              <Text className="text-sm font-promptMedium text-gray-700 flex-1">ข้อมูลส่วนตัว</Text>
              <Icon name="chevron-forward" size={16} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {user?.first_time_setting == false && (
          <View className="mx-4 mt-6">
            <Text className="text-lg font-promptBold text-myBlack mb-3">เริ่มต้นใช้งาน</Text>
            <TouchableOpacity 
              className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex-row items-center"
              onPress={handleFirstTimeSetupPress}
          >
            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
              <Icon name="document-text" size={24} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-promptSemiBold text-blue-800">กรอกข้อมูลครั้งแรก</Text>
              <Text className="text-sm text-blue-600 mt-1 font-prompt">กรอกข้อมูลส่วนตัวเพื่อเริ่มใช้งาน</Text>
            </View>
            <Icon name="chevron-forward" size={20} color="#3b82f6" />
          </TouchableOpacity>
        </View>
        )}

        {user?.is_verified == false && (
        <View className="mx-4 mt-6">
          <Text className="text-lg font-promptBold text-myBlack mb-3">ยืนยันบัญชี</Text>
          <TouchableOpacity 
            className="bg-red-50 border border-red-200 rounded-xl p-4 flex-row items-center"
            onPress={() => {navigation.navigate('EmailVerification')}}
        >
          <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center mr-4">
            <Icon name="mail" size={24} color="#ef4444" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-promptSemiBold text-red-800">ยืนยันอีเมลของคุณ</Text>
            <Text className="text-sm text-red-600 mt-1 font-prompt">กรุณายืนยันอีเมลเพื่อใช้ตอนลืมรหัสผ่าน</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#ef4444" />
        </TouchableOpacity>
        </View>
        )}

        {/* Quick Actions - 2 Columns */}
        <View className="mx-4 mt-6">
          <Text className="text-lg font-promptBold text-myBlack mb-3">การจัดการอาหาร</Text>
          <View className="bg-white rounded-xl shadow-md shadow-slate-600 overflow-hidden flex-row ">
            {/* เพิ่มแผนอาหาร */}
            <TouchableOpacity 
              className="flex-1 bg-white p-3 items-center border-r border-gray-200"
              onPress={() => navigation.navigate('OptionPlan',{from:'Menu'})}
            >
                <View className="w-10 h-10  rounded-full items-center justify-center mb-2">
                <Icon name="restaurant" size={20} color="#22c55e" />
                </View>
              <Text className="text-xs font-promptSemiBold text-green-800 text-center">เพิ่มแผนอาหาร</Text>
              <Text className="text-xs text-green-600 mt-1 text-center font-prompt">สร้างแผนใหม่</Text>
            </TouchableOpacity>

            {/* จัดการเมนูอาหาร */}
            <TouchableOpacity 
              className="flex-1 bg-white p-3 items-center"
              onPress={() => navigation.navigate('MyFood' as any)}
            >
              <View className="w-10 h-10  rounded-full items-center justify-center mb-2">
                <Icon name="fast-food" size={20} color="#3b82f6" />
              </View>
              <Text className="text-xs font-promptSemiBold text-blue-800 text-center">จัดการเมนูอาหาร</Text>
              <Text className="text-xs text-blue-600 mt-1 text-center font-prompt">ดูและแก้ไขเมนู</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Menu */}
        <View className="mx-4 mt-6">
          <Text className="text-lg font-promptBold text-myBlack mb-3">เมนูหลัก</Text>
          <View className="bg-white rounded-xl shadow-md shadow-slate-600 overflow-hidden">


             <TouchableOpacity 
              className="flex-row items-center p-4 border-b border-gray-100"
              onPress={handleEatingReportPress}
            >
              <View className="w-10 h-10  rounded-full items-center justify-center mr-4">
                <Icon name="analytics" size={20} color="#f59e0b" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-promptMedium text-myBlack">รายงานการกิน</Text>
                <Text className="text-xs text-gray-500 font-prompt">ดูสถิติและรายงานการบริโภคอาหาร</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center p-4 border-b border-gray-100"
              onPress={handlePlanSelectionPress}
            >
              <View className="w-10 h-10  rounded-full items-center justify-center mr-4">
                <Icon name="restaurant" size={20} color="#22c55e" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-promptMedium text-myBlack">เลือกแพลนการกิน</Text>
                <Text className="text-xs text-gray-500 font-prompt">เลือกแพลนอาหารที่เหมาะสมกับคุณ</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>


            <TouchableOpacity 
              className="flex-row items-center p-4 border-b border-gray-100"
              onPress={handleEatingStyleSettingsPress}
            >
              <View className="w-10 h-10  rounded-full items-center justify-center mr-4">
                <Icon name="options" size={20} color="#8b5cf6" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-promptMedium text-myBlack">ตั้งค่าการรูปแบบการกิน</Text>
                <Text className="text-xs text-gray-500 font-prompt">กำหนดรูปแบบการกินที่เหมาะสม</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center p-4 border-b border-gray-100"
              onPress={handleNotificationSettingsPress}
            >
              <View className="w-10 h-10  rounded-full items-center justify-center mr-4">
                <Icon name="notifications" size={20} color="#f97316" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-promptMedium text-myBlack">ตั้งค่าการแจ้งเตือน</Text>
                <Text className="text-xs text-gray-500 font-prompt">จัดการการแจ้งเตือนต่างๆ</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            {/* <TouchableOpacity 
              className="flex-row items-center p-4 border-b border-gray-100"
              onPress={handleRecordSettingsPress}
            >
              <View className="w-10 h-10  rounded-full items-center justify-center mr-4">
                <Icon name="create" size={20} color="#6366f1" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-promptMedium text-myBlack">ตั้งค่าบันทึกการกิน</Text>
                <Text className="text-xs text-gray-500 font-prompt">กำหนดวิธีการบันทึกอาหาร</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity> */}

            <TouchableOpacity 
              className="flex-row items-center p-4"
              onPress={handleMealTimeSettingsPress}
            >
              <View className="w-10 h-10  rounded-full items-center justify-center mr-4">
                <Icon name="time" size={20} color="#14b8a6" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-promptMedium text-myBlack">ตั้งเวลามื้ออาหาร</Text>
                <Text className="text-xs text-gray-500 font-prompt">กำหนดเวลาสำหรับแต่ละมื้อ</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>
        

        {/* Additional Options */}
        <View className="mx-4 mt-6">
          <Text className="text-lg font-promptBold text-myBlack mb-3">อื่นๆ</Text>
          <View className="bg-white rounded-xl shadow-md shadow-slate-600 overflow-hidden">
            <TouchableOpacity 
              className="flex-row items-center p-4 border-b border-gray-100"
              onPress={handleNutritionPrinciplesPress}
            >
              <View className="w-10 h-10  rounded-full items-center justify-center mr-4">
                <Icon name="book-outline" size={20} color="#6366f1" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-promptMedium text-myBlack">หลักการโภชนาการ</Text>
                <Text className="text-xs text-gray-500 font-prompt">สรุป BMR, TDEE และการจัดสัดส่วนอาหาร</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-row items-center p-4"
              onPress={handleLogout}
            >
              <View className="w-10 h-10  rounded-full items-center justify-center mr-4">
                <Icon name="log-out" size={20} color="#ef4444" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-promptMedium text-red-500">ออกจากระบบ</Text>
                <Text className="text-xs text-red-400 font-prompt">ลงชื่อออกจากบัญชี</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Version */}
        <View className="mx-4 mt-6 mb-4">
          <Text className="text-center text-sm text-gray-400 font-prompt">
            GoodMeal App v1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* Avatar Selection Modal */}
      <Modal
        visible={showAvatarModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl px-6 py-8">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-promptSemiBold text-gray-800">เลือก Avatar</Text>
              <TouchableOpacity 
                onPress={() => setShowAvatarModal(false)}
                className="w-8 h-8 items-center justify-center"
              >
                <Icon name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <View className="flex-row justify-between flex-wrap">
              {[1, 2, 3, 4, 5, 6].map((avatarId) => (
                <TouchableOpacity
                  key={avatarId}
                  onPress={() => handleSelectAvatar(avatarId)}
                  className={`mb-4 ${selectedAvatar === avatarId ? 'opacity-100' : 'opacity-70'}`}
                >
                  <View className={`w-16 h-16 rounded-full ${selectedAvatar === avatarId ? 'border-3 border-primary' : 'border-2 border-gray-200'} items-center justify-center`}>
                    <Image 
                      source={avatarImages[avatarId as keyof typeof avatarImages]}
                      className="w-14 h-14 rounded-full"
                      resizeMode="cover"
                    />
                  </View>
                  {selectedAvatar === avatarId && (
                    <View className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full items-center justify-center">
                      <Icon name="checkmark" size={14} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <Menu />
    </SafeAreaView>
  );
};

export default MenuScreen;
