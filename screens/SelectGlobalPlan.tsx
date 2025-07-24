import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../hooks/Navigation';

const SelectGlobalPlan = () => {
  const navigation = useTypedNavigation();

  // Mock data for global plans
  const globalPlans = [
    {
      id: 1,
      title: 'แผนลดน้ำหนักสำหรับผู้เริ่มต้น',
      subtitle: 'เหมาะสำหรับคนที่ต้องการลดน้ำหนัก 3-5 กิโลกรัม',
      duration: 14,
      image: 'https://via.placeholder.com/120x120/E5E7EB/6B7280?text=Plan1',
    },
    {
      id: 2,
      title: 'แผนเพิ่มกล้ามเนื้อ',
      subtitle: 'สำหรับคนที่ต้องการสร้างมวลกล้ามเนื้อ',
      duration: 21,
      image: 'https://via.placeholder.com/120x120/E5E7EB/6B7280?text=Plan2',
    },
    {
      id: 3,
      title: 'แผนอาหารเพื่อสุขภาพ',
      subtitle: 'เน้นอาหารเพื่อสุขภาพและสมดุลของร่างกาย',
      duration: 30,
      image: 'https://via.placeholder.com/120x120/E5E7EB/6B7280?text=Plan3',
    },
    {
      id: 4,
      title: 'แผนอาหารคลีน',
      subtitle: 'อาหารที่ผ่านการแปรรูปน้อยที่สุด เน้นธรรมชาติ',
      duration: 14,
      image: 'https://via.placeholder.com/120x120/E5E7EB/6B7280?text=Plan4',
    },
  ];

  const handlePlanPress = (planId: number) => {
    console.log('Selected plan:', planId);
    // Navigate to plan details or implementation screen
  };

  const handleSeeMorePlans = () => {
    console.log('See more plans pressed');
    // Navigate to see more plans screen
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
            <Icon name="arrow-back" size={24} color="#4A4A4A" />
          </TouchableOpacity>
          <View className="flex-1" />
        </View>
        
        {/* Main Title - Centered */}
        <Text className="text-3xl font-promptSemiBold text-[#4A4A4A] mb-4 text-center">
          เลือกแผนการกินจากทางเรา
        </Text>
        
        {/* Subtitle */}
        <View className="items-center">
          <Text className="text-base font-promptLight text-[#4A4A4A] text-center leading-6">
            เลือกแผนการกินตามแบบต่างๆ
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-4">
          {/* Plan Cards */}
          <View className="space-y-4">
            {globalPlans.map((plan) => (
              <View
                key={plan.id}
                className="bg-white rounded-xl shadow-md mx-2 mb-4 overflow-hidden"
                style={{
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.1,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
              >
                <View className="flex-row">
                  {/* Image Column */}
                  <View className="w-32 h-32">
                    <Image
                      source={{ uri: plan.image }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>
                  
                  {/* Content Column */}
                  <View className="flex-1 p-4 justify-between">
                    {/* Title and Subtitle */}
                    <View className="flex-1">
                      <Text className="text-lg font-promptSemiBold text-[#4A4A4A] mb-2 leading-5">
                        {plan.title}
                      </Text>
                      <Text className="text-sm font-promptLight text-[#4A4A4A] leading-4 mb-3">
                        {plan.subtitle}
                      </Text>
                    </View>
                    
                    {/* Bottom Row */}
                    <View className="flex-row justify-between items-end">
                      {/* Duration */}
                      <View className="flex-row items-center">
                        <Text className="text-xs font-promptMedium text-[#4A4A4A]">
                          {plan.duration} วัน
                        </Text>
                      </View>
                      
                      {/* View Details Button */}
                      <TouchableOpacity
                        onPress={() => handlePlanPress(plan.id)}
                        activeOpacity={0.7}
                      >
                        <Text className="text-sm font-promptMedium text-primary">
                          ดูรายการอาหาร &gt;&gt;
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* See More Plans Button */}
          <View className="px-4 mt-6 mb-8">
            <TouchableOpacity
              onPress={handleSeeMorePlans}
              activeOpacity={0.7}
              className="items-center"
            >
              <Text className="text-lg font-promptMedium text-primary">
                ดูแพลนอาหารเพิ่มเติม
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SelectGlobalPlan;
