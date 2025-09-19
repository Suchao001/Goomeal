import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import { useTypedNavigation } from '../hooks/Navigation';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Menu from './material/Menu';
import KebabMenuMyFood from '../components/KebabMenuMyFood';
import { ApiClient } from '../utils/apiClient';
import { base_url } from '../config';

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
  src?: string; // 'user' or 'ai'
  createdAt?: any;
  updatedAt?: any;
  serving?: string;
}

const MyFood = () => {
  const navigation = useTypedNavigation();
  const apiClient = useMemo(() => new ApiClient(), []);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [userFoods, setUserFoods] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'user' | 'ai'>('all');
  
  // Kebab menu state
  const [kebabMenuVisible, setKebabMenuVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [kebabMenuPosition, setKebabMenuPosition] = useState({ x: 0, y: 0 });

  // Load user foods from API
  const loadUserFoods = async (query?: string) => {
    setIsLoading(true);
    try {
      const srcParam = sourceFilter === 'all' ? undefined : sourceFilter;
      const result = await apiClient.getUserFoods(query, 50, srcParam); // Load up to 50 items
      
      if (result.success && result.data) {
        // API returns only user foods in userFoods array
        setUserFoods(result.data.userFoods || []);
      } else {
        console.error('Failed to load user foods:', result.error);
        setUserFoods([]);
      }
    } catch (error) {
      console.error('Error loading user foods:', error);
      setUserFoods([]);
    } finally {
      setIsLoading(false);
      if (isInitialLoad) setIsInitialLoad(false);
    }
  };

  // Load initial data
  useEffect(() => {
    loadUserFoods();
  }, []);

  // Refresh data when screen comes back into focus
  useFocusEffect(
    React.useCallback(() => {
      loadUserFoods(searchQuery);
    }, [searchQuery, sourceFilter])
  );

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isInitialLoad) {
        loadUserFoods(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, isInitialLoad]);

  // Reload when source filter changes
  useEffect(() => {
    if (!isInitialLoad) {
      loadUserFoods(searchQuery);
    }
  }, [sourceFilter]);

  // Get image URL for user food
  const getImageUrl = (food: FoodItem): string => {
    if (!food.img) return '';
    // User food images: base_url + img (img already contains /images/user_foods/)
    return `${base_url}${food.img}`;
  };

  const handleEditFood = () => {
    if (!selectedFood) return;
    // Navigate to edit food screen with food data
    navigation.navigate('EditFood', { 
      foodId: selectedFood.id,
      food: selectedFood 
    });
  };

  const handleDeleteFood = () => {
    if (!selectedFood) return;
    Alert.alert(
      'ลบเมนูอาหาร',
      `คุณต้องการลบ "${selectedFood.name}" หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบ',
          style: 'destructive',
          onPress: () => deleteFood(selectedFood.id)
        }
      ]
    );
  };

  const deleteFood = async (foodId: string) => {
    try {
      const result = await apiClient.deleteUserFood(foodId);
      if (result.success) {
        setUserFoods(userFoods.filter(food => food.id !== foodId));
        Alert.alert('สำเร็จ', 'ลบเมนูอาหารเรียบร้อยแล้ว');
      } else {
        Alert.alert('ข้อผิดพลาด', result.error || 'ไม่สามารถลบเมนูอาหารได้');
      }
    } catch (error) {
      console.error('Error deleting food:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถลบเมนูอาหารได้');
    }
  };

  const handleKebabPress = (food: FoodItem, event: any) => {
    const { pageY, pageX } = event.nativeEvent;
    setSelectedFood(food);
    setKebabMenuPosition({ x: pageX, y: pageY });
    setKebabMenuVisible(true);
  };

  const handleAddNewFood = () => {
    navigation.navigate('AddNewFood');
  };

  const renderFoodCard = (food: FoodItem) => {
    const imageUrl = getImageUrl(food);
    
    return (
      <View key={food.id} className="bg-white rounded-lg p-4 mb-3 shadow-sm">
        <View className="flex-row items-center">
          <View className="w-16 h-16 rounded-lg bg-gray-100 items-center justify-center mr-4">
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                className="w-16 h-16 rounded-lg"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-2xl font-prompt">🍽️</Text>
            )}
          </View>
          
          <View className="flex-1">
            {/* Badges ข้างบนชื่อ */}
            <View className="flex-row justify-end mb-1 space-x-1 gap-1">
              
              {food.src && (
                <View className={`rounded-full px-2 py-1 ${
                  food.src === 'ai' ? 'bg-purple-100' : 'bg-green-100'
                }`}>
                  <Text className={`text-xs font-prompt ${
                    food.src === 'ai' ? 'text-purple-600' : 'text-green-600'
                  }`}>
                    {food.src === 'ai' ? '🤖 AI' : ' เพิ่มเอง'}
                  </Text>
                </View>
              )}
            </View>
            
            {/* ชื่อเมนู */}
            <View className="flex-row items-center mb-1">
              <Text className="text-lg font-semibold text-gray-800 flex-1 font-prompt">{food.name}</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Text className="text-sm text-gray-600 mr-4 font-prompt">{food.cal} kcal</Text>
              <Text className="text-sm text-gray-600 mr-4 font-prompt">{food.carb}g คาร์บ</Text>
              <Text className="text-sm text-gray-600 font-prompt">{food.protein}g โปรตีน</Text>
            </View>
            {food.serving ? (
              <View className="flex-row items-center mb-1">
                <Icon name="restaurant-outline" size={14} color="#9ca3af" />
                <Text className="text-xs text-gray-500 font-prompt ml-1">{food.serving}</Text>
              </View>
            ) : null}
            {food.ingredient && (
              <Text className="text-xs text-gray-500 font-prompt" numberOfLines={2}>
                {food.ingredient}
              </Text>
            )}
          </View>
          
          {/* Kebab Menu */}
          <TouchableOpacity
            onPress={(event) => handleKebabPress(food, event)}
            className="w-8 h-8 rounded-full items-center justify-center"
          >
            <Icon name="ellipsis-vertical" size={20} color="#ffb800" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary px-4 py-4 mt-6 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity 
          className="w-10 h-10 rounded-lg items-center justify-center"
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <Text className="text-xl  text-white font-promptBold">จัดการเมนูอาหารของฉัน</Text>
        
        <TouchableOpacity 
          className="w-10 h-10 rounded-lg items-center justify-center"
          onPress={handleAddNewFood}
        >
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <View className="bg-gray-50 rounded-lg px-4 py-3 flex-row items-center">
          <Icon name="search" size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-3 text-gray-800 font-prompt"
            placeholder="ค้นหาเมนูอาหารของฉัน"
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Source Filter */}
        <View className="flex-row mt-3 space-x-3 gap-1">
          <TouchableOpacity
            className={`px-3 py-2 rounded-lg flex-row items-center ${
              sourceFilter === 'all' ? 'bg-primary' : 'bg-gray-200'
            }`}
            onPress={() => setSourceFilter('all')}
          >
            <Text className={`text-sm font-prompt ${
              sourceFilter === 'all' ? 'text-white' : 'text-gray-600'
            }`}>ทั้งหมด</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`px-3 py-2 rounded-lg flex-row items-center ${
              sourceFilter === 'user' ? 'bg-green-500' : 'bg-gray-200'
            }`}
            onPress={() => setSourceFilter('user')}
          >
            <Icon name="person" size={14} color={sourceFilter === 'user' ? 'white' : '#6b7280'} />
            <Text className={`text-sm ml-1 font-prompt ${
              sourceFilter === 'user' ? 'text-white' : 'text-gray-600'
            }`}>เพิ่มเอง</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`px-3 py-2 rounded-lg flex-row items-center ${
              sourceFilter === 'ai' ? 'bg-blue-500' : 'bg-gray-200'
            }`}
            onPress={() => setSourceFilter('ai')}
          >
            <Icon name="sparkles" size={14} color={sourceFilter === 'ai' ? 'white' : '#6b7280'} />
            <Text className={`text-sm ml-1 font-prompt ${
              sourceFilter === 'ai' ? 'text-white' : 'text-gray-600'
            }`}>จาก AI</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {isLoading && (
          <View className="items-center justify-center py-8">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-500 mt-2 font-prompt">กำลังโหลดเมนูอาหาร...</Text>
          </View>
        )}

        {!isLoading && (
          <>
            {/* User Foods List */}
            {userFoods.length > 0 ? (
              <View className="mb-6">
                <View className="flex-row items-center justify-between mb-3 px-1">
                  <Text className="text-lg font-semibold text-gray-800 font-prompt">🍽️ เมนูอาหารของฉัน</Text>
                  <Text className="text-sm text-gray-500 font-prompt">({userFoods.length} เมนู)</Text>
                </View>
                {userFoods.map(food => renderFoodCard(food))}
              </View>
            ) : !isLoading && (
              <View className="flex-1 items-center justify-center py-20">
                <Icon name="restaurant" size={48} color="#9ca3af" />
                <Text className="text-gray-500 mt-4 text-center font-prompt">
                  {searchQuery ? 'ไม่พบเมนูอาหารที่ค้นหา' : 'ยังไม่มีเมนูอาหารของคุณ'}
                </Text>
                <Text className="text-gray-400 text-center font-prompt">
                  {searchQuery ? 'ลองค้นหาด้วยคำอื่น' : 'เริ่มต้นด้วยการเพิ่มเมนูใหม่'}
                </Text>
                {!searchQuery && (
                  <TouchableOpacity
                    onPress={handleAddNewFood}
                    className="bg-primary rounded-xl px-6 py-3 mt-4"
                  >
                    <Text className="text-white font-semibold font-prompt">เพิ่มเมนูแรก</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Add New Food Button */}
      {userFoods.length > 0 && (
        <View className="bg-white px-4 py-4 border-t border-gray-100">
          <TouchableOpacity
            onPress={handleAddNewFood}
            className="bg-primary rounded-xl p-4 items-center justify-center"
          >
            <View className="flex-row items-center">
              <Icon name="add" size={20} color="white" />
              <Text className="text-white font-bold ml-2 font-prompt">เพิ่มเมนูใหม่</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      <Menu />

      {/* Kebab Menu Modal */}
      <KebabMenuMyFood
        visible={kebabMenuVisible}
        onClose={() => setKebabMenuVisible(false)}
        onEdit={handleEditFood}
        onDelete={handleDeleteFood}
        position={kebabMenuPosition}
      />
    </SafeAreaView>
  );
};

export default MyFood;
