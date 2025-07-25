import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../hooks/Navigation';
import { useRoute, RouteProp } from '@react-navigation/native';
import { apiClient } from '../utils/apiClient';
import { RootStackParamList } from '../types/navigation';

type GlobalPlanMealRouteProp = RouteProp<RootStackParamList, 'GlobalPlanMeal'>;

const GlobalPlanMeal = () => {
  const navigation = useTypedNavigation();
  const route = useRoute<GlobalPlanMealRouteProp>();
  
  // Now we can safely access planId with proper typing
  const { planId } = route.params;
  
  console.log('🎯 [GlobalPlanMeal] Route params:', route.params);
  console.log('🎯 [GlobalPlanMeal] Extracted planId:', planId);
  
  const [mealPlanData, setMealPlanData] = useState<any[]>([]);
  const [planInfo, setPlanInfo] = useState<any>(null);
  const [originalMealPlan, setOriginalMealPlan] = useState<any>(null); // Store original API format
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMealPlanDetails();
    console.log('page global plan meal');
  }, [planId]);

  const fetchMealPlanDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get(`/api/meal-plan-details/${planId}`);
      
      if (response.data.success) {
        const { planInfo, mealPlan } = response.data.data;
        setPlanInfo(planInfo);
        setOriginalMealPlan(mealPlan); // Store original for saving
        
        // Transform API data to component format
        const transformedData = Object.keys(mealPlan).map(dayKey => {
          const dayData = mealPlan[dayKey];
          const dayNumber = parseInt(dayKey);
          
          // Calculate nutrition totals for the day
          let totalCalories = 0;
          let totalProtein = 0;
          let totalCarbs = 0;
          let totalFat = 0;
          
          const meals: any[] = [];
          
          // Process each meal type
          Object.keys(dayData.meals).forEach(mealType => {
            const mealData = dayData.meals[mealType];
            totalCalories += mealData.totalCal;
            
            // Add individual meal items
            mealData.items.forEach((item: any) => {
              totalProtein += item.protein;
              totalCarbs += item.carb;
              totalFat += item.fat;
              
              // Map meal type to display format
              const mealTypeDisplay = {
                breakfast: { type: 'breakfast', icon: 'sunny-outline' },
                lunch: { type: 'lunch', icon: 'restaurant-outline' },
                dinner: { type: 'dinner', icon: 'moon-outline' }
              };
              
              meals.push({
                type: mealType,
                icon: mealTypeDisplay[mealType as keyof typeof mealTypeDisplay]?.icon || 'restaurant-outline',
                name: item.name
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
        
        // Sort by day number
        transformedData.sort((a, b) => a.day - b.day);
        setMealPlanData(transformedData);
      } else {
        setError('ไม่สามารถดึงข้อมูลแผนอาหารได้');
      }
    } catch (err) {
      console.error('Error fetching meal plan details:', err);
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleDayPress = (day: number) => {
    console.log('View details for day:', day);
    navigation.navigate('GlobalPlanDayDetail', { planId, day });
  };

  const handleSavePlan = async () => {
    if (!planInfo || !originalMealPlan) {
      alert('ไม่มีข้อมูลแผนอาหารให้บันทึก');
      return;
    }

    try {
      setSaving(true);
      
      // Create FormData to send both JSON data and image path
      const formData = new FormData();
      formData.append('name', `${planInfo.plan_name} (คัดลอก)`);
      formData.append('description', planInfo.description || `แผนอาหาร ${planInfo.duration} วัน จาก Global Plan`);
      formData.append('plan', JSON.stringify(originalMealPlan));
      
      // Add image path from planInfo if available
      if (planInfo.image) {
        // Extract just the filename/path part from the full URL
        const imagePath = planInfo.image.split('/images/').pop();
        if (imagePath) {
          formData.append('imagePath', imagePath);
        }
      }

      console.log('Saving plan with image:', {
        name: `${planInfo.plan_name} (คัดลอก)`,
        description: planInfo.description,
        imagePath: planInfo.image,
        planDataKeys: originalMealPlan ? Object.keys(originalMealPlan) : []
      });

      const response = await apiClient.post('/user-food-plans', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        alert('บันทึกแผนอาหารเรียบร้อยแล้ว!');
        console.log('Plan saved successfully:', response.data.data);
        
        // Navigate back or to user's plans
        navigation.goBack();
      } else {
        alert(`เกิดข้อผิดพลาด: ${response.data.error}`);
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

  const renderMealCard = (dayData: any) => (
    <View key={dayData.day} className="bg-white rounded-xl shadow-sm mx-4 mb-4 overflow-hidden">
      {/* Day Header */}
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

      {/* Meals List */}
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

      {/* Nutrition Summary Section */}
      <View className="bg-white px-4 py-3 mt-2 mx-3 mb-3 rounded-lg">
        {/* Total Calories */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm font-promptMedium text-[#4A4A4A]">
            แคลอรี่รวม
          </Text>
          <Text className="text-lg font-promptSemiBold text-[#4A4A4A]">
            {dayData.totalCalories} kcal
          </Text>
        </View>

        {/* Macronutrients - Three Columns */}
        <View className="flex-row justify-between space-x-2">
          {/* Protein */}
          <View className="flex-1 bg-[#F9FAFB] rounded-lg p-3 items-center">
            <Text className="text-lg font-promptSemiBold text-primary mb-1">
              {dayData.protein}g
            </Text>
            <Text className="text-xs font-promptMedium text-[#4A4A4A]">
              โปรตีน
            </Text>
          </View>

          {/* Carbs */}
          <View className="flex-1 bg-[#F9FAFB] rounded-lg p-3 items-center mx-2">
            <Text className="text-lg font-promptSemiBold text-primary mb-1">
              {dayData.carbs}g
            </Text>
            <Text className="text-xs font-promptMedium text-[#4A4A4A]">
              คาร์บ
            </Text>
          </View>

          {/* Fat */}
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
      {/* Header */}
      <View className="bg-white px-4 py-4 pt-12 border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="p-2 mr-2"
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#4A4A4A" />
          </TouchableOpacity>
          <Text className="text-xl font-promptSemiBold text-[#4A4A4A]">
            {planInfo?.plan_name || 'พรีวิวแผนอาหาร'}
          </Text>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text className="text-gray-500 mt-2">กำลังโหลดข้อมูล...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-4">
          <Icon name="alert-circle-outline" size={64} color="#ef4444" />
          <Text className="text-red-500 text-center mt-4 text-lg font-promptMedium">
            {error}
          </Text>
          <TouchableOpacity
            onPress={fetchMealPlanDetails}
            className="bg-primary rounded-lg px-6 py-3 mt-4"
          >
            <Text className="text-white font-promptMedium">ลองใหม่</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView className="flex-1 pt-4" showsVerticalScrollIndicator={false}>
          {mealPlanData.map(dayData => renderMealCard(dayData))}
          
          {/* Bottom spacing */}
          <View className="h-6" />
        </ScrollView>
      )}

      {/* Fixed Save Button - Only show when data is loaded */}
      {!loading && !error && (
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

export default GlobalPlanMeal;
