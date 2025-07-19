import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { FoodItem } from '../stores/mealPlanStore';

interface MealCardProps {
  meal: {
    id: string;
    name: string;
    icon: string;
    time: string;
  };
  hasFood: boolean;
  mealData: any;
  nutrition: {
    cal: number;
    carb: number;
    fat: number;
    protein: number;
  };
  onAddFood: (mealId: string) => void;
  onRemoveFood: (foodId: string, mealId: string, selectedDay: number) => void;
  getImageUrl: (food: FoodItem) => string;
  selectedDay: number;
}

export const MealCard: React.FC<MealCardProps> = ({
  meal,
  hasFood,
  mealData,
  nutrition,
  onAddFood,
  onRemoveFood,
  getImageUrl,
  selectedDay
}) => {
  return (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
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
                <Text className="text-xs text-gray-500">
                  {food.cal} kcal • {food.carb}g คาร์บ • {food.protein}g โปรตีน
                </Text>
              </View>
              {food.isUserFood && (
                <View className="bg-blue-100 rounded px-1 py-0.5 mr-2">
                  <Text className="text-xs text-blue-600">เมนูของฉัน</Text>
                </View>
              )}
              <TouchableOpacity
                onPress={() => onRemoveFood(food.id, meal.id, selectedDay)}
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
        onPress={() => onAddFood(meal.id)}
      >
        <Icon name="add" size={20} color="white" />
        <Text className="text-white font-medium ml-2">เพิ่มอาหาร</Text>
      </TouchableOpacity>
    </View>
  );
};
