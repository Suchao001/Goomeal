import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useTypedNavigation } from '../hooks/Navigation';
import Icon from 'react-native-vector-icons/Ionicons';

/**
 * FoodMenuScreen Component
 * หน้าแนะนำเมนูอาหาร - แสดงรายการอาหารล่าสุดและที่บันทึกไว้
 */
const FoodMenuScreen = () => {
  const navigation = useTypedNavigation();

  // Mock data for latest food items
  const latestFoods = [
    {
      id: '1',
      name: 'สลัดผักรวมกับไก่ย่าง',
      calories: 285,
      carbs: 12,
      protein: 35,
      fat: 8,
      image: require('../assets/images/Foodtype_1.png'),
    },
    {
      id: '2',
      name: 'ข้าวกล้องผัดผักโขม',
      calories: 320,
      carbs: 45,
      protein: 12,
      fat: 10,
      image: require('../assets/images/Foodtype_2.png'),
    },
    {
      id: '3',
      name: 'ปลาแซลมอนย่างกับผักสตีม',
      calories: 395,
      carbs: 8,
      protein: 42,
      fat: 18,
      image: require('../assets/images/Foodtype_3.png'),
    },
  ];

  // Mock data for saved food items
  const savedFoods = [
    {
      id: '1',
      name: 'โจ๊กไก่ใส่ผัก',
      calories: 245,
      carbs: 35,
      protein: 18,
      fat: 5,
      image: require('../assets/images/Foodtype_4.png'),
    },
    {
      id: '2',
      name: 'สมูทตี้ผลไม้รวม',
      calories: 180,
      carbs: 42,
      protein: 8,
      fat: 2,
      image: require('../assets/images/Foodtype_1.png'),
    },
  ];

  const renderFoodItem = (item: any, showKebabMenu = true) => (
    <TouchableOpacity key={item.id} className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
      <View className="flex-row">
        {/* Food Image */}
        <View className="w-20 h-20 bg-gray-200">
          <Image
            source={item.image}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        
        {/* Food Info */}
        <View className="flex-1 p-3">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-lg font-semibold text-gray-800 flex-1" numberOfLines={2}>
              {item.name}
            </Text>
            {showKebabMenu && (
              <TouchableOpacity className="ml-2">
                <Icon name="ellipsis-vertical" size={20} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Calories */}
          <View className="flex-row items-center mb-2">
            <Icon name="flame" size={16} color="#f59e0b" />
            <Text className="text-orange-500 font-medium ml-1">{item.calories} แคลอรี่</Text>
          </View>
          
          {/* Nutrition Info */}
          <View className="flex-row justify-between">
            <View className="flex-row items-center">
              <Icon name="nutrition" size={14} color="#3b82f6" />
              <Text className="text-blue-600 text-sm ml-1">{item.carbs}g</Text>
            </View>
            <View className="flex-row items-center">
              <Icon name="fitness" size={14} color="#10b981" />
              <Text className="text-green-600 text-sm ml-1">{item.protein}g</Text>
            </View>
            <View className="flex-row items-center">
              <Icon name="water" size={14} color="#f59e0b" />
              <Text className="text-yellow-600 text-sm ml-1">{item.fat}g</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity 
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4"
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        
        <Text className="text-xl font-bold text-gray-900">แนะนำเมนูอาหาร</Text>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Latest Food Items Section */}
        <View className="mt-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-800">รายการอาหารล่าสุด</Text>
            <TouchableOpacity>
              <Text className="text-gray-500 text-sm">ดูเพิ่มเติม...</Text>
            </TouchableOpacity>
          </View>

          {latestFoods.map(item => renderFoodItem(item))}
        </View>

        {/* Saved Food Items Section */}
        <View className="mt-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-800">รายการอาหารที่บันทึกไว้</Text>
            <TouchableOpacity>
              <Text className="text-gray-500 text-sm">ดูเพิ่มเติม...</Text>
            </TouchableOpacity>
          </View>

          {savedFoods.map(item => renderFoodItem(item))}
        </View>

        {/* Request New Menu Button */}
        <View className="mt-8 mb-6">
          <TouchableOpacity 
            className="bg-primary rounded-xl p-4 flex-row items-center justify-center shadow-md"
            onPress={() => navigation.navigate('SuggestionMenu')}
          >
            <Icon name="sparkles" size={28} color="white" />
            <Text className="text-white font-bold text-lg ml-3">ขอเมนูใหม่</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default FoodMenuScreen;
