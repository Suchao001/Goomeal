import React, { useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { View, Text, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../hooks/Navigation';
import { useAuth } from '../AuthContext';
import e from 'cors';

const { width } = Dimensions.get('window');

const OptionPlanScreen = () => {
  const navigation = useTypedNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const params = route.params as any;
  const from = params?.from;

  // ตรวจสอบว่าผู้ใช้กรอกข้อมูลส่วนตัวแล้วหรือไม่
  const isFirstTimeUser = user?.first_time_setting != true;

  const planOptions = [
    {
      title: 'ปรับแต่งการกินอาหารตามรูปแบบของท่านเอง',
      subtitle: 'มี calories ที่ควรได้รับในแต่ละวันแนะนำ',
      icon: 'calendar-outline',
      to: 'MealPlan'
    },
    {
      title: 'สร้างแผนการกินจากระบบ',
      subtitle: isFirstTimeUser 
        ? 'กรุณากรอกข้อมูลส่วนตัวก่อนใช้งานฟีเจอร์นี้'
        : 'กรอกข้อมูลเบื้องต้นระบบจะสร้างแผนการกินตามที่ท่านต้องการ',
      icon: 'sparkles-outline',
      to: isFirstTimeUser ? 'PersonalSetup' : 'PromptForm1',
      disabled: isFirstTimeUser
    },
    {
      id: '3',
      title: 'แผนการกินจากตัวเลือกที่มี',
      subtitle: 'ทางเราได้จัดเตรียมแผนการกิน',
      icon: 'layers-outline',
      to: 'SelectGlobalPlan'
    },
    {

      title: 'สอบถามเกี่ยวกับการกิน',
      subtitle: 'โดยจะมีข้อมูลของท่านเป็นส่วนประกอบ',
      icon: 'chatbubble-outline',
      to: 'PersonalPlan1'
    }
  ];

  const handleOptionPress = (page: string) => {
    switch(page) {
      case 'ChatScreen':
        navigation.navigate('ChatScreen');
        break;
      default:
        // Handle other pages if needed
        break;
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-8">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity 
            className="p-2"
            onPress={() => {
              if (from === 'CalendarScreen') {
                navigation.navigate('Calendar');
              } else if (from === 'Menu') {
                navigation.navigate('Menu');
              } else {
                navigation.navigate('Home');
              }
            }}
          >
            <Icon name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1" />
        </View>
        
        {/* Large Title - Centered */}
        <Text className="text-3xl font-promptSemiBold text-black mb-4 text-center">
          เลือกแผนการกินอาหาร
        </Text>
        
        {/* Subtitle */}
        <View className="items-center">
          <Text className="text-base font-promptLight text-black text-center w-4/6 leading-6">
            เลือกตัวเลือกการสร้างแผนการกินอาหารตามรูปแบบ ต่างๆ ดังนี้
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-4">
          {/* Option Cards */}
          <View className="space-y-3">
            {planOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  className="mx-[8%] mb-4"
                  onPress={() => {
                    if (option.to === 'PromptForm1') {
                      navigation.navigate('PromptForm1', { isForAi: true });
                    } else if (option.to === 'PersonalSetup') {
                      navigation.navigate('PersonalSetup');
                    } else if (option.to === 'SelectGlobalPlan') {
                      navigation.navigate('SelectGlobalPlan');
                    } else if (option.to === 'MealPlan') {
                      navigation.navigate('MealPlan', { from: 'OptionPlan' });
                    } else if (option.to === 'PersonalPlan1') {
                      navigation.navigate('PersonalPlan1',{isForAi: true});
                    } else {
                      handleOptionPress(option.to);
                    }
                  }}
                  activeOpacity={0.7}
                >
                <View className={`rounded-2xl p-4 py-10 flex-row items-center ${
                  option.disabled ? 'bg-gray-200' : 'bg-[#EFEFEF]'
                }`}>
                  {/* Icon at the beginning */}
                  <View className="mr-4">
                    <Icon 
                      name={option.icon} 
                      size={36} 
                      color={option.disabled ? "#9CA3AF" : "#4A4A4A"} 
                    />
                  </View>
                  
                  {/* Content Column */}
                  <View className="flex-1">
                    {/* Title */}
                    <Text className={`text-sm font-promptSemiBold mb-1 leading-5 ${
                      option.disabled ? 'text-gray-500' : 'text-black'
                    }`}>
                      {option.title}
                    </Text>
                    
                    {/* Subtitle */}
                    <Text className={`text-xs font-promptLight leading-4 ${
                      option.disabled ? 'text-gray-400' : 'text-black'
                    }`}>
                      {option.subtitle}
                    </Text>

                    {/* Warning for disabled option */}
                    {option.disabled && (
                      <View className="flex-row items-center mt-2">
                        <Icon name="information-circle" size={14} color="#F59E0B" />
                        <Text className="text-xs font-promptLight text-orange-500 ml-1">
                          กดเพื่อกรอกข้อมูลส่วนตัว
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default OptionPlanScreen;