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
  type DayDetail,
  type Recommendation
} from '../../utils/api/weeklyReportApi';

/**
 * WeeklyReportScreen Component
 * หน้ารายงานการกินรายสัปดาห์
 */

const { width } = Dimensions.get('window');

const WeeklyReportScreen = () => {
  const navigation = useTypedNavigation();
  const [weekOffset, setWeekOffset] = useState(0); 
  
  
  const [reportData, setReportData] = useState<WeeklyReportData | null>(null);
  const [insightsData, setInsightsData] = useState<WeeklyInsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPrinciples, setShowPrinciples] = useState(false);

  const handleBackPress = () => {
    navigation.goBack();
  };

  
  const loadWeeklyData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [summaryRes, insightsRes] = await Promise.all([
        getWeeklyNutritionSummary(weekOffset),
        getWeeklyInsights(weekOffset)
      ]);
      
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

  
  useEffect(() => {
    loadWeeklyData();
  }, [loadWeeklyData]);

  
  useFocusEffect(
    useCallback(() => {
      loadWeeklyData();
    }, [loadWeeklyData])
  );

  
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

  
  useEffect(() => {
    try {
      if (!reportData?.daily_details?.length) return;
      
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
      
      if (weekOffset < 0) {
        setWeekOffset(weekOffset + 1);
      }
    }
  };

  
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

  
  const generateSmartRecommendations = useCallback((): Recommendation[] => {
    if (!reportData) return [];

    const recs: Recommendation[] = [];
    const sum = reportData.summary;
    const daysLogged = (reportData as any)?.summary?.total_days_with_data ?? (insightsData?.insights?.days_logged ?? 0);

    
    const targetCal = sum.avg_recommended_cal || sum.avg_target_cal || 0;
    const actualCal = sum.avg_total_calories || 0;
    if (targetCal > 0 && actualCal > 0) {
      const diff = Math.round(actualCal - targetCal);
      const pct = Math.round(((actualCal - targetCal) / Math.max(1, targetCal)) * 100);
      const over = diff > 0;
      if (Math.abs(diff) >= 150 || Math.abs(pct) >= 8) {
        recs.push({
          icon: over ? 'flame' : 'leaf',
          color: over ? '#ef4444' : '#22c55e',
          title: over ? 'พลังงานเฉลี่ยเกินเป้า' : 'พลังงานเฉลี่ยต่ำกว่าเป้า',
          message: over
            ? `เฉลี่ย +${diff} kcal/วัน (≈ ${pct}%) ลองลดของหวาน/ของทอด 1 มื้อต่อวัน หรือเพิ่มผักและโปรตีนไม่ติดมัน`
            : `เฉลี่ย ${diff} kcal/วัน (≈ ${pct}%) ลองเพิ่มของว่างที่โปรตีนสูง เช่น โยเกิร์ต/นมถั่วเหลือง หรือเพิ่มปริมาณคาร์บเชิงซ้อน`
        });
      }
    }

    
    const p = sum.avg_total_protein || 0;
    const c = sum.avg_total_carbs || 0;
    const f = sum.avg_total_fat || 0;
    const kcalFromMacros = p * 4 + c * 4 + f * 9;
    if (kcalFromMacros > 0) {
      const pPct = Math.round(((p * 4) / kcalFromMacros) * 100);
      const cPct = Math.round(((c * 4) / kcalFromMacros) * 100);
      const fPct = Math.round(((f * 9) / kcalFromMacros) * 100);

      
      const ideal = { p: 25, c: 50, f: 25 };
      const delta = {
        p: pPct - ideal.p,
        c: cPct - ideal.c,
        f: fPct - ideal.f,
      };
      const biggestKey = (['p','c','f'] as const).sort((a,b) => Math.abs(delta[b]) - Math.abs(delta[a]))[0];
      const biggestGap = Math.abs(delta[biggestKey]);
      if (biggestGap >= 7) {
        if (biggestKey === 'p' && delta.p < 0) {
          recs.push({
            icon: 'fitness',
            color: '#ef4444',
            title: 'โปรตีนอาจต่ำกว่าที่เหมาะสม',
            message: 'เพิ่มโปรตีนไม่ติดมันในแต่ละมื้อ เช่น อกไก่ ปลา เต้าหู้ หรือไข่ เพื่ออิ่มนานและรักษามวลกล้ามเนื้อ'
          });
        } else if (biggestKey === 'c' && delta.c > 0) {
          recs.push({
            icon: 'nutrition',
            color: '#f59e0b',
            title: 'คาร์บค่อนข้างสูง',
            message: 'ลดเครื่องดื่มหวาน/ของหวาน เปลี่ยนเป็นคาร์บเชิงซ้อน เช่น ข้าวกล้อง โฮลเกรน และเพิ่มผักใบเขียว'
          });
        } else if (biggestKey === 'f' && delta.f > 0) {
          recs.push({
            icon: 'water',
            color: '#f59e0b',
            title: 'ไขมันค่อนข้างสูง',
            message: 'ลดของทอด/น้ำสลัดมัน เปลี่ยนเป็นการย่าง/นึ่ง และใช้น้ำมันแต่น้อย'
          });
        }
      }
    }

    
    if (daysLogged < 5) {
      recs.push({
        icon: 'calendar',
        color: '#3b82f6',
        title: 'เพิ่มความสม่ำเสมอในการบันทึก',
        message: 'บันทึกอย่างน้อย 5 วัน/สัปดาห์ เพื่อให้คำแนะนำแม่นยำขึ้น ลองตั้งเตือนเวลาเดิมทุกวัน'
      });
    }

    
    const dayCals = (reportData.daily_details || []).map(d => d.total_calories || 0).filter(n => n > 0);
    if (dayCals.length >= 3) {
      const mean = dayCals.reduce((a,b)=>a+b,0) / dayCals.length;
      const variance = dayCals.reduce((a,b)=>a + Math.pow(b - mean, 2), 0) / dayCals.length;
      const sd = Math.sqrt(variance);
      const cv = mean > 0 ? sd / mean : 0;
      if (cv >= 0.20) {
        recs.push({
          icon: 'stats-chart',
          color: '#10b981',
          title: 'พลังงานรายวันเหวี่ยงค่อนข้างมาก',
          message: 'พยายามให้พลังงานใกล้เคียงกันในแต่ละวัน โดยวางแผนมื้อเท่าๆ กัน หลีกเลี่ยงการกินหนักเฉพาะบางวัน'
        });
      }
    }

    
    const withTarget = (reportData.daily_details || []).filter(d => typeof (d.recommended_cal || d.target_cal) === 'number');
    if (withTarget.length > 0) {
      const scored = withTarget.map(d => ({
        d,
        tgt: (typeof d.recommended_cal === 'number' ? d.recommended_cal : d.target_cal) || 0,
        cal: d.total_calories || 0
      }));
      scored.sort((a,b) => Math.abs(b.cal - b.tgt) - Math.abs(a.cal - a.tgt));
      const worst = scored[0];
      if (worst && Math.abs(worst.cal - worst.tgt) >= 200) {
        const over = worst.cal > worst.tgt;
        recs.push({
          icon: over ? 'warning' : 'checkmark-circle',
          color: over ? '#ef4444' : '#22c55e',
          title: over ? 'มีวันที่เกินเป้าชัดเจน' : 'มีวันที่ต่ำกว่าเป้าชัดเจน',
          message: `${getShortThaiDayName(worst.d.date)} เกิน/ขาด ≈ ${Math.abs(worst.cal - worst.tgt)} kcal ลองเตรียมมื้อ/ของว่างไว้ล่วงหน้าในวันนั้น`
        });
      }
    }

    return recs;
  }, [reportData, insightsData?.insights?.days_logged]);

  const renderChart = () => {
    if (!displayData.dailyChart.length) {
      return (
        <View className="bg-white rounded-2xl p-5 mb-6 shadow-lg shadow-slate-800">
          <Text className="text-lg text-gray-800 mb-4 font-promptBold">กราฟแคลอรี่ 7 วัน</Text>
          <View className="h-40 items-center justify-center">
            <Icon name="bar-chart-outline" size={48} color="#9ca3af" />
            <Text className="text-sm text-gray-500 mt-2 font-prompt">ไม่มีข้อมูล</Text>
          </View>
        </View>
      );
    }

    
    
    const valuesForScale = displayData.dailyChart.flatMap(d => {
      const arr: number[] = [];
      if (typeof d.calories === 'number') arr.push(d.calories as number);
      if (typeof d.target === 'number') arr.push(d.target as number);
      return arr;
    });
    const rawMax = Math.max(1, ...(valuesForScale.length ? valuesForScale : [1]));
    
    const axisMax = Math.max(1, Math.ceil(rawMax / 50) * 50);
    
    const chartHeight = Math.max(200, Math.min(380, Math.round(axisMax / 10)));
    const yTicks = [1, 0.75, 0.5, 0.25]; 

    
    const barData = displayData.dailyChart.map((d) => {
      const cal = typeof d.calories === 'number' ? (d.calories as number) : 0;
      const hasTarget = typeof d.target === 'number' && !Number.isNaN(d.target as number);
      const tgt = hasTarget ? (d.target as number) : undefined;

      
      
      
      
      
      let frontColor = '#3b82f6';
      if (hasTarget && typeof tgt === 'number') {
        const thresh = Math.max(100, Math.round(tgt * 0.10)); 
        const diff = cal - tgt;
        if (Math.abs(diff) <= thresh) {
          frontColor = '#22c55e'; 
        } else {
          frontColor = diff > 0 ? '#ef4444' : '#ffb800'; 
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
        <Text className="text-lg text-gray-800 mb-4 font-promptBold">กราฟแคลอรี่ 7 วัน</Text>
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
          <Text className="text-xl text-white font-promptSemiBold">รายงานสัปดาห์</Text>
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
          <Text className="text-sm text-gray-500 font-prompt">
            {displayData.weekRange}
          </Text>
          <Text className="text-xs text-gray-400 mt-1 font-prompt">
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
            <Text className="text-gray-500 mt-4 font-prompt">กำลังโหลดข้อมูล...</Text>
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
                    <Text className="text-base text-gray-600 font-prompt">แคลอรี่เฉลี่ยต่อวัน</Text>
                    <Text className="text-3xl text-gray-800 mt-1 font-promptBold" style={{ lineHeight: 40 }}>{displayData.weekAverage.calories} <Text className="text-base text-gray-500 font-promptSemiBold">kcal/วัน</Text></Text>
                  </View>
                </View>
              </View>
            </View>
            

            {/* Macro Cards: 3 columns (carb, protein, fat) */}
            <View className="flex-row gap-3 mb-6">

              {/* Protein */}
              <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-lg shadow-slate-800">
                <View className="w-10 h-10 rounded-full items-center justify-center mb-2 bg-red-100">
                  <Icon name="fitness" size={20} color="#ef4444" />
                </View>
                <Text className="text-xl text-gray-800 font-promptBold">{Math.round(displayData.weekAverage.protein)}</Text>
                <Text className="text-xs text-gray-600 font-prompt">g/วัน</Text>
                <Text className="text-xs text-gray-500 mt-1 font-prompt">โปรตีนเฉลี่ย</Text>
              </View>

              {/* Carbs */}
              <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-lg shadow-slate-800">
                <View className="w-10 h-10 rounded-full items-center justify-center mb-2 bg-green-100">
                  <Icon name="leaf" size={20} color="#22c55e" />
                </View>
                <Text className="text-xl text-gray-800 font-promptBold">{Math.round(displayData.weekAverage.carbs)}</Text>
                <Text className="text-xs text-gray-600 font-prompt">g/วัน</Text>
                <Text className="text-xs text-gray-500 mt-1 font-prompt">คาร์บเฉลี่ย</Text>
              </View>

              {/* Fat */}
              <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-lg shadow-slate-800">
                <View className="w-10 h-10 rounded-full items-center justify-center mb-2 bg-orange-100">
                  <Icon name="water" size={20} color="#f59e0b" />
                </View>
                <Text className="text-xl text-gray-800 font-promptBold">{Math.round(displayData.weekAverage.fat)}</Text>
                <Text className="text-xs text-gray-600 font-prompt">g/วัน</Text>
                <Text className="text-xs text-gray-500 mt-1 font-prompt">ไขมันเฉลี่ย</Text>
              </View>
            </View>

            {/* Chart */}
            {renderChart()}

            {/* Weight Progress */}
            {displayData.weightChange && (
              <View className="bg-white rounded-2xl p-5 mb-6 shadow-lg shadow-slate-800">
                <Text className="text-lg text-gray-800 mb-4 font-promptBold">ความคืบหน้าน้ำหนัก</Text>
                
                <View className="flex-row justify-between items-center mb-4">
                  <View className="items-center flex-1">
                    <Text className="text-sm text-gray-500 font-prompt">น้ำหนักเริ่มต้น</Text>
                    <Text className="text-2xl text-gray-800 font-promptBold">{displayData.weightChange.start_weight}</Text>
                    <Text className="text-xs text-gray-400 font-prompt">กิโลกรัม</Text>
                  </View>
                  
                  <View className="items-center flex-1">
                    <Text className="text-sm text-gray-500 font-prompt">เปลี่ยนแปลง</Text>
                    <View className="flex-row items-center">
                      <Icon 
                        name={displayData.weightChange.change < 0 ? "trending-down" : "trending-up"} 
                        size={20} 
                        color={displayData.weightChange.change < 0 ? "#22c55e" : "#ef4444"} 
                      />
                      <Text className={`text-2xl font-promptBold ml-1 ${
                        displayData.weightChange.change < 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {displayData.weightChange.change > 0 ? '+' : ''}{displayData.weightChange.change}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-400 font-prompt">กิโลกรัม</Text>
                  </View>
                  
                  <View className="items-center flex-1">
                    <Text className="text-sm text-gray-500 font-prompt">น้ำหนักปัจจุบัน</Text>
                    <Text className="text-2xl text-blue-500 font-promptBold">{displayData.weightChange.end_weight}</Text>
                    <Text className="text-xs text-gray-400 font-prompt">กิโลกรัม</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Recommendations */}
            {insightsData && (
              <View className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-800">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-lg text-gray-800 font-promptBold">คำแนะนำสำหรับสัปดาห์นี้</Text>
                  <TouchableOpacity
                    className="px-2 py-1"
                    onPress={() => setShowPrinciples(prev => !prev)}
                    accessibilityLabel="toggle-principles"
                  >
                    <View className="flex-row items-center">
                      <Icon name="information-circle-outline" size={18} color="#6b7280" />
                      <Text className="text-xs text-gray-500 ml-1 font-prompt">
                        {showPrinciples ? 'ซ่อนหลักการ' : 'ดูหลักการ'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
                {showPrinciples && (
                  <View className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                    <Text className="text-xs text-amber-800 font-prompt">
                      • พลังงานเฉลี่ยเทียบเป้า: แจ้งเตือนเมื่อเบี่ยงเบน ≥ 150 kcal/วัน หรือ ≥ 8%
                    </Text>
                    <Text className="text-xs text-amber-800 font-prompt mt-1">
                      • สัดส่วนแมโครอ้างอิง: โปรตีน/คาร์บ/ไขมัน ≈ 25/50/25 หากเพี้ยน ≥ 7% จะแนะนำวิธีปรับ
                    </Text>
                    <Text className="text-xs text-amber-800 font-prompt mt-1">
                      • ความสม่ำเสมอ: บันทึก {"<"} 5 วัน/สัปดาห์ → แนะนำเพิ่มความถี่ในการบันทึก
                    </Text>
                    <Text className="text-xs text-amber-800 font-prompt mt-1">
                      • ความเหวี่ยงพลังงาน: SD/Mean ≥ 20% → แนะนำวางแผนมื้อให้สม่ำเสมอ
                    </Text>
                    <Text className="text-xs text-amber-800 font-prompt mt-1">
                      • วันหลุดหนักสุด: ส่วนต่าง ≥ 200 kcal → แนะนำเตรียมมื้อ/ของว่างล่วงหน้าในวันนั้น
                    </Text>
                  </View>
                )}
                
                {(() => {
                  
                  const backendRecs = insightsData?.recommendations || [];
                  const smartRecs = generateSmartRecommendations();
                  const mergedMap = new Map<string, any>();
                  [...backendRecs, ...smartRecs].forEach(r => {
                    if (!mergedMap.has(r.title)) mergedMap.set(r.title, r);
                  });
                  const merged = Array.from(mergedMap.values());
                  return merged;
                })().map((rec, index) => (
                  <View key={index} className="flex-row items-start mb-4 last:mb-0">
                    <View 
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${rec.color}20` }}
                    >
                      <Icon name={rec.icon} size={20} color={rec.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base text-gray-800 mb-1 font-promptSemiBold">
                        {rec.title}
                      </Text>
                      <Text className="text-sm text-gray-600 leading-5 font-prompt">
                        {rec.message}
                      </Text>
                    </View>
                  </View>
                ))}
                
                {/* Insights Summary */}
                {insightsData.insights && (
                  <View className="mt-4 pt-4 border-t border-gray-100">
                    <Text className="text-sm text-gray-700 mb-2 font-promptSemiBold">สรุปสัปดาห์นี้</Text>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-gray-500 font-prompt">บันทึก: {insightsData.insights.days_logged}/7 วัน</Text>
                      <Text className="text-xs text-gray-500 font-prompt">ความสม่ำเสมอ: {insightsData.insights.consistency_rate}%</Text>
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
