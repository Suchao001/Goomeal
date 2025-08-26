import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../../hooks/Navigation';
import { useFocusEffect } from '@react-navigation/native';
import Menu from '../material/Menu';
import { 
  getWeeklyNutritionSummary, 
  getWeeklyInsights,
  formatWeekRange,
  getShortThaiDayName,
  type WeeklyReportData,
  type WeeklyInsightsData,
  type DayDetail
} from '../../utils/api/weeklyReportApi';

/**
 * WeeklyReportScreen Component
 * หน้ารายงานการกินรายสัปดาห์
 */

const { width } = Dimensions.get('window');

const WeeklyReportScreen = () => {
  const navigation = useTypedNavigation();
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week, 1 = next week
  
  // Data states
  const [reportData, setReportData] = useState<WeeklyReportData | null>(null);
  const [insightsData, setInsightsData] = useState<WeeklyInsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleBackPress = () => {
    navigation.goBack();
  };

  // Load data functions
  const loadWeeklyData = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log(`📊 [WeeklyReport] Loading data for week offset: ${weekOffset}`);
      
      // Load both summary and insights in parallel
      const [summaryRes, insightsRes] = await Promise.all([
        getWeeklyNutritionSummary(weekOffset),
        getWeeklyInsights(weekOffset)
      ]);
      
      if (summaryRes.success && summaryRes.data) {
        setReportData(summaryRes.data);
        console.log(`📊 [WeeklyReport] Loaded weekly summary:`, summaryRes.data.summary);
      } else {
        setReportData(null);
        console.log(`⚠️ [WeeklyReport] No weekly summary data`);
      }
      
      if (insightsRes.success && insightsRes.data) {
        setInsightsData(insightsRes.data);
        console.log(`💡 [WeeklyReport] Loaded insights:`, insightsRes.data.insights);
      } else {
        setInsightsData(null);
        console.log(`⚠️ [WeeklyReport] No insights data`);
      }
    } catch (error) {
      console.error('❌ [WeeklyReport] Failed to load weekly data:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลรายสัปดาห์ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  }, [weekOffset]);

  // Load data when weekOffset changes
  useEffect(() => {
    loadWeeklyData();
  }, [loadWeeklyData]);

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadWeeklyData();
    }, [loadWeeklyData])
  );

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setWeekOffset(weekOffset - 1);
    } else if (direction === 'next') {
      // Prevent going to future weeks beyond current week
      if (weekOffset < 0) {
        setWeekOffset(weekOffset + 1);
      }
    }
  };

  // Get calculated values from API data
  const getDisplayData = () => {
    if (!reportData) {
      return {
        weekRange: 'กำลังโหลด...',
        weekAverage: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        dailyChart: [],
        weightChange: null
      };
    }

    const { summary, daily_details, weight_change, week_info } = reportData;
    
    return {
      weekRange: formatWeekRange(week_info.start_date, week_info.end_date),
      weekAverage: {
        calories: summary.avg_total_calories || 0,
        protein: summary.avg_total_protein || 0,
        carbs: summary.avg_total_carbs || 0,
        fat: summary.avg_total_fat || 0,
      },
      dailyChart: daily_details.map(day => ({
        day: getShortThaiDayName(day.date),
        date: new Date(day.date).getDate().toString(),
        calories: day.total_calories,
        target: day.recommended_cal || day.target_cal || 1500,
        protein: day.total_protein,
        carbs: day.total_carbs,
        fat: day.total_fat
      })),
      weightChange: weight_change
    };
  };

  const displayData = getDisplayData();

  const renderChart = () => {
    if (!displayData.dailyChart.length) {
      return (
        <View className="bg-white rounded-2xl p-5 mb-6 shadow-lg shadow-slate-800">
          <Text className="text-lg font-bold text-gray-800 mb-4">กราฟแคลอรี่ 7 วัน</Text>
          <View className="h-40 items-center justify-center">
            <Icon name="bar-chart-outline" size={48} color="#9ca3af" />
            <Text className="text-sm text-gray-500 mt-2">ไม่มีข้อมูล</Text>
          </View>
        </View>
      );
    }

    const maxCalories = Math.max(...displayData.dailyChart.map(d => d.target));
    const chartHeight = 120;

    return (
      <View className="bg-white rounded-2xl p-5 mb-6 shadow-lg shadow-slate-800">
        <Text className="text-lg font-bold text-gray-800 mb-4">กราฟแคลอรี่ 7 วัน</Text>
        
        <View style={{ height: chartHeight + 35 }} className="items-center">
          <View className="flex-row items-end justify-between w-full" style={{ height: chartHeight }}>
            {displayData.dailyChart.map((day, index) => {
              const caloriesHeight = (day.calories / maxCalories) * chartHeight;
              const targetHeight = (day.target / maxCalories) * chartHeight;
              const isOver = day.calories > day.target;
              
              return (
                <TouchableOpacity
                  key={index}
                  className="items-center flex-1"
                  onPress={() => navigation.navigate('EatingReport')}
                >
                  {/* Target line */}
                  <View 
                    className="w-full border-t-2 border-dashed border-gray-300 absolute"
                    style={{ bottom: targetHeight }}
                  />
                  
                  {/* Calories bar */}
                  <View 
                    className={`w-6 rounded-t-lg ${isOver ? 'bg-red-400' : 'bg-primary'}`}
                    style={{ height: Math.max(caloriesHeight, 4) }} // Minimum height for visibility
                  />
                  
                  {/* Day label */}
                  <Text className="text-xs text-gray-600 mt-1 font-medium">{day.day}</Text>
                  <Text className="text-xs text-gray-400">{day.date}</Text>
                  
                  {/* Calories value */}
                  <Text className="text-xs font-bold text-gray-800 mt-1">
                    {day.calories}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          
          {/* Legend */}
          <View className="flex-row items-center justify-center mt-3 space-x-3">
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-primary rounded mr-1" />
              <Text className="text-xs text-gray-600">ปกติ</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-0.5 border-t border-dashed border-gray-400 mr-1" />
              <Text className="text-xs text-gray-600">เป้าหมาย</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-red-400 rounded mr-1" />
              <Text className="text-xs text-gray-600">เกิน</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-10 pb-4 bg-primary">
        <TouchableOpacity 
          className="w-10 h-10 rounded-full items-center justify-center"
          onPress={handleBackPress}
        >
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View className="flex-row items-center gap-2">
          <Icon name="calendar" size={32} color="white" />
          <Text className="text-xl font-semibold text-white">รายงานสัปดาห์</Text>
        </View>
        
        <View className="w-10" />
      </View>

      {/* Week Navigation */}
      <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity
          className="w-8 h-8 items-center justify-center"
          onPress={() => navigateWeek('prev')}
        >
          <Icon name="chevron-back" size={20} color="#374151" />
        </TouchableOpacity>
        
        <View className="items-center">
          <Text className="text-sm text-gray-500">
            {displayData.weekRange}
          </Text>
          <Text className="text-xs text-gray-400 mt-1">
            {weekOffset === 0 ? 'สัปดาห์นี้' : 
             weekOffset === -1 ? 'สัปดาห์ที่แล้ว' : 
             `${Math.abs(weekOffset)} สัปดาห์ก่อน`}
          </Text>
        </View>
        
        <TouchableOpacity
          className={`w-8 h-8 items-center justify-center ${weekOffset >= 0 ? 'opacity-50' : ''}`}
          onPress={() => navigateWeek('next')}
          disabled={weekOffset >= 0}
        >
          <Icon name="chevron-forward" size={20} color="#374151" />
        </TouchableOpacity>
      </View>
      
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {isLoading ? (
          <View className="flex-1 items-center justify-center pt-20">
            <Icon name="hourglass-outline" size={48} color="#9ca3af" />
            <Text className="text-gray-500 mt-4">กำลังโหลดข้อมูล...</Text>
          </View>
        ) : (
          <View className="flex-1 px-4 pt-6">
            
            {/* Weekly Summary Cards */}
            <View className="flex-row flex-wrap gap-3 mb-6">
              <View className="bg-white rounded-2xl p-4 items-center flex-1 min-w-[45%] shadow-lg shadow-slate-800">
                <View className="w-12 h-12 rounded-full items-center justify-center mb-2 bg-red-100">
                  <Icon name="flame" size={24} color="#ef4444" />
                </View>
                <Text className="text-2xl font-bold text-gray-800">{displayData.weekAverage.calories}</Text>
                <Text className="text-xs text-gray-600">kcal/วัน</Text>
                <Text className="text-sm text-gray-700 text-center mt-1">เฉลี่ยต่อวัน</Text>
              </View>

              <View className="bg-white rounded-2xl p-4 items-center flex-1 min-w-[45%] shadow-lg shadow-slate-800">
                <View className="w-12 h-12 rounded-full items-center justify-center mb-2 bg-green-100">
                  <Icon name="fitness" size={24} color="#22c55e" />
                </View>
                <Text className="text-2xl font-bold text-gray-800">{Math.round(displayData.weekAverage.protein)}</Text>
                <Text className="text-xs text-gray-600">g/วัน</Text>
                <Text className="text-sm text-gray-700 text-center mt-1">โปรตีนเฉลี่ย</Text>
              </View>
            </View>

            {/* Chart */}
            {renderChart()}

            {/* Weight Progress */}
            {displayData.weightChange && (
              <View className="bg-white rounded-2xl p-5 mb-6 shadow-lg shadow-slate-800">
                <Text className="text-lg font-bold text-gray-800 mb-4">ความคืบหน้าน้ำหนัก</Text>
                
                <View className="flex-row justify-between items-center mb-4">
                  <View className="items-center flex-1">
                    <Text className="text-sm text-gray-500">น้ำหนักเริ่มต้น</Text>
                    <Text className="text-2xl font-bold text-gray-800">{displayData.weightChange.start_weight}</Text>
                    <Text className="text-xs text-gray-400">กิโลกรัม</Text>
                  </View>
                  
                  <View className="items-center flex-1">
                    <Text className="text-sm text-gray-500">เปลี่ยนแปลง</Text>
                    <View className="flex-row items-center">
                      <Icon 
                        name={displayData.weightChange.change < 0 ? "trending-down" : "trending-up"} 
                        size={20} 
                        color={displayData.weightChange.change < 0 ? "#22c55e" : "#ef4444"} 
                      />
                      <Text className={`text-2xl font-bold ml-1 ${
                        displayData.weightChange.change < 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {displayData.weightChange.change > 0 ? '+' : ''}{displayData.weightChange.change}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-400">กิโลกรัม</Text>
                  </View>
                  
                  <View className="items-center flex-1">
                    <Text className="text-sm text-gray-500">น้ำหนักปัจจุบัน</Text>
                    <Text className="text-2xl font-bold text-blue-500">{displayData.weightChange.end_weight}</Text>
                    <Text className="text-xs text-gray-400">กิโลกรัม</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Recommendations */}
            {insightsData && (
              <View className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-800">
                <Text className="text-lg font-bold text-gray-800 mb-4">คำแนะนำสำหรับสัปดาห์นี้</Text>
                
                {insightsData.recommendations.map((rec, index) => (
                  <View key={index} className="flex-row items-start mb-4 last:mb-0">
                    <View 
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${rec.color}20` }}
                    >
                      <Icon name={rec.icon} size={20} color={rec.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-800 mb-1">
                        {rec.title}
                      </Text>
                      <Text className="text-sm text-gray-600 leading-5">
                        {rec.message}
                      </Text>
                    </View>
                  </View>
                ))}
                
                {/* Insights Summary */}
                {insightsData.insights && (
                  <View className="mt-4 pt-4 border-t border-gray-100">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">สรุปสัปดาห์นี้</Text>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-gray-500">บันทึก: {insightsData.insights.days_logged}/7 วัน</Text>
                      <Text className="text-xs text-gray-500">ความสม่ำเสมอ: {insightsData.insights.consistency_rate}%</Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
      
      <Menu />
    </View>
  );
};

export default WeeklyReportScreen;
