import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../hooks/Navigation';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { apiClient } from '../utils/apiClient';
import { seconde_url } from '../config';
import { DatePickerModal } from '../components/DatePickerModal';

type GlobalPlanDayDetailRouteProp = RouteProp<RootStackParamList, 'GlobalPlanDayDetail'>;

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

const GlobalPlanDayDetail = () => {
  const navigation = useTypedNavigation();
  const route = useRoute<GlobalPlanDayDetailRouteProp>();
  const { planId, day } = route.params;
  
  const [selectedDay, setSelectedDay] = useState(day);
  const [mealData, setMealData] = useState<DayMealData | null>(null);
  const [planInfo, setPlanInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [maxDays, setMaxDays] = useState(30);

  // Generate current date for display
  const currentDate = {
    fullDate: `วันที่ ${selectedDay}`,
  };

  useEffect(() => {
    fetchDayDetails();
  }, [planId, selectedDay]);

  const fetchDayDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get(`/api/meal-plan-details/${planId}`);
      
      if (response.data.success) {
        const { planInfo, mealPlan } = response.data.data;
        setPlanInfo(planInfo);
        
        // Get max days from meal plan
        const availableDays = Object.keys(mealPlan).map(day => parseInt(day));
        const maxDay = Math.max(...availableDays);
        setMaxDays(maxDay);
        
        // Get data for selected day
        const dayKey = `day${selectedDay}`;
        const dayData = mealPlan[dayKey];
        
        if (dayData) {
          const transformedMealData: DayMealData = {
            breakfast: [],
            lunch: [],
            dinner: []
          };
          
          // Transform breakfast data
          if (dayData.meals.breakfast) {
            transformedMealData.breakfast = dayData.meals.breakfast.items.map((item: any) => ({
              name: item.name,
              calories: item.calories || 0,
              protein: item.protein || 0,
              carb: item.carb || 0,
              fat: item.fat || 0,
              image: item.image
            }));
          }
          
          // Transform lunch data
          if (dayData.meals.lunch) {
            transformedMealData.lunch = dayData.meals.lunch.items.map((item: any) => ({
              name: item.name,
              calories: item.calories || 0,
              protein: item.protein || 0,
              carb: item.carb || 0,
              fat: item.fat || 0,
              image: item.image
            }));
          }
          
          // Transform dinner data
          if (dayData.meals.dinner) {
            transformedMealData.dinner = dayData.meals.dinner.items.map((item: any) => ({
              name: item.name,
              calories: item.calories || 0,
              protein: item.protein || 0,
              carb: item.carb || 0,
              fat: item.fat || 0,
              image: item.image
            }));
          }
          
          setMealData(transformedMealData);
        } else {
          setError(`ไม่พบข้อมูลสำหรับวันที่ ${selectedDay}`);
        }
      } else {
        setError('ไม่สามารถดึงข้อมูลแผนอาหารได้');
      }
    } catch (err) {
      console.error('Error fetching day details:', err);
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && selectedDay > 1) {
      setSelectedDay(selectedDay - 1);
    } else if (direction === 'next' && selectedDay < maxDays) {
      setSelectedDay(selectedDay + 1);
    }
  };

  const handleDateSelect = (day: number) => {
    if (day >= 1 && day <= maxDays) {
      setSelectedDay(day);
    }
    setShowDatePicker(false);
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) {
      return 'https://via.placeholder.com/60x60/E5E7EB/6B7280?text=Food';
    }
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `${seconde_url}${imagePath}`;
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
          {meals.map((meal, index) => (
            <View key={index} className="mb-4">
              {/* Timeline Connection */}
              <View className="absolute left-[-32px] top-0 bottom-0 w-0.5 bg-gray-200" />
              {/* Small Circle */}
              <View className="absolute left-[-38px] top-6 w-3 h-3 rounded-full bg-[#d9d9d9]" />
              
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
          ))}
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      {/* Header */}
      <View className="bg-white px-4 py-4 pt-12 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity 
            className="p-2"
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#4A4A4A" />
          </TouchableOpacity>
          <Text className="text-xl font-promptSemiBold text-[#4A4A4A]">
            พรีวิวอาหาร
          </Text>
          <TouchableOpacity
            className="p-2"
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="calendar-outline" size={24} color="#f59e0b" />
          </TouchableOpacity>
        </View>

        {/* Day Navigation */}
        <View className="flex-row items-center justify-between py-3">
          <TouchableOpacity
            className={`w-10 h-10 rounded-full items-center justify-center ${
              selectedDay <= 1 ? 'opacity-30' : 'bg-gray-100'
            }`}
            onPress={() => navigateDay('prev')}
            disabled={selectedDay <= 1}
          >
            <Icon name="chevron-back" size={20} color="#374151" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-1 items-center"
            onPress={() => setShowDatePicker(true)}
          >
            <Text className="text-lg font-bold text-gray-800">{currentDate.fullDate}</Text>
            <Text className="text-sm text-gray-500">แตะเพื่อเปลี่ยนวันที่</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`w-10 h-10 rounded-full items-center justify-center ${
              selectedDay >= maxDays ? 'opacity-30' : 'bg-gray-100'
            }`}
            onPress={() => navigateDay('next')}
            disabled={selectedDay >= maxDays}
          >
            <Icon name="chevron-forward" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text className="text-gray-500 mt-2">กำลังโหลดข้อมูล...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-4">
          <Icon name="alert-circle-outline" size={64} color="#ef4444" />
          <Text className="text-red-500 text-center mt-4 text-lg font-promptMedium">
            {error}
          </Text>
          <TouchableOpacity
            onPress={fetchDayDetails}
            className="bg-primary rounded-lg px-6 py-3 mt-4"
          >
            <Text className="text-white font-promptMedium">ลองใหม่</Text>
          </TouchableOpacity>
        </View>
      ) : mealData ? (
        <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
          {/* Timeline Container */}
          <View className="relative">
            {/* Main Timeline Line */}
            <View className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
            
            {/* Breakfast */}
            {mealData.breakfast.length > 0 && 
              renderMealSection('breakfast', mealData.breakfast, 'sunny-outline', 'อาหารเช้า')
            }
            
            {/* Lunch */}
            {mealData.lunch.length > 0 && 
              renderMealSection('lunch', mealData.lunch, 'restaurant-outline', 'อาหารกลางวัน')
            }
            
            {/* Dinner */}
            {mealData.dinner.length > 0 && 
              renderMealSection('dinner', mealData.dinner, 'moon-outline', 'อาหารเย็น')
            }
          </View>
          
          {/* Bottom spacing */}
          <View className="h-8" />
        </ScrollView>
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500 text-lg">ไม่มีข้อมูลอาหารสำหรับวันนี้</Text>
        </View>
      )}

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectDay={handleDateSelect}
        selectedDay={selectedDay}
        days={Array.from({ length: maxDays }, (_, i) => i + 1)}
      />
    </View>
  );
};

export default GlobalPlanDayDetail;
