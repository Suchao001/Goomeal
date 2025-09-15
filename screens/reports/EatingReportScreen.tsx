import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useTypedNavigation } from '../../hooks/Navigation';
import { useAuth } from '../../AuthContext';
import Menu from '../material/Menu';
import CaloriesSummary from '../../components/CaloriesSummary';
import { getDailyNutritionSummary, type DailyNutritionSummary } from '../../utils/api/dailyNutritionApi';
import { getEatingRecordsByDate, type EatingRecord } from '../../utils/api/eatingRecordApi';
import { getTodayBangkokDate } from '../../utils/bangkokTime';
import { generateDailyRecommendation as generateDailyRecommendationV1, type DailyRecommendation } from '../../utils/dailyRecommendationService';
import { generateDailyRecommendation } from '../../utils/dailyRecommendationService';
import { mapAuthUserToUserProfile, isUserProfileComplete, getDefaultNutritionData } from '../../utils/userProfileMapper';
import { useRecommendedNutrition } from '../../hooks/useRecommendedNutrition';


const formatDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const parseDate = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

const getScoreGradient = (score: number) => {
  if (score >= 90) return ['#22c55e', '#059669'];
  if (score >= 80) return ['#3b82f6', '#06b6d4'];
  if (score >= 70) return ['#eab308', '#d97706'];
  if (score >= 60) return ['#f97316', '#ef4444'];
  return ['#ef4444', '#ec4899'];
};




