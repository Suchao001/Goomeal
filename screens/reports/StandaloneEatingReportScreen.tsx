// Standalone version ของ EatingReportScreen สำหรับทดสอบ
// ไม่ต้องพึ่ง Navigation Context

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import CaloriesSummary from '../../components/CaloriesSummary';
import { generateDailyRecommendation, type DailyRecommendation } from '../../utils/dailyRecommendationService';

// Mock data for demonstration
const mockDailyNutrition = {
  total_calories: 1847,
  total_protein: 85,
  total_carbs: 234,
  total_fat: 62,
  recommended_cal: 1800,
  recommended_protein: 90,
  recommended_carb: 225,
  recommended_fat: 60
};

const mockEatingRecords = [
  {
    id: 1,
    food_name: 'ข้าวผัดกุ้ง',
    calories: 450,
    protein: 25,
    carbs: 60,
    fat: 15,
    meal_type: 'เช้า',
    meal_time: '08:30'
  },
  {
    id: 2,
    food_name: 'สลัดไก่ย่าง',
    calories: 320,
    protein: 35,
    carbs: 15,
    fat: 18,
    meal_type: 'กลางวัน',
    meal_time: '12:00'
  },
  {
    id: 3,
    food_name: 'ปลาทอดกับผักโขม',
    calories: 380,
    protein: 25,
    carbs: 20,
    fat: 22,
    meal_type: 'เย็น',
    meal_time: '18:30'
  }
];

/**
 * Standalone EatingReportScreen Component สำหรับทดสอบ
 * ไม่ต้องใช้ Navigation Context
 */
