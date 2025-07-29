import React from 'react';

import { View, Text, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../hooks/Navigation';

const { width } = Dimensions.get('window');

const OptionPlanScreen = () => {
  const navigation = useTypedNavigation();

  const planOptions = [
    {
      title: 'ปรับแต่งการกินอาหารตามรูปแบบของท่านเอง',
      subtitle: 'และจะมีการวิเคราะห์แผนการกินของท่าน',
      icon: 'calendar-outline',
      to: 'MealPlan'
    },
    {
     
      title: 'สร้างแผนการกินจากระบบ โดยกรอกข้อมูล',
      subtitle: 'เบื้องต้นระบบจะสร้างแผนการกินตามที่ท่านต้องการ',
      icon: 'sparkles-outline',
      to: 'PersonalPlan1'
    },
    {
      id: '3',
      title: 'การสร้างแผนการกินจากตัวเลือกที่มี',
      subtitle: 'ทางระบบจะวิเคราะห์สร้างแผนการกินตามข้อมูลที่ท่านเลือกผ่านตัวเลือก',
      icon: 'layers-outline',
      to: 'SelectGlobalPlan'
    },
    {
    
      title: 'สร้างแผนการกินตาม prompt ที่ท่านกรอก',
      subtitle: 'หรือสอบถามเกี่ยวกับการกิน',
      icon: 'chatbubble-outline',
      to: 'AddNewFood'
    }
  ];

  const handleOptionPress = ( page: string) => {
    navigation.navigate(page)
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-8">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity 
            className="p-2"
            onPress={() => navigation.goBack()}
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
                    if (option.to === 'PersonalPlan1') {
                      navigation.navigate('PersonalPlan1', { isForAi: true });
                    } else {
                      handleOptionPress(option.to);
                    }
                  }}
                  activeOpacity={0.7}
                >
                <View className="bg-[#EFEFEF] rounded-2xl p-4 py-10 flex-row items-center">
                  {/* Icon at the beginning */}
                  <View className="mr-4">
                    <Icon 
                      name={option.icon} 
                      size={36} 
                      color="#4A4A4A" 
                    />
                  </View>
                  
                  {/* Content Column */}
                  <View className="flex-1">
                    {/* Title */}
                    <Text className="text-sm font-promptSemiBold text-black mb-1 leading-5">
                      {option.title}
                    </Text>
                    
                    {/* Subtitle */}
                    <Text className="text-xs font-promptLight text-black leading-4">
                      {option.subtitle}
                    </Text>
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