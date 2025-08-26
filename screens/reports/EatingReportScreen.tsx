import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../../hooks/Navigation';
import { useFocusEffect } from '@react-navigation/native';
import Menu from '../material/Menu';
import CaloriesSummary from '../../components/CaloriesSummary';
import { getDailyNutritionSummary, type DailyNutritionSummary } from '../../utils/api/dailyNutritionApi';
import { getEatingRecordsByDate, type EatingRecord } from '../../utils/api/eatingRecordApi';
import { getBangkokDateForDay, getCurrentBangkokDay, getTodayBangkokDate } from '../../utils/bangkokTime';

/**
 * EatingReportScreen Component
 * หน้ารายงานการกิน
 */
const EatingReportScreen = () => {
  const navigation = useTypedNavigation<'EatingReport'>();
  
  // Get current day for initial state
  const getCurrentDay = () => getCurrentBangkokDay();
  const [selectedDay, setSelectedDay] = useState(() => getCurrentDay());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Data states
  const [dailyNutrition, setDailyNutrition] = useState<DailyNutritionSummary | null>(null);
  const [eatingRecords, setEatingRecords] = useState<EatingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useRecommended, setUseRecommended] = useState(true); // Toggle between recommended and target
  

  const handleBackPress = () => {
    navigation.goBack();
  };

  // Load data functions
  const loadDailyData = useCallback(async () => {
    try {
      setIsLoading(true);
      const date = getBangkokDateForDay(selectedDay);
      
      console.log(`📊 [EatingReport] Loading data for day ${selectedDay} (${date})`);
      
     
      const nutritionRes = await getDailyNutritionSummary(date);
      if (nutritionRes.success && nutritionRes.data) {
        setDailyNutrition(nutritionRes.data);
        console.log(`📊 [EatingReport] Loaded nutrition summary:`, JSON.stringify(nutritionRes.data));
      } else {
        setDailyNutrition(null);
        console.log(`⚠️ [EatingReport] No nutrition summary for ${date}`);
      }
      
      // Load eating records
      const recordsRes = await getEatingRecordsByDate(date);
      if (recordsRes.success && recordsRes.data.records) {
        setEatingRecords(recordsRes.data.records);
        console.log(`📊 [EatingReport] Loaded ${recordsRes.data.records.length} eating records`);
      } else {
        setEatingRecords([]);
        console.log(`⚠️ [EatingReport] No eating records for ${date}`);
      }
    } catch (error) {
      console.error('❌ [EatingReport] Failed to load daily data:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDay]);

  const navigateDay = (direction: 'prev' | 'next') => {
    const currentDay = getCurrentDay();
    
    if (direction === 'prev' && selectedDay > 1) {
      setSelectedDay(selectedDay - 1);
    } else if (direction === 'next') {
      if (selectedDay < currentDay) {
        setSelectedDay(selectedDay + 1);
      } else {
        // Show alert when trying to go to future days
        Alert.alert(
          'ไม่สามารถดูข้อมูลได้', 
          'ไม่สามารถดูข้อมูลของวันอนาคตได้',
          [{ text: 'ตกลง', style: 'default' }]
        );
      }
    }
  };

  // Load data when selectedDay changes
  useEffect(() => {
    loadDailyData();
  }, [loadDailyData, selectedDay]);

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadDailyData();
    }, [loadDailyData])
  );

  const getDayName = (day: number) => {
    const currentDay = getCurrentDay();
    
    if (day === currentDay) {
      return 'วันนี้';
    }
    
    // Calculate the actual date
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(day);
    
    const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const monthNames = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    
    return `${day} ${monthNames[targetDate.getMonth()]}`;
  };

  const dayName = getDayName(selectedDay);

  // Calculate report data from actual data
  const getReportData = () => {
    if (!dailyNutrition && eatingRecords.length === 0) {
      return {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        targetCalories: 0,
        targetProtein: 0,
        targetCarbs: 0,
        targetFat: 0,
        hasRecommended: false,
        hasTarget: false
      };
    }

    // Use dailyNutrition if available, otherwise calculate from eating records
    const totalCalories = dailyNutrition?.total_calories || 
      eatingRecords.reduce((sum, record) => sum + (record.calories || 0), 0);
    const totalProtein = dailyNutrition?.total_protein || 
      eatingRecords.reduce((sum, record) => sum + (record.protein || 0), 0);
    const totalCarbs = dailyNutrition?.total_carbs || 
      eatingRecords.reduce((sum, record) => sum + (record.carbs || 0), 0);
    const totalFat = dailyNutrition?.total_fat || 
      eatingRecords.reduce((sum, record) => sum + (record.fat || 0), 0);

    // Check what data is available
    const hasRecommended = !!(dailyNutrition?.recommended_cal || dailyNutrition?.recommended_protein || 
                             dailyNutrition?.recommended_carb || dailyNutrition?.recommended_fat);
    const hasTarget = !!(dailyNutrition?.target_cal || dailyNutrition?.target_protein || 
                        dailyNutrition?.target_carb || dailyNutrition?.target_fat);

    // Get target values based on toggle
    const getTargetValue = (recommended: number | null | undefined, target: number | null | undefined): number => {
      if (useRecommended && recommended != null) return recommended;
      if (!useRecommended && target != null) return target;
      // Fallback: if preferred type is not available, use the other
      return recommended ?? target ?? 0;
    };

    const targetCalories = getTargetValue(dailyNutrition?.recommended_cal, dailyNutrition?.target_cal);
    const targetProtein = getTargetValue(dailyNutrition?.recommended_protein, dailyNutrition?.target_protein);
    const targetCarbs = getTargetValue(dailyNutrition?.recommended_carb, dailyNutrition?.target_carb);
    const targetFat = getTargetValue(dailyNutrition?.recommended_fat, dailyNutrition?.target_fat);

    return {
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat,
      hasRecommended,
      hasTarget
    };
  };

  const reportData = getReportData();

  // Group eating records by meal type
  const getMealData = () => {
    const mealGroups: { [key: string]: EatingRecord[] } = {};
    eatingRecords.forEach(record => {
      const mealType = record.meal_type || 'อื่นๆ';
      if (!mealGroups[mealType]) {
        mealGroups[mealType] = [];
      }
      mealGroups[mealType].push(record);
    });
    return mealGroups;
  };

  const mealData = getMealData();

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
          <Text className="text-xl font-semibold text-white">รายงานการกิน</Text>
        </View>
        
        <TouchableOpacity 
          className="flex-row items-center"
          onPress={() => {
          
            console.log('Navigate to WeeklyReport');
          }}
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
        
        <Text className="text-lg font-medium text-gray-800">
          {dayName}
        </Text>
        
        <TouchableOpacity
          className={`w-8 h-8 items-center justify-center ${selectedDay >= getCurrentDay() ? 'opacity-50' : ''}`}
          onPress={() => navigateDay('next')}
          disabled={selectedDay >= getCurrentDay()}
        >
          <Icon name="chevron-forward" size={20} color="#374151" />
        </TouchableOpacity>
      </View>
      
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Main Content */}
  <View className="flex-1 px-4 pt-6">
          {/* Daily Summary Header */}
         
          <Text className="text-2xl font-bold text-gray-800 mb-2">สถิติการกินของคุณ</Text>
          <View className="flex-row items-center justify-between mb-8">
            <Text className="text-base text-gray-600 leading-6">
              ดูสถิติและรายงานการบริโภคอาหารประจำวัน
            </Text>
            <TouchableOpacity
              className="bg-primary px-3 py-1 rounded-full"
              onPress={() => {
                navigation.navigate('WeeklyReport');
              }}
            >
              <Text className="text-white text-xs font-medium">ดูรายสัปดาห์</Text>
            </TouchableOpacity>
          </View>

          {/* Nutrition Toggle */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-800">สรุปโภชนาการ</Text>
            {(reportData.hasRecommended && reportData.hasTarget) && (
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
            )}
          </View>

          {/* CaloriesSummary Component */}
          {(reportData.targetCalories > 0 || reportData.targetProtein > 0 || reportData.targetCarbs > 0 || reportData.targetFat > 0) ? (
            <CaloriesSummary
              caloriesConsumed={reportData.totalCalories || 0}
              caloriesTarget={Math.max(reportData.targetCalories || 0, 1)} // Prevent division by zero
              protein={{
                current: reportData.totalProtein || 0,
                target: Math.max(reportData.targetProtein || 0, 1), // Prevent division by zero
                unit: 'g',
                color: '#22c55e',
                icon: 'fitness'
              }}
              carbs={{
                current: reportData.totalCarbs || 0,
                target: Math.max(reportData.targetCarbs || 0, 1), // Prevent division by zero
                unit: 'g',
                color: '#3b82f6',
                icon: 'leaf'
              }}
              fat={{
                current: reportData.totalFat || 0,
                target: Math.max(reportData.targetFat || 0, 1), // Prevent division by zero
                unit: 'g',
                color: '#f59e0b',
                icon: 'water'
              }}
            />
          ) : (
            <View className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
              <View className="items-center">
                <Icon name="analytics-outline" size={48} color="#9ca3af" />
                <Text className="text-lg font-semibold text-gray-700 mt-3">ไม่มีข้อมูลเป้าหมาย</Text>
                <Text className="text-sm text-gray-500 text-center mt-2">
                  กรุณาตั้งค่าเป้าหมายโภชนาการของคุณเพื่อดูสถิติรายละเอียด
                </Text>
              </View>
            </View>
          )}

          <View className='h-4'></View>

          {/* Recent Meals */}
          

          {/* Food Details Section */}
          {eatingRecords.length > 0 && !isLoading && (
            <View className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-800">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-bold text-gray-800">รายการอาหารทั้งหมด</Text>
                <View className="bg-gray-100 px-3 py-1 rounded-full">
                  <Text className="text-xs font-medium text-gray-600">
                    {eatingRecords.length} รายการ
                  </Text>
                </View>
              </View>
              
              {eatingRecords.map((record, index) => (
                <View 
                  key={`food-${index}`}
                  className={`flex-row justify-between items-start py-3 ${
                    index < eatingRecords.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <View className="flex-1 mr-3">
                    <Text className="text-base font-medium text-gray-800" numberOfLines={2}>
                      {record.food_name}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <View className="bg-blue-100 px-2 py-0.5 rounded-full mr-2">
                        <Text className="text-blue-700 text-xs font-medium">
                          {record.meal_type || 'อื่นๆ'}
                        </Text>
                      </View>
                      {record.meal_time && (
                        <Text className="text-xs text-gray-500">
                          {record.meal_time.slice(0, 5)}
                        </Text>
                      )}
                    </View>
                    
                    {/* Nutritional Info */}
                    {(record.protein || record.carbs || record.fat) && (
                      <View className="flex-row items-center mt-2">
                        {record.protein && (
                          <Text className="text-xs text-green-600 mr-3">
                            โปรตีน {Math.round(record.protein)}g
                          </Text>
                        )}
                        {record.carbs && (
                          <Text className="text-xs text-blue-600 mr-3">
                            คาร์บ {Math.round(record.carbs)}g
                          </Text>
                        )}
                        {record.fat && (
                          <Text className="text-xs text-orange-600">
                            ไขมัน {Math.round(record.fat)}g
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                  
                  <View className="items-end">
                    <Text className="text-lg font-bold text-red-500">
                      {(record.calories || 0).toLocaleString()}
                    </Text>
                    <Text className="text-xs text-gray-500">kcal</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      <Menu/>
    </View>
  );
};

export default EatingReportScreen;