const EatingReportScreen = () => {
  const { user } = useAuth();
  const typedNavigation = useTypedNavigation<'EatingReport'>();

  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayBangkokDate());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempSelectedDate, setTempSelectedDate] = useState(new Date());

  const [dailyNutrition, setDailyNutrition] = useState<DailyNutritionSummary | null>(null);
  const [eatingRecords, setEatingRecords] = useState<EatingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useRecommended, setUseRecommended] = useState(true);
  const [dailyRecommendation, setDailyRecommendation] = useState<DailyRecommendation | null>(null);
  const [hasUserProfile, setHasUserProfile] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { nutrition: recommendedByHook } = useRecommendedNutrition();

  const handleBackPress = () => {
    try {
      typedNavigation.goBack();
    } catch (error) {
      console.log('Navigation error:', error);
    }
  };

  const loadDailyData = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const date = selectedDate;
      console.log(`📊 [EatingReport] Loading data for date ${date}`);

      const [nutritionRes, recordsRes] = await Promise.all([
        getDailyNutritionSummary(date),
        getEatingRecordsByDate(date)
      ]);

      if (nutritionRes.success && nutritionRes.data) {
        setDailyNutrition(nutritionRes.data);
        console.log(`📊 [EatingReport] Loaded nutrition summary:`, JSON.stringify(nutritionRes.data));
      } else {
        setDailyNutrition(null);
        console.log(`⚠️ [EatingReport] No nutrition summary for ${date}`);
      }

      if (recordsRes.success && recordsRes.data.records) {
        setEatingRecords(recordsRes.data.records);
        console.log(`📊 [EatingReport] Loaded ${recordsRes.data.records.length} eating records`);
      } else {
        setEatingRecords([]);
        console.log(`⚠️ [EatingReport] No eating records for ${date}`);
      }
    } catch (error) {
      console.error('❌ [EatingReport] Failed to load daily data:', error);
      setErrorMsg('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => { loadDailyData(); }, [loadDailyData]);

  
  useFocusEffect(
    useCallback(() => {
      loadDailyData();
    }, [loadDailyData])
  );

  const navigateDay = (direction: 'prev' | 'next') => {
    const current = parseDate(selectedDate);
    const next = new Date(current);
    next.setDate(current.getDate() + (direction === 'prev' ? -1 : 1));
    const today = new Date();
    next.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    try {
      console.log(`[EatingReport] navigateDay: ${direction} from ${formatDate(current)} -> ${formatDate(next)}`);
    } catch {}
    if (direction === 'next' && next > today) {
      Alert.alert('ไม่สามารถดูข้อมูลได้', 'ไม่สามารถดูข้อมูลของวันอนาคตได้', [{ text: 'ตกลง', style: 'default' }]);
      return;
    }
    setSelectedDate(formatDate(next));
    setTempSelectedDate(next);
  };

  const getDateLabel = (dateStr: string) => {
    const todayStr = getTodayBangkokDate();
    if (dateStr === todayStr) return 'วันนี้';
    const d = parseDate(dateStr);
    const monthNames = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
    return `${d.getDate()} ${monthNames[d.getMonth()]}`;
  };

  const dayName = useMemo(() => getDateLabel(selectedDate), [selectedDate]);

  
  const totalsFromRecords = useMemo(() => {
    const sum = (k: keyof EatingRecord) => eatingRecords.reduce((acc, r) => acc + (Number(r[k]) || 0), 0);
    return {
      calories: sum('calories'),
      protein: sum('protein'),
      carbs: sum('carbs'),
      fat: sum('fat'),
    };
  }, [eatingRecords]);

  const reportData = useMemo(() => {
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
        hasTarget: false,
      };
    }

    const totalCalories = dailyNutrition?.total_calories ?? totalsFromRecords.calories;
    const totalProtein  = dailyNutrition?.total_protein  ?? totalsFromRecords.protein;
    const totalCarbs    = dailyNutrition?.total_carbs    ?? totalsFromRecords.carbs;
    const totalFat      = dailyNutrition?.total_fat      ?? totalsFromRecords.fat;

    const hasRecommended = Boolean(dailyNutrition?.recommended_cal || dailyNutrition?.recommended_protein || dailyNutrition?.recommended_carb || dailyNutrition?.recommended_fat);
    const hasTarget      = Boolean(dailyNutrition?.target_cal || dailyNutrition?.target_protein || dailyNutrition?.target_carb || dailyNutrition?.target_fat);

    const getTargetValue = (recommended?: number | null, target?: number | null) => {
      if (useRecommended && recommended != null) return recommended;
      if (!useRecommended && target != null) return target;
      return recommended ?? target ?? 0;
    };

    let targetCalories = getTargetValue(dailyNutrition?.recommended_cal, dailyNutrition?.target_cal);
    let targetProtein  = getTargetValue(dailyNutrition?.recommended_protein, dailyNutrition?.target_protein);
    let targetCarbs    = getTargetValue(dailyNutrition?.recommended_carb, dailyNutrition?.target_carb);
    let targetFat      = getTargetValue(dailyNutrition?.recommended_fat, dailyNutrition?.target_fat);

    
    targetCalories ||= recommendedByHook?.cal || 0;
    targetProtein  ||= recommendedByHook?.protein || 0;
    targetCarbs    ||= recommendedByHook?.carb || 0;
    targetFat      ||= recommendedByHook?.fat || 0;

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
      hasTarget,
    };
  }, [dailyNutrition, eatingRecords.length, totalsFromRecords, recommendedByHook, useRecommended]);

  const showRecommendationSection = useMemo(() => {
    const hasRecommendedApi = reportData.hasRecommended;
    const hasTargetOnly = reportData.hasTarget && !reportData.hasRecommended;
    if (hasTargetOnly) return false; 
    if (hasRecommendedApi) return useRecommended; 
    if (!reportData.hasTarget) return true; 
    return false;
  }, [reportData.hasRecommended, reportData.hasTarget, useRecommended]);

  const mealGroups = useMemo(() => {
    const groups: Record<string, EatingRecord[]> = {};
    for (const r of eatingRecords) {
      const key = r.meal_type || 'อื่นๆ';
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    }
    return groups;
  }, [eatingRecords]);

  const generateRecommendation = useCallback(() => {
    const userProfile = mapAuthUserToUserProfile(user);
    const hasProfile = isUserProfileComplete(user);
    setHasUserProfile(hasProfile);

    const hasEatingData = reportData.totalCalories > 0 || reportData.totalProtein > 0 || reportData.totalCarbs > 0 || reportData.totalFat > 0;
    if (!hasProfile && !hasEatingData) {
      console.log('⚠️ [EatingReport] No user profile and no eating data available');
      setDailyRecommendation(null);
      return;
    }

    const actualIntake = {
      calories: reportData.totalCalories,
      protein: reportData.totalProtein,
      carbs: reportData.totalCarbs,
      fat: reportData.totalFat,
    };

    const recommendedIntake = (reportData.targetCalories > 0)
      ? {
          calories: reportData.targetCalories,
          protein: reportData.targetProtein,
          carbs: reportData.targetCarbs,
          fat: reportData.targetFat,
        }
      : (() => {
          const d = getDefaultNutritionData();
          return { calories: d.cal, protein: d.protein, carbs: d.carb, fat: d.fat };
        })();

    const userProfileForRecommendation = (hasProfile && userProfile)
      ? {
          target_goal: userProfile.target_goal,
          weight: parseFloat(userProfile.weight),
          age: parseInt(userProfile.age),
          activity_level: userProfile.activity_level,
        }
      : { target_goal: 'healthy' as const, weight: 65, age: 30, activity_level: 'moderate' as const };

    try {
      
      const generator =  generateDailyRecommendationV1;
      const recommendation = generator(
        actualIntake,
        { calories: recommendedIntake.calories, protein: recommendedIntake.protein, carbs: recommendedIntake.carbs, fat: recommendedIntake.fat },
        userProfileForRecommendation,
        
      );
      setDailyRecommendation(recommendation);
    } catch (error) {
      console.error('❌ [EatingReport] Error generating recommendation:', error);
      setDailyRecommendation(null);
    }
  }, [user, reportData, getDefaultNutritionData]);

  useEffect(() => {
    if (!isLoading && showRecommendationSection) generateRecommendation();
    else if (!showRecommendationSection) setDailyRecommendation(null);
  }, [generateRecommendation, isLoading, showRecommendationSection]);

  return (
    <View className="flex-1 bg-gray-100">
      {/* Top Bar */}
      <View className="flex-row items-center justify-between px-4 pt-10 pb-4 bg-primary">
        <TouchableOpacity
          className="w-10 h-10 rounded-full items-center justify-center"
          onPress={handleBackPress}
          accessibilityLabel="go-back"
        >
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View className="flex-row items-center gap-2">
          <Icon name="stats-chart" size={32} color="#ffff" />
          <Text className="text-xl text-white font-promptSemiBold">รายงานการกิน</Text>
        </View>

        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => setShowDatePicker(true)}
          accessibilityLabel="open-calendar-modal"
        >
          <Icon name="calendar" size={20} color="#ffff" />
        </TouchableOpacity>
      </View>

      {/* Day Navigator */}
      <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity className={`w-8 h-8 items-center justify-center`} onPress={() => navigateDay('prev')}>
          <Icon name="chevron-back" size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg text-gray-800 font-promptMedium">{dayName}</Text>
        <TouchableOpacity
          className={`w-8 h-8 items-center justify-center ${selectedDate === getTodayBangkokDate() ? 'opacity-50' : ''}`}
          onPress={() => navigateDay('next')}
          disabled={selectedDate === getTodayBangkokDate()}
        >
          <Icon name="chevron-forward" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="flex-1 px-4 pt-6">
          {/* Header */}
          <Text className="text-2xl text-gray-800 mb-2 font-promptBold">สถิติการกินของคุณ</Text>
          <View className="flex-row items-center justify-between mb-8">
            <Text className="text-base text-gray-600 leading-6 font-prompt">ดูสถิติและรายงานการบริโภคอาหารประจำวัน</Text>
            <TouchableOpacity
              className="bg-primary px-3 py-1 rounded-full"
              onPress={() => {
                try {
                  typedNavigation.navigate('WeeklyReport');
                } catch (error) {
                  console.log('Navigation error:', error);
                  Alert.alert('ขณะนี้ไม่สามารถเข้าหน้ารายสัปดาห์ได้', 'กรุณาลองใหม่อีกครั้ง');
                }
              }}
            >
              <Text className="text-white text-xs font-promptMedium">ดูรายสัปดาห์</Text>
            </TouchableOpacity>
          </View>

          {/* Nutrition Toggle */}
          <View className="flex-row justify-between items-center mb-1">
            <View className="flex-row items-center">
              <Text className="ml-2 text-lg text-gray-800 font-promptBold">สรุปโภชนาการ</Text>
            </View>
            {(reportData.hasRecommended && reportData.hasTarget) && (
              <View className="flex-row bg-gray-100 rounded-lg p-1">
                <TouchableOpacity className={`px-4 py-2 rounded-md ${!useRecommended ? 'bg-blue-500' : ''}`} onPress={() => setUseRecommended(false)}>
                  <Text className={`text-sm ${!useRecommended ? 'text-white font-promptSemiBold' : 'text-gray-600 font-prompt'}`}>เป้าหมาย</Text>
                </TouchableOpacity>
                <TouchableOpacity className={`px-4 py-2 rounded-md ${useRecommended ? 'bg-green-500' : ''}`} onPress={() => setUseRecommended(true)}>
                  <Text className={`text-sm ${useRecommended ? 'text-white font-promptSemiBold' : 'text-gray-600 font-prompt'}`}>แนะนำ</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          {(reportData.hasRecommended && reportData.hasTarget) && (
            <Text className="text-xs text-gray-500 mb-4">
              {useRecommended ? 'แนะนำ: จากระบบโดยคำนวณจากข้อมูลของคุณ' : 'เป้าหมาย: ตามแผนการกินที่คุณตั้งค่าไว้'}
            </Text>
          )}

          {/* Summary Card */}
          {(reportData.targetCalories > 0 || reportData.targetProtein > 0 || reportData.targetCarbs > 0 || reportData.targetFat > 0) ? (
            <CaloriesSummary
              caloriesConsumed={reportData.totalCalories || 0}
              caloriesTarget={Math.max(reportData.targetCalories || 0, 1)}
              protein={{ current: reportData.totalProtein || 0, target: Math.max(reportData.targetProtein || 0, 1), unit: 'g', color: '#22c55e', icon: 'fitness' }}
              carbs={{ current: reportData.totalCarbs || 0, target: Math.max(reportData.targetCarbs || 0, 1), unit: 'g', color: '#3b82f6', icon: 'leaf' }}
              fat={{ current: reportData.totalFat || 0, target: Math.max(reportData.targetFat || 0, 1), unit: 'g', color: '#f59e0b', icon: 'water' }}
            />
          ) : (
            <View className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
              <View className="items-center">
                <Icon name="analytics-outline" size={48} color="#9ca3af" />
                <Text className="text-lg text-gray-700 mt-3 font-promptSemiBold">ไม่มีข้อมูลเป้าหมาย</Text>
                <Text className="text-sm text-gray-500 text-center mt-2 font-prompt">กรุณาตั้งค่าเป้าหมายโภชนาการของคุณเพื่อดูสถิติรายละเอียด</Text>
              </View>
            </View>
          )}

          <View className='h-4' />

          {/* Daily Recommendation Section */}
          {isLoading ? (
            <View className="rounded-3xl p-8 mb-6 shadow-xl border border-blue-200" style={{ backgroundColor: '#eef2ff' }}>
              <View className="items-center">
                <LinearGradient colors={["#60a5fa", "#6366f1"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Text className="text-3xl">🎯</Text>
                </LinearGradient>
                <Text className="text-xl text-gray-800 font-promptSemiBold mb-2">กำลังสร้างคำแนะนำ...</Text>
                <Text className="text-sm text-gray-600 text-center font-prompt leading-relaxed">กำลังวิเคราะห์ข้อมูลการกินของคุณเพื่อให้คำแนะนำที่ดีที่สุด</Text>
                <View className="flex-row mt-4 space-x-1">
                  <ActivityIndicator />
                </View>
              </View>
            </View>
          ) : !showRecommendationSection ? null : !dailyRecommendation ? (
            <View className="rounded-3xl p-8 mb-6 shadow-xl border border-orange-200" style={{ backgroundColor: '#fff7ed' }}>
              <View className="items-center">
                <LinearGradient colors={["#fb923c", "#ef4444"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Text className="text-3xl">🤔</Text>
                </LinearGradient>
                <Text className="text-xl text-gray-800 text-center mb-3 font-promptSemiBold">ไม่สามารถสร้างคำแนะนำได้</Text>
                <Text className="text-sm text-gray-600 text-center mb-6 leading-relaxed">{!hasUserProfile ? 'กรุณากรอกข้อมูลส่วนตัวให้ครบถ้วนและลองกินอาหารบางอย่างก่อน' : 'ไม่มีข้อมูลการกินในวันนี้ กรุณาบันทึกอาหารที่กินแล้วลองอีกครั้ง'}</Text>
                {!hasUserProfile && (
                  <TouchableOpacity className="rounded-2xl active:scale-95 shadow-lg overflow-hidden" onPress={() => {
                    try { typedNavigation.navigate('EditProfile'); }
                    catch { Alert.alert('แจ้งเตือน', 'กรุณาไปที่หน้าโปรไฟล์เพื่อกรอกข้อมูลให้ครบถ้วน'); }
                  }}>
                    <LinearGradient colors={["#06b6d4", "#2563eb"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16 }}>
                      <View className="flex-row items-center">
                        <Text className="text-white text-base font-promptMedium mr-2">กรอกข้อมูลส่วนตัว</Text>
                        <Text className="text-white">✨</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            <View className="bg-white rounded-3xl p-6 mb-6 shadow-xl border border-gray-100">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center flex-1">
                  <LinearGradient colors={["#4ade80", "#10b981"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                    <Text className="text-2xl">📊</Text>
                  </LinearGradient>
                  <View className="flex-1">
                    <Text className="text-xl text-gray-800 font-promptBold">คำแนะนำรายวัน</Text>
                    <Text className="text-sm text-gray-500 font-prompt mt-1">{dailyRecommendation.date}</Text>
                  </View>
                </View>
                <LinearGradient colors={getScoreGradient(dailyRecommendation.totalScore)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16 }}>
                  <Text className="text-white text-base font-promptBold">{dailyRecommendation.totalScore}/100</Text>
                </LinearGradient>
              </View>

              {/* Alerts */}
              {!hasUserProfile && (
                <View className="border-l-4 border-amber-400 rounded-xl p-4 mb-5" style={{ backgroundColor: '#fff7ed' }}>
                  <View className="flex-row items-start">
                    <View className="bg-amber-100 w-8 h-8 rounded-full items-center justify-center mr-3"><Text className="text-amber-600">⚠️</Text></View>
                    <View className="flex-1">
                      <Text className="text-amber-800 text-base font-promptSemiBold mb-1">ข้อมูลส่วนตัวยังไม่ครบถ้วน</Text>
                      <Text className="text-amber-700 text-sm mb-3 leading-relaxed">คำแนะนำอาจไม่ถูกต้องตามความต้องการเฉพาะของคุณ</Text>
                      <TouchableOpacity className="bg-amber-500 px-4 py-2 rounded-xl active:scale-95" onPress={() => {
                        try { typedNavigation.navigate('EditProfile'); }
                        catch { Alert.alert('แจ้งเตือน', 'กรุณาไปที่หน้าโปรไฟล์เพื่อกรอกข้อมูลให้ครบถ้วน'); }
                      }}>
                        <Text className="text-white text-sm font-promptMedium">กรอกข้อมูลเพื่อความแม่นยำ →</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {reportData.totalCalories === 0 && (
                <View className="border-l-4 border-blue-400 rounded-xl p-4 mb-5" style={{ backgroundColor: '#eff6ff' }}>
                  <View className="flex-row items-center">
                    <View className="bg-blue-100 w-8 h-8 rounded-full items-center justify-center mr-3"><Text className="text-blue-600">ℹ️</Text></View>
                    <View className="flex-1">
                      <Text className="text-blue-800 text-base font-promptSemiBold mb-1">ยังไม่มีข้อมูลการกินในวันนี้</Text>
                      <Text className="text-blue-700 text-sm leading-relaxed">เริ่มบันทึกอาหารเพื่อรับคำแนะนำที่แม่นยำ</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Score Summary */}
              <View className="rounded-2xl p-5 mb-6 border border-gray-200" style={{ backgroundColor: '#f8fafc' }}>
                <Text className="text-center text-lg text-gray-800 mb-4 font-promptSemiBold leading-relaxed">{dailyRecommendation.summary}</Text>
                <View className="bg-white rounded-xl p-4 shadow-sm">
                  <View className="flex-row justify-between">
                    {[
                      { label: '🔥 แคลอรี่', data: dailyRecommendation.assessments.calories },
                      { label: '💪 โปรตีน', data: dailyRecommendation.assessments.protein },
                      { label: '🍚 คาร์บ', data: dailyRecommendation.assessments.carbs },
                      { label: '🥑 ไขมัน', data: dailyRecommendation.assessments.fat },
                    ].map((item, idx) => (
                      <View key={idx} className="items-center flex-1">
                        <Text className="text-sm text-gray-600 mb-2 text-center">{item.label}</Text>
                        <View className={`w-12 h-12 rounded-xl items-center justify-center mb-2 ${
                          item.data.score >= 23 ? 'bg-green-100 border-2 border-green-300' :
                          item.data.score >= 18 ? 'bg-blue-100 border-2 border-blue-300' :
                          item.data.score >= 15 ? 'bg-yellow-100 border-2 border-yellow-300' :
                          'bg-red-100 border-2 border-red-300'
                        }`}>
                          <Text className={`text-sm font-promptBold ${
                            item.data.score >= 23 ? 'text-green-700' :
                            item.data.score >= 18 ? 'text-blue-700' :
                            item.data.score >= 15 ? 'text-yellow-700' :
                            'text-red-700'
                          }`}>{item.data.score}</Text>
                        </View>
                        <Text className="text-xs text-gray-500 font-promptMedium">25 คะแนน</Text>
                        <Text className={`text-sm font-promptSemiBold mt-1 ${
                          item.data.percentage >= 90 && item.data.percentage <= 110 ? 'text-green-600' :
                          item.data.percentage >= 80 && item.data.percentage <= 120 ? 'text-blue-600' :
                          'text-orange-600'
                        }`}>{item.data.percentage.toFixed(0)}%</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {/* Advice Sections */}
              <View className="space-y-5 gap-1">
                {dailyRecommendation.nutritionAdvice.length > 0 && (
                  <View className="rounded-2xl p-5 border border-green-200" style={{ backgroundColor: '#ecfdf5' }}>
                    <View className="flex-row items-center mb-4">
                      <View className="bg-green-500 w-8 h-8 rounded-lg items-center justify-center mr-3"><Text className="text-white">💪</Text></View>
                      <Text className="text-lg text-green-800 font-promptBold">โภชนาการวันนี้</Text>
                    </View>
                    {dailyRecommendation.nutritionAdvice.slice(0, 3).map((advice, i) => (
                      <View key={i} className="flex-row items-start mb-3"><Text className="text-sm text-green-800 leading-6 flex-1 font-prompt">{advice}</Text></View>
                    ))}
                  </View>
                )}

                {dailyRecommendation.activityAdvice.length > 0 && (
                  <View className="rounded-2xl p-5 border border-blue-200" style={{ backgroundColor: '#eff6ff' }}>
                    <View className="flex-row items-center mb-4">
                      <View className="bg-blue-500 w-8 h-8 rounded-lg items-center justify-center mr-3"><Text className="text-white">🏃‍♂️</Text></View>
                      <Text className="text-lg text-blue-800 font-promptBold">กิจกรรมแนะนำ</Text>
                    </View>
                    {dailyRecommendation.activityAdvice.map((advice, i) => (
                      <View key={i} className="flex-row items-start mb-3">
                        <View className="bg-blue-500 w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5"><Text className="text-white text-xs font-promptBold">→</Text></View>
                        <Text className="text-sm text-blue-800 leading-6 flex-1 font-prompt">{advice}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {dailyRecommendation.tomorrowTips.length > 0 && (
                  <View className="rounded-2xl p-5 border border-purple-200" style={{ backgroundColor: '#f5f3ff' }}>
                    <View className="flex-row items-center mb-4">
                      <View className="bg-purple-500 w-8 h-8 rounded-lg items-center justify-center mr-3"><Text className="text-white">💡</Text></View>
                      <Text className="text-lg text-purple-800 font-promptBold">เคล็ดลับสำหรับพรุ่งนี้</Text>
                    </View>
                    {dailyRecommendation.tomorrowTips.slice(0, 3).map((tip, i) => (
                      <View key={i} className="flex-row items-start mb-3"><Text className="text-sm text-purple-800 leading-6 flex-1 font-prompt">{tip}</Text></View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Food list */}
          {eatingRecords.length > 0 && !isLoading ? (
            <View className="bg-white rounded-2xl p-6 shadow-lg">
              <View className="flex-row items-center justify-between mb-5">
                <View className="flex-row items-center">
                  <View className="bg-orange-500 w-8 h-8 rounded-lg items-center justify-center mr-3">
                    <Icon name="restaurant" size={16} color="white" />
                  </View>
                  <Text className="text-lg text-gray-800 font-promptBold">รายการอาหารวันนี้</Text>
                </View>
                <View className="bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                  <Text className="text-sm text-orange-600 font-promptMedium">{eatingRecords.length} รายการ</Text>
                </View>
              </View>

              <View className="space-y-3">
                {eatingRecords.map((record, index) => (
                  <View key={`food-${index}`} className="bg-gray-50 rounded-xl p-4">
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1 mr-3">
                        <Text className="text-base text-gray-800 font-promptMedium mb-2" numberOfLines={2}>{record.food_name}</Text>
                        <View className="flex-row items-center space-x-2 mb-3">
                          <View className="bg-blue-500 px-3 py-1 rounded-full"><Text className="text-white text-xs font-promptMedium">{record.meal_type || 'อื่นๆ'}</Text></View>
                          {record.meal_time && (
                            <View className="bg-gray-200 px-3 py-1 rounded-full"><Text className="text-gray-600 text-xs font-promptMedium">{record.meal_time.slice(0, 5)}</Text></View>
                          )}
                        </View>
                        <View className="flex-row space-x-4">
                          <View className="items-center"><Text className="text-xs text-gray-500 mb-1">โปรตีน</Text><Text className="text-sm text-green-600 font-promptSemiBold">{Math.round(record.protein || 0)}g</Text></View>
                          <View className="items-center"><Text className="text-xs text-gray-500 mb-1">คาร์บ</Text><Text className="text-sm text-blue-600 font-promptSemiBold">{Math.round(record.carbs || 0)}g</Text></View>
                          <View className="items-center"><Text className="text-xs text-gray-500 mb-1">ไขมัน</Text><Text className="text-sm text-orange-600 font-promptSemiBold">{Math.round(record.fat || 0)}g</Text></View>
                        </View>
                      </View>
                      <View className="items-center bg-white rounded-lg px-3 py-2 shadow-sm">
                        <Text className="text-lg text-red-500 font-promptBold">{(record.calories || 0).toLocaleString()}</Text>
                        <Text className="text-xs text-gray-500 font-promptMedium">kcal</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : !isLoading ? (
            <View className="bg-white rounded-2xl p-6 shadow-lg">
              <View className="items-center">
                <View className="bg-gray-100 w-16 h-16 rounded-full items-center justify-center mb-4"><Icon name="restaurant-outline" size={32} color="#9ca3af" /></View>
                <Text className="text-lg text-gray-700 text-center mb-2 font-promptSemiBold">ยังไม่มีรายการอาหารในวันนี้</Text>
                <Text className="text-sm text-gray-500 text-center mb-6 leading-relaxed">เริ่มต้นบันทึกอาหารที่คุณกินเพื่อดูสถิติและคำแนะนำ</Text>
                <TouchableOpacity className="bg-orange-500 px-6 py-3 rounded-xl flex-row items-center shadow-sm" onPress={() => {
                  try { typedNavigation.navigate('RecordFood'); }
                  catch { Alert.alert('แจ้งเตือน', 'กรุณาไปที่หน้าค้นหาอาหารเพื่อเพิ่มรายการอาหาร'); }
                }}>
                  <Icon name="add" size={16} color="white" />
                  <Text className="text-white text-sm font-promptMedium ml-2">เพิ่มอาหาร</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Calendar Modal */}
      <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
        <View className="flex-1 bg-black bg-opacity-10 justify-start items-center pt-20">
          <View className="bg-white rounded-2xl p-6 mx-4 shadow-2xl" style={{ minWidth: 320, maxWidth: 350 }}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-promptBold text-gray-800">เลือกวันที่</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}><Icon name="close" size={24} color="#6b7280" /></TouchableOpacity>
            </View>
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity onPress={() => { const d = new Date(tempSelectedDate); d.setMonth(d.getMonth() - 1); setTempSelectedDate(d); }} className="w-10 h-10 items-center justify-center"><Icon name="chevron-back" size={20} color="#374151" /></TouchableOpacity>
              <Text className="text-lg font-promptBold text-gray-800">{tempSelectedDate.toLocaleDateString('th-TH', { year: 'numeric', month: 'long' })}</Text>
              <TouchableOpacity onPress={() => { const d = new Date(tempSelectedDate); d.setMonth(d.getMonth() + 1); setTempSelectedDate(d); }} className="w-10 h-10 items-center justify-center"><Icon name="chevron-forward" size={20} color="#374151" /></TouchableOpacity>
            </View>

            <View className="flex-row mb-2">{['อา','จ','อ','พ','พฤ','ศ','ส'].map((day, i) => (
              <View key={i} className="flex-1 items-center py-2"><Text className="text-sm font-promptMedium text-gray-600">{day}</Text></View>
            ))}</View>

            <View>
              {(() => {
                const year = tempSelectedDate.getFullYear();
                const month = tempSelectedDate.getMonth();
                const firstDay = new Date(year, month, 1);
                const startDate = new Date(firstDay);
                startDate.setDate(startDate.getDate() - firstDay.getDay());
                const weeks: Date[][] = [];
                const currentWeek: Date[] = [];
                for (let i = 0; i < 42; i++) {
                  const date = new Date(startDate);
                  date.setDate(startDate.getDate() + i);
                  if (currentWeek.length === 7) { weeks.push([...currentWeek]); currentWeek.length = 0; }
                  currentWeek.push(date);
                }
                if (currentWeek.length > 0) weeks.push(currentWeek);

                const today = new Date(); today.setHours(0,0,0,0);

                return weeks.map((week, wi) => (
                  <View key={wi} className="flex-row">
                    {week.map((date, di) => {
                      const inMonth = date.getMonth() === month;
                      const dayNum = date.getDate();
                      const compare = new Date(date); compare.setHours(0,0,0,0);
                      const selectable = inMonth && (compare.getTime() <= today.getTime());
                      const selected = inMonth && (formatDate(compare) === selectedDate);
                      const isToday = compare.getTime() === today.getTime();
                      return (
                        <TouchableOpacity key={di} className="flex-1 items-center py-3" onPress={() => { if (!selectable) return; setSelectedDate(formatDate(compare)); setShowDatePicker(false); }} disabled={!selectable}>
                          <View className={`w-8 h-8 rounded-full items-center justify-center ${selected ? 'bg-primary' : isToday ? 'bg-blue-100' : ''}`}>
                            <Text className={`text-sm ${selected ? 'text-white font-promptBold' : isToday ? 'text-blue-600 font-promptBold' : selectable ? 'text-gray-800' : 'text-gray-300'}`}>{dayNum}</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ));
              })()}
            </View>

            <View className="flex-row justify-between mt-3">
              <TouchableOpacity onPress={() => { const d = new Date(); d.setHours(0,0,0,0); setSelectedDate(formatDate(d)); setShowDatePicker(false); }} className="flex-1 bg-gray-100 rounded-lg py-3 mr-2">
                <Text className="text-center text-gray-700 font-promptMedium">วันนี้</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { const y = new Date(); y.setDate(y.getDate() - 1); y.setHours(0,0,0,0); setSelectedDate(formatDate(y)); setTempSelectedDate(y); setShowDatePicker(false); }} className="flex-1 bg-gray-100 rounded-lg py-3 ml-2">
                <Text className="text-center text-gray-700 font-promptMedium">เมื่อวาน</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* {navContext ? <Menu/> : null} */}
    </View>
  );
};

export default EatingReportScreen;
