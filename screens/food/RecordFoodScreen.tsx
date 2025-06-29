import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useTypedNavigation } from '../../hooks/Navigation';
import Icon from 'react-native-vector-icons/Ionicons';
import Menu from '../material/Menu';

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

  const [selectedDay, setSelectedDay] = useState(29);
  const [mealTimes, setMealTimes] = useState<MealTime[]>([
    {
      time: '7:30',
      label: 'มื้อเช้า',
      entries: [
        { id: '1', name: 'ข้าวผัดไข่', calories: 350, confirmed: true },
      ]
    },
    {
      time: '12:30',
      label: 'มื้อกลางวัน',
      entries: [
        { id: '2', name: 'ก๋วยเตี๋ยวน้ำใส', calories: 450, confirmed: true },
      ]
    },
    {
      time: '18:30',
      label: 'มื้อเย็น',
      entries: []
    }
  ]);

  const totalCalories = mealTimes.reduce((total, meal) =>
    total + meal.entries.reduce((mealTotal, entry) => mealTotal + entry.calories, 0), 0
  );
  const targetCalories = 1500;

  const getCurrentDate = () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear() + 543; // Convert to Buddhist Era

    return {
      dayName: `วันที่ ${selectedDay}`,
      fullDate: `${selectedDay}/${month}/${year}`
    };
  };

  const { dayName } = getCurrentDate();

  const navigateDay = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && selectedDay > 1) {
      setSelectedDay(selectedDay - 1);
    } else if (direction === 'next' && selectedDay < 30) {
      setSelectedDay(selectedDay + 1);
    }
  };

  const handleAddFood = (timeIndex: number) => {
    const meal = mealTimes[timeIndex];
    navigation.navigate('SearchFoodForAdd', {
      mealType: meal.label,
      mealTime: meal.time
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
    Alert.alert('ยืนยัน', 'ยืนยันการบันทึกอาหารทั้งหมด');
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
        <View className="w-10 h-10 rounded-lg items-center justify-center">
          <Icon name="calendar" size={24} color="white" />
        </View>
      </View>

      <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity
          className={`w-8 h-8 items-center justify-center ${selectedDay <= 1 ? 'opacity-50' : ''}`}
          onPress={() => navigateDay('prev')}
          disabled={selectedDay <= 1}
        >
          <Icon name="chevron-back" size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-medium text-gray-800">
          {dayName}
        </Text>
        <TouchableOpacity
          className={`w-8 h-8 items-center justify-center ${selectedDay >= 30 ? 'opacity-50' : ''}`}
          onPress={() => navigateDay('next')}
          disabled={selectedDay >= 30}
        >
          <Icon name="chevron-forward" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="font-medium text-gray-700">แคลอรี่วันนี้</Text>
          <Text className="font-semibold text-primary">
            {totalCalories}/{targetCalories} แคลอรี่
          </Text>
        </View>
        <View className="bg-gray-200 rounded-full h-3">
          <View
            className="bg-primary h-3 rounded-full"
            style={{ width: `${Math.min((totalCalories / targetCalories) * 100, 100)}%` }}
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {mealTimes.map((meal, timeIndex) => renderMealCard(meal, timeIndex))}
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