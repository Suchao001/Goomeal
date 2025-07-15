import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface NutritionData {
  current: number;
  target: number;
  unit: string;
  color: string;
  icon: string;
}

interface CaloriesSummaryProps {
  caloriesConsumed: number;
  caloriesTarget: number;
  protein: NutritionData;
  carbs: NutritionData;
  fat: NutritionData;
}

const CaloriesSummary: React.FC<CaloriesSummaryProps> = ({
  caloriesConsumed,
  caloriesTarget,
  protein,
  carbs,
  fat
}) => {
  const caloriesPercentage = (caloriesConsumed / caloriesTarget) * 100;
  
  const NutritionItem = ({ data, label }: { data: NutritionData; label: string }) => {
    const percentage = (data.current / data.target) * 100;
    
    return (
      <View className="flex-1 items-center">
        <View className="w-12 h-12 rounded-full items-center justify-center mb-2" style={{ backgroundColor: data.color + '20' }}>
          <Icon name={data.icon} size={20} color={data.color} />
        </View>
        <Text className="text-xs text-gray-500 mb-1">{label}</Text>
        <Text className="text-sm font-bold text-gray-800">
          {data.current}{data.unit}
        </Text>
        <Text className="text-xs text-gray-400">
          / {data.target}{data.unit}
        </Text>
        <View className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
          <View 
            className="h-1.5 rounded-full"
            style={{ 
              backgroundColor: data.color,
              width: `${Math.min(percentage, 100)}%`
            }}
          />
        </View>
      </View>
    );
  };

  return (
    <View className="mx-4 mt-4 bg-white rounded-xl p-5 shadow-sm">
      {/* Calories Section */}
      <View className="mb-6">
        <Text className="text-lg font-bold text-gray-800 mb-3">แคลอรี่วันนี้</Text>
        
        {/* Main Calories Display */}
        <View className="items-center mb-4">
          <View className="relative w-32 h-32 items-center justify-center">
            {/* Background Circle */}
            <View className="absolute w-full h-full rounded-full border-8 border-gray-200" />
            
            {/* Progress Circle */}
            <View 
              className="absolute w-full h-full rounded-full border-8 border-primary"
              style={{
                transform: [{ rotate: '-90deg' }],
                borderTopColor: caloriesPercentage > 100 ? '#ef4444' : '#fbbf24',
                borderRightColor: 'transparent',
                borderBottomColor: 'transparent',
                borderLeftColor: 'transparent',
              }}
            />
            
            {/* Center Content */}
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-800">{caloriesConsumed}</Text>
              <Text className="text-sm text-gray-500">/ {caloriesTarget}</Text>
              <Text className="text-xs text-gray-400">กิโลแคลอรี่</Text>
            </View>
          </View>
          
          {/* Remaining Calories */}
          
        </View>
      </View>

      {/* Nutrition Breakdown */}
      <View>
        <View className="flex-row space-x-3">
          <NutritionItem data={protein} label="โปรตีน" />
          <NutritionItem data={carbs} label="คาร์บ" />
          <NutritionItem data={fat} label="ไขมัน" />
        </View>
      </View>
    </View>
  );
};

export default CaloriesSummary;