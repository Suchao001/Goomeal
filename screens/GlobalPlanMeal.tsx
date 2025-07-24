import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../hooks/Navigation';

const GlobalPlanMeal = () => {
  const navigation = useTypedNavigation();

  // Mock data for meal plan
  const mealPlanData = [
    {
      day: 1,
      totalCalories: 1200,
      protein: 45,
      carbs: 150,
      fat: 35,
      meals: [
        { type: 'breakfast', icon: 'sunny-outline', name: 'ข้าวโพดต้มกับไข่ต้ม' },
        { type: 'lunch', icon: 'restaurant-outline', name: 'ข้าวกล้องผัดผักรวม' },
        { type: 'dinner', icon: 'moon-outline', name: 'ปลาย่างกับสลัดผัก' }
      ]
    },
    {
      day: 2,
      totalCalories: 1150,
      protein: 42,
      carbs: 140,
      fat: 38,
      meals: [
        { type: 'breakfast', icon: 'sunny-outline', name: 'โอ๊ตมีลกับผลไม้' },
        { type: 'lunch', icon: 'restaurant-outline', name: 'ข้าวหอมมะลิกับแกงเขียวหวาน' },
        { type: 'dinner', icon: 'moon-outline', name: 'ไก่ย่างกับผักต้มน้ำใส' }
      ]
    },
    {
      day: 3,
      totalCalories: 1300,
      protein: 50,
      carbs: 160,
      fat: 40,
      meals: [
        { type: 'breakfast', icon: 'sunny-outline', name: 'ขนมปังโฮลวีทกับอโวคาโด' },
        { type: 'lunch', icon: 'restaurant-outline', name: 'ข้าวผัดกุ้งใส่ผัก' },
        { type: 'dinner', icon: 'moon-outline', name: 'เต้าหู้ทอดกับผัดผักกาด' }
      ]
    },
    {
      day: 4,
      totalCalories: 1100,
      protein: 40,
      carbs: 130,
      fat: 32,
      meals: [
        { type: 'breakfast', icon: 'sunny-outline', name: 'สมูทตี้ผลไม้รวม' },
        { type: 'lunch', icon: 'restaurant-outline', name: 'ส้มตำกับข้าวเหนียว' },
        { type: 'dinner', icon: 'moon-outline', name: 'ซุปผักใส่เห็ด' }
      ]
    }
  ];

  const handleDayPress = (day: number) => {
    console.log('View details for day:', day);
    // Navigate to daily meal details
  };

  const handleSavePlan = () => {
    console.log('Save this plan');
    // Save plan logic here
  };

  const renderMealCard = (dayData: any) => (
    <View key={dayData.day} className="bg-white rounded-xl shadow-sm mx-4 mb-4 overflow-hidden">
      {/* Day Header */}
      <View className="bg-white px-4 pt-4 pb-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-promptSemiBold text-[#4A4A4A]">
            วันที่ {dayData.day}
          </Text>
          <TouchableOpacity 
            onPress={() => handleDayPress(dayData.day)}
            className="flex-row items-center"
          >
            <Text className="text-sm font-promptMedium text-primary mr-1">
              ดูรายละเอียด
            </Text>
            <Icon name="chevron-forward" size={16} color="#f59e0b" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Meals List */}
      <View className="px-4 pb-3">
        {dayData.meals.map((meal: any, index: number) => (
          <View key={index} className="flex-row items-center mb-2">
            <View className="w-6 h-6 mr-3 items-center justify-center">
              <Icon name={meal.icon} size={18} color="#f59e0b" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-promptMedium text-[#4A4A4A] capitalize">
                {meal.type === 'breakfast' ? 'อาหารเช้า' : 
                 meal.type === 'lunch' ? 'อาหารกลางวัน' : 'อาหารเย็น'}: 
                <Text className="font-promptLight"> {meal.name}</Text>
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Nutrition Summary Section */}
      <View className="bg-white px-4 py-3 mt-2 mx-3 mb-3 rounded-lg">
        {/* Total Calories */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm font-promptMedium text-[#4A4A4A]">
            แคลอรี่รวม
          </Text>
          <Text className="text-lg font-promptSemiBold text-[#4A4A4A]">
            {dayData.totalCalories} kcal
          </Text>
        </View>

        {/* Macronutrients - Three Columns */}
        <View className="flex-row justify-between space-x-2">
          {/* Protein */}
          <View className="flex-1 bg-[#F9FAFB] rounded-lg p-3 items-center">
            <Text className="text-lg font-promptSemiBold text-primary mb-1">
              {dayData.protein}g
            </Text>
            <Text className="text-xs font-promptMedium text-[#4A4A4A]">
              โปรตีน
            </Text>
          </View>

          {/* Carbs */}
          <View className="flex-1 bg-[#F9FAFB] rounded-lg p-3 items-center mx-2">
            <Text className="text-lg font-promptSemiBold text-primary mb-1">
              {dayData.carbs}g
            </Text>
            <Text className="text-xs font-promptMedium text-[#4A4A4A]">
              คาร์บ
            </Text>
          </View>

          {/* Fat */}
          <View className="flex-1 bg-[#F9FAFB] rounded-lg p-3 items-center">
            <Text className="text-lg font-promptSemiBold text-primary mb-1">
              {dayData.fat}g
            </Text>
            <Text className="text-xs font-promptMedium text-[#4A4A4A]">
              ไขมัน
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      {/* Header */}
      <View className="bg-white px-4 py-4 pt-12 border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="p-2 mr-2"
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#4A4A4A" />
          </TouchableOpacity>
          <Text className="text-xl font-promptSemiBold text-[#4A4A4A]">
            พรีวิวแผนอาหาร
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 pt-4" showsVerticalScrollIndicator={false}>
        {mealPlanData.map(dayData => renderMealCard(dayData))}
        
        {/* Bottom spacing */}
        <View className="h-6" />
      </ScrollView>

      {/* Fixed Save Button */}
      <View className="bg-white px-4 py-4 border-t border-gray-200">
        <TouchableOpacity
          onPress={handleSavePlan}
          className="bg-primary rounded-lg py-4 items-center justify-center"
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-promptSemiBold">
            บันทึกแผนนี้
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GlobalPlanMeal;
