import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../hooks/Navigation';
import { useRoute, RouteProp } from '@react-navigation/native';
import { apiClient } from '../utils/apiClient';
import { RootStackParamList } from '../types/navigation';
import { SavePlanModal } from '../components/SavePlanModal';
import { useImagePicker } from '../hooks/useImagePicker';

type GlobalPlanMealRouteProp = RouteProp<RootStackParamList, 'GlobalPlanMeal'>;

const GlobalPlanMeal = () => {
  const navigation = useTypedNavigation();
  const route = useRoute<GlobalPlanMealRouteProp>();
  
  // Now we can safely access planId with proper typing
  const { planId } = route.params;
  const [mealPlanData, setMealPlanData] = useState<any[]>([]);
  const [planInfo, setPlanInfo] = useState<any>(null);
  const [originalMealPlan, setOriginalMealPlan] = useState<any>(null); // Store original API format
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // SavePlanModal states
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [setAsCurrentPlan, setSetAsCurrentPlan] = useState(true);
  const [selectedPlanImage, setSelectedPlanImage] = useState<string | null>(null);
  const { showImagePicker } = useImagePicker();

  useEffect(() => {
    fetchMealPlanDetails();
    console.log('Screen: GlobalPlanMeal');
  }, [planId]);

  useEffect(() => {
    // Set default values when planInfo is loaded
    if (planInfo) {
      setPlanName(`${planInfo.plan_name} (คัดลอก)`);
      setPlanDescription(planInfo.description || `แผนอาหาร ${planInfo.duration} วัน จาก Global Plan`);
    }
  }, [planInfo]);

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
          // Day key is already a number string like "1", "2"
          const dayNumber = parseInt(dayKey);
          
          let totalCalories = dayData.totalCal || 0;
          let totalProtein = 0;
          let totalCarbs = 0;
          let totalFat = 0;
          
          const meals: any[] = [];
          
          // Process each meal type - handle different case variations
          Object.keys(dayData.meals).forEach(mealType => {
            const mealData = dayData.meals[mealType];
          
            const normalizedMealType = mealType.toLowerCase();
            
            // Handle different data structures - could be array or object
            let mealItems = [];
            if (Array.isArray(mealData)) {
              mealItems = mealData;
            } else if (mealData.items && Array.isArray(mealData.items)) {
              mealItems = mealData.items;
            } else if (mealData && typeof mealData === 'object') {
              // If it's an object, try to extract items or treat as single item
              mealItems = [mealData];
            }
            
            // Add individual meal items
            mealItems.forEach((item: any) => {
              if (item.protein) totalProtein += item.protein;
              if (item.carb) totalCarbs += item.carb;
              if (item.fat) totalFat += item.fat;
              
              // Map meal type to display format
              const mealTypeDisplay = {
                breakfast: { type: 'breakfast', icon: 'sunny-outline' },
                lunch: { type: 'lunch', icon: 'restaurant-outline' },
                dinner: { type: 'dinner', icon: 'moon-outline' }
              };
              
              meals.push({
                type: normalizedMealType,
                icon: mealTypeDisplay[normalizedMealType as keyof typeof mealTypeDisplay]?.icon || 'restaurant-outline',
                name: item.name || item.food_name || 'ไม่ระบุชื่อ'
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
  
    const dayData = mealPlanData.find(d => d.day === day);
    
    // Use the correct key format - just the day number as string
    const dayKey = day.toString();
    const originalDayData = originalMealPlan?.[dayKey];
  
    if (dayData && originalDayData) {
      navigation.navigate('GlobalPlanDayDetail', { 
        planId, 
        day,
        dayData,
        originalDayData,
        planInfo,
        maxDays: mealPlanData.length
      });
    } else {
      console.log('❌ Missing data - dayData:', !!dayData, 'originalDayData:', !!originalDayData);
      
      // Fallback: create minimal data structure
      if (dayData) {
        console.log('⚠️ Using fallback data structure');
        const fallbackOriginalData = {
          meals: {
            breakfast: { items: [] as any[] },
            lunch: { items: [] as any[] },
            dinner: { items: [] as any[] }
          }
        };
        
        // Populate with available meal data
        dayData.meals.forEach((meal: any) => {
          const mealType = meal.type.toLowerCase();
          if (fallbackOriginalData.meals[mealType as keyof typeof fallbackOriginalData.meals]) {
            fallbackOriginalData.meals[mealType as keyof typeof fallbackOriginalData.meals].items.push({
              name: meal.name,
              calories: 0,
              protein: 0,
              carb: 0,
              fat: 0,
              image: null
            });
          }
        });
        
        navigation.navigate('GlobalPlanDayDetail', { 
          planId, 
          day,
          dayData,
          originalDayData: fallbackOriginalData,
          planInfo,
          maxDays: mealPlanData.length
        });
      } else {
        alert(`ไม่พบข้อมูลสำหรับวันที่ ${day}`);
      }
    }
  };

  const handleImagePicker = async () => {
    const imageUri = await showImagePicker('เลือกรูปภาพแผน', 'เลือกรูปภาพสำหรับแผนอาหารของคุณ');
    if (imageUri) {
      setSelectedPlanImage(imageUri);
    }
  };

  const handleRemoveImage = () => {
    setSelectedPlanImage(null);
  };

  const openSaveModal = () => {
    setShowSaveModal(true);
  };

  const handleSavePlan = async () => {
    if (!planInfo || !originalMealPlan) {
      alert('ไม่มีข้อมูลแผนอาหารให้บันทึก');
      return;
    }
    
    if (!planName.trim()) {
      alert('กรุณาใส่ชื่อแผนอาหาร');
      return;
    }
    
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('name', planName.trim());
      formData.append('description', planDescription.trim() || `แผนอาหาร ${planInfo.duration} วัน`);
      formData.append('plan', JSON.stringify(originalMealPlan));
      formData.append('setAsCurrentPlan', setAsCurrentPlan.toString());
      
      // Handle image upload
      if (selectedPlanImage) {
        const imageExtension = selectedPlanImage.split('.').pop() || 'jpg';
        formData.append('image', {
          uri: selectedPlanImage,
          type: `image/${imageExtension}`,
          name: `plan_image.${imageExtension}`,
        } as any);
      } else if (planInfo.image) {
        // Use existing plan image if no new image selected
        const imagePath = planInfo.image.split('/images/').pop();
        if (imagePath) {
          formData.append('imagePath', imagePath);
        }
      }

      console.log('Saving plan with data:', {
        name: planName.trim(),
        description: planDescription.trim(),
        hasNewImage: !!selectedPlanImage,
        hasExistingImage: !!planInfo.image,
        setAsCurrentPlan,
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
        
        setShowSaveModal(false);
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

  // Calculate total days and menus for SavePlanModal
  const totalDays = mealPlanData.length;
  const totalMenus = mealPlanData.reduce((total, day) => {
    return total + (day.meals ? day.meals.length : 0);
  }, 0);

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
            onPress={openSaveModal}
            className="bg-primary rounded-lg py-4 items-center justify-center"
            activeOpacity={0.8}
          >
            <Text className="text-white text-lg font-promptSemiBold">
              บันทึกแผนนี้
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Save Plan Modal */}
      <SavePlanModal
        visible={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSavePlan}
        planName={planName}
        setPlanName={setPlanName}
        planDescription={planDescription}
        setPlanDescription={setPlanDescription}
        selectedPlanImage={selectedPlanImage}
        onImagePicker={handleImagePicker}
        onRemoveImage={handleRemoveImage}
        totalDays={totalDays}
        totalMenus={totalMenus}
        saveButtonText={saving ? "กำลังบันทึก..." : "บันทึกแผน"}
        setAsCurrentPlan={setAsCurrentPlan}
        setSetAsCurrentPlan={setSetAsCurrentPlan}
      />
    </View>
  );
};

export default GlobalPlanMeal;
