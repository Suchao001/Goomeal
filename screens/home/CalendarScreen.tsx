import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView, Modal, ScrollView, FlatList } from 'react-native';
import { useTypedNavigation } from '../../hooks/Navigation';
import Icon from 'react-native-vector-icons/Ionicons';
import Menu from '../material/Menu';
import { apiClient } from '../../utils/apiClient';
import { seconde_url, base_url } from '../../config';


// Interface for meal items (copied from GlobalPlanDayDetail)
interface MealItem {
  name: string;
  calories: number;
  protein: number;
  carb: number;
  fat: number;
  image?: string;
}

interface DayMealData {
  breakfast: MealItem[];
  lunch: MealItem[];
  dinner: MealItem[];
}

/**
 * CalendarScreen Component
 * หน้าจัดการเมนูอาหาร - แสดงเมนูอาหารตามวันและเวลา
 */
const CalendarScreen = () => {
  const navigation = useTypedNavigation();

  // State for selected date
  const [selectedDate, setSelectedDate] = useState(new Date()); // Use actual date instead of day number
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showKebabMenu, setShowKebabMenu] = useState(false);
  
  // State for user food plan data
  const [currentFoodPlan, setCurrentFoodPlan] = useState<any>(null);
  const [currentDayMeals, setCurrentDayMeals] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate which day of the plan the selected date represents
  const calculatePlanDay = (selectedDate: Date, startDate: Date, isRepeat: boolean, planDuration: number) => {
    const timeDiff = selectedDate.getTime() - startDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) {
      // Selected date is before plan start date
      return null;
    }
    
    if (isRepeat) {
      // If repeating, cycle through plan days
      return (daysDiff % planDuration) + 1;
    } else {
      // If not repeating, only show if within plan duration
      if (daysDiff >= planDuration) {
        return null;
      }
      return daysDiff + 1;
    }
  };

  // Get current plan day and meals for selected date
  const getCurrentPlanDay = () => {
    if (!currentFoodPlan || !currentFoodPlan.usingInfo) {
      return null;
    }
    
    const startDate = new Date(currentFoodPlan.usingInfo.start_date);
    let planData = currentFoodPlan.plan;
    
    // Handle case where plan data might be a JSON string
    if (typeof planData === 'string') {
      try {
        planData = JSON.parse(planData);
      } catch (error) {
        console.error('❌ [CalendarScreen] Error parsing plan data:', error);
        return null;
      }
    }
    
    const planDuration = Object.keys(planData || {}).length;
    
    const planDay = calculatePlanDay(
      selectedDate, 
      startDate, 
      currentFoodPlan.usingInfo.is_repeat,
      planDuration
    );
    
    if (!planDay || !planData) {
      return null;
    }
    
    let dayData = planData[planDay.toString()];
    
    // Handle case where day data might also be a JSON string
    if (typeof dayData === 'string') {
      try {
        dayData = JSON.parse(dayData);
      } catch (error) {
        console.error('❌ [CalendarScreen] Error parsing day data:', error);
        return null;
      }
    }
    
    return {
      day: planDay,
      meals: dayData?.meals || dayData || null
    };
  };

  // Update meals when date or food plan changes
  useEffect(() => {
    const planDay = getCurrentPlanDay();
    setCurrentDayMeals(planDay);
   
  }, [selectedDate, currentFoodPlan]);

  // Transform meal data for current day (improved to handle the actual JSON structure)
  const transformCurrentDayMealData = (): DayMealData => {
    const transformedMealData: DayMealData = {
      breakfast: [],
      lunch: [],
      dinner: []
    };

    if (!currentDayMeals || !currentDayMeals.meals) {
      console.log('❌ [CalendarScreen] No currentDayMeals or meals data');
      return transformedMealData;
    }

    // Handle the actual JSON structure from the plan data
    let mealsData = currentDayMeals.meals;
    
    // Handle case where meals might be a JSON string
    if (typeof mealsData === 'string') {
      try {
        mealsData = JSON.parse(mealsData);
      } catch (error) {
        console.error('❌ [CalendarScreen] Error parsing meals data:', error);
        return transformedMealData;
      }
    }
    
    // Helper function to categorize meal types (supports case variations and custom names)
    const categorizeMealType = (mealTypeName: string) => {
      const lowerName = mealTypeName.toLowerCase();
      
      if (lowerName.includes('breakfast') || lowerName.includes('เช้า') || lowerName === 'breakfast') {
        return 'breakfast';
      } else if (lowerName.includes('lunch') || lowerName.includes('กลางวัน') || lowerName === 'lunch') {
        return 'lunch';
      } else if (lowerName.includes('dinner') || lowerName.includes('เย็น') || lowerName === 'dinner') {
        return 'dinner';
      } else {
        // If it's a custom name, try to map based on time or order
        return 'lunch'; // Default fallback
      }
    };
    
    // Process each meal type dynamically
    Object.keys(mealsData).forEach(mealKey => {
      const mealData = mealsData[mealKey];
      const category = categorizeMealType(mealKey);
      
   
      if (mealData && mealData.items && Array.isArray(mealData.items)) {
        const transformedItems = mealData.items.map((item: any) => ({
          name: item.name || 'ไม่ระบุชื่อ',
          calories: parseFloat(item.cal) || 0,
          protein: parseFloat(item.protein) || 0,
          carb: parseFloat(item.carb) || 0,
          fat: parseFloat(item.fat) || 0,
          image: item.img
        }));
        
        // Add to appropriate category (or combine if multiple map to same category)
        transformedMealData[category as keyof DayMealData].push(...transformedItems);
      }
    });

   
    return transformedMealData;
  };

  // Helper functions (copied from GlobalPlanDayDetail)
  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) {
      return 'https://via.placeholder.com/60x60/E5E7EB/6B7280?text=Food';
    }
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Check if path starts with /images/ -> use base_url
    if (imagePath.startsWith('/images/')) {
      return `${base_url}${imagePath}`;
    }
    
    // Check if path starts with /foods/ -> use seconde_url
    if (imagePath.startsWith('/foods/')) {
      return `${seconde_url}${imagePath}`;
    }
    
    // Default fallback - use seconde_url for other paths
    return `${seconde_url}${imagePath}`;
  };

  const calculateMealCalories = (meals: MealItem[]) => {
    return meals.reduce((total, meal) => total + meal.calories, 0);
  };

  const renderMealSection = (mealType: 'breakfast' | 'lunch' | 'dinner', meals: MealItem[], icon: string, title: string) => {    
    const totalCalories = calculateMealCalories(meals);
    
    let mealTotalCal = totalCalories;
    
    if (currentDayMeals?.meals) {
      let mealsData = currentDayMeals.meals;
      
      if (typeof mealsData === 'string') {
        try {
          mealsData = JSON.parse(mealsData);
        } catch (error) {
          console.error('❌ [CalendarScreen] Error parsing meals for totalCal:', error);
        }
      }
      
      // Find matching meal by type (case insensitive)
      const mealKey = Object.keys(mealsData).find(key => {
        const lowerKey = key.toLowerCase();
        return lowerKey === mealType || 
               (mealType === 'breakfast' && (lowerKey.includes('breakfast') || lowerKey.includes('เช้า'))) ||
               (mealType === 'lunch' && (lowerKey.includes('lunch') || lowerKey.includes('กลางวัน'))) ||
               (mealType === 'dinner' && (lowerKey.includes('dinner') || lowerKey.includes('เย็น')));
      });
      
      if (mealKey && mealsData[mealKey]?.totalCal) {
        mealTotalCal = mealsData[mealKey].totalCal;
      }
    }
  
    
    return (
      <View className="mb-8">
        {/* Meal Header with Timeline */}
        <View className="flex-row items-center mb-4">
          {/* Timeline Circle */}
          <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-4">
            <Icon name={icon} size={16} color="white" />
          </View>
          
          {/* Meal Info */}
          <View className="flex-1">
            <Text className="text-lg font-promptSemiBold text-[#4A4A4A]">{title}</Text>
            <Text className="text-sm font-promptMedium" style={{ color: '#77dd77' }}>
              {mealTotalCal} cal
            </Text>
          </View>
        </View>
        
        {/* Meal Items */}
        <View className="ml-12">
          {meals.length === 0 ? (
            <View className="mb-4">
              <View className="bg-white rounded-xl p-4 shadow-sm">
                <Text className="text-gray-500 text-center">ไม่มีเมนูอาหาร</Text>
              </View>
            </View>
          ) : (
            meals.map((meal, index) => (
              <View key={index} className="mb-4">
                {/* Food Item Card */}
                <View className="bg-white rounded-xl p-4 shadow-md shadow-slate-400">
                  <View className="flex-row">
                    {/* Food Image */}
                    <View className="w-16 h-16 mr-4">
                      <Image
                        source={{ uri: getImageUrl(meal.image) }}
                        className="w-full h-full rounded-lg"
                        resizeMode="cover"
                      />
                    </View>
                    
                    {/* Food Details */}
                    <View className="flex-1">
                      <Text className="text-base font-promptSemiBold text-[#4A4A4A] mb-2">
                        {meal.name}
                      </Text>
                      <Text className="text-sm font-promptMedium text-gray-600 mb-1">
                        {meal.calories} cal
                      </Text>
                      
                      {/* Nutrition Info in Grid */}
                      <View className="flex-row justify-between">
                        <Text className="text-xs font-promptLight text-gray-500 flex-1">
                          โปรตีน {meal.protein}g
                        </Text>
                        <Text className="text-xs font-promptLight text-gray-500 flex-1">
                          คาร์บ {meal.carb}g
                        </Text>
                        <Text className="text-xs font-promptLight text-gray-500 flex-1">
                          ไขมัน {meal.fat}g
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    );
  };

  // Fetch current user food plan
  useEffect(() => {
    fetchCurrentFoodPlan();
  }, []);

  const fetchCurrentFoodPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call API to get current active food plan
      const response = await apiClient.get('/user-food-plans/current');
      
    
      if (response.data.success) {
        const planData = response.data.data;
        
        setCurrentFoodPlan({
          id: planData.food_plan_id,
          name: planData.name,
          description: planData.description,
          plan: planData.plan_data,
          img: planData.img,
          usingInfo: {
            start_date: planData.start_date,
            is_repeat: planData.is_repeat
          }
        });
      } else {
        console.log('⚠️ [CalendarScreen] No active food plan found:', response.data.error);
        setCurrentFoodPlan(null);
      }
    } catch (err: any) {
      console.error('❌ [CalendarScreen] Error fetching food plan:', err);
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการดึงข้อมูลแผนอาหาร');
    } finally {
      setLoading(false);
    }
  };

  // Get current date info
  const getCurrentDate = () => {
    const day = selectedDate.getDate();
    const month = selectedDate.getMonth() + 1;
    const year = selectedDate.getFullYear() + 543; // Convert to Buddhist Era
    
    const planDay = getCurrentPlanDay();
    
    return {
      dayName: `วันที่ ${day}`,
      fullDate: `${day}/${month}/${year}`,
      planDayText: planDay ? `แผนวันที่ ${planDay.day}` : 'ไม่มีแผน'
    };
  };

  const { dayName, fullDate, planDayText } = getCurrentDate();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header - calendarOld style */}
      <View className="bg-primary px-4 py-4 mt-6 flex-row items-center justify-between border-b border-gray-100">
        {/* Menu Button */}
        
        <TouchableOpacity className="w-10 h-10 rounded-lg items-center justify-center">
          <Icon name="menu" size={24} color="#ffb800" />
        </TouchableOpacity>
        
        {/* Title */}
        <Text className="text-xl  text-white font-promptBold">แผนการกิน</Text>
        
        {/* Calendar Info */}
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="flex-row items-center"
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="calendar" size={20} color="#ffff" />
           
          </TouchableOpacity>
          
          {/* Kebab Menu */}
          <TouchableOpacity 
            className="ml-3 w-8 h-8 items-center justify-center"
            onPress={() => setShowKebabMenu(true)}
          >
            <Icon name="ellipsis-vertical" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Navigation Bar - calendarOld style */}
      <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity
          className="w-8 h-8 items-center justify-center"
          onPress={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() - 1);
            setSelectedDate(newDate);
          }}
        >
          <Icon name="chevron-back" size={20} color="#374151" />
        </TouchableOpacity>
        
        <View className="items-center">
          <Text className="text-lg font-medium font-prompt text-gray-800">
            {dayName}
          </Text>
    
          {currentDayMeals && currentDayMeals.meals && (
            <Text className="text-xs font-bold text-primary">
              {(() => {
                let mealsData = currentDayMeals.meals;
                
            
                if (typeof mealsData === 'string') {
                  try {
                    mealsData = JSON.parse(mealsData);
                  } catch (error) {
                    console.error('❌ [CalendarScreen] Error parsing meals for total cal display:', error);
                    return '0 kcal';
                  }
                }
                
                let totalCal = 0;
                
                // Sum up totalCal from all meals dynamically
                Object.keys(mealsData).forEach(mealKey => {
                  if (mealsData[mealKey]?.totalCal) {
                    totalCal += mealsData[mealKey].totalCal;
                  }
                });
                
                return `${totalCal} kcal`;
              })()}
            </Text>
          )}
        </View>
        
        <TouchableOpacity
          className="w-8 h-8 items-center justify-center"
          onPress={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() + 1);
            setSelectedDate(newDate);
          }}
        >
          <Icon name="chevron-forward" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View className="flex-1">
        {/* Loading State */}
        {loading && (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500 text-lg">กำลังโหลดข้อมูล...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View className="flex-1 items-center justify-center">
            <Icon name="alert-circle-outline" size={64} color="#ef4444" />
            <Text className="text-red-500 text-center mt-4 text-lg">{error}</Text>
            <TouchableOpacity
              onPress={fetchCurrentFoodPlan}
              className="bg-primary rounded-lg px-6 py-3 mt-4"
            >
              <Text className="text-white font-medium">ลองใหม่</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Current Food Plan Display with Daily Meals */}
        {!loading && !error && currentFoodPlan && currentDayMeals && currentDayMeals.meals && (
          <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
            {/* Plan Info */}
            {/* <View className="mb-6">
              <Text className="text-xl font-bold text-gray-800 mb-2">แผนอาหารปัจจุบัน</Text>
              <View className="bg-white rounded-xl p-4 shadow-sm">
                <Text className="text-lg font-semibold text-gray-800 mb-1">{currentFoodPlan.name}</Text>
                <Text className="text-gray-600 mb-2">{currentFoodPlan.description}</Text>
                
                {currentFoodPlan.usingInfo && (
                  <View className="bg-gray-50 rounded-lg p-3 mb-3">
                    <Text className="text-sm text-gray-600">
                      วันที่เริ่มใช้: {new Date(currentFoodPlan.usingInfo.start_date).toLocaleDateString('th-TH')}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      รูปแบบ: {currentFoodPlan.usingInfo.is_repeat ? 'ทำซ้ำ' : 'ไม่ทำซ้ำ'}
                    </Text>
                  </View>
                )}
              </View>
            </View> */}

            {/* Daily Meals */}
            <View className="mb-6">
              <Text className="text-xl font-promptBold text-myBlack mb-4">
                เมนูอาหาร {planDayText}
              </Text>
              
              {/* Timeline Container */}
              <View className="relative">
                {/* Main Timeline Line */}
                <View className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                
                {(() => {
                  const transformedMeals = transformCurrentDayMealData();
                  return (
                    <>
                      {/* Breakfast */}
                      {renderMealSection('breakfast', transformedMeals.breakfast, 'sunny-outline', 'อาหารเช้า')}
                      
                      {/* Lunch */}
                      {renderMealSection('lunch', transformedMeals.lunch, 'restaurant-outline', 'อาหารกลางวัน')}
                      
                      {/* Dinner */}
                      {renderMealSection('dinner', transformedMeals.dinner, 'moon-outline', 'อาหารเย็น')}
                    </>
                  );
                })()}
              </View>
            </View>
            
            {/* Bottom spacing */}
            <View className="h-8" />
          </ScrollView>
        )}

        {/* No Meals for Selected Day - Show calendarOld style */}
        {!loading && !error && currentFoodPlan && (!currentDayMeals || !currentDayMeals.meals) && (
          <View className="flex-1 items-center justify-center px-4">
            {/* Fruit Illustration */}
            <Image 
              source={require('../../assets/images/bg1.png')} 
              className="w-64 h-64 mb-6"
              resizeMode="contain"
            />

            {/* Text Content */}
            <View className="items-center mb-8">
              <Text className="text-2xl font-bold text-gray-800 mb-2">
                แนะนำการกินเพื่อสุขภาพ
              </Text>
              <Text className="text-gray-600 text-center leading-6">
                แนะนำเมนูอาหารเช้าและอาหารเย็น{'\n'}
                เพื่อสุขภาพที่ดีในแต่ละวัน
              </Text>
            </View>

            {/* Add Menu Button */}
            <TouchableOpacity 
              className="bg-primary rounded-xl px-8 py-4 flex-row items-center shadow-md"
              onPress={() => navigation.navigate('OptionPlan', {
                from: 'CalendarScreen'
              })}
            >
              <Icon name="add-circle" size={24} color="white" />
              <Text className="text-white font-bold text-lg ml-2">เพิ่มเมนู</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* No Plan State - Show calendarOld style */}
        {!loading && !error && !currentFoodPlan && (
          <View className="flex-1 items-center justify-center px-4">
            {/* Fruit Illustration */}
            <Image 
              source={require('../../assets/images/bg1.png')} 
              className="w-64 h-64 mb-6"
              resizeMode="contain"
            />

            {/* Text Content */}
            <View className="items-center mb-8">
              <Text className="text-2xl font-bold text-gray-800 mb-2">
                แนะนำการกินเพื่อสุขภาพ
              </Text>
              <Text className="text-gray-600 text-center leading-6">
                แนะนำเมนูอาหารเช้าและอาหารเย็น{'\n'}
                เพื่อสุขภาพที่ดีในแต่ละวัน
              </Text>
            </View>

            {/* Add Menu Button */}
            <TouchableOpacity 
              className="bg-primary rounded-xl px-8 py-4 flex-row items-center shadow-md"
              onPress={() => navigation.navigate('OptionPlan')}
            >
              <Icon name="add-circle" size={24} color="white" />
              <Text className="text-white font-bold text-lg ml-2">เพิ่มเมนู</Text>
            </TouchableOpacity>
          </View>
        )}
        <View className='h-20' />
      </View>

      {/* Bottom Navigation */}
      <Menu />

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View className="flex-1 bg-black bg-opacity-10 justify-start items-center pt-20">
          <View className="bg-white rounded-2xl p-6 mx-4 shadow-2xl" style={{ minWidth: 320, maxWidth: 350 }}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">เลือกวันที่</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Icon name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            {/* Calendar Grid */}
            <View className="mb-4">
              {/* Current Month/Year */}
              <View className="flex-row items-center justify-between mb-4">
                <TouchableOpacity
                  onPress={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setSelectedDate(newDate);
                  }}
                  className="w-10 h-10 items-center justify-center"
                >
                  <Icon name="chevron-back" size={20} color="#374151" />
                </TouchableOpacity>
                
                <Text className="text-lg font-bold text-gray-800">
                  {selectedDate.toLocaleDateString('th-TH', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </Text>
                
                <TouchableOpacity
                  onPress={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setSelectedDate(newDate);
                  }}
                  className="w-10 h-10 items-center justify-center"
                >
                  <Icon name="chevron-forward" size={20} color="#374151" />
                </TouchableOpacity>
              </View>
              
              {/* Week days header */}
              <View className="flex-row mb-2">
                {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day, index) => (
                  <View key={index} className="flex-1 items-center py-2">
                    <Text className="text-sm font-medium text-gray-600">{day}</Text>
                  </View>
                ))}
              </View>
              
              {/* Calendar days */}
              <View>
                {(() => {
                  const year = selectedDate.getFullYear();
                  const month = selectedDate.getMonth();
                  const firstDay = new Date(year, month, 1);
                  const lastDay = new Date(year, month + 1, 0);
                  const startDate = new Date(firstDay);
                  startDate.setDate(startDate.getDate() - firstDay.getDay());
                  
                  const weeks = [];
                  const currentWeek = [];
                  
                  for (let i = 0; i < 42; i++) {
                    const date = new Date(startDate);
                    date.setDate(startDate.getDate() + i);
                    
                    if (currentWeek.length === 7) {
                      weeks.push([...currentWeek]);
                      currentWeek.length = 0;
                    }
                    
                    currentWeek.push(date);
                  }
                  
                  if (currentWeek.length > 0) {
                    weeks.push(currentWeek);
                  }
                  
                  return weeks.map((week, weekIndex) => (
                    <View key={weekIndex} className="flex-row">
                      {week.map((date, dayIndex) => {
                        const isCurrentMonth = date.getMonth() === month;
                        const isSelected = date.toDateString() === selectedDate.toDateString();
                        const isToday = date.toDateString() === new Date().toDateString();
                        
                        return (
                          <TouchableOpacity
                            key={dayIndex}
                            className="flex-1 items-center py-3"
                            onPress={() => {
                              setSelectedDate(new Date(date));
                              setShowDatePicker(false);
                            }}
                          >
                            <View 
                              className={`w-8 h-8 rounded-full items-center justify-center ${
                                isSelected 
                                  ? 'bg-primary' 
                                  : isToday 
                                    ? 'bg-blue-100' 
                                    : ''
                              }`}
                            >
                              <Text 
                                className={`text-sm ${
                                  isSelected 
                                    ? 'text-white font-bold' 
                                    : isToday 
                                      ? 'text-blue-600 font-bold'
                                      : isCurrentMonth 
                                        ? 'text-gray-800' 
                                        : 'text-gray-300'
                                }`}
                              >
                                {date.getDate()}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ));
                })()}
              </View>
            </View>
            
            {/* Quick select buttons */}
            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() => {
                  setSelectedDate(new Date());
                  setShowDatePicker(false);
                }}
                className="flex-1 bg-gray-100 rounded-lg py-3 mr-2"
              >
                <Text className="text-center text-gray-700 font-medium">วันนี้</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setSelectedDate(tomorrow);
                  setShowDatePicker(false);
                }}
                className="flex-1 bg-gray-100 rounded-lg py-3 ml-2"
              >
                <Text className="text-center text-gray-700 font-medium">พรุ่งนี้</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Kebab Menu Modal */}
      <Modal
        visible={showKebabMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowKebabMenu(false)}
      >
        <TouchableOpacity 
          className="flex-1"
          onPress={() => setShowKebabMenu(false)}
        >
          <View className="absolute top-20 right-4 bg-white rounded-lg shadow-lg py-2 min-w-[150px]">
            {currentFoodPlan && (
              <TouchableOpacity
                className="px-4 py-3 flex-row items-center"
                onPress={() => {
                  setShowKebabMenu(false);
                  navigation.navigate('MealPlanEdit', { foodPlanId: currentFoodPlan.id, from: 'Calendar' });
                }}
              >
                <Icon name="create" size={20} color="#6b7280" />
                <Text className="ml-3 text-gray-700">แก้ไขแผนอาหาร</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              className="px-4 py-3 flex-row items-center"
              onPress={() => {
                setShowKebabMenu(false);
                navigation.navigate('OptionPlan');
              }}
            >
              <Icon name="add-circle" size={20} color="#6b7280" />
              <Text className="ml-3 text-gray-700">เพิ่มแผนใหม่</Text>
            </TouchableOpacity>
            
            <View className="border-t border-gray-100 my-1" />
            
           
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
};




export default CalendarScreen;
