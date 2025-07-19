import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert, Image, ActivityIndicator } from 'react-native';
import { useTypedNavigation } from '../../hooks/Navigation';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useMealPlanStore, type FoodItem } from '../../stores/mealPlanStore';
import { useImagePicker } from '../../hooks/useImagePicker';
import { useMealPlanActions } from '../../hooks/useMealPlanActions';
import { useMealPlanMode, type MealPlanMode } from '../../hooks/useMealPlanMode';
import { SavePlanModal } from '../../components/SavePlanModal';
import { DatePickerModal } from '../../components/DatePickerModal';
import { AddMealModal } from '../../components/AddMealModal';
import { KebabMenuModal } from '../../components/KebabMenuModal';
import { getImageUrl, getCurrentDate, generateDays } from '../../utils/mealPlanUtils';

/**
 * MealPlanScreen Component
 * หน้าวางแผนเมนูอาหาร - รองรับทั้งโหมดสร้างใหม่และแก้ไข
 * Modes:
 * - add: สร้างแผนอาหารใหม่
 * - edit: แก้ไขแผนอาหารที่มีอยู่ (ส่ง foodPlanId มาด้วย)
 */
const MealPlanScreen = () => {
  const navigation = useTypedNavigation();
  const route = useRoute();

  // Get route parameters
  const routeParams = route.params as any;
  const mode: MealPlanMode = routeParams?.mode || 'add';
  const foodPlanId = routeParams?.foodPlanId;

  // Custom hooks
  const { showImagePicker } = useImagePicker();
  const { handleClearMealPlan, canSave } = useMealPlanActions();
  const mealPlanMode = useMealPlanMode(mode, foodPlanId);

  // Zustand store hooks
  const {
    mealPlanData,
    addMeal,
    addFoodToMeal,
    removeFoodFromMeal,
    getAllMealsForDay,
    getDayMeals,
    getMealNutrition,
    getDayNutrition
  } = useMealPlanStore();

  // State for selected date and modals
  const [selectedDay, setSelectedDay] = useState(1);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showKebabMenu, setShowKebabMenu] = useState(false);
  const [showSavePlanModal, setShowSavePlanModal] = useState(false);

  // Calculate totals for SavePlanModal
  const totalDays = Object.keys(mealPlanData).length;
  const totalMenus = Object.values(mealPlanData).reduce((total, day: any) => 
    total + Object.values(day).reduce((mealTotal, meal: any) => mealTotal + meal.items.length, 0), 0
  );

  // Handlers for SavePlanModal
  const handlePlanImagePicker = async () => {
    const imageUri = await showImagePicker(
      'เลือกรูปภาพ',
      'เลือกวิธีการเพิ่มรูปภาพแผนอาหาร'
    );
    if (imageUri) {
      mealPlanMode.updatePlanMetadata({ planImage: imageUri });
    }
  };

  const handleSavePlan = async () => {
    // Prepare meal plan data with enhanced nutrition info
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

    const result = await mealPlanMode.savePlan(enhancedMealPlan);
    
    if (result.success) {
      setShowSavePlanModal(false);
      Alert.alert(
        'บันทึกข้อมูลสำเร็จ', 
        `แผนอาหาร "${mealPlanMode.planName}" ${mealPlanMode.mode === 'edit' ? 'ถูกอัพเดท' : 'ถูกบันทึก'}เรียบร้อยแล้ว\n${result.message || ''}`
      );
      
      // Navigate back if in edit mode
      if (mealPlanMode.mode === 'edit') {
        navigation.goBack();
      }
    } else {
      Alert.alert('เกิดข้อผิดพลาด', result.error);
    }
  };

  const handleCloseSavePlanModal = () => {
    setShowSavePlanModal(false);
  };

  // Memoized values
  const days = useMemo(() => generateDays(30), []);
  const currentDate = useMemo(() => getCurrentDate(selectedDay), [selectedDay]);

  // Listen for navigation params (when returning from SearchFoodForAdd)
  useFocusEffect(
    React.useCallback(() => {
      const params = route.params as any;
      if (params?.selectedFood && params?.mealId && params?.selectedDay) {
        setSelectedDay(params.selectedDay);
        addFoodToMeal(params.selectedFood, params.mealId, params.selectedDay);
        navigation.setParams({ selectedFood: undefined, mealId: undefined, selectedDay: undefined });
      }
    }, [route.params, navigation]) // Remove addFoodToMeal from dependency
  );

  // Handlers
  const handleSaveMealPlan = () => {
    if (!canSave) {
      Alert.alert('ไม่มีข้อมูลให้บันทึก', 'กรุณาเพิ่มอาหารลงในแผนก่อนบันทึก');
      return;
    }
    setShowSavePlanModal(true);
  };

  const handleAddNewMeal = (name: string, time: string) => {
    const newMeal = {
      id: `meal_${Date.now()}`,
      name,
      icon: 'restaurant',
      time
    };
    addMeal(newMeal, selectedDay);
  };

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
      source: 'MealPlan',
      selectedDay: selectedDay
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

  // Show loading screen when loading plan data
  if (mealPlanMode.isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="bg-primary px-4 py-4 mt-6 flex-row items-center justify-between border-b border-gray-100">
          <TouchableOpacity 
            className="w-10 h-10 rounded-lg items-center justify-center"
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <Text className="text-xl font-bold text-white font-prompt">{mealPlanMode.getScreenTitle()}</Text>
          
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
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <Text className="text-xl font-bold text-white font-prompt">{mealPlanMode.getScreenTitle()}</Text>
        
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
        onSave={handleSaveMealPlan}
        onClear={handleClearMealPlan}
        canSave={canSave()}
      />

      <SavePlanModal
        visible={showSavePlanModal}
        onClose={handleCloseSavePlanModal}
        onSave={handleSavePlan}
        planName={mealPlanMode.planName}
        setPlanName={(name: string) => mealPlanMode.updatePlanMetadata({ planName: name })}
        planDescription={mealPlanMode.planDescription}
        setPlanDescription={(desc: string) => mealPlanMode.updatePlanMetadata({ planDescription: desc })}
        selectedPlanImage={mealPlanMode.planImage}
        onImagePicker={handlePlanImagePicker}
        onRemoveImage={() => mealPlanMode.updatePlanMetadata({ planImage: null })}
        totalDays={totalDays}
        totalMenus={totalMenus}
        saveButtonText={mealPlanMode.getSaveButtonText()}
        setAsCurrentPlan={mealPlanMode.setAsCurrentPlan}
        setSetAsCurrentPlan={(value: boolean) => mealPlanMode.updatePlanMetadata({ setAsCurrentPlan: value })}
      />
    </SafeAreaView>
  );
};

export default MealPlanScreen;
