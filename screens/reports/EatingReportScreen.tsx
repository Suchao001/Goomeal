import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../../hooks/Navigation';
import { useFocusEffect } from '@react-navigation/native';
import Menu from '../material/Menu';
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
  

  const handleBackPress = () => {
    navigation.goBack();
  };

  // Load data functions
  const loadDailyData = useCallback(async () => {
    try {
      setIsLoading(true);
      const date = getBangkokDateForDay(selectedDay);
      
      console.log(`📊 [EatingReport] Loading data for day ${selectedDay} (${date})`);
      
      // Load daily nutrition summary
      const nutritionRes = await getDailyNutritionSummary(date);
      if (nutritionRes.success && nutritionRes.data) {
        setDailyNutrition(nutritionRes.data);
        console.log(`📊 [EatingReport] Loaded nutrition summary:`, nutritionRes.data);
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
      return [
        { label: 'แคลอรี่', value: '0', target: '0', unit: 'kcal', color: '#ef4444', progress: 0 },
        { label: 'โปรตีน', value: '0', target: '0', unit: 'g', color: '#22c55e', progress: 0 },
        { label: 'คาร์โบไฮเดรต', value: '0', target: '0', unit: 'g', color: '#3b82f6', progress: 0 },
        { label: 'ไขมัน', value: '0', target: '0', unit: 'g', color: '#f59e0b', progress: 0 },
      ];
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

    // Get target values from dailyNutrition
    const targetCalories = dailyNutrition?.target_cal || 0;
    const targetProtein = dailyNutrition?.target_protein || 0;
    const targetCarbs = dailyNutrition?.target_carb || 0;
    const targetFat = dailyNutrition?.target_fat || 0;

    // Calculate progress percentages
    const caloriesProgress = targetCalories > 0 ? Math.min((totalCalories / targetCalories) * 100, 100) : 0;
    const proteinProgress = targetProtein > 0 ? Math.min((totalProtein / targetProtein) * 100, 100) : 0;
    const carbsProgress = targetCarbs > 0 ? Math.min((totalCarbs / targetCarbs) * 100, 100) : 0;
    const fatProgress = targetFat > 0 ? Math.min((totalFat / targetFat) * 100, 100) : 0;

    return [
      { 
        label: 'แคลอรี่', 
        value: totalCalories.toLocaleString(), 
        target: targetCalories > 0 ? targetCalories.toLocaleString() : '-',
        unit: 'kcal', 
        color: '#ef4444',
        progress: caloriesProgress
      },
      { 
        label: 'โปรตีน', 
        value: Math.round(totalProtein).toString(), 
        target: targetProtein > 0 ? Math.round(targetProtein).toString() : '-',
        unit: 'g', 
        color: '#22c55e',
        progress: proteinProgress
      },
      { 
        label: 'คาร์โบไฮเดรต', 
        value: Math.round(totalCarbs).toString(), 
        target: targetCarbs > 0 ? Math.round(targetCarbs).toString() : '-',
        unit: 'g', 
        color: '#3b82f6',
        progress: carbsProgress
      },
      { 
        label: 'ไขมัน', 
        value: Math.round(totalFat).toString(), 
        target: targetFat > 0 ? Math.round(targetFat).toString() : '-',
        unit: 'g', 
        color: '#f59e0b',
        progress: fatProgress
      },
    ];
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
          {(dailyNutrition || eatingRecords.length > 0) && (
            <View 
              className="rounded-2xl p-5 mb-6 shadow-lg"
              style={{ backgroundColor: '#ffb800' }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-white text-xl font-bold">
                  สรุปประจำวัน
                </Text>
                {dailyNutrition?.weight && (
                  <View 
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    <Text className="text-white text-sm font-medium">
                      น้ำหนัก {dailyNutrition.weight} kg
                    </Text>
                  </View>
                )}
              </View>
              
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-white opacity-80 text-sm">แคลอรี่ที่บริโภค</Text>
                  <Text className="text-white text-2xl font-bold">
                    {(dailyNutrition?.total_calories || 
                      eatingRecords.reduce((sum, r) => sum + (r.calories || 0), 0)
                    ).toLocaleString()}
                  </Text>
                  <Text className="text-white opacity-80 text-sm">kcal</Text>
                </View>
                
                {dailyNutrition?.target_cal && (
                  <View className="items-end">
                    <Text className="text-white opacity-80 text-sm">เป้าหมาย</Text>
                    <Text className="text-white text-lg font-semibold">
                      {dailyNutrition.target_cal.toLocaleString()}
                    </Text>
                    <Text className="text-white opacity-80 text-sm">kcal</Text>
                    
                    <View className="mt-2">
                      <Text className={`text-sm font-medium ${
                        (dailyNutrition.total_calories || 0) > dailyNutrition.target_cal 
                          ? 'text-red-200' : 'text-green-200'
                      }`}>
                        {(dailyNutrition.total_calories || 0) > dailyNutrition.target_cal 
                          ? `เกิน ${((dailyNutrition.total_calories || 0) - dailyNutrition.target_cal).toLocaleString()} kcal`
                          : `เหลือ ${(dailyNutrition.target_cal - (dailyNutrition.total_calories || 0)).toLocaleString()} kcal`
                        }
                      </Text>
                    </View>
                  </View>
                )}
              </View>
              
              {dailyNutrition?.recommendation && (
                <View 
                  className="rounded-xl p-3 mt-4"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <Text className="text-white opacity-80 text-sm mb-1">คำแนะนำ</Text>
                  <Text className="text-white text-sm">{dailyNutrition.recommendation}</Text>
                </View>
              )}
            </View>
          )}
          
          <Text className="text-2xl font-bold text-gray-800 mb-2">สถิติการกินของคุณ</Text>
          <View className="flex-row items-center justify-between mb-8">
            <Text className="text-base text-gray-600 leading-6">
              ดูสถิติและรายงานการบริโภคอาหารประจำวัน
            </Text>
            <TouchableOpacity
              className="bg-primary px-3 py-1 rounded-full"
              onPress={() => {
                // TODO: Navigate to WeeklyReport when available
                console.log('Navigate to WeeklyReport');
              }}
            >
              <Text className="text-white text-xs font-medium">ดูรายสัปดาห์</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Cards */}
          <View className="flex-row flex-wrap gap-3 mb-6">
            {reportData.map((item, index) => (
              <View key={index} className="bg-white rounded-2xl p-4 items-center flex-1 min-w-[45%] shadow-lg shadow-slate-800">
                <View 
                  className="w-12 h-12 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <Icon name="analytics" size={24} color={item.color} />
                </View>
                
                {/* Current vs Target */}
                <View className="items-center mb-2">
                  <Text className="text-2xl font-bold text-gray-800">{item.value}</Text>
                  <Text className="text-xs text-gray-600">{item.unit}</Text>
                  {item.target !== '-' && (
                    <Text className="text-xs text-gray-500 mt-1">
                      เป้าหมาย: {item.target} {item.unit}
                    </Text>
                  )}
                </View>

                {/* Progress Bar */}
                {item.target !== '-' && (
                  <View className="w-full mb-2">
                    <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <View 
                        className="h-full rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(item.progress, 100)}%`,
                          backgroundColor: item.progress > 100 ? '#ef4444' : item.color 
                        }}
                      />
                    </View>
                    <Text 
                      className="text-xs text-center mt-1"
                      style={{ 
                        color: item.progress > 100 ? '#ef4444' : item.color 
                      }}
                    >
                      {Math.round(item.progress)}%
                    </Text>
                  </View>
                )}
                
                <Text className="text-sm text-gray-700 text-center">{item.label}</Text>
              </View>
            ))}
          </View>

          {/* Chart Placeholder */}
          <View className="bg-white rounded-2xl p-5 mb-6 shadow-lg shadow-slate-800">
            <Text className="text-lg font-bold text-gray-800 mb-4">กราฟการบริโภคแคลอรี่</Text>
            <View className="h-50 items-center justify-center bg-gray-50 rounded-xl">
              <Icon name="bar-chart" size={80} color="#9ca3af" />
              <Text className="text-base text-gray-500 mt-2">กราฟจะแสดงที่นี่</Text>
            </View>
          </View>

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
