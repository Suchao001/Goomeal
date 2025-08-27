import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../AuthContext';
import Menu from '../material/Menu';
import CaloriesSummary from '../../components/CaloriesSummary';
import { getDailyNutritionSummary, type DailyNutritionSummary } from '../../utils/api/dailyNutritionApi';
import { getEatingRecordsByDate, type EatingRecord } from '../../utils/api/eatingRecordApi';
import { getBangkokDateForDay, getCurrentBangkokDay, getTodayBangkokDate } from '../../utils/bangkokTime';
import { generateDailyRecommendation, type DailyRecommendation } from '../../utils/dailyRecommendationService';
import { mapAuthUserToUserProfile, isUserProfileComplete, getDefaultNutritionData } from '../../utils/userProfileMapper';


const EatingReportScreen = () => {
  // Auth context for user data
  const { user } = useAuth();
  
  // Safe navigation hook with fallback
  let navigation;
  try {
    navigation = useNavigation();
  } catch (error) {
    console.log('Navigation context not available:', error);
    navigation = null;
  }
  
  // Get current day for initial state
  const getCurrentDay = () => getCurrentBangkokDay();
  const [selectedDay, setSelectedDay] = useState(() => getCurrentDay());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Data states
  const [dailyNutrition, setDailyNutrition] = useState<DailyNutritionSummary | null>(null);
  const [eatingRecords, setEatingRecords] = useState<EatingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useRecommended, setUseRecommended] = useState(true); // Toggle between recommended and target
  const [dailyRecommendation, setDailyRecommendation] = useState<DailyRecommendation | null>(null);
  const [hasUserProfile, setHasUserProfile] = useState(false); // Track if user has complete profile
  

  const handleBackPress = () => {
    try {
      if (navigation) {
        navigation.goBack();
      } else {
        console.log('Navigation not available for goBack');
      }
    } catch (error) {
      console.log('Navigation error:', error);
      // Fallback - could show alert or handle differently
    }
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
  }, [selectedDay]); // ลบ loadDailyData dependency เพื่อป้องกัน infinite loop

  // Load data when screen comes into focus (only if navigation context available)
  try {
    useFocusEffect(
      useCallback(() => {
        const loadData = async () => {
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
        };
        
        loadData();
      }, [selectedDay]) // ใช้ selectedDay โดยตรง
    );
  } catch (error) {
    console.log('useFocusEffect not available:', error);
  }

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
  // Memoize eating records calculation to prevent unnecessary re-computations
  const totalCaloriesFromRecords = React.useMemo(() => 
    eatingRecords.reduce((sum, record) => sum + (record.calories || 0), 0), 
    [eatingRecords]
  );
  
  const totalProteinFromRecords = React.useMemo(() => 
    eatingRecords.reduce((sum, record) => sum + (record.protein || 0), 0), 
    [eatingRecords]
  );
  
  const totalCarbsFromRecords = React.useMemo(() => 
    eatingRecords.reduce((sum, record) => sum + (record.carbs || 0), 0), 
    [eatingRecords]
  );
  
  const totalFatFromRecords = React.useMemo(() => 
    eatingRecords.reduce((sum, record) => sum + (record.fat || 0), 0), 
    [eatingRecords]
  );

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
    const totalCalories = dailyNutrition?.total_calories || totalCaloriesFromRecords;
    const totalProtein = dailyNutrition?.total_protein || totalProteinFromRecords;
    const totalCarbs = dailyNutrition?.total_carbs || totalCarbsFromRecords;
    const totalFat = dailyNutrition?.total_fat || totalFatFromRecords;

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

  // Memoize report data to prevent unnecessary re-renders
  const reportData = React.useMemo(() => getReportData(), [
    dailyNutrition?.total_calories,
    dailyNutrition?.total_protein,
    dailyNutrition?.total_carbs,
    dailyNutrition?.total_fat,
    dailyNutrition?.recommended_cal,
    dailyNutrition?.recommended_protein,
    dailyNutrition?.recommended_carb,
    dailyNutrition?.recommended_fat,
    dailyNutrition?.target_cal,
    dailyNutrition?.target_protein,
    dailyNutrition?.target_carb,
    dailyNutrition?.target_fat,
    totalCaloriesFromRecords,
    totalProteinFromRecords,
    totalCarbsFromRecords,
    totalFatFromRecords,
    useRecommended
  ]);

  // Generate daily recommendation using real user data only
  const generateRecommendation = useCallback(() => {
    // Check if user has complete profile
    const userProfile = mapAuthUserToUserProfile(user);
    const hasProfile = isUserProfileComplete(user);
    setHasUserProfile(hasProfile);

    // Only generate recommendation if we have either user profile OR eating data
    const hasEatingData = reportData.totalCalories > 0 || reportData.totalProtein > 0 || reportData.totalCarbs > 0 || reportData.totalFat > 0;
    
    if (!hasProfile && !hasEatingData) {
      console.log('⚠️ [EatingReport] No user profile and no eating data available');
      setDailyRecommendation(null);
      return;
    }

    // If no user profile but has eating data, show recommendation with limited accuracy
    if (!hasProfile && hasEatingData) {
      console.log('⚠️ [EatingReport] No user profile, showing basic recommendation based on eating data only');
    }

    let actualIntake, recommendedIntake, userProfileForRecommendation;
    
    // Use real eating data
    actualIntake = {
      calories: reportData.totalCalories,
      protein: reportData.totalProtein,
      carbs: reportData.totalCarbs,
      fat: reportData.totalFat
    };

    // Use recommended/target values if available, otherwise use general defaults
    if (reportData.targetCalories > 0) {
      recommendedIntake = {
        calories: reportData.targetCalories,
        protein: reportData.targetProtein,
        carbs: reportData.targetCarbs,
        fat: reportData.targetFat
      };
    } else {
      // Use general nutritional guidelines (not mockup data)
      const defaultNutrition = getDefaultNutritionData();
      recommendedIntake = {
        calories: defaultNutrition.cal,
        protein: defaultNutrition.protein,
        carbs: defaultNutrition.carb,
        fat: defaultNutrition.fat
      };
    }

    // Use user profile if available
    if (hasProfile && userProfile) {
      userProfileForRecommendation = {
        target_goal: userProfile.target_goal,
        weight: parseFloat(userProfile.weight),
        age: parseInt(userProfile.age),
        activity_level: userProfile.activity_level
      };
    } else {
      // If no user profile, use general health maintenance profile
      // This is based on general nutritional guidelines, not mockup data
      userProfileForRecommendation = {
        target_goal: 'healthy' as const,
        weight: 65, // Average adult weight for calculations
        age: 30, // Average adult age for metabolism calculations
        activity_level: 'moderate' // Moderate activity as baseline
      };
    }

    try {
      const recommendation = generateDailyRecommendation(
        actualIntake,
        recommendedIntake,
        userProfileForRecommendation
      );
      setDailyRecommendation(recommendation);
    } catch (error) {
      console.error('❌ [EatingReport] Error generating recommendation:', error);
      setDailyRecommendation(null);
    }
  }, [
    reportData.totalCalories,
    reportData.totalProtein, 
    reportData.totalCarbs,
    reportData.totalFat,
    reportData.targetCalories,
    reportData.targetProtein,
    reportData.targetCarbs,
    reportData.targetFat,
    user?.age,
    user?.weight,
    user?.target_goal,
    user?.activity_level
  ]);

  // Generate recommendation when report data changes
  useEffect(() => {
    if (!isLoading) {
      // Generate recommendation based on available real data
      generateRecommendation();
    }
  }, [generateRecommendation, isLoading]);

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
                try {
                  if (navigation) {
                    (navigation as any).navigate('WeeklyReport');
                  } else {
                    Alert.alert('ขณะนี้ไม่สามารถเข้าหน้ารายสัปดาห์ได้', 'Navigation ไม่พร้อมใช้งาน');
                  }
                } catch (error) {
                  console.log('Navigation error:', error);
                  Alert.alert('ขณะนี้ไม่สามารถเข้าหน้ารายสัปดาห์ได้', 'กรุณาลองใหม่อีกครั้ง');
                }
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
          ) : !dailyRecommendation ? (
            <View className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
              <View className="items-center">
                <View className="bg-gray-200 w-10 h-10 rounded-full items-center justify-center mb-3">
                  <Text className="text-2xl">😔</Text>
                </View>
                <Text className="text-lg font-semibold text-gray-700 text-center mb-2">
                  ไม่สามารถสร้างคำแนะนำได้
                </Text>
                <Text className="text-sm text-gray-500 text-center mb-4">
                  {!hasUserProfile 
                    ? 'กรุณากรอกข้อมูลส่วนตัวให้ครบถ้วนและลองกินอาหารบางอย่างก่อน'
                    : 'ไม่มีข้อมูลการกินในวันนี้ กรุณาบันทึกอาหารที่กินแล้วลองอีกครั้ง'
                  }
                </Text>
                {!hasUserProfile && (
                  <TouchableOpacity
                    className="bg-primary px-4 py-2 rounded-full"
                    onPress={() => {
                      try {
                        if (navigation) {
                          navigation.navigate('EditProfile' as never);
                        } else {
                          Alert.alert('แจ้งเตือน', 'กรุณาไปที่หน้าโปรไฟล์เพื่อกรอกข้อมูลให้ครบถ้วน');
                        }
                      } catch (error) {
                        Alert.alert('แจ้งเตือน', 'กรุณาไปที่หน้าโปรไฟล์เพื่อกรอกข้อมูลให้ครบถ้วน');
                      }
                    }}
                  >
                    <Text className="text-white text-sm font-medium">กรอกข้อมูลส่วนตัว</Text>
                  </TouchableOpacity>
                )}
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

              {/* No Data Notice - แสดงเมื่อไม่มีข้อมูลหรือ user profile ไม่ครบ */}
              {!hasUserProfile && (
                <View className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <View className="flex-row items-center">
                    <Text className="text-amber-600 mr-2">⚠️</Text>
                    <View className="flex-1">
                      <Text className="text-amber-800 text-sm font-medium">
                        ข้อมูลส่วนตัวยังไม่ครบถ้วน
                      </Text>
                      <Text className="text-amber-700 text-xs mt-1">
                        คำแนะนำอาจไม่ถูกต้องตามความต้องการเฉพาะของคุณ
                      </Text>
                      <TouchableOpacity
                        className="mt-2"
                        onPress={() => {
                          try {
                            if (navigation) {
                              navigation.navigate('EditProfile' as never);
                            } else {
                              Alert.alert('แจ้งเตือน', 'กรุณาไปที่หน้าโปรไฟล์เพื่อกรอกข้อมูลให้ครบถ้วน');
                            }
                          } catch (error) {
                            Alert.alert('แจ้งเตือน', 'กรุณาไปที่หน้าโปรไฟล์เพื่อกรอกข้อมูลให้ครบถ้วน');
                          }
                        }}
                      >
                        <Text className="text-amber-700 text-sm underline font-medium">
                          กรอกข้อมูลส่วนตัวเพื่อความแม่นยำ →
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {reportData.totalCalories === 0 && (
                <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <View className="flex-row items-center">
                    <Text className="text-blue-600 mr-2">ℹ️</Text>
                    <View className="flex-1">
                      <Text className="text-blue-800 text-sm font-medium">
                        ยังไม่มีข้อมูลการกินในวันนี้
                      </Text>
                      <Text className="text-blue-700 text-xs mt-1">
                        เริ่มบันทึกอาหารเพื่อรับคำแนะนำที่แม่นยำ
                      </Text>
                    </View>
                  </View>
                </View>
              )}

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

          {/* Recent Meals */}
          

          {/* Food Details Section */}
          {eatingRecords.length > 0 && !isLoading ? (
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
                    <View className="flex-row items-center mt-2">
                      <Text className="text-xs text-green-600 mr-3">
                        โปรตีน {Math.round(record.protein || 0)}g
                      </Text>
                      <Text className="text-xs text-blue-600 mr-3">
                        คาร์บ {Math.round(record.carbs || 0)}g
                      </Text>
                      <Text className="text-xs text-orange-600">
                        ไขมัน {Math.round(record.fat || 0)}g
                      </Text>
                    </View>
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
          ) : !isLoading && (
            <View className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-800">
              <View className="items-center">
                <View className="bg-gray-100 w-16 h-16 rounded-full items-center justify-center mb-4">
                  <Text className="text-3xl">🍽️</Text>
                </View>
                <Text className="text-lg font-semibold text-gray-700 text-center mb-2">
                  ยังไม่มีรายการอาหารในวันนี้
                </Text>
                <Text className="text-sm text-gray-500 text-center mb-4">
                  เริ่มต้นบันทึกอาหารที่คุณกินเพื่อดูสถิติและคำแนะนำ
                </Text>
                <TouchableOpacity
                  className="bg-primary px-4 py-2 rounded-full"
                  onPress={() => {
                    try {
                      if (navigation) {
                        navigation.navigate('FoodSearch' as never);
                      } else {
                        Alert.alert('แจ้งเตือน', 'กรุณาไปที่หน้าค้นหาอาหารเพื่อเพิ่มรายการอาหาร');
                      }
                    } catch (error) {
                      Alert.alert('แจ้งเตือน', 'กรุณาไปที่หน้าค้นหาอาหารเพื่อเพิ่มรายการอาหาร');
                    }
                  }}
                >
                  <Text className="text-white text-sm font-medium">เพิ่มอาหาร</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      <Menu/>
    </View>
  );
};

export default EatingReportScreen;
