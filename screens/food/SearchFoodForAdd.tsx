import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Image, ActivityIndicator } from 'react-native';
import { useTypedNavigation } from '../../hooks/Navigation';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Menu from '../material/Menu';
import { ApiClient } from '../../utils/apiClient';
import { base_url, seconde_url } from '../../config';

interface FoodItem {
  id: string;
  name: string;
  cal: number;
  carb: number;
  fat: number;
  protein: number;
  img: string | null;
  ingredient: string;
  source: 'user_food' | 'foods';
  isUserFood: boolean;
}

interface RouteParams {
  hideRecommended?: boolean;
  mealId?: string;
  source?: string;
  selectedDay?: number;
}

const SearchFoodForAdd = () => {
  const navigation = useTypedNavigation();
  const route = useRoute();
  const params = route.params as RouteParams || {};
  const apiClient = useMemo(() => new ApiClient(), []);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [userFoods, setUserFoods] = useState<FoodItem[]>([]);
  const [globalFoods, setGlobalFoods] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const [showAllUserFoods, setShowAllUserFoods] = useState(false);
  const [showAllGlobalFoods, setShowAllGlobalFoods] = useState(false);
  
  // Load foods from API
  const loadFoods = async (query?: string) => {
    setIsLoading(true);
    try {
      const result = await apiClient.searchFoods(query, query ? 50 : 8); // เริ่มต้น 8 รายการ, search 50 รายการ
      
      if (result.success && result.data) {
        // แยกข้อมูลที่ได้จาก backend
        setUserFoods(result.data.userFoods || []);
        setGlobalFoods(result.data.globalFoods || []);
      } else {
        console.error('Failed to load foods:', result.error);
        setUserFoods([]);
        setGlobalFoods([]);
      }
    } catch (error) {
      console.error('Error loading foods:', error);
      setUserFoods([]);
      setGlobalFoods([]);
    } finally {
      setIsLoading(false);
      if (isInitialLoad) setIsInitialLoad(false);
    }
  };

  // Load initial data
  useEffect(() => {
    loadFoods();
  }, []);

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isInitialLoad) {
        // Reset show all states when searching
        setShowAllUserFoods(false);
        setShowAllGlobalFoods(false);
        loadFoods(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, isInitialLoad]);

  // Get image URL based on source
  const getImageUrl = (food: FoodItem): string => {
    if (!food.img) return '';
    
    // Debug log to check image URL construction
    console.log('Image URL construction for food:', food.name);
    console.log('Food source:', food.source);
    console.log('Food isUserFood:', food.isUserFood);
    console.log('Food img:', food.img);
    
    if (food.isUserFood || food.source === 'user_food') {
      // User food images: base_url + img (img already contains /images/user_foods/)
      const fullUrl = `${base_url}${food.img}`;
      console.log('User food URL:', fullUrl);
      return fullUrl;
    } else {
      // Global food images: seconde_url + img
      const fullUrl = `${seconde_url}${food.img}`;
      console.log('Global food URL:', fullUrl);
      return fullUrl;
    }
  };

  const handleAddFood = (food: FoodItem) => {
  
    if (params.mealId) {
      console.log('🍽️ [SearchFoodForAdd] เพิ่มอาหารเข้ามื้อ:', params.mealId, 'อาหาร:', food.name);
      console.log('🔄 [SearchFoodForAdd] Source:', params.source);
      console.log('📅 [SearchFoodForAdd] Selected day:', (route.params as any)?.selectedDay);
      
      if(params.source === 'MealPlanEdit') {
        console.log('➡️ [SearchFoodForAdd] Navigating back to MealPlanEdit with food');
        navigation.navigate('MealPlanEdit', {
          mode: 'edit',
          selectedFood: food,
          mealId: params.mealId,
          selectedDay: (route.params as any)?.selectedDay || 1
        });
        return;
      }
      
      console.log('➡️ [SearchFoodForAdd] Navigating back to MealPlan with food');
      navigation.navigate('MealPlan', {
        selectedFood: food,
        mealId: params.mealId,
        selectedDay: (route.params as any)?.selectedDay || 1
      });
      return;
    }
    
    console.log('⬅️ [SearchFoodForAdd] Going back without food selection');
    navigation.goBack();
  };

  const handleAddNewMenu = () => {
    navigation.navigate('AddNewFood');
  };

  const renderFoodCard = (food: FoodItem) => {
    const imageUrl = getImageUrl(food);
    
    return (
      <View key={food.id} className="bg-white rounded-lg p-4 mb-3 flex-row items-center shadow-sm">
        <View className="w-16 h-16 rounded-lg bg-gray-100 items-center justify-center mr-4">
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              className="w-16 h-16 rounded-lg"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-2xl">🍽️</Text>
          )}
        </View>
        
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-lg font-semibold text-gray-800 flex-1">{food.name}</Text>
            {food.isUserFood && (
              <View className="bg-blue-100 rounded-full px-2 py-1">
                <Text className="text-xs text-blue-600">เมนูของฉัน</Text>
              </View>
            )}
          </View>
          <View className="flex-row items-center mb-2">
            <Text className="text-sm text-gray-600 mr-4">{food.cal} kcal</Text>
            <Text className="text-sm text-gray-600 mr-4">{food.carb}g คาร์บ</Text>
            <Text className="text-sm text-gray-600">{food.protein}g โปรตีน</Text>
          </View>
          {food.ingredient && (
            <Text className="text-xs text-gray-500" numberOfLines={1}>
              {food.ingredient}
            </Text>
          )}
        </View>
        
        <TouchableOpacity
          onPress={() => handleAddFood(food)}
          className="w-10 h-10 bg-blue-300 rounded-full items-center justify-center"
        >
          <Icon name="add" size={20} color="blue" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderFoodSection = (title: string, foods: FoodItem[], limit?: number, showAll?: boolean, onToggleShowAll?: () => void) => {
    if (foods.length === 0) return null;
    
    const shouldLimit = limit && !searchQuery && !showAll;
    const displayFoods = shouldLimit ? foods.slice(0, limit) : foods;
    
    return (
      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-3 px-1">
          <Text className="text-lg font-semibold text-gray-800">{title}</Text>
          {shouldLimit && foods.length > limit && (
            <TouchableOpacity onPress={onToggleShowAll}>
              <Text className="text-sm text-blue-600 font-medium">
                ดูทั้งหมด ({foods.length})
              </Text>
            </TouchableOpacity>
          )}
          {showAll && limit && (
            <TouchableOpacity onPress={onToggleShowAll}>
              <Text className="text-sm text-gray-600 font-medium">
                ดูน้อยลง
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {displayFoods.map(food => renderFoodCard(food))}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-primary px-4 py-4 mt-6 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity 
          className="w-10 h-10 rounded-lg items-center justify-center"
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <Text className="text-xl font-bold text-white">
          {params.source === 'MealPlan' ? 'เลือกอาหารสำหรับมื้อ' : 'เลือกอาหาร'}
        </Text>
        
        <View className="w-10 h-10" />
      </View>

      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <View className="bg-gray-50 rounded-lg px-4 py-3 flex-row items-center">
          <Icon name="search" size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-3 text-gray-800"
            placeholder="ค้นหาสินค้าหรือเมนู"
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {isLoading && (
          <View className="items-center justify-center py-8">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-500 mt-2">กำลังค้นหา...</Text>
          </View>
        )}

        {!isLoading && (
          <>
            {/* อาหารของฉัน (User Foods) */}
            {userFoods.length > 0 && renderFoodSection(
              '🍽️ อาหารของฉัน', 
              userFoods, 
              4,
              showAllUserFoods,
              () => setShowAllUserFoods(!showAllUserFoods)
            )}
            
            {/* รายการอาหารจาก GoodMeal (Global Foods) - แสดงเสมอ */}
            {globalFoods.length > 0 && renderFoodSection(
              '🥗 รายการอาหารจาก GoodMeal', 
              globalFoods,
              4,
              showAllGlobalFoods,
              () => setShowAllGlobalFoods(!showAllGlobalFoods)
            )}
            
            {/* แสดงข้อความ "ไม่พบอาหาร" เฉพาะเมื่อไม่มีผลลัพธ์ใดๆ */}
            {(userFoods.length === 0 && globalFoods.length === 0) && !isLoading && (
              <View className="flex-1 items-center justify-center py-20">
                <Icon name="search" size={48} color="#9ca3af" />
                <Text className="text-gray-500 mt-4 text-center">
                  {searchQuery ? 'ไม่พบอาหารที่ค้นหา' : 'ยังไม่มีข้อมูลอาหาร'}
                </Text>
                <Text className="text-gray-400 text-center">
                  {searchQuery ? 'ลองค้นหาด้วยคำอื่น' : 'เริ่มต้นด้วยการเพิ่มเมนูใหม่'}
                </Text>
              </View>
            )}                                                                                                                                                                    
          </>
        )}

        <TouchableOpacity
          onPress={handleAddNewMenu}
          className="bg-primary rounded-xl p-4 items-center justify-center mx-4 mb-4"
        >
          <View className="flex-row items-center">
            <Icon name="add" size={20} color="white" />
            <Text className="text-white font-bold ml-2">เพิ่มเมนูใหม่</Text>                                                                                                                                                                                                          
          </View>
        </TouchableOpacity>
      </ScrollView>                                       

      <View className="bg-white px-4 py-4 border-t border-gray-100">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-primary rounded-xl p-4 items-center justify-center"
        >
          <View className="flex-row items-center">
            <Icon name="checkmark" size={20} color="white" />
            <Text className="text-white font-bold ml-2">เสร็จสิ้น</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Menu />
    </SafeAreaView>
  );
};

export default SearchFoodForAdd;
