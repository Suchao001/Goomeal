import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../hooks/Navigation';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

type AiPlanDayDetailRouteProp = RouteProp<RootStackParamList, 'AiPlanDayDetail'>;

interface MealItem {
  name: string;
  calories: number;
  protein: number;
  carb: number;
  fat: number;
  image?: string;
}

interface DayMealData {
  breakfast: MealItem[];
  lunch: MealItem[];
  dinner: MealItem[];
}

const AiPlanDayDetail = () => {
  const navigation = useTypedNavigation();
  const route = useRoute<AiPlanDayDetailRouteProp>();
  
  // Get all data from navigation params
  const { 
    day: initialDay, 
    dayData: initialDayData, 
    originalDayData: initialOriginalData,
    maxDays,
    aiPlanData
  } = route.params;
  
  const [selectedDay, setSelectedDay] = useState(initialDay);
  const [mealData, setMealData] = useState<DayMealData | null>(null);

  useEffect(() => {
    // Transform the initial data when component mounts or data changes
    transformMealData();
  }, [initialOriginalData]);

  useEffect(() => {
    if (selectedDay !== initialDay) {
      // Go back to meal plan and let user select the new day
      navigation.goBack();
    }
  }, [selectedDay, initialDay]);

  const transformMealData = () => {
    if (!initialOriginalData) return;

    const transformedMealData: DayMealData = {
      breakfast: [],
      lunch: [],
      dinner: []
    };

    // Helper function to categorize meal types
    const categorizeMealType = (mealTypeName: string) => {
      const lowerName = mealTypeName.toLowerCase();
      
      if (lowerName.includes('breakfast') || lowerName.includes('เช้า')) {
        return 'breakfast';
      } else if (lowerName.includes('lunch') || lowerName.includes('กลางวัน')) {
        return 'lunch';
      } else if (lowerName.includes('dinner') || lowerName.includes('เย็น')) {
        return 'dinner';
      } else {
        // For AI data, map directly to the meal types
        if (lowerName === 'breakfast') return 'breakfast';
        if (lowerName === 'lunch') return 'lunch';
        if (lowerName === 'dinner') return 'dinner';
        return 'lunch'; // default fallback
      }
    };

    // Transform all meal data
    Object.keys(initialOriginalData.meals).forEach(mealType => {
      const mealData = initialOriginalData.meals[mealType];
      const category = categorizeMealType(mealType);
      
      // Handle different data structures
      let mealItems = [];
      
      if (Array.isArray(mealData)) {
        // If mealData is already an array
        mealItems = mealData;
      } else if (mealData && typeof mealData === 'object') {
        // If mealData is an object, check for items property or treat as single item
        if (mealData.items && Array.isArray(mealData.items)) {
          mealItems = mealData.items;
        } else if (mealData.name || mealData.food_name) {
          // Single meal item
          mealItems = [mealData];
        } else {
          // Object with multiple properties - might be the meal items themselves
          // Try to extract array values or convert object to array
          const objectValues = Object.values(mealData);
          if (objectValues.length > 0 && typeof objectValues[0] === 'object') {
            mealItems = objectValues;
          }
        }
      }
      
      // Transform items and add to appropriate category
      const transformedItems = mealItems.map((item: any, index: number) => {
        const transformedItem = {
          name: item.name || item.food_name || `ไม่ระบุชื่อ ${index + 1}`,
          calories: parseFloat(item.calories) || parseFloat(item.cal) || 0,
          protein: parseFloat(item.protein) || 0,
          carb: parseFloat(item.carb) || parseFloat(item.carbs) || 0,
          fat: parseFloat(item.fat) || 0,
          image: item.image || item.img // Handle both 'image' and 'img' field names
        };
        
        return transformedItem;
      });
      
      transformedMealData[category as keyof DayMealData].push(...transformedItems);
    });

    setMealData(transformedMealData);
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    let newDay = selectedDay;
    if (direction === 'prev' && selectedDay > 1) {
      newDay = selectedDay - 1;
    } else if (direction === 'next' && selectedDay < maxDays) {
      newDay = selectedDay + 1;
    }
    
    if (newDay !== selectedDay) {
      setSelectedDay(newDay);
    }
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) {
      return 'https://via.placeholder.com/60x60/E5E7EB/6B7280?text=Food';
    }
    
    // If it's already a full URL (starts with http/https), use it as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // For AI generated foods, they typically don't have images, so use placeholder
    return 'https://via.placeholder.com/60x60/E5E7EB/6B7280?text=AI';
  };

  const calculateMealCalories = (meals: MealItem[]) => {
    return meals.reduce((total, meal) => total + meal.calories, 0);
  };

  const renderMealSection = (mealType: 'breakfast' | 'lunch' | 'dinner', meals: MealItem[], icon: string, title: string) => {    
    const totalCalories = calculateMealCalories(meals);
    
    return (
      <View className="mb-8">
        {/* Meal Header with Timeline */}
        <View className="flex-row items-center mb-4">
          {/* Timeline Circle */}
          <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-4">
            <Icon name={icon} size={16} color="white" />
          </View>
          
          {/* Meal Info */}
          <View className="flex-1">
            <Text className="text-lg font-promptSemiBold text-[#4A4A4A]">{title}</Text>
            <Text className="text-sm font-promptMedium" style={{ color: '#77dd77' }}>
              {totalCalories} cal
            </Text>
          </View>
        </View>
        
        {/* Meal Items */}
        <View className="ml-12">
          {meals.length === 0 ? (
            <View className="mb-4">
              <View className="bg-white rounded-xl p-4 shadow-sm">
                <Text className="text-gray-500 text-center">ไม่มีเมนูอาหาร</Text>
              </View>
            </View>
          ) : (
            meals.map((meal, index) => (
              <View key={index} className="mb-4">
                {/* Food Item Card */}
                <View className="bg-white rounded-xl p-4 shadow-sm">
                  <View className="flex-row">
                    {/* Food Image */}
                    <View className="w-16 h-16 mr-4">
                      <Image
                        source={{ uri: getImageUrl(meal.image) }}
                        className="w-full h-full rounded-lg"
                        resizeMode="cover"
                      />
                    </View>
                    
                    {/* Food Details */}
                    <View className="flex-1">
                      <Text className="text-base font-promptSemiBold text-[#4A4A4A] mb-2">
                        {meal.name}
                      </Text>
                      <Text className="text-sm font-promptMedium text-gray-600 mb-1">
                        {meal.calories} cal
                      </Text>
                      
                      {/* Nutrition Info in Grid */}
                      <View className="flex-row justify-between">
                        <Text className="text-xs font-promptLight text-gray-500 flex-1">
                          โปรตีน {meal.protein}g
                        </Text>
                        <Text className="text-xs font-promptLight text-gray-500 flex-1">
                          คาร์บ {meal.carb}g
                        </Text>
                        <Text className="text-xs font-promptLight text-gray-500 flex-1">
                          ไขมัน {meal.fat}g
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    );
  };

  // Show message if we're waiting for data
  if (!mealData || !initialOriginalData) {
    return (
      <View className="flex-1 bg-[#F9FAFB] justify-center items-center">
        <Text className="text-gray-500 text-lg">กำลังโหลดข้อมูลวันที่ {selectedDay}...</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-primary rounded-lg px-6 py-3 mt-4"
        >
          <Text className="text-white font-promptMedium">กลับ</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      {/* Header */}
      <View className="bg-white px-4 py-4 pt-12 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity 
            className="p-2"
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#4A4A4A" />
          </TouchableOpacity>
          <Text className="text-xl font-promptSemiBold text-[#4A4A4A]">
            วันที่ {initialDay} - AI Plan
          </Text>
          <View className="w-10" />
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
        {/* Timeline Container */}
        <View className="relative">
          {/* Main Timeline Line */}
          <View className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
          
          {/* Breakfast */}
          {renderMealSection('breakfast', mealData.breakfast, 'sunny-outline', 'อาหารเช้า')}
          
          {/* Lunch */}
          {renderMealSection('lunch', mealData.lunch, 'restaurant-outline', 'อาหารกลางวัน')}
          
          {/* Dinner */}
          {renderMealSection('dinner', mealData.dinner, 'moon-outline', 'อาหารเย็น')}
        </View>
        
        {/* Bottom spacing */}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
};

export default AiPlanDayDetail;
