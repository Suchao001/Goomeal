import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Svg, { G, Circle } from 'react-native-svg';

interface NutritionData {
  current: number;
  target: number;
  unit: string;
  color: string; // hex เช่น "#10b981"
  icon: string;  // ionicon name
}

interface CaloriesSummaryProps {
  caloriesConsumed: number;
  caloriesTarget: number;
  protein: NutritionData;
  carbs: NutritionData;
  fat: NutritionData;
}

const CircularProgress = ({
  size = 64,
  strokeWidth = 6,
  progress = 0,
  color = '#10b981',
  trackColor = '#e5e7eb',
}: {
  size?: number;
  strokeWidth?: number;
  progress?: number; // 0-100
  color?: string;
  trackColor?: string;
}) => {
  const pct = Math.max(0, Math.min(progress, 100));
  const half = size / 2;
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const dashOffset = c * (1 - pct / 100);

  return (
    <Svg width={size} height={size}>
      <G rotation={-90} originX={half} originY={half}>
        <Circle cx={half} cy={half} r={r} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={half}
          cy={half}
          r={r}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          fill="none"
        />
      </G>
    </Svg>
  );
};

const CaloriesSummary: React.FC<CaloriesSummaryProps> = ({
  caloriesConsumed,
  caloriesTarget,
  protein,
  carbs,
  fat
}) => {
  const safeDiv = (a: number, b: number) => (b > 0 ? a / b : 0);

  const caloriesPercentage = safeDiv(caloriesConsumed, caloriesTarget) * 100;

  // เดิม clamp เหลือ 0 ทำให้ไม่เข้ากรณี “เกินเป้าหมาย” แก้แบบนี้
  const rawRemaining = caloriesTarget - caloriesConsumed;
  const remainingCalories = Math.max(rawRemaining, 0);

  const NutritionCard = ({ data, label }: { data: NutritionData; label: string }) => {
    const percentage = safeDiv(data.current, data.target) * 100;

    return (
      <View className="flex-1 mx-1">
        <View className="bg-white rounded-2xl p-4 shadow-md shadow-slate-600 border border-gray-50">
          <View className="items-center mb-3">
            <Text className="text-xs font-promptMedium text-myBlack uppercase tracking-wide">
              {label}
            </Text>
          </View>

          {/* วงแหวน progress + ไอคอนพื้นหลัง */}
          <View className="items-center mb-3">
            <View className="relative w-16 h-16 items-center justify-center">
              <Icon
                name={data.icon}
                size={54}
                color={`${data.color}33`}  // #RRGGBBAA (20% opacity)
                style={{ position: 'absolute', left: 0, top: 0, zIndex: 0 }}
              />
              <View className="absolute">
                <CircularProgress
                  size={64}
                  strokeWidth={6}
                  progress={percentage}
                  color={data.color}
                  trackColor="#e5e7eb"
                />
              </View>
              <View
                className="w-16 h-16 rounded-full items-center justify-center"
                style={{ backgroundColor: `${data.color}10`, zIndex: 1 }}
              >
                <Text className="text-lg font-promptBold" style={{ color: data.color }}>
                  {Math.round(percentage)}%
                </Text>
              </View>
            </View>
          </View>

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
      <View className="bg-white rounded-2xl p-4 shadow-lg shadow-slate-600 border border-transparent mb-3">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-promptBold text-myBlack">แคลอรี่วันนี้</Text>
          <View className="bg-white rounded-full px-2 py-0.5 shadow-sm">
            <Text className="text-[10px] font-promptMedium text-blue-600">
              {Math.round(caloriesPercentage)}%
            </Text>
          </View>
        </View>

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
                  backgroundColor:
                    caloriesPercentage > 100 ? '#f59e0b' :
                    caloriesPercentage > 80 ? '#10b981' : '#10b981',
                  width: `${Math.min(caloriesPercentage, 100)}%`,
                }}
              />
            </View>
          </View>

          {/* Status Message */}
          {rawRemaining > 0 ? (
            <View className="bg-white rounded-full px-3 py-1 shadow-sm">
              <Text className="text-xs font-promptMedium text-gray-600">
                เหลืออีก <Text className="font-promptBold text-green-600">{remainingCalories}</Text> แคลอรี่
              </Text>
            </View>
          ) : rawRemaining < 0 ? (
            <View className="bg-red-50 rounded-full px-3 py-1 border border-red-100">
              <Text className="text-xs font-promptMedium text-red-600">
                เกินเป้าหมาย <Text className="font-promptBold">{Math.abs(rawRemaining)}</Text> แคลอรี่
              </Text>
            </View>
          ) : null}
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
