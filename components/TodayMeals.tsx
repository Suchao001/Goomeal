import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { createEatingRecord, getEatingRecordsByDate, EatingRecord } from '../utils/api/eatingRecordApi';
import { getTodayBangkokDate } from '../utils/bangkokTime';

export interface MealData {
  id: string;
  mealType: string; // support custom meal types
  foodName: string;
  calories: number;
  carbs?: number;
  fat?: number;
  protein?: number;
  image?: any; // Local image require()
  imageUrl?: string; // URL image
  time?: string;
  fromPlan?: boolean; // Indicates if this food is from meal plan
  saved?: boolean; // Indicates if already saved to backend
  recordId?: number; // Backend record id for deletion
  uniqueId?: string; // Unique ID for plan items
}

interface TodayMealsProps {
  meals: MealData[];
  onAddMeal: (mealType: MealData['mealType']) => void;
  onEditMeal: (meal: MealData) => void;
  onRefreshData?: () => void; // Callback to refresh data after saving
}

const TodayMeals: React.FC<TodayMealsProps> = ({ meals, onAddMeal, onEditMeal, onRefreshData }) => {
  const [isSaving, setIsSaving] = useState(false);

  // Debug: log incoming meals from API/parent
  useEffect(() => {
    try {
      if (Array.isArray(meals)) {
        const types = Array.from(new Set(meals.map(m => m.mealType)));
      } else {
      }
    } catch (e) { }
  }, [meals]);

  const getMealTypeLabel = (mealType: MealData['mealType']) => {
    const t = String(mealType || '').toLowerCase();
    switch (mealType) {
      case 'breakfast': return 'มื้อเช้า';
      case 'lunch': return 'มื้อกลางวัน';
      case 'dinner': return 'มื้อเย็น';
      
      default: return mealType || 'มื้ออาหาร';
    }
  };

  const getMealTypeIcon = (mealType: MealData['mealType']) => {
    switch (mealType) {
      case 'breakfast': return 'sunny';
      case 'lunch': return 'partly-sunny';
      case 'dinner': return 'moon';
 
      default: return 'restaurant';
    }
  };

  const getMealTypeColor = (mealType: MealData['mealType']) => {
    switch (mealType) {
      case 'breakfast': return '#f59e0b';
      case 'lunch': return '#10b981';
      case 'dinner': return '#6366f1';
   
      default: return '#6b7280';
    }
  };

  // Group meals by type (support custom types)
  const groupsMap = meals.reduce<Record<string, MealData[]>>((acc, m) => {
    const key = m.mealType || 'other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});
  const orderedKeys = [
    'breakfast',
    'lunch',
    'dinner',
    ...Object.keys(groupsMap).filter(k => !['breakfast','lunch','dinner'].includes(k))
  ];
  const groupedMeals = orderedKeys.map(type => ({ type, meals: groupsMap[type] || [] }));

  // Debug: log grouped result
  useEffect(() => {
    try {
      const counts = groupedMeals.map(g => ({ type: g.type, count: g.meals.length }));
    } catch (e) { }
  }, [orderedKeys.join('|'), meals]);

  // Save meal plan item to backend
  const handleSaveMeal = async (meal: MealData) => {
    if (!meal.fromPlan || meal.saved || isSaving) return;

    try {
      setIsSaving(true);
      const logDate = getTodayBangkokDate();
      
      const recordData: Omit<EatingRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
        log_date: logDate,
        food_name: meal.foodName,
        meal_type: getMealTypeLabel(meal.mealType),
        calories: meal.calories || 0,
        carbs: meal.carbs || 0,
        fat: meal.fat || 0,
        protein: meal.protein || 0,
        meal_time: meal.time ? `${meal.time}:00` : '12:00:00',
        image: undefined,
        unique_id: meal.uniqueId
      };
      
      await createEatingRecord(recordData);
      
      // Refresh data to show updated save status
      if (onRefreshData) {
        onRefreshData();
      }
      
    } catch (error) {
      console.error('Error saving meal:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกอาหารได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSaving(false);
    }
  };

  const renderMealItem = (meal: MealData) => (
    <TouchableOpacity
      key={meal.id}
      className="flex-row items-center bg-gray-50 rounded-lg p-3 mb-2"
      onPress={() => onEditMeal(meal)}
    >
      {/* Food Image */}
      <View className="w-12 h-12 rounded-lg bg-gray-200 items-center justify-center mr-3">
        {meal.image || meal.imageUrl ? (
          <Image
            source={meal.image ? meal.image : { uri: meal.imageUrl }}
            className="w-full h-full rounded-lg"
            resizeMode="cover"
          />
        ) : (
          <Icon name="restaurant" size={20} color="#9ca3af" />
        )}
      </View>

      {/* Food Info */}
      <View className="flex-1">
        <Text className="text-sm font-promptMedium text-myBlack" numberOfLines={1}>
          {meal.foodName}
        </Text>
        <Text className="text-xs text-gray-500 font-prompt">
          {meal.calories} แคลอรี่
          {meal.time && ` • ${meal.time}`}
        </Text>
      </View>

      {/* Save/Saved Icon */}
      <View className="ml-2">
        {meal.fromPlan ? (
          meal.saved ? (
            // Show check circle for saved items
            <View className="flex-row items-center">
              <Icon name="checkmark-circle" size={20} color="#22c55e" />
             
            </View>
          ) : (
            // Show save button for unsaved plan items
            <TouchableOpacity
              className="bg-primary px-2 py-1 rounded-full h-8 flex-row items-center"
              onPress={() => handleSaveMeal(meal)}
              disabled={isSaving}
            >
              <Icon name="save-outline" size={14} color="white" />
            
            </TouchableOpacity>
          )
        ) : (
          // Show different icon for manually added meals
          <Icon name="restaurant-outline" size={16} color="#6b7280" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderMealSection = ({ type, meals: typeMeals }: { type: MealData['mealType']; meals: MealData[] }) => (
    <View key={type} className="mb-4">
      {/* Meal Type Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View 
            className="w-8 h-8  items-center justify-center mr-2"
           
          >
            <Icon 
              name={getMealTypeIcon(type)} 
              size={16} 
              color={getMealTypeColor(type)} 
            />
          </View>
          <Text className="text-base font-promptSemiBold text-myBlack">
            {getMealTypeLabel(type)}
          </Text>
          {typeMeals.length > 0 && (
            <Text className="text-sm text-gray-500 ml-2 font-prompt">
              ({typeMeals.reduce((sum, meal) => sum + meal.calories, 0)} แคลอรี่)
            </Text>
          )}
        </View>
        
       
      </View>

      {/* Meals List */}
      {typeMeals.length > 0 ? (
        <View>
          {typeMeals.map(renderMealItem)}
        </View>
      ) : null
        // <TouchableOpacity
        //   className="border-2 border-dashed border-gray-300 rounded-lg py-6 items-center"
        //   onPress={() => onAddMeal(type)}
        // >
        //   <Icon name="add-circle-outline" size={24} color="#9ca3af" />
        //   <Text className="text-gray-500 text-sm mt-1">เพิ่มอาหาร{getMealTypeLabel(type)}</Text>
        // </TouchableOpacity>
      }
    </View>
  );

  return (
    <View className="mx-4 mt-4 bg-white border border-transparent rounded-xl p-5 shadow-md shadow-slate-600">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-promptBold text-myBlack">มื้ออาหารวันนี้</Text>
        <Text className="text-sm text-gray-500 font-prompt">
          {meals.length} รายการ • {meals.reduce((sum, meal) => sum + meal.calories, 0)} แคลอรี่
        </Text>
      </View>

      {groupedMeals.map(renderMealSection)}
    </View>
  );
};

export default TodayMeals;
