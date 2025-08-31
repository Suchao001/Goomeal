import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
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
      const [summaryRes, insightsRes] = await Promise.all([
        getWeeklyNutritionSummary(weekOffset),
        getWeeklyInsights(weekOffset)
      ]);
      // Debug: log raw API responses (summary + insights)
      try {
        console.log('🛰️ [WeeklyReport] Raw summaryRes:', summaryRes);
        console.log('🛰️ [WeeklyReport] Raw insightsRes:', insightsRes);
      } catch (_) {}
      
      if (summaryRes.success && summaryRes.data) {
        setReportData(summaryRes.data);
        try {
          console.log(`📊 [WeeklyReport] Loaded weekly summary:`, summaryRes.data.summary);
          console.log(`📅 [WeeklyReport] Week info:`, summaryRes.data.week_info);
          const brief = (summaryRes.data.daily_details || []).map((d: any) => ({ date: d.date, calories: d.total_calories, target: d.recommended_cal || d.target_cal }));
          console.log('🗂️ [WeeklyReport] Daily details (brief):', brief);
        } catch (_) {}
      } else {
        setReportData(null);
      }
      
      if (insightsRes.success && insightsRes.data) {
        setInsightsData(insightsRes.data);
        try { console.log(`💡 [WeeklyReport] Loaded insights:`, insightsRes.data.insights); } catch (_) {}
      } else {
        setInsightsData(null);
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

  // Debug: log report and calories per day when data loads
  useEffect(() => {
    try {
      console.log('🧾 [WeeklyReport] reportData:', reportData);
      if (reportData?.daily_details) {
        const rows = reportData.daily_details.map((d) => ({ date: d.date, calories: d.total_calories, target: d.recommended_cal || d.target_cal }));
        console.log('📆 [WeeklyReport] Daily calories:', rows);
      } else {
        console.log('📭 [WeeklyReport] No reportData.daily_details');
      }
    } catch (e) {}
  }, [reportData]);

  useEffect(() => {
    try {
      console.log('💡 [WeeklyReport] insightsData:', insightsData);
    } catch (e) {}
  }, [insightsData]);

  // Debug: recompute chart scaling against current data to verify UI math
  useEffect(() => {
    try {
      if (!reportData?.daily_details?.length) return;
      // Map into chart series like render uses
      const chart = reportData.daily_details.map((day) => ({
        date: day.date,
        calories: day.total_calories || 0,
        target: day.recommended_cal || day.target_cal || 0,
      }));
      const rawMax = Math.max(1, ...chart.map(d => Math.max(d.calories || 0, d.target || 0)));
      const axisMax = Math.max(1, Math.ceil(rawMax / 50) * 50);
      const chartHeight = Math.max(200, Math.min(380, Math.round(axisMax / 10)));
      const bars = chart.map(d => {
        const caloriesHeight = (d.calories / axisMax) * chartHeight;
        const targetHeight = (d.target / axisMax) * chartHeight;
        const cH = Math.max(4, Math.min(chartHeight - 2, Math.floor(caloriesHeight)));
        const tH = Math.max(0, Math.min(chartHeight - 1, Math.floor(targetHeight)));
        return {
          date: d.date,
          cal: d.calories,
          target: d.target,
          calPct: Math.round((d.calories / axisMax) * 100),
          tgtPct: Math.round((d.target / axisMax) * 100),
          cH,
          tH,
          chartHeight,
          axisMax,
        };
      });
      console.log('📐 [WeeklyReport] Chart scale debug:', { rawMax, axisMax, chartHeight });
      console.log('📊 [WeeklyReport] Bars debug:', bars);
    } catch (e) {}
  }, [reportData]);

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
        // ไม่ตั้งค่า default 1500 เพื่อไม่ให้ปั่นสเกล หากไม่มีให้เป็น undefined
        target: (typeof day.recommended_cal === 'number' && !Number.isNaN(day.recommended_cal))
          ? day.recommended_cal
          : ((typeof day.target_cal === 'number' && !Number.isNaN(day.target_cal)) ? day.target_cal : undefined),
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

    // Scale by the max of calories or target; use a "nice" rounded ceiling for consistency
    // คิดจากค่าที่มีจริงเท่านั้น ไม่เอา default 1500 มาปน
    const valuesForScale = displayData.dailyChart.flatMap(d => {
      const arr: number[] = [];
      if (typeof d.calories === 'number') arr.push(d.calories as number);
      if (typeof d.target === 'number') arr.push(d.target as number);
      return arr;
    });
    const rawMax = Math.max(1, ...(valuesForScale.length ? valuesForScale : [1]));
    // Round up to nearest 50 to create small headroom and nicer tick labels
    const axisMax = Math.max(1, Math.ceil(rawMax / 50) * 50);
    // Dynamic height based on axisMax (approx. 1px per 10 kcal), clamped
    const chartHeight = Math.max(200, Math.min(380, Math.round(axisMax / 10)));
    const yTicks = [1, 0.75, 0.5, 0.25]; // 100%, 75%, 50%, 25%

    // เตรียมข้อมูลสำหรับ BarChart + เส้นเป้าหมาย
    const barData = displayData.dailyChart.map((d) => {
      const cal = typeof d.calories === 'number' ? (d.calories as number) : 0;
      const hasTarget = typeof d.target === 'number' && !Number.isNaN(d.target as number);
      const tgt = hasTarget ? (d.target as number) : undefined;

      // Color rules
      // - Over target: red (#ef4444)
      // - Close/equal to target: green (#22c55e) within ±max(50 kcal, 2% of target)
      // - Below target but not close: amber (#ffb800)
      // - No target: default blue (#3b82f6)
      let frontColor = '#3b82f6';
      if (hasTarget && typeof tgt === 'number') {
        if (cal > tgt) {
          frontColor = '#ef4444';
        } else {
          const thresh = Math.max(50, Math.round(tgt * 0.02));
          frontColor = Math.abs(cal - tgt) <= thresh ? '#22c55e' : '#ffb800';
        }
      }

      return {
        value: cal,
        label: d.day,
        frontColor,
        topLabelComponent: () => (
          <Text style={{ fontSize: 10, color: '#374151', fontWeight: '700' }}>{cal}</Text>
        ),
      } as any;
    });
    const lineData = displayData.dailyChart.map((d) =>
      typeof d.target === 'number' ? (d.target as number) : null
    );

    return (
      <View className="bg-white rounded-2xl p-5 mb-6 shadow-lg shadow-slate-800">
        <Text className="text-lg font-bold text-gray-800 mb-4">กราฟแคลอรี่ 7 วัน</Text>
        <BarChart
          data={barData}
          height={chartHeight}
          maxValue={axisMax}
          noOfSections={4}
          yAxisTextStyle={{ fontSize: 10, color: '#9ca3af' }}
          xAxisLabelTextStyle={{ fontSize: 10, color: '#6b7280' }}
          yAxisLabelWidth={30}
          barBorderRadius={4}
          initialSpacing={40}
          spacing={24}
          isAnimated
          rulesType="dashed"
          rulesColor="#e5e7eb"
          rulesThickness={1}
          showLine
          lineData={lineData as any}
          lineConfig={{
            color: '#9ca3af',
            thickness: 2,
            curved: false,
            hideDataPoints: true,
          }}
        />
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
            {/* Big Calorie Card (full width) */}
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-lg shadow-slate-800">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 rounded-full items-center justify-center mr-3 bg-red-100">
                    <Icon name="flame" size={24} color="#ef4444" />
                  </View>
                  <View>
                    <Text className="text-base text-gray-600">แคลอรี่เฉลี่ยต่อวัน</Text>
                    <Text className="text-3xl font-extrabold text-gray-800 mt-1">{displayData.weekAverage.calories} <Text className="text-base font-semibold text-gray-500">kcal/วัน</Text></Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Macro Cards: 3 columns (carb, protein, fat) */}
            <View className="flex-row gap-3 mb-6">
              {/* Carbs */}
              <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-lg shadow-slate-800">
                <View className="w-10 h-10 rounded-full items-center justify-center mb-2" style={{ backgroundColor: '#f59e0b20' }}>
                  <Icon name="nutrition" size={20} color="#f59e0b" />
                </View>
                <Text className="text-xl font-bold text-gray-800">{Math.round(displayData.weekAverage.carbs)}</Text>
                <Text className="text-xs text-gray-600">g/วัน</Text>
                <Text className="text-xs text-gray-500 mt-1">คาร์บเฉลี่ย</Text>
              </View>

              {/* Protein */}
              <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-lg shadow-slate-800">
                <View className="w-10 h-10 rounded-full items-center justify-center mb-2 bg-green-100">
                  <Icon name="fitness" size={20} color="#22c55e" />
                </View>
                <Text className="text-xl font-bold text-gray-800">{Math.round(displayData.weekAverage.protein)}</Text>
                <Text className="text-xs text-gray-600">g/วัน</Text>
                <Text className="text-xs text-gray-500 mt-1">โปรตีนเฉลี่ย</Text>
              </View>

              {/* Fat */}
              <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-lg shadow-slate-800">
                <View className="w-10 h-10 rounded-full items-center justify-center mb-2" style={{ backgroundColor: '#a855f720' }}>
                  <Icon name="ice-cream" size={20} color="#a855f7" />
                </View>
                <Text className="text-xl font-bold text-gray-800">{Math.round(displayData.weekAverage.fat)}</Text>
                <Text className="text-xs text-gray-600">g/วัน</Text>
                <Text className="text-xs text-gray-500 mt-1">ไขมันเฉลี่ย</Text>
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
