import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export interface MealData {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodName: string;
  calories: number;
  image?: any; // Local image require()
  imageUrl?: string; // URL image
  time?: string;
}

interface TodayMealsProps {
  meals: MealData[];
  onAddMeal: (mealType: MealData['mealType']) => void;
  onEditMeal: (meal: MealData) => void;
}

const TodayMeals: React.FC<TodayMealsProps> = ({ meals, onAddMeal, onEditMeal }) => {
  const getMealTypeLabel = (mealType: MealData['mealType']) => {
    switch (mealType) {
      case 'breakfast': return 'มื้อเช้า';
      case 'lunch': return 'มื้อเที่ยง';
      case 'dinner': return 'มื้อเย็น';
      
      default: return 'มื้ออาหาร';
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

  // Group meals by type
  const mealTypes: MealData['mealType'][] = ['breakfast', 'lunch', 'dinner'];
  const groupedMeals = mealTypes.map(type => ({
    type,
    meals: meals.filter(meal => meal.mealType === type)
  }));

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

      {/* Edit Icon */}
      <Icon name="chevron-forward" size={16} color="#9ca3af" />
    </TouchableOpacity>
  );

  const renderMealSection = ({ type, meals: typeMeals }: { type: MealData['mealType']; meals: MealData[] }) => (
    <View key={type} className="mb-4">
      {/* Meal Type Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View 
            className="w-8 h-8 rounded-full items-center justify-center mr-2"
            style={{ backgroundColor: getMealTypeColor(type) + '20' }}
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
        
        <TouchableOpacity
          className="w-8 h-8 rounded-full bg-primary items-center justify-center"
          onPress={() => onAddMeal(type)}
        >
          <Icon name="add" size={16} color="white" />
        </TouchableOpacity>
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
    <View className="mx-4 mt-4 bg-white rounded-xl p-5 shadow-md shadow-slate-600 border border-transparent">
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