const StandaloneEatingReportScreen = () => {
  // States
  const [selectedDay, setSelectedDay] = useState(27);
  const [isLoading, setIsLoading] = useState(false);
  const [useRecommended, setUseRecommended] = useState(true);
  const [dailyRecommendation, setDailyRecommendation] = useState<DailyRecommendation | null>(null);
  const [mockScenario, setMockScenario] = useState(0);

  const handleBackPress = () => {
    Alert.alert('Navigation', 'ในการใช้งานจริงจะกลับไปหน้าก่อนหน้า');
  };

  // Calculate report data
  const getReportData = () => {
    return {
      totalCalories: mockDailyNutrition.total_calories,
      totalProtein: mockDailyNutrition.total_protein,
      totalCarbs: mockDailyNutrition.total_carbs,
      totalFat: mockDailyNutrition.total_fat,
      targetCalories: mockDailyNutrition.recommended_cal,
      targetProtein: mockDailyNutrition.recommended_protein,
      targetCarbs: mockDailyNutrition.recommended_carb,
      targetFat: mockDailyNutrition.recommended_fat,
      hasRecommended: true,
      hasTarget: true
    };
  };

  const reportData = getReportData();

  // Generate daily recommendation
  const generateRecommendation = useCallback(() => {
    // Mock scenarios for demo
    const mockScenarios = [
      {
        name: "คนลดน้ำหนัก - กินดี",
        userProfile: { target_goal: 'decrease' as const, weight: 70, age: 28, activity_level: 'moderate' },
        actualIntake: { calories: 1847, protein: 85, carbs: 234, fat: 62 },
        recommendedIntake: { calories: 1800, protein: 90, carbs: 225, fat: 60 }
      },
      {
        name: "คนลดน้ำหนัก - กินน้อย",
        userProfile: { target_goal: 'decrease' as const, weight: 70, age: 28, activity_level: 'moderate' },
        actualIntake: { calories: 1450, protein: 65, carbs: 180, fat: 45 },
        recommendedIntake: { calories: 1800, protein: 90, carbs: 225, fat: 60 }
      },
      {
        name: "นักกีฬา - โปรตีนสูง",
        userProfile: { target_goal: 'increase' as const, weight: 65, age: 25, activity_level: 'high' },
        actualIntake: { calories: 2200, protein: 120, carbs: 280, fat: 80 },
        recommendedIntake: { calories: 2400, protein: 100, carbs: 320, fat: 85 }
      },
      {
        name: "คนทำงานออฟฟิศ - สมดุล",
        userProfile: { target_goal: 'healthy' as const, weight: 65, age: 30, activity_level: 'low' },
        actualIntake: { calories: 1950, protein: 75, carbs: 250, fat: 70 },
        recommendedIntake: { calories: 2000, protein: 78, carbs: 275, fat: 67 }
      }
    ];

    // ใช้ mock scenario
    const scenario = mockScenarios[mockScenario % mockScenarios.length];
    const { actualIntake, recommendedIntake, userProfile } = scenario;

    const recommendation = generateDailyRecommendation(
      actualIntake,
      recommendedIntake,
      userProfile
    );

    setDailyRecommendation(recommendation);
  }, [mockScenario]);

  // Generate recommendation when component mounts or scenario changes
  useEffect(() => {
    generateRecommendation();
  }, [generateRecommendation]);

  const navigateDay = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && selectedDay > 1) {
      setSelectedDay(selectedDay - 1);
    } else if (direction === 'next' && selectedDay < 31) {
      setSelectedDay(selectedDay + 1);
    }
  };

  const getDayName = (day: number) => {
    if (day === 27) return 'วันนี้';
    return `${day} สิงหาคม`;
  };

  const dayName = getDayName(selectedDay);

  return (
    <View className="flex-1 bg-gray-100">
      <View className="flex-row items-center justify-between px-4 pt-10 pb-4 bg-primary">
        <TouchableOpacity 
          className="w-10 h-10 rounded-full items-center justify-center"
          onPress={handleBackPress}
        >
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View className="flex-row items-center gap-2">
          <Icon name="analytics" size={32} color="#ffff" />
          <Text className="text-xl font-semibold text-white">รายงานการกิน (Demo)</Text>
        </View>
        
        <TouchableOpacity 
          className="flex-row items-center"
          onPress={() => Alert.alert('Demo', 'ในการใช้งานจริงจะไปหน้ารายงานสัปดาห์')}
        >
          <Icon name="calendar" size={20} color="#ffff" />
        </TouchableOpacity>
      </View>

      <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity
          className={`w-8 h-8 items-center justify-center ${selectedDay <= 1 ? 'opacity-50' : ''}`}
          onPress={() => navigateDay('prev')}
          disabled={selectedDay <= 1}
        >
          <Icon name="chevron-back" size={20} color="#374151" />
        </TouchableOpacity>
        
        <Text className="text-lg font-medium text-gray-800">{dayName}</Text>
        
        <TouchableOpacity
          className={`w-8 h-8 items-center justify-center ${selectedDay >= 31 ? 'opacity-50' : ''}`}
          onPress={() => navigateDay('next')}
          disabled={selectedDay >= 31}
        >
          <Icon name="chevron-forward" size={20} color="#374151" />
        </TouchableOpacity>
      </View>
      
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="flex-1 px-4 pt-6">
          {/* Daily Summary Header */}
          <Text className="text-2xl font-bold text-gray-800 mb-2">สถิติการกินของคุณ</Text>
          <View className="flex-row items-center justify-between mb-8">
            <Text className="text-base text-gray-600 leading-6">
              ดูสถิติและรายงานการบริโภคอาหารประจำวัน (Demo)
            </Text>
            <TouchableOpacity
              className="bg-primary px-3 py-1 rounded-full"
              onPress={() => Alert.alert('Demo', 'ในการใช้งานจริงจะไปหน้ารายงานสัปดาห์')}
            >
              <Text className="text-white text-xs font-medium">ดูรายสัปดาห์</Text>
            </TouchableOpacity>
          </View>

          {/* Nutrition Toggle */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-800">สรุปโภชนาการ</Text>
            <View className="flex-row bg-gray-100 rounded-lg p-1">
              <TouchableOpacity 
                className={`px-4 py-2 rounded-md ${!useRecommended ? 'bg-blue-500' : ''}`}
                onPress={() => setUseRecommended(false)}
              >
                <Text className={`text-sm ${!useRecommended ? 'text-white font-semibold' : 'text-gray-600'}`}>เป้าหมาย</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className={`px-4 py-2 rounded-md ${useRecommended ? 'bg-green-500' : ''}`}
                onPress={() => setUseRecommended(true)}
              >
                <Text className={`text-sm ${useRecommended ? 'text-white font-semibold' : 'text-gray-600'}`}>แนะนำ</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* CaloriesSummary Component */}
          <CaloriesSummary
            caloriesConsumed={reportData.totalCalories}
            caloriesTarget={reportData.targetCalories}
            protein={{
              current: reportData.totalProtein,
              target: reportData.targetProtein,
              unit: 'g',
              color: '#22c55e',
              icon: 'fitness'
            }}
            carbs={{
              current: reportData.totalCarbs,
              target: reportData.targetCarbs,
              unit: 'g',
              color: '#3b82f6',
              icon: 'leaf'
            }}
            fat={{
              current: reportData.totalFat,
              target: reportData.targetFat,
              unit: 'g',
              color: '#f59e0b',
              icon: 'water'
            }}
          />

          <View className='h-4'></View>

          {/* Daily Recommendation Section */}
          {isLoading ? (
            <View className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
              <View className="items-center">
                <View className="bg-gray-200 w-10 h-10 rounded-full items-center justify-center mb-3">
                  <Text className="text-2xl">🎯</Text>
                </View>
                <Text className="text-lg font-semibold text-gray-700">กำลังสร้างคำแนะนำ...</Text>
                <Text className="text-sm text-gray-500 text-center mt-2">
                  กำลังวิเคราะห์ข้อมูลการกินของคุณ
                </Text>
              </View>
            </View>
          ) : dailyRecommendation && (
            <View className="bg-white rounded-2xl p-5 mb-6 shadow-lg">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className="bg-blue-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                    <Text className="text-2xl">🎯</Text>
                  </View>
                  <View>
                    <Text className="text-lg font-bold text-gray-800">คำแนะนำรายวัน</Text>
                    <Text className="text-sm text-gray-600">{dailyRecommendation.date}</Text>
                  </View>
                </View>
                <View className={`px-4 py-2 rounded-full shadow-md ${
                  dailyRecommendation.totalScore >= 90 ? 'bg-green-500' :
                  dailyRecommendation.totalScore >= 80 ? 'bg-blue-500' :
                  dailyRecommendation.totalScore >= 70 ? 'bg-yellow-500' :
                  dailyRecommendation.totalScore >= 60 ? 'bg-orange-500' : 'bg-red-500'
                }`}>
                  <Text className="text-white font-bold text-sm">
                    {dailyRecommendation.totalScore}/100
                  </Text>
                </View>
              </View>

              {/* Demo Notice */}
              <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <Text className="text-yellow-600 mr-2">ℹ️</Text>
                    <Text className="text-yellow-800 text-sm font-medium flex-1">
                      แสดงตัวอย่างคำแนะนำด้วยข้อมูล Mockup
                    </Text>
                  </View>
                  <TouchableOpacity
                    className="bg-yellow-500 px-3 py-1 rounded-full ml-2"
                    onPress={() => setMockScenario((prev) => prev + 1)}
                  >
                    <Text className="text-white text-xs font-medium">เปลี่ยนตัวอย่าง</Text>
                  </TouchableOpacity>
                </View>
                <Text className="text-yellow-700 text-xs mt-2">
                  {['คนลดน้ำหนัก - กินดี', 'คนลดน้ำหนัก - กินน้อย', 'นักกีฬา - โปรตีนสูง', 'คนทำงานออฟฟิศ - สมดุล'][mockScenario % 4]}
                </Text>
              </View>

              {/* Score Summary */}
              <View className="bg-gray-50 rounded-xl p-4 mb-4">
                <Text className="text-center text-lg font-semibold text-gray-800 mb-2">
                  {dailyRecommendation.summary}
                </Text>
                
                {/* Score Grid */}
                <View className="flex-row justify-between mt-3">
                  {[
                    { label: '🔥 แคลอรี่', score: dailyRecommendation.assessments.calories.score, percent: dailyRecommendation.assessments.calories.percentage },
                    { label: '💪 โปรตีน', score: dailyRecommendation.assessments.protein.score, percent: dailyRecommendation.assessments.protein.percentage },
                    { label: '🍚 คาร์บ', score: dailyRecommendation.assessments.carbs.score, percent: dailyRecommendation.assessments.carbs.percentage },
                    { label: '🥑 ไขมัน', score: dailyRecommendation.assessments.fat.score, percent: dailyRecommendation.assessments.fat.percentage }
                  ].map((item, index) => (
                    <View key={index} className="items-center flex-1">
                      <Text className="text-xs text-gray-600 mb-1">{item.label}</Text>
                      <Text className={`text-sm font-bold ${
                        item.score >= 23 ? 'text-green-600' :
                        item.score >= 18 ? 'text-blue-600' :
                        item.score >= 15 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>{item.score}/25</Text>
                      <Text className={`text-xs ${
                        item.percent >= 90 && item.percent <= 110 ? 'text-green-600' : 
                        item.percent >= 80 && item.percent <= 120 ? 'text-blue-600' : 
                        'text-orange-600'
                      }`}>
                        {item.percent.toFixed(0)}%
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Nutrition Advice */}
              {dailyRecommendation.nutritionAdvice.length > 0 && (
                <View className="mb-4">
                  <Text className="text-base font-semibold text-gray-800 mb-3">💪 โภชนาการวันนี้</Text>
                  {dailyRecommendation.nutritionAdvice.slice(0, 3).map((advice, index) => (
                    <View key={index} className="flex-row items-start mb-2">
                      <Text className="text-sm text-gray-700 leading-5">{advice}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Activity Advice */}
              {dailyRecommendation.activityAdvice.length > 0 && (
                <View className="mb-4">
                  <Text className="text-base font-semibold text-gray-800 mb-3">🏃‍♂️ กิจกรรมแนะนำ</Text>
                  {dailyRecommendation.activityAdvice.map((advice, index) => (
                    <View key={index} className="flex-row items-start mb-2">
                      <Text className="text-sm text-blue-700 leading-5">{advice}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Tomorrow Tips */}
              {dailyRecommendation.tomorrowTips.length > 0 && (
                <View className="bg-blue-50 rounded-xl p-4">
                  <Text className="text-base font-semibold text-blue-800 mb-3">🎯 เคล็ดลับสำหรับพรุ่งนี้</Text>
                  {dailyRecommendation.tomorrowTips.slice(0, 3).map((tip, index) => (
                    <View key={index} className="flex-row items-start mb-2 last:mb-0">
                      <View className="w-5 h-5 bg-blue-500 rounded-full items-center justify-center mr-3 mt-0.5">
                        <Text className="text-white text-xs font-bold">{index + 1}</Text>
                      </View>
                      <Text className="text-sm text-blue-800 leading-5 flex-1">{tip}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Food Details Section */}
          <View className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-800">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-800">รายการอาหารทั้งหมด (Demo)</Text>
              <View className="bg-gray-100 px-3 py-1 rounded-full">
                <Text className="text-xs font-medium text-gray-600">
                  {mockEatingRecords.length} รายการ
                </Text>
              </View>
            </View>
            
            {mockEatingRecords.map((record, index) => (
              <View 
                key={`food-${index}`}
                className={`flex-row justify-between items-start py-3 ${
                  index < mockEatingRecords.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <View className="flex-1 mr-3">
                  <Text className="text-base font-medium text-gray-800" numberOfLines={2}>
                    {record.food_name}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <View className="bg-blue-100 px-2 py-0.5 rounded-full mr-2">
                      <Text className="text-blue-700 text-xs font-medium">
                        {record.meal_type}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-500">
                      {record.meal_time}
                    </Text>
                  </View>
                  
                  {/* Nutritional Info */}
                  <View className="flex-row items-center mt-2">
                    <Text className="text-xs text-green-600 mr-3">
                      โปรตีน {Math.round(record.protein)}g
                    </Text>
                    <Text className="text-xs text-blue-600 mr-3">
                      คาร์บ {Math.round(record.carbs)}g
                    </Text>
                    <Text className="text-xs text-orange-600">
                      ไขมัน {Math.round(record.fat)}g
                    </Text>
                  </View>
                </View>
                
                <View className="items-end">
                  <Text className="text-lg font-bold text-red-500">
                    {record.calories.toLocaleString()}
                  </Text>
                  <Text className="text-xs text-gray-500">kcal</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default StandaloneEatingReportScreen;
