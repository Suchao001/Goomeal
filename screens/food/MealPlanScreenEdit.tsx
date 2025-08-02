import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert, Image, ActivityIndicator } from 'react-native';
import { useTypedNavigation } from '../../hooks/Navigation';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useMealPlanStoreEdit, type FoodItem } from '../../stores/mealPlanStoreEdit';
import { useMealPlanMode } from '../../hooks/useMealPlanEdit';
import { DatePickerModal } from '../../components/DatePickerModal';
import { AddMealModal } from '../../components/AddMealModal';
import { KebabMenuModal } from '../../components/KebabMenuModal';
import { EditFoodModal } from '../../components/EditFoodModal';
import { getImageUrl, getCurrentDate, generateDays } from '../../utils/mealPlanUtils';


const MealPlanEditScreen = () => {
  const navigation = useTypedNavigation();
  
  const route = useRoute();
  
  // Get foodPlanId from route params and keep it constant
  const [foodPlanId] = useState(() => (route.params as any)?.foodPlanId);
  const [from] = useState(() => (route.params as any)?.from);

  // Use the refactored hook - edit-only mode
  const { 
    isLoading, 
    isSaving,
    initializeEditMode,
    savePlan, 
    clearEditSession: clearEditSessionFromHook
  } = useMealPlanMode();

  // Get all state and actions from the edit store
  const {
    planId,
    mealPlanData,
    planName,
    planDescription,
    planImage,
    setAsCurrentPlan,
    addMeal,
    addFoodToMeal,
    removeFoodFromMeal,
    updateFoodInMeal,
    getAllMealsForDay,
    getDayMeals,
    getMealNutrition,
    getDayNutrition,
    setPlanMetadata,
    loadMealPlanData,
    clearEditSession,
  } = useMealPlanStoreEdit();

  // Local state for UI
  const [selectedDay, setSelectedDay] = useState(1);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showKebabMenu, setShowKebabMenu] = useState(false);
  const [showEditFoodModal, setShowEditFoodModal] = useState(false);
  const [editingFood, setEditingFood] = useState<{ food: FoodItem; mealId: string; day: number } | null>(null);

  // Generate days and current date
  const days = useMemo(() => generateDays(), []);
  const currentDate = useMemo(() => getCurrentDate(selectedDay), [selectedDay]);

  // Check if we can save (has meal plan data and planId)
  const canSave = useMemo(() => {
    const hasData = Object.keys(mealPlanData).length > 0;
    const hasPlanId = Boolean(planId);
    const result = hasData && hasPlanId;
    console.log('🔍 [MealPlanScreenEdit] canSave:', {
      hasData,
      hasPlanId,
      planId,
      mealPlanDataKeys: Object.keys(mealPlanData),
      totalDays: Object.keys(mealPlanData).length,
      canSave: result
    });
    return result;
  }, [mealPlanData, planId]);

  // Load meal plan data when component mounts
  useEffect(() => {
    if (foodPlanId) {
      console.log('🔄 [MealPlanScreenEdit] Component Mount/foodPlanId Change. foodPlanId:', foodPlanId);
      console.log('🔄 [MealPlanScreenEdit] Current planId in store:', planId);
      
      // เงื่อนไข: โหลดข้อมูลก็ต่อเมื่อ planId ใน store ยังไม่ใช่ตัวที่ถูกต้อง
      // หรือยังไม่มีข้อมูลแผนอาหารเลย
      if (planId !== foodPlanId) {
        console.log(`🔄 [MealPlanScreenEdit] Initializing edit mode because planId is different. Store: ${planId}, Route: ${foodPlanId}`);
        initializeEditMode(foodPlanId);
      } else {
        console.log('✅ [MealPlanScreenEdit] Plan already loaded, skipping initialization');
      }
    }
    
    // ไม่ต้องมี cleanup function ที่นี่ เพราะเราต้องการให้ state คงอยู่
  }, [foodPlanId, initializeEditMode, planId]);

  // Handle food addition from SearchFoodForAdd navigation
  useFocusEffect(
    useCallback(() => {
      const params = route.params as any;
      console.log('🔄 [MealPlanScreenEdit] useFocusEffect triggered with params:', params);
      console.log('🔄 [MealPlanScreenEdit] Current store state:', {
        planId,
        planName,
        hasData: Object.keys(mealPlanData).length > 0
      });
      
      if (params?.selectedFood && params?.mealId && params?.selectedDay) {
        console.log('🍽️ [MealPlanScreenEdit] Processing food addition from params:', {
          food: params.selectedFood.name,
          foodId: params.selectedFood.id,
          mealId: params.mealId,
          selectedDay: params.selectedDay,
        });
        
        setSelectedDay(params.selectedDay);
        addFoodToMeal(params.selectedFood, params.mealId, params.selectedDay);
        
        // Clear params to prevent re-adding on next focus
        navigation.setParams({ 
          selectedFood: undefined, 
          mealId: undefined, 
          selectedDay: undefined,
          //สำคัญ: ต้องคง foodPlanId ไว้ใน params
          foodPlanId: foodPlanId 
        });
        console.log('✅ [MealPlanScreenEdit] Params cleared after food addition');
      } else {
        console.log('ℹ️ [MealPlanScreenEdit] No food addition params found');
      }
    }, [route.params, addFoodToMeal, navigation, getDayMeals, planId, planName, mealPlanData])
  );

  
  const handleBack = useCallback(() => {
    console.log('⬅️ [MealPlanScreenEdit] Going back - clearing edit session');
    clearEditSession();
    navigation.reset({
    index: 0,
    routes: [{ name: from || 'Home' }] // Use 'Home' as default if from is not set,
  });
  
  }, [clearEditSession, navigation]);
  
  // Handle save plan
  const handleSavePlan = async () => {
    console.log('💾 [MealPlanScreenEdit] Current state:', {
      planId,
      planName,
      canSave,
      mealPlanDataKeys: Object.keys(mealPlanData)
    });
    
    if (!canSave) {
      Alert.alert('ไม่มีข้อมูลให้บันทึก', 'กรุณาเพิ่มอาหารลงในแผนก่อนบันทึก');
      return;
    }

    if (!planId) {
      Alert.alert('ข้อผิดพลาด', 'ไม่พบ ID ของแผนอาหาร กรุณาลองใหม่');
      return;
    }

    Alert.alert(
      'ยืนยันการอัพเดท',
      `คุณต้องการอัพเดทแผนอาหาร "${planName}" หรือไม่?`,
      [
        {
          text: 'ยกเลิก',
          style: 'cancel'
        },
        {
          text: 'อัพเดท',
          onPress: async () => {
            console.log('💾 [MealPlanScreenEdit] Calling savePlan with planId:', planId);
            const result = await savePlan();
            if (result.success) {
              Alert.alert('สำเร็จ', `แผนอาหาร "${planName}" ถูกอัพเดทเรียบร้อยแล้ว`);
              handleBack(); // Use handleBack to clear edit session
            } else {
              Alert.alert('ข้อผิดพลาด', result.error);
            }
          }
        }
      ]
    );
  };

  // Handle add new meal
  const handleAddNewMeal = (name: string, time: string) => {
    const newMeal = {
      id: `meal_${Date.now()}`,
      name,
      icon: 'restaurant',
      time
    };
    addMeal(newMeal, selectedDay);
  };

  // Handle edit food
  const handleEditFood = (food: FoodItem, mealId: string, day: number) => {
    setEditingFood({ food, mealId, day });
    setShowEditFoodModal(true);
  };

  const handleSaveEditedFood = (updatedFood: FoodItem) => {
    if (editingFood) {
      updateFoodInMeal(updatedFood, editingFood.mealId, editingFood.day);
      setEditingFood(null);
    }
  };

  const handleCloseEditFoodModal = () => {
    setShowEditFoodModal(false);
    setEditingFood(null);
  };

  // Handle clear meal plan
  const handleClearMealPlan = () => {
    Alert.alert(
      'ยืนยันการล้างข้อมูล',
      'คุณต้องการล้างอาหารทั้งหมดในแผนนี้หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'ล้างข้อมูล', 
          style: 'destructive',
          onPress: () => {
            // Clear all meal data in the store
            clearEditSession();
          }
        }
      ]
    );
  };

  // Navigation functions
  const navigateDay = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && selectedDay > 1) {
      setSelectedDay(selectedDay - 1);
    } else if (direction === 'next' && selectedDay < 30) {
      setSelectedDay(selectedDay + 1);
    }
  };

  const handleAddFoodToMeal = (mealId: string) => {
    navigation.navigate('SearchFoodForAdd', {
      hideRecommended: true,
      mealId: mealId,
      source: 'MealPlanEdit',
      selectedDay: selectedDay,
      foodPlanId: foodPlanId
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
                  onPress={() => handleEditFood(food, meal.id, selectedDay)}
                  className="w-6 h-6 rounded-full bg-blue-100 items-center justify-center mr-2"
                >
                  <Icon name="create" size={12} color="#3b82f6" />
                </TouchableOpacity>
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

  // Show loading screen when loading plan data
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="bg-primary px-4 py-4 mt-6 flex-row items-center justify-between border-b border-gray-100">
          <TouchableOpacity 
            className="w-10 h-10 rounded-lg items-center justify-center"
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <Text className="text-xl font-bold text-white font-prompt">แก้ไขแผนอาหาร</Text>
          
          <View className="w-10 h-10" />
        </View>
        
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text className="text-gray-600 mt-4 text-lg">กำลังโหลดข้อมูลแผนอาหาร...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary px-4 py-4 mt-6 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity 
          className="w-10 h-10 rounded-lg items-center justify-center"
          onPress={handleBack}
        >
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <Text className="text-xl font-bold text-white font-prompt">แก้ไขแผนอาหาร</Text>
        
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
            <Text className="text-lg font-bold text-gray-800">{currentDate.fullDate}</Text>
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
        {getAllMealsForDay(selectedDay).map((meal: any) => renderMealCard(meal))}

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

      {/* Modals */}
      <DatePickerModal
        visible={showDatePicker}
        selectedDay={selectedDay}
        days={days}
        onSelectDay={setSelectedDay}
        onClose={() => setShowDatePicker(false)}
      />

      <AddMealModal
        visible={showAddMealModal}
        onClose={() => setShowAddMealModal(false)}
        onAddMeal={handleAddNewMeal}
      />

      <KebabMenuModal
        visible={showKebabMenu}
        onClose={() => setShowKebabMenu(false)}
        onSave={handleSavePlan}
        onClear={handleClearMealPlan}
        canSave={canSave}
      />

      <EditFoodModal
        visible={showEditFoodModal}
        food={editingFood?.food || null}
        onClose={handleCloseEditFoodModal}
        onSave={handleSaveEditedFood}
      />
    </SafeAreaView>
  );
};

export default MealPlanEditScreen;
