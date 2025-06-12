import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Modal, TextInput, Alert } from 'react-native';
import { useTypedNavigation } from '../hooks/Navigation';
import Icon from 'react-native-vector-icons/Ionicons';

/**
 * MealPlanScreen Component
 * หน้าวางแผนเมนูอาหาร - แสดงการจัดการเมนูอาหารในแต่ละมื้อ
 */
const MealPlanScreen = () => {
  const navigation = useTypedNavigation();

  // State for selected date and modals
  const [selectedDay, setSelectedDay] = useState(12); // Default to day 12
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [newMealName, setNewMealName] = useState('');
  const [newMealTime, setNewMealTime] = useState('');

  // Default meals
  const [meals, setMeals] = useState([
    { id: 'breakfast', name: 'อาหารมื้อเช้า', icon: 'sunny', time: '07:00', hasFood: false },
    { id: 'lunch', name: 'อาหารมื้อกลางวัน', icon: 'partly-sunny', time: '12:00', hasFood: false },
    { id: 'dinner', name: 'อาหารมื้อเย็น', icon: 'moon', time: '18:00', hasFood: false },
  ]);

  // Get current date info
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

  // Navigate to previous/next day
  const navigateDay = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && selectedDay > 1) {
      setSelectedDay(selectedDay - 1);
    } else if (direction === 'next' && selectedDay < 30) {
      setSelectedDay(selectedDay + 1);
    }
  };

  // Add new meal
  const handleAddMeal = () => {
    if (!newMealName.trim() || !newMealTime.trim()) {
      Alert.alert('กรุณากรอกข้อมูลให้ครบ', 'โปรดระบุชื่อมื้ออาหารและเวลา');
      return;
    }

    const newMeal = {
      id: `meal_${Date.now()}`,
      name: newMealName.trim(),
      icon: 'restaurant',
      time: newMealTime.trim(),
      hasFood: false
    };

    setMeals([...meals, newMeal]);
    setNewMealName('');
    setNewMealTime('');
    setShowAddMealModal(false);
  };

  // Add food to meal
  const handleAddFoodToMeal = (mealId: string) => {
    // Navigate to food selection or suggestion screen
    navigation.navigate('SuggestionMenu');
  };

  const renderMealCard = (meal: any) => (
    <View key={meal.id} className="bg-white rounded-xl p-4 mb-4 shadow-sm">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-yellow-100 rounded-full items-center justify-center mr-3">
            <Icon name={meal.icon} size={24} color="#eab308" />
          </View>
          <View>
            <Text className="text-lg font-semibold text-gray-800">{meal.name}</Text>
            <Text className="text-sm text-gray-500">{meal.time}</Text>
          </View>
        </View>
        
        {/* Meal status */}
        <View className={`px-3 py-1 rounded-full ${meal.hasFood ? 'bg-green-100' : 'bg-gray-100'}`}>
          <Text className={`text-xs font-medium ${meal.hasFood ? 'text-green-600' : 'text-gray-600'}`}>
            {meal.hasFood ? 'มีเมนูแล้ว' : 'ยังไม่มีเมนู'}
          </Text>
        </View>
      </View>

      {/* Food items or add button */}
      {meal.hasFood ? (
        <View className="bg-gray-50 rounded-lg p-3 mb-3">
          <Text className="text-gray-600">เมนูอาหารที่เลือกไว้จะแสดงที่นี่</Text>
        </View>
      ) : (
        <View className="border-2 border-dashed border-gray-200 rounded-lg p-4 items-center">
          <Icon name="add-circle-outline" size={32} color="#9ca3af" />
          <Text className="text-gray-500 mt-2 text-center">ยังไม่มีเมนูอาหาร</Text>
        </View>
      )}

      {/* Add food button */}
      <TouchableOpacity
        className="bg-yellow-500 rounded-lg py-3 flex-row items-center justify-center mt-3"
        onPress={() => handleAddFoodToMeal(meal.id)}
      >
        <Icon name="add" size={20} color="white" />
        <Text className="text-white font-medium ml-2">เพิ่มอาหาร</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary px-4 py-4 mt-6 flex-row items-center justify-between border-b border-gray-100">
        {/* Back Button */}
        <TouchableOpacity 
          className="w-10 h-10 rounded-lg items-center justify-center"
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        {/* Title */}
        <Text className="text-xl font-bold text-white font-prompt">วางแผนเมนูอาหาร</Text>
        
        {/* Add Meal Button */}
        <TouchableOpacity 
          className="w-10 h-10 rounded-lg items-center justify-center"
          onPress={() => setShowAddMealModal(true)}
        >
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Date Navigation Bar */}
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

      {/* Main Content */}
      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {/* Meal Cards */}
        {meals.map(meal => renderMealCard(meal))}

        {/* Add More Meals Button */}
        <TouchableOpacity
          className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 items-center justify-center"
          onPress={() => setShowAddMealModal(true)}
        >
          <Icon name="add-circle" size={48} color="#9ca3af" />
          <Text className="text-gray-600 font-medium mt-2">เพิ่มมื้อเพิ่มเติม</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Meal Modal */}
      <Modal
        visible={showAddMealModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddMealModal(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">เพิ่มมื้ออาหาร</Text>
              <TouchableOpacity onPress={() => setShowAddMealModal(false)}>
                <Icon name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            {/* Meal Name Input */}
            <View className="mb-4">
              <Text className="text-base font-medium text-gray-700 mb-2">ชื่อมื้ออาหาร</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                placeholder="เช่น ของว่างบ่าย, มื้อดึก..."
                value={newMealName}
                onChangeText={setNewMealName}
              />
            </View>

            {/* Meal Time Input */}
            <View className="mb-6">
              <Text className="text-base font-medium text-gray-700 mb-2">เวลาของมื้ออาหาร</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                placeholder="เช่น 15:00, 21:30..."
                value={newMealTime}
                onChangeText={setNewMealTime}
              />
            </View>

            {/* Action Buttons */}
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
                onPress={() => setShowAddMealModal(false)}
              >
                <Text className="text-gray-700 font-medium">ยกเลิก</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 bg-yellow-500 rounded-lg py-3 items-center"
                onPress={handleAddMeal}
              >
                <Text className="text-white font-medium">เพิ่มมื้ออาหาร</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MealPlanScreen;
