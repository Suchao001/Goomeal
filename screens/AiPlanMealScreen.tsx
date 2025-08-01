import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../hooks/Navigation';
import { useRoute } from '@react-navigation/native';
import { apiClient } from '../utils/apiClient';

const AiPlanMealScreen = () => {
  const navigation = useTypedNavigation();
  const route = useRoute();
  const { aiPlanData } = route.params as { aiPlanData: any };

  const [mealPlanData, setMealPlanData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!aiPlanData) {
      setLoading(false);
      return;
    }

    // Transform AI data to component format
    const transformedData = Object.keys(aiPlanData).map(dayKey => {
      const dayData = aiPlanData[dayKey];
      const dayNumber = parseInt(dayKey);
      let totalCalories = dayData.totalCal || 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      const meals: any[] = [];
      
      Object.keys(dayData.meals).forEach(mealType => {
        const mealData = dayData.meals[mealType];
        let mealItems = Array.isArray(mealData.items) ? mealData.items : [];
        
        mealItems.forEach((item: any) => {
          if (item.protein) totalProtein += item.protein;
          if (item.carb) totalCarbs += item.carb;
          if (item.fat) totalFat += item.fat;
          
          const mealTypeDisplay: { [key: string]: { type: string; icon: string } } = {
            breakfast: { type: 'breakfast', icon: 'sunny-outline' },
            lunch: { type: 'lunch', icon: 'restaurant-outline' },
            dinner: { type: 'dinner', icon: 'moon-outline' }
          };
          
          meals.push({
            type: mealType,
            icon: mealTypeDisplay[mealType]?.icon || 'restaurant-outline',
            name: item.name || 'ไม่ระบุชื่อ'
          });
        });
      });
      
      return {
        day: dayNumber,
        totalCalories: Math.round(totalCalories),
        protein: Math.round(totalProtein),
        carbs: Math.round(totalCarbs),
        fat: Math.round(totalFat),
        meals: meals
      };
    });
    
    transformedData.sort((a, b) => a.day - b.day);
    setMealPlanData(transformedData);
    setLoading(false);
  }, [aiPlanData]);

  const handleSavePlan = async () => {
    if (!aiPlanData) {
      alert('ไม่มีข้อมูลแผนอาหารให้บันทึก');
      return;
    }

    try {
      setSaving(true);
      
      const response = await apiClient.saveFoodPlan({
        name: `แผนอาหารจาก AI (${Object.keys(aiPlanData).length} วัน)`,
        description: `แผนอาหารที่สร้างโดย AI สำหรับ ${Object.keys(aiPlanData).length} วัน`,
        plan: aiPlanData,
        image: undefined
      });
      
      if (response.success) {
        alert('บันทึกแผนอาหารเรียบร้อยแล้ว!');
        console.log('Plan saved successfully:', response.data);
        navigation.navigate('Home');
      } else {
        alert(`เกิดข้อผิดพลาด: ${response.message}`);
      }
    } catch (error: any) {
      console.error('Error saving plan:', error);
      
      let errorMessage = 'เกิดข้อผิดพลาดในการบันทึกแผน';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDayPress = (day: number) => {
    console.log('🎯 View details for day:', day);
    
    // Find the day data
    const dayData = mealPlanData.find(d => d.day === day);
    
    // Use the correct key format - just the day number as string
    const dayKey = day.toString();
    const originalDayData = aiPlanData?.[dayKey];
    
    console.log('📊 Day data found:', dayData);
    console.log('📊 Original day data for key', dayKey, ':', originalDayData);
    
    if (dayData && originalDayData) {
      console.log('✅ Navigating to AiPlanDayDetail with real data');
      navigation.navigate('AiPlanDayDetail', { 
        day,
        dayData,
        originalDayData,
        maxDays: mealPlanData.length,
        aiPlanData
      });
    } else {
      alert(`ไม่พบข้อมูลสำหรับวันที่ ${day}`);
    }
  };

  const renderMealCard = (dayData: any) => (
    <View key={dayData.day} className="bg-white rounded-xl shadow-sm mx-4 mb-4 overflow-hidden">
      <View className="bg-white px-4 pt-4 pb-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-promptSemiBold text-[#4A4A4A]">
            วันที่ {dayData.day}
          </Text>
          <TouchableOpacity 
            onPress={() => handleDayPress(dayData.day)}
            className="flex-row items-center"
          >
            <Text className="text-sm font-promptMedium text-primary mr-1">
              ดูรายละเอียด
            </Text>
            <Icon name="chevron-forward" size={16} color="#f59e0b" />
          </TouchableOpacity>
        </View>
      </View>
      <View className="px-4 pb-3">
        {dayData.meals.map((meal: any, index: number) => (
          <View key={index} className="flex-row items-center mb-2">
            <View className="w-6 h-6 mr-3 items-center justify-center">
              <Icon name={meal.icon} size={18} color="#f59e0b" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-promptMedium text-[#4A4A4A] capitalize">
                {meal.type === 'breakfast' ? 'อาหารเช้า' : 
                 meal.type === 'lunch' ? 'อาหารกลางวัน' : 'อาหารเย็น'}: 
                <Text className="font-promptLight"> {meal.name}</Text>
              </Text>
            </View>
          </View>
        ))}
      </View>
      <View className="bg-white px-4 py-3 mt-2 mx-3 mb-3 rounded-lg">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm font-promptMedium text-[#4A4A4A]">
            แคลอรี่รวม
          </Text>
          <Text className="text-lg font-promptSemiBold text-[#4A4A4A]">
            {dayData.totalCalories} kcal
          </Text>
        </View>
        <View className="flex-row justify-between space-x-2">
          <View className="flex-1 bg-[#F9FAFB] rounded-lg p-3 items-center">
            <Text className="text-lg font-promptSemiBold text-primary mb-1">
              {dayData.protein}g
            </Text>
            <Text className="text-xs font-promptMedium text-[#4A4A4A]">
              โปรตีน
            </Text>
          </View>
          <View className="flex-1 bg-[#F9FAFB] rounded-lg p-3 items-center mx-2">
            <Text className="text-lg font-promptSemiBold text-primary mb-1">
              {dayData.carbs}g
            </Text>
            <Text className="text-xs font-promptMedium text-[#4A4A4A]">
              คาร์บ
            </Text>
          </View>
          <View className="flex-1 bg-[#F9FAFB] rounded-lg p-3 items-center">
            <Text className="text-lg font-promptSemiBold text-primary mb-1">
              {dayData.fat}g
            </Text>
            <Text className="text-xs font-promptMedium text-[#4A4A4A]">
              ไขมัน
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <View className="bg-white px-4 py-4 pt-12 border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="p-2 mr-2"
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#4A4A4A" />
          </TouchableOpacity>
          <Text className="text-xl font-promptSemiBold text-[#4A4A4A]">
            พรีวิวแผนอาหารจาก AI
          </Text>
        </View>
      </View>
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text className="text-gray-500 mt-2">กำลังโหลดข้อมูล...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 pt-4" showsVerticalScrollIndicator={false}>
          {mealPlanData.map(dayData => renderMealCard(dayData))}
          <View className="h-6" />
        </ScrollView>
      )}

      {/* Fixed Save Button - Only show when data is loaded */}
      {!loading && (
        <View className="bg-white px-4 py-4 border-t border-gray-200">
          <TouchableOpacity
            onPress={handleSavePlan}
            className={`rounded-lg py-4 items-center justify-center ${
              saving ? 'bg-gray-400' : 'bg-primary'
            }`}
            activeOpacity={0.8}
            disabled={saving}
          >
            {saving ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white text-lg font-promptSemiBold ml-2">
                  กำลังบันทึก...
                </Text>
              </View>
            ) : (
              <Text className="text-white text-lg font-promptSemiBold">
                บันทึกแผนนี้
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default AiPlanMealScreen;
