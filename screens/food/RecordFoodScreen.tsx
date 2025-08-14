import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useTypedNavigation } from '../../hooks/Navigation';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Menu from '../material/Menu';
import { fetchTodayMeals, TodayMealData, TodayMealItem } from '../../utils/todayMealApi';

interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  confirmed: boolean;
}

interface MealTime {
  time: string;
  label: string;
  entries: FoodEntry[];
}

const RecordFoodScreen = () => {
  const navigation = useTypedNavigation();

  // Get current day for limiting navigation and initial state
  const getCurrentDay = () => {
    const today = new Date();
    return today.getDate();
  };

  // Always start with today's date
  const [selectedDay, setSelectedDay] = useState(() => getCurrentDay());
  const [mealTimes, setMealTimes] = useState<MealTime[]>([
    {
      time: '7:30',
      label: 'มื้อเช้า',
      entries: []
    },
    {
      time: '12:30',
      label: 'มื้อกลางวัน',
      entries: []
    },
    {
      time: '18:30',
      label: 'มื้อเย็น',
      entries: []
    }
  ]);

  // Today's meals data from API
  const [todayMealData, setTodayMealData] = useState<TodayMealData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load today's meals when component mounts or selected day changes
  useEffect(() => {
    loadTodayMeals();
  }, [selectedDay]);

  // Ensure we start with today's date when component mounts
  useEffect(() => {
    const currentDay = getCurrentDay();
    if (selectedDay !== currentDay) {
      setSelectedDay(currentDay);
    }
  }, []);

  // Load today's meals from API
  const loadTodayMeals = useCallback(async () => {
    try {
      setIsLoading(true);
      const todayMeals = await fetchTodayMeals();
      setTodayMealData(todayMeals);
      
      // Convert API data to MealTime format
      if (todayMeals) {
        const updatedMealTimes = [...mealTimes];
        
        // Convert breakfast
        updatedMealTimes[0].entries = todayMeals.breakfast.map((meal, index) => ({
          id: `breakfast-${index}`,
          name: meal.name,
          calories: meal.calories,
          confirmed: true
        }));
        
        // Convert lunch
        updatedMealTimes[1].entries = todayMeals.lunch.map((meal, index) => ({
          id: `lunch-${index}`,
          name: meal.name,
          calories: meal.calories,
          confirmed: true
        }));
        
        // Convert dinner
        updatedMealTimes[2].entries = todayMeals.dinner.map((meal, index) => ({
          id: `dinner-${index}`,
          name: meal.name,
          calories: meal.calories,
          confirmed: true
        }));
        
        setMealTimes(updatedMealTimes);
      }
    } catch (error) {
      console.error('❌ [RecordFoodScreen] Error loading today\'s meals:', error);
      // Keep empty meals if API fails
      setTodayMealData(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDay]);

  // Refresh data when screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      // Check if we need to update to today's date
      const currentDay = getCurrentDay();
      if (selectedDay < currentDay) {
        // If the selected day is in the past compared to current day, 
        // user might want to see today's data
        console.log('Day changed, updating to current day');
        setSelectedDay(currentDay);
      } else {
        loadTodayMeals();
      }
    }, [loadTodayMeals, selectedDay])
  );

  const totalCalories = mealTimes.reduce((total, meal) =>
    total + meal.entries.reduce((mealTotal, entry) => mealTotal + entry.calories, 0), 0
  );
  const targetCalories = 1500;

  const getCurrentDate = () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear() + 543; // Convert to Buddhist Era
    const currentDay = today.getDate();

    return {
      dayName: selectedDay === currentDay ? 'วันนี้' : `วันที่ ${selectedDay}`,
      fullDate: `${selectedDay}/${month}/${year}`,
      isToday: selectedDay === currentDay
    };
  };

  const { dayName, isToday } = getCurrentDate();

  // Function to go back to today
  const goToToday = () => {
    setSelectedDay(getCurrentDay());
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    const currentDay = getCurrentDay();
    
    if (direction === 'prev' && selectedDay > 1) {
      setSelectedDay(selectedDay - 1);
    } else if (direction === 'next') {
      if (selectedDay < currentDay) {
        setSelectedDay(selectedDay + 1);
      } else {
        // Show alert when trying to go to future days
        Alert.alert(
          'ไม่สามารถดูข้อมูลได้', 
          'ไม่สามารถดูหรือบันทึกข้อมูลของวันอนาคตได้',
          [{ text: 'ตกลง', style: 'default' }]
        );
      }
    }
  };

  const handleAddFood = (timeIndex: number) => {
    const meal = mealTimes[timeIndex];
    navigation.navigate('SearchFoodForAdd', {
      selectedDay: selectedDay,
      source: meal.label // Use label as source identifier
    });
  };

  const handleRemoveFood = (timeIndex: number, entryId: string) => {
    const updatedMealTimes = [...mealTimes];
    updatedMealTimes[timeIndex].entries = updatedMealTimes[timeIndex].entries.filter(
      entry => entry.id !== entryId
    );
    setMealTimes(updatedMealTimes);
  };

  const handleConfirmAll = () => {
    const totalMeals = mealTimes.reduce((total, meal) => total + meal.entries.length, 0);
    
    if (totalMeals === 0) {
      Alert.alert('ไม่มีอาหารที่จะบันทึก', 'กรุณาเพิ่มอาหารก่อนทำการยืนยัน');
      return;
    }
    
    Alert.alert(
      'ยืนยันการบันทึก', 
      `คุณต้องการบันทึกอาหาร ${totalMeals} รายการหรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'ยืนยัน', 
          onPress: () => {
            // TODO: Implement actual saving to backend
            Alert.alert('สำเร็จ', 'บันทึกอาหารเรียบร้อยแล้ว');
          }
        }
      ]
    );
  };

  const FoodEntryCard = ({ entry, onRemove }: { entry: FoodEntry; onRemove: () => void }) => (
    <View className="bg-green-100 rounded-lg p-3 mb-2 flex-row items-center justify-between">
      <View className="flex-row items-center flex-1">
        <Icon name="checkmark-circle" size={20} color="#22c55e" />
        <View className="ml-3 flex-1">
          <Text className="font-semibold text-gray-800">{entry.name}</Text>
          <Text className="text-gray-600">{entry.calories} แคลอรี่</Text>
        </View>
      </View>
      <View className="flex-row items-center">
        <Icon name="attach" size={16} color="#6b7280" />
        <TouchableOpacity onPress={onRemove} className="ml-2">
          <Icon name="remove-circle" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMealCard = (meal: MealTime, timeIndex: number) => (
    <View key={timeIndex} className="bg-white rounded-xl p-4 mb-4 shadow-sm">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-primary/20 rounded-full items-center justify-center mr-3">
            <Icon
              name={timeIndex === 0 ? 'sunny' : timeIndex === 1 ? 'partly-sunny' : 'moon'}
              size={24}
              color="#eab308"
            />
          </View>
          <View>
            <Text className="text-lg font-semibold text-gray-800">{meal.label}</Text>
            <Text className="text-sm text-gray-500">{meal.time}</Text>
          </View>
        </View>
        <View className={`px-3 py-1 rounded-full ${meal.entries.length > 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
          <Text className={`text-xs font-medium ${meal.entries.length > 0 ? 'text-green-600' : 'text-gray-600'}`}>
            {meal.entries.length > 0 ? `${meal.entries.length} รายการ` : 'ยังไม่มีอาหาร'}
          </Text>
        </View>
      </View>
      {/* --- FIX: Removed empty lines that were here --- */}
      {meal.entries.length > 0 ? (
        <View className="mb-3">
          {meal.entries.map((entry) => (
            <FoodEntryCard
              key={entry.id}
              entry={entry}
              onRemove={() => handleRemoveFood(timeIndex, entry.id)}
            />
          ))}
        </View>
      ) : (
        <View className="border-2 border-dashed border-gray-200 rounded-lg p-4 items-center mb-3">
          <Icon name="add-circle-outline" size={32} color="#9ca3af" />
          <Text className="text-gray-500 mt-2 text-center">ยังไม่มีอาหาร</Text>
        </View>
      )}
      {/* --- FIX: Removed empty lines that were here --- */}
      <TouchableOpacity
        onPress={() => handleAddFood(timeIndex)}
        className="bg-primary rounded-lg py-3 flex-row items-center justify-center"
      >
        <Icon name="add" size={20} color="white" />
        <Text className="text-white font-medium ml-2">เพิ่มอาหาร</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-primary px-4 py-4 mt-6 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity
          className="w-10 h-10 rounded-lg items-center justify-center"
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">บันทึก/ยืนยันอาหาร</Text>
        <TouchableOpacity 
          className="w-10 h-10 rounded-lg items-center justify-center"
          onPress={goToToday}
        >
          <Icon name={isToday ? "calendar" : "today"} size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity
          className={`w-8 h-8 items-center justify-center ${selectedDay <= 1 ? 'opacity-50' : ''}`}
          onPress={() => navigateDay('prev')}
          disabled={selectedDay <= 1}
        >
          <Icon name="chevron-back" size={20} color="#374151" />
        </TouchableOpacity>
        <Text className={`text-lg font-medium ${isToday ? 'text-primary font-bold' : 'text-gray-800'}`}>
          {dayName}
        </Text>
        {!isToday && (
          <TouchableOpacity 
            onPress={goToToday}
            className="absolute right-16 bg-primary/10 px-2 py-1 rounded-full"
          >
            <Text className="text-primary text-xs font-medium">กลับวันนี้</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className={`w-8 h-8 items-center justify-center ${selectedDay >= getCurrentDay() ? 'opacity-50' : ''}`}
          onPress={() => navigateDay('next')}
          disabled={selectedDay >= getCurrentDay()}
        >
          <Icon name="chevron-forward" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="font-medium text-gray-700">
            {isToday ? 'แคลอรี่วันนี้' : `แคลอรี่วันที่ ${selectedDay}`}
          </Text>
          {isLoading ? (
            <Text className="font-semibold text-gray-400">กำลังโหลด...</Text>
          ) : (
            <Text className="font-semibold text-primary">
              {totalCalories}/{targetCalories} แคลอรี่
            </Text>
          )}
        </View>
        <View className="bg-gray-200 rounded-full h-3">
          <View
            className="bg-primary h-3 rounded-full"
            style={{ width: `${Math.min((totalCalories / targetCalories) * 100, 100)}%` }}
          />
        </View>
        
        {/* Show plan info if available */}
        {todayMealData && todayMealData.planName && (
          <View className="mt-3 p-3 bg-blue-50 rounded-lg">
            <View className="flex-row items-center">
              <Icon name="calendar" size={16} color="#3b82f6" />
              <Text className="text-blue-600 font-medium ml-2">
                {todayMealData.planName}
                {todayMealData.planDay && ` - วันที่ ${todayMealData.planDay}`}
              </Text>
            </View>
          </View>
        )}
      </View>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <Icon name="restaurant" size={48} color="#9ca3af" />
            <Text className="text-gray-500 mt-4 text-lg">กำลังโหลดเมนูอาหาร...</Text>
            <Text className="text-gray-400 mt-2 text-center">
              กำลังดึงข้อมูลแผนการกินของคุณ
            </Text>
          </View>
        ) : !todayMealData || (!todayMealData.breakfast.length && !todayMealData.lunch.length && !todayMealData.dinner.length) ? (
          <View className="flex-1 items-center justify-center py-20">
            <Icon name="calendar-outline" size={48} color="#9ca3af" />
            <Text className="text-gray-500 mt-4 text-lg">ไม่มีแผนการกินวันนี้</Text>
            <Text className="text-gray-400 mt-2 text-center">
              คุณสามารถเพิ่มอาหารด้วยตนเองได้
            </Text>
            <TouchableOpacity 
              className="bg-primary rounded-lg px-6 py-3 mt-6"
              onPress={() => navigation.navigate('SelectGlobalPlan')}
            >
              <View className="flex-row items-center">
                <Icon name="add" size={20} color="white" />
                <Text className="text-white font-medium ml-2">เลือกแผนการกิน</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          mealTimes.map((meal, timeIndex) => renderMealCard(meal, timeIndex))
        )}
      </ScrollView>

      <View className="bg-white px-4 py-4 border-t border-gray-100">
        <TouchableOpacity
          onPress={handleConfirmAll}
          className="bg-primary rounded-xl p-4 items-center justify-center"
        >
          <View className="flex-row items-center">
            <Icon name="checkmark" size={20} color="white" />
            <Text className="text-white font-bold ml-2">ยืนยันการบันทึกทั้งหมด</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Menu />
    </SafeAreaView>
  );
};

export default RecordFoodScreen;