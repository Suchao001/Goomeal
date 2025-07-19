import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Modal, TextInput, Alert, FlatList, Image, Platform } from 'react-native';
import { useTypedNavigation } from '../../hooks/Navigation';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { base_url, seconde_url } from '../../config';
import { useMealPlanStore, type FoodItem } from '../../stores/mealPlanStore';
import { ApiClient } from '../../utils/apiClient';

/**
 * MealPlanScreen Component
 * หน้าวางแผนเมนูอาหาร - แสดงการจัดการเมนูอาหารในแต่ละมื้อ
 */
const MealPlanScreen = () => {
  const navigation = useTypedNavigation();
  const route = useRoute();
  const apiClient = useMemo(() => new ApiClient(), []);

  // Zustand store hooks
  const {
    mealPlanData,
    addFoodToMeal,
    removeFoodFromMeal,
    clearMealPlan,
    addMeal,
    getAllMealsForDay,
    getDayMeals,
    getMealNutrition,
    getDayNutrition
  } = useMealPlanStore();

  // State for selected date and modals
  const [selectedDay, setSelectedDay] = useState(1); // Default to day 1
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newMealName, setNewMealName] = useState('');
  const [newMealTime, setNewMealTime] = useState('');
  const [showKebabMenu, setShowKebabMenu] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showSavePlanModal, setShowSavePlanModal] = useState(false);
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [selectedPlanImage, setSelectedPlanImage] = useState<string | null>(null);

  // Generate days 1-30 for date picker
  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  // Debug: Monitor state changes
  useEffect(() => {
    console.log('=== Meal Plan Data Updated (Zustand) ===');
    console.log('Total days with data:', Object.keys(mealPlanData).length);
    
    // Only log detailed data when there's actual data to prevent spam
    if (Object.keys(mealPlanData).length > 0) {
      Object.keys(mealPlanData).forEach(day => {
        const dayMeals = mealPlanData[parseInt(day)];
        const mealCount = Object.keys(dayMeals).length;
        const totalItems = Object.values(dayMeals).reduce((total, meal) => total + meal.items.length, 0);
        console.log(`Day ${day}: ${mealCount} meals, ${totalItems} food items`);
      });
    }
  }, [mealPlanData]);

  // Listen for navigation params (when returning from SearchFoodForAdd)
  useFocusEffect(
    React.useCallback(() => {
      const params = route.params as any;
      if (params?.selectedFood && params?.mealId && params?.selectedDay) {
        console.log('=== Adding Food to Meal ===');
        console.log('Food:', params.selectedFood.name);
        console.log('Meal ID:', params.mealId);
        console.log('Day:', params.selectedDay);
        
        // Set the selected day to match the params
        setSelectedDay(params.selectedDay);
        
        // Add food immediately using Zustand store (no need to pass mealInfo, store will find it)
        addFoodToMeal(params.selectedFood, params.mealId, params.selectedDay);
        
        // Clear the params to prevent re-execution
        navigation.setParams({ selectedFood: undefined, mealId: undefined, selectedDay: undefined });
      }
    }, [route.params, navigation, addFoodToMeal])
  );

  // Get image URL based on food source
  const getImageUrl = (food: FoodItem): string => {
    if (!food.img) return '';
    
    // Debug log to check image URL construction
    console.log('MealPlan - Image URL construction for food:', food.name);
    console.log('Food source:', food.source);
    console.log('Food isUserFood:', food.isUserFood);
    console.log('Food img:', food.img);
    
    if (food.isUserFood || food.source === 'user_food') {
      const fullUrl = `${base_url}${food.img}`;
      console.log('MealPlan - User food URL:', fullUrl);
      return fullUrl;
    } else {
      const fullUrl = `${seconde_url}${food.img}`;
      console.log('MealPlan - Global food URL:', fullUrl);
      return fullUrl;
    }
  };

  // Save meal plan data
  const handleSaveMealPlan = async () => {
    // Check if there's any data to save
    if (Object.keys(mealPlanData).length === 0) {
      Alert.alert('ไม่มีข้อมูลให้บันทึก', 'กรุณาเพิ่มอาหารลงในแผนก่อนบันทึก');
      return;
    }

    // Show save plan modal for naming the plan
    setShowSavePlanModal(true);
  };

  // Function to handle closing save plan modal and reset form
  const handleCloseSavePlanModal = () => {
    setShowSavePlanModal(false);
    setPlanName('');
    setPlanDescription('');
    setSelectedPlanImage(null);
  };

  // Image picker functions for plan image
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'ต้องการสิทธิ์เข้าถึง',
        'แอปต้องการสิทธิ์เข้าถึงรูปภาพเพื่อเลือกรูปแผนอาหาร',
        [
          { text: 'ยกเลิก', style: 'cancel' },
          { text: 'ตั้งค่า', onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync() }
        ]
      );
      return false;
    }
    return true;
  };

  const handlePlanImagePicker = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    Alert.alert(
      'เลือกรูปภาพ',
      'เลือกวิธีการเพิ่มรูปภาพแผนอาหาร',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ถ่ายรูป', onPress: openPlanCamera },
        { text: 'เลือกจากอัลบั้ม', onPress: openPlanImageLibrary }
      ]
    );
  };

  const openPlanCamera = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermission.status !== 'granted') {
      Alert.alert('ข้อผิดพลาด', 'ต้องการสิทธิ์เข้าถึงกล้องเพื่อถ่ายรูป');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedPlanImage(result.assets[0].uri);
    }
  };

  const openPlanImageLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedPlanImage(result.assets[0].uri);
    }
  };

  // Confirm save plan with details
  const handleConfirmSavePlan = async () => {
    if (!planName.trim()) {
      Alert.alert('กรุณาใส่ชื่อแผน', 'โปรดระบุชื่อแผนอาหารก่อนบันทึก');
      return;
    }

    try {
      // Create enhanced data with total calories
      const enhancedMealPlan = Object.keys(mealPlanData).reduce((acc, dayKey) => {
        const day = parseInt(dayKey);
        const dayMeals = mealPlanData[day];
        let dayTotalCal = 0;
        
        const enhancedDayMeals = Object.keys(dayMeals).reduce((mealAcc, mealId) => {
          const meal = dayMeals[mealId];
          const mealTotalCal = meal.items.reduce((total, item) => total + item.cal, 0);
          dayTotalCal += mealTotalCal;
          
          mealAcc[mealId] = {
            ...meal,
            totalCal: mealTotalCal
          };
          
          return mealAcc;
        }, {} as any);
        
        acc[dayKey] = {
          totalCal: dayTotalCal,
          meals: enhancedDayMeals
        };
        
        return acc;
      }, {} as any);

      // Add plan metadata
      const planData = {
        planName: planName.trim(),
        planDescription: planDescription.trim(),
        planImage: selectedPlanImage,
        createdAt: new Date().toISOString(),
        totalDays: Object.keys(enhancedMealPlan).length,
        data: enhancedMealPlan
      };

      console.log('=== MEAL PLAN DATA WITH TOTAL CALORIES ===');
      console.log(JSON.stringify(planData, null, 2));

      // Save to backend via API
      const result = await apiClient.saveFoodPlan({
        name: planName.trim(),
        description: planDescription.trim(),
        plan: enhancedMealPlan,
        image: selectedPlanImage || undefined
      });

      if (result.success) {
        // Also save to JSON file for backup/debugging
        const jsonString = JSON.stringify(planData, null, 2);
        const fileName = `meal-plan-${planName.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
        const fileUri = FileSystem.documentDirectory + fileName;
        
        try {
          await FileSystem.writeAsStringAsync(fileUri, jsonString);
        } catch (fileError) {
          console.warn('Failed to save backup JSON file:', fileError);
        }
        
        // Close modal and reset form
        setShowSavePlanModal(false);
        setPlanName('');
        setPlanDescription('');
        setSelectedPlanImage(null);
        
        Alert.alert(
          'บันทึกข้อมูลสำเร็จ', 
          `แผนอาหาร "${planName}" ถูกบันทึกเรียบร้อยแล้ว\n${result.message || ''}`
        );
      } else {
        Alert.alert('เกิดข้อผิดพลาด', result.error || 'ไม่สามารถบันทึกแผนอาหารได้');
      }
    } catch (error) {
      console.error('Error saving meal plan:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
    }
  };

  // Clear all meal plan data
  const handleClearMealPlan = () => {
    Alert.alert(
      'เคลียร์ข้อมูล', 
      'คุณต้องการเคลียร์ข้อมูลทั้งหมดหรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'เคลียร์', 
          style: 'destructive', 
          onPress: () => {
            clearMealPlan();
            Alert.alert('เคลียร์ข้อมูล', 'ข้อมูลทั้งหมดถูกลบแล้ว');
          }
        }
      ]
    );
  };

  // Get current date info (simplified - just day numbers, no real dates)
  const getCurrentDate = () => {
    return {
      dayName: `วันที่ ${selectedDay}`,
      fullDate: `วันที่ ${selectedDay}`,
      shortDate: `วันที่ ${selectedDay}`
    };
  };

  const { dayName, fullDate, shortDate } = getCurrentDate();

  // Navigate to previous/next day
  const navigateDay = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && selectedDay > 1) {
      setSelectedDay(selectedDay - 1);
    } else if (direction === 'next' && selectedDay < 30) {
      setSelectedDay(selectedDay + 1);
    }
  };

  // Render date picker item
  const renderDatePickerItem = ({ item }: { item: number }) => (
    <TouchableOpacity
      className={`p-2 m-1 rounded-lg items-center justify-center ${
        selectedDay === item 
          ? 'bg-primary shadow-lg' 
          : 'bg-gray-100 hover:bg-gray-200'
      }`}
      style={{ width: 40, height: 40 }}
      onPress={() => {
        setSelectedDay(item);
        setShowDatePicker(false);
      }}
    >
      <Text className={`text-sm font-semibold ${
        selectedDay === item ? 'text-white' : 'text-gray-700'
      }`}>
        {item}
      </Text>
    </TouchableOpacity>
  );

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
      time: newMealTime.trim()
    };

    addMeal(newMeal, selectedDay); // Pass selectedDay to add meal only for this day
    setNewMealName('');
    setNewMealTime('');
    setShowAddMealModal(false);
  };

  // Handle time picker change
  const onTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (selectedDate) {
      setSelectedTime(selectedDate);
      const timeString = selectedDate.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      setNewMealTime(timeString);
    }
  };

  // Format time for display
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Add food to meal
  const handleAddFoodToMeal = (mealId: string) => {
    navigation.navigate('SearchFoodForAdd', {
      hideRecommended: true, // ซ่อนรายการอาหารที่แนะนำ
      mealId: mealId, // ส่ง meal ID ไปด้วย
      source: 'MealPlan', // ระบุแหล่งที่มา
      selectedDay: selectedDay // ส่งวันที่เลือกไปด้วย
    }); 
  };

  const renderMealCard = (meal: any) => {
    const currentDayMeals = getDayMeals(selectedDay);
    const mealData = currentDayMeals[meal.id];
    const hasFood = mealData && mealData.items.length > 0;
    const nutrition = hasFood ? getMealNutrition(selectedDay, meal.id) : { cal: 0, carb: 0, fat: 0, protein: 0 };

    return (
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
          <View className="items-end">
            <View className={`px-3 py-1 rounded-full ${hasFood ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Text className={`text-xs font-medium ${hasFood ? 'text-green-600' : 'text-gray-600'}`}>
                {hasFood ? `${mealData.items.length} เมนู` : 'ยังไม่มีเมนู'}
              </Text>
            </View>
            {hasFood && (
              <Text className="text-xs text-gray-500 mt-1">{nutrition.cal} kcal</Text>
            )}
          </View>
        </View>

        {/* Nutrition Summary */}
        {hasFood && (
          <View className="bg-gray-50 rounded-lg p-3 mb-3">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm font-medium text-gray-700">สรุปโภชนาการ</Text>
              <Text className="text-sm font-bold text-blue-600">{nutrition.cal} kcal</Text>
            </View>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-xs text-gray-500">คาร์บ</Text>
                <Text className="text-sm font-medium text-gray-700">{nutrition.carb}g</Text>
              </View>
              <View className="items-center">
                <Text className="text-xs text-gray-500">โปรตีน</Text>
                <Text className="text-sm font-medium text-gray-700">{nutrition.protein}g</Text>
              </View>
              <View className="items-center">
                <Text className="text-xs text-gray-500">ไขมัน</Text>
                <Text className="text-sm font-medium text-gray-700">{nutrition.fat}g</Text>
              </View>
            </View>
          </View>
        )}

        {/* Food items */}
        {hasFood && (
          <View className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
            <Text className="text-sm font-medium text-gray-700 mb-2">รายการอาหาร</Text>
            {mealData.items.map((food: FoodItem, index: number) => (
              <View key={`${food.id}-${index}`} className="flex-row items-center mb-2 last:mb-0">
                <View className="w-8 h-8 rounded bg-gray-200 items-center justify-center mr-3">
                  {food.img ? (
                    <Image
                      source={{ uri: getImageUrl(food) }}
                      className="w-8 h-8 rounded"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text className="text-xs">🍽️</Text>
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-800">{food.name}</Text>
                  <Text className="text-xs text-gray-500">{food.cal} kcal • {food.carb}g คาร์บ • {food.protein}g โปรตีน</Text>
                </View>
                {food.isUserFood && (
                  <View className="bg-blue-100 rounded px-1 py-0.5 mr-2">
                    <Text className="text-xs text-blue-600">เมนูของฉัน</Text>
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => removeFoodFromMeal(food.id, meal.id, selectedDay)}
                  className="w-6 h-6 rounded-full bg-red-100 items-center justify-center"
                >
                  <Icon name="close" size={12} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        
        {/* Add food button */}
        <TouchableOpacity
          className="bg-primary rounded-lg py-3 flex-row items-center justify-center mt-3"
          onPress={() => handleAddFoodToMeal(meal.id)}
        >
          <Icon name="add" size={20} color="white" />
          <Text className="text-white font-medium ml-2">เพิ่มอาหาร</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary px-4 py-4 mt-6 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity 
          className="w-10 h-10 rounded-lg items-center justify-center"
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <Text className="text-xl font-bold text-white font-prompt">วางแผนเมนูอาหาร</Text>
        
        <View className="flex-row items-center">
          <TouchableOpacity
            className="bg-opacity-20 rounded-lg px-3 py-2 mr-2"
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="calendar" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity 
            className="w-8 h-8 items-center justify-center"
            onPress={() => setShowKebabMenu(true)}
          >
            <Icon name="ellipsis-vertical" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Navigation Bar */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-2">
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
            <Text className="text-lg font-bold text-gray-800">{fullDate}</Text>
            <Text className="text-sm text-gray-500">แตะเพื่อเปลี่ยนวันที่</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`w-10 h-10 rounded-full items-center justify-center ${
              selectedDay >= 30 ? 'opacity-30' : 'bg-gray-100'
            }`}
            onPress={() => navigateDay('next')}
            disabled={selectedDay >= 30}
          >
            <Icon name="chevron-forward" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
        
        {/* Daily Calories Summary */}
        <View className="bg-blue-50 rounded-lg p-4 mt-2">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-blue-800">รวมแคลอรี่วันนี้</Text>
            <Text className="text-xl font-bold text-blue-600">{getDayNutrition(selectedDay).cal} kcal</Text>
          </View>
          
          {getDayNutrition(selectedDay).cal > 0 && (
            <View className="flex-row justify-between bg-white rounded-lg p-3">
              <View className="items-center flex-1">
                <Text className="text-xs text-blue-600 font-medium">คาร์โบไฮเดรต</Text>
                <Text className="text-sm font-bold text-blue-700">{getDayNutrition(selectedDay).carb}g</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-xs text-blue-600 font-medium">โปรตีน</Text>
                <Text className="text-sm font-bold text-blue-700">{getDayNutrition(selectedDay).protein}g</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-xs text-blue-600 font-medium">ไขมัน</Text>
                <Text className="text-sm font-bold text-blue-700">{getDayNutrition(selectedDay).fat}g</Text>
              </View>
            </View>
          )}
          
          {getDayNutrition(selectedDay).cal === 0 && (
            <Text className="text-center text-blue-600 text-sm">ยังไม่มีข้อมูลอาหารสำหรับวันนี้</Text>
          )}
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {/* Meal Cards */}
        {getAllMealsForDay(selectedDay).map(meal => renderMealCard(meal))}

        {/* Add More Meals Button */}
        <TouchableOpacity
          className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 items-center justify-center"
          onPress={() => setShowAddMealModal(true)}
        >
          <Icon name="add-circle" size={48} color="#9ca3af" />
          <Text className="text-gray-600 font-medium mt-2">เพิ่มมื้อเพิ่มเติม</Text>
        </TouchableOpacity>
        <View>
          <Text className="text-gray-500 text-center mt-4">คุณสามารถเพิ่มมื้ออาหารได้ตามต้องการ</Text>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableOpacity 
          className="flex-1"
          activeOpacity={1}
          onPress={() => setShowDatePicker(false)}
        >
          <View className="absolute top-20 left-4 right-4 bg-white rounded-xl shadow-lg p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-800">เลือกวันที่</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Icon name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={days}
              renderItem={renderDatePickerItem}
              keyExtractor={(item) => item.toString()}
              numColumns={6}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ 
                paddingHorizontal: 8,
                paddingBottom: 16
              }}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
            />
            
            <TouchableOpacity
              className="bg-primary rounded-lg py-3 items-center mt-2"
              onPress={() => setShowDatePicker(false)}
            >
              <Text className="text-white font-semibold">ยืนยัน</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Meal Modal */}
      <Modal
        visible={showAddMealModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddMealModal(false)}
      >
        <TouchableOpacity 
          className="flex-1 justify-end"
          activeOpacity={1}
          onPress={() => setShowAddMealModal(false)}
        >
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
              <TouchableOpacity
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex-row items-center justify-between"
                onPress={() => setShowTimePicker(true)}
              >
                <Text className={`${newMealTime ? 'text-gray-800' : 'text-gray-400'}`}>
                  {newMealTime || 'เลือกเวลา'}
                </Text>
                <Icon name="time-outline" size={20} color="#6b7280" />
              </TouchableOpacity>
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
                className="flex-1 bg-primary rounded-lg py-3 items-center"
                onPress={handleAddMeal}
              >
                <Text className="text-white font-medium">เพิ่มมื้ออาหาร</Text>
              </TouchableOpacity>
            </View>
            
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Time Picker Modal */}
      {showTimePicker && (
        <Modal
          visible={showTimePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <TouchableOpacity 
            className="flex-1 justify-end"
            activeOpacity={1}
            onPress={() => setShowTimePicker(false)}
          >
            <View className="bg-white rounded-t-3xl p-6">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-gray-800">เลือกเวลา</Text>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Icon name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              <DateTimePicker
                value={selectedTime}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onTimeChange}
                style={{ alignSelf: 'center' }}
              />
              
              {Platform.OS === 'ios' && (
                <View className="flex-row space-x-3 mt-6">
                  <TouchableOpacity
                    className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
                    onPress={() => setShowTimePicker(false)}
                  >
                    <Text className="text-gray-700 font-medium">ยกเลิก</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    className="flex-1 bg-primary rounded-lg py-3 items-center"
                    onPress={() => {
                      const timeString = selectedTime.toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      });
                      setNewMealTime(timeString);
                      setShowTimePicker(false);
                    }}
                  >
                    <Text className="text-white font-medium">ยืนยัน</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Save Plan Modal */}
      <Modal
        visible={showSavePlanModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseSavePlanModal}
      >
        <View className="flex-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
          <TouchableOpacity 
            className="flex-1 justify-end"
            activeOpacity={1}
            onPress={handleCloseSavePlanModal}
          >
            <View className="bg-white rounded-t-3xl p-6">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-gray-800">บันทึกแผนอาหาร</Text>
                <TouchableOpacity onPress={handleCloseSavePlanModal}>
                  <Icon name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              {/* Plan Name Input */}
              <View className="mb-4">
                <Text className="text-base font-medium text-gray-700 mb-2">ชื่อแผนอาหาร</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                  placeholder="เช่น แผนลดน้ำหนัก 7 วัน, เมนูเพิ่มกล้าม..."
                  value={planName}
                  onChangeText={setPlanName}
                />
              </View>

              {/* Plan Image Placeholder */}
              <View className="mb-4">
                <Text className="text-base font-medium text-gray-700 mb-2">รูปภาพแผน</Text>
                <TouchableOpacity 
                  className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 items-center justify-center h-32"
                  onPress={handlePlanImagePicker}
                >
                  {selectedPlanImage ? (
                    <Image
                      source={{ uri: selectedPlanImage }}
                      className="w-full h-full rounded-lg"
                      resizeMode="cover"
                    />
                  ) : (
                    <>
                      <Icon name="camera-outline" size={32} color="#9ca3af" />
                      <Text className="text-gray-500 mt-2">แตะเพื่อเพิ่มรูปภาพ</Text>
                    </>
                  )}
                </TouchableOpacity>
                {selectedPlanImage && (
                  <TouchableOpacity
                    className="mt-2 self-center"
                    onPress={() => setSelectedPlanImage(null)}
                  >
                    <Text className="text-red-500 text-sm">ลบรูปภาพ</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Plan Description Input */}
              <View className="mb-6">
                <Text className="text-base font-medium text-gray-700 mb-2">คำอธิบาย</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                  placeholder="อธิบายเกี่ยวกับแผนอาหารนี้..."
                  value={planDescription}
                  onChangeText={setPlanDescription}
                  multiline
                  numberOfLines={3}
                  style={{ textAlignVertical: 'top' }}
                />
              </View>

              {/* Summary Info */}
              <View className="bg-blue-50 rounded-lg p-4 mb-6">
                <Text className="text-sm font-medium text-blue-800 mb-2">สรุปแผนอาหาร</Text>
                <Text className="text-sm text-blue-700">
                  • จำนวนวัน: {Object.keys(mealPlanData).length} วัน
                </Text>
                <Text className="text-sm text-blue-700">
                  • รวมเมนูอาหาร: {Object.values(mealPlanData).reduce((total, day) => 
                    total + Object.values(day).reduce((mealTotal, meal: any) => mealTotal + meal.items.length, 0), 0
                  )} เมนู
                </Text>
              </View>

              {/* Action Buttons */}
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
                  onPress={handleCloseSavePlanModal}
                >
                  <Text className="text-gray-700 font-medium">ยกเลิก</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="flex-1 bg-primary rounded-lg py-3 items-center"
                  onPress={handleConfirmSavePlan}
                >
                  <Text className="text-white font-medium">บันทึกแผน</Text>
                </TouchableOpacity>
              </View>
              
            </View>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Kebab Menu Modal */}
      <Modal
        visible={showKebabMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowKebabMenu(false)}
      >
        <TouchableOpacity 
          className="flex-1"
          activeOpacity={1}
          onPress={() => setShowKebabMenu(false)}
        >
          <View className="absolute top-20 right-4 bg-white rounded-xl shadow-lg py-2" style={{ minWidth: 180 }}>
            {/* Save Data Option */}
            <TouchableOpacity
              className="flex-row items-center px-4 py-3 active:bg-gray-50"
              onPress={() => {
                setShowKebabMenu(false);
                handleSaveMealPlan();
              }}
            >
              <Icon name="save-outline" size={20} color="#059669" />
              <Text className="text-gray-800 font-medium ml-3">บันทึกข้อมูล</Text>
            </TouchableOpacity>
            
            {/* Divider */}
            <View className="h-px bg-gray-200 mx-2" />
            
            {/* Clear Data Option */}
            <TouchableOpacity
              className="flex-row items-center px-4 py-3 active:bg-gray-50"
              onPress={() => {
                setShowKebabMenu(false);
                handleClearMealPlan();
              }}
            >
              <Icon name="trash-outline" size={20} color="#dc2626" />
              <Text className="text-gray-800 font-medium ml-3">เคลียร์ข้อมูล</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default MealPlanScreen;
