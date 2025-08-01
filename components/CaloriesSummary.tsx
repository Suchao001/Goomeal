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
  const remainingCalories = Math.max(caloriesTarget - caloriesConsumed, 0);
  
  const NutritionCard = ({ data, label }: { data: NutritionData; label: string }) => {
    const percentage = (data.current / data.target) * 100;
    const isComplete = percentage >= 100;
    
    return (
      <View className="flex-1 mx-1">
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
          {/* Label */}
          <View className="items-center mb-3">
            <Text className="text-xs font-promptMedium text-myBlack uppercase tracking-wide">
              {label}
            </Text>
          </View>
          {/* Progress Circle with Icon as Background */}
          <View className="items-center mb-3">
            <View className="relative w-16 h-16 items-center justify-center">
              {/* Icon as background */}
              <Icon
                name={data.icon}
                size={54}
                color={data.color + '33'}
                style={{ position: 'absolute', left: 0, top: 0, zIndex: 0 }}
              />
              {/* Percent and ring above icon */}
              <View className="w-16 h-16 rounded-full items-center justify-center" style={{ backgroundColor: data.color + '10', zIndex: 1 }}>
                <Text className="text-lg font-promptBold" style={{ color: data.color }}>
                  {Math.round(percentage)}%
                </Text>
              </View>
              {/* Progress Ring */}
              <View 
                className="absolute top-0 left-0 w-16 h-16 rounded-full border-4"
                style={{
                  borderTopColor: isComplete ? data.color : data.color,
                  borderRightColor: percentage > 25 ? (isComplete ? data.color : data.color) : '#d1d5db',
                  borderBottomColor: percentage > 50 ? (isComplete ? data.color : data.color) : '#d1d5db',
                  borderLeftColor: percentage > 75 ? (isComplete ? data.color : data.color) : '#d1d5db',
                  transform: [{ rotate: '-90deg' }],
                  zIndex: 2
                }}
              />
            </View>
          </View>
          {/* Values */}
          <View className="items-center">
            <Text className="text-base font-promptBold text-myBlack">
              {data.current}
              <Text className="text-sm font-prompt text-gray-500">{data.unit}</Text>
            </Text>
            <Text className="text-xs text-gray-400 mt-1 font-prompt">
              เป้าหมาย {data.target}{data.unit}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="mx-3 mt-4">
      {/* Main Calories Card */}
      <View className="bg-white rounded-2xl p-4 shadow-lg border border-blue-100 mb-3">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-promptBold text-myBlack">แคลอรี่วันนี้</Text>
          <View className="bg-white rounded-full px-2 py-0.5 shadow-sm">
            <Text className="text-[10px] font-promptMedium text-blue-600">
              {Math.round(caloriesPercentage)}%
            </Text>
          </View>
        </View>
        {/* Main Calories Display */}
        <View className="items-center mb-4">
          <View className="flex-row items-baseline justify-center mb-1">
            <Text className="text-3xl font-promptBold text-myBlack">
              {caloriesConsumed.toLocaleString()}
            </Text>
            <Text className="text-base text-gray-500 ml-1 font-prompt">
              / {caloriesTarget.toLocaleString()}
            </Text>
          </View>
          <Text className="text-xs font-promptMedium text-gray-600 mb-2">กิโลแคลอรี่</Text>
          {/* Progress Bar */}
          <View className="w-full mb-2">
            <View className="w-full h-2 bg-white rounded-full shadow-inner overflow-hidden">
              <View
                className="h-2 rounded-full shadow-sm"
                style={{
                  backgroundColor: caloriesPercentage > 100 ? '#ef4444' : 
                                 caloriesPercentage > 80 ? '#f59e0b' : '#10b981',
                  width: `${Math.min(caloriesPercentage, 100)}%`,
                }}
              />
            </View>
          </View>
          {/* Status Message */}
          {remainingCalories > 0 ? (
            <View className="bg-white rounded-full px-3 py-1 shadow-sm">
              <Text className="text-xs font-promptMedium text-gray-600">
                เหลืออีก <Text className="font-promptBold text-green-600">{remainingCalories}</Text> แคลอรี่
              </Text>
            </View>
          ) : (
            <View className="bg-red-50 rounded-full px-3 py-1 border border-red-100">
              <Text className="text-xs font-promptMedium text-red-600">
                เกินเป้าหมาย <Text className="font-promptBold">{caloriesConsumed - caloriesTarget}</Text> แคลอรี่
              </Text>
            </View>
          )}
        </View>
      </View>
      {/* Nutrition Cards */}
      <View className="flex-row">
        <NutritionCard data={protein} label="โปรตีน" />
        <NutritionCard data={carbs} label="คาร์บ" />
        <NutritionCard data={fat} label="ไขมัน" />
      </View>
    </View>
  );
};

export default CaloriesSummary;