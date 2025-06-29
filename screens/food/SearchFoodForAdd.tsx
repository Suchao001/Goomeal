import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Image } from 'react-native';
import { useTypedNavigation } from '../../hooks/Navigation';
import Icon from 'react-native-vector-icons/Ionicons';
import Menu from '../material/Menu';

interface FoodItem {
  id: string;
  name: string;
  image: string;
  calories: number;
  carbs: number;
  protein: number;
  tags: string[];
}


const SearchFoodForAdd = () => {
  const navigation = useTypedNavigation();
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const [foodItems] = useState<FoodItem[]>([
    {
      id: '1',
      name: 'น้ำแดง',
      image: 'https://via.placeholder.com/60x60/ff6b6b/ffffff?text=🍛',
      calories: 450,
      carbs: 65,
      protein: 20,
      tags: ['เผ็ด', 'ไทย']
    },
    {
      id: '2', 
      name: 'น้ำแดงเผ็ด',
      image: 'https://via.placeholder.com/60x60/ff6b6b/ffffff?text=🍜',
      calories: 480,
      carbs: 70,
      protein: 22,
      tags: ['เผ็ดมาก', 'ไทย']
    },
    {
      id: '3',
      name: 'ผัดกะเพรา',
      image: 'https://via.placeholder.com/60x60/4ecdc4/ffffff?text=�',
      calories: 420,
      carbs: 55,
      protein: 25,
      tags: ['เผ็ด', 'ใส่ไข่']
    }
  ]);  
  const [recommendedFoods] = useState<FoodItem[]>([
    {
      id: '4',
      name: 'ข้าวผัดกุ้ง',
      image: 'https://via.placeholder.com/60x60/45b7d1/ffffff?text=�',
      calories: 380,
      carbs: 60,
      protein: 18,
      tags: ['ทะเล', 'ข้าว']
    },
    {
      id: '5',
      name: 'ต้มยำกุ้ง',
      image: 'https://via.placeholder.com/60x60/f39c12/ffffff?text=�',
      calories: 150,
      carbs: 20,
      protein: 12,
      tags: ['เปรี้ยว', 'เผ็ด', 'ทะเล']
    },
    {
      id: '6',
      name: 'สลัดผักรวม',
      image: 'https://via.placeholder.com/60x60/2ecc71/ffffff?text=🥗',
      calories: 120,
      carbs: 15,
      protein: 8,
      tags: ['ผัก', 'สุขภาพ']
    }
  ]);  
  const filteredRecentFoods = foodItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredRecommendedFoods = recommendedFoods.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddFood = (food: FoodItem) => {
    console.log('เพิ่มอาหาร:', food.name);
    navigation.goBack();
  };

  const handleAddNewMenu = () => {
    navigation.navigate('AddNewFood');
  };

  const renderFoodCard = (food: FoodItem) => (
    <View key={food.id} className="bg-white rounded-lg p-4 mb-3 flex-row items-center shadow-sm">
      <View className="w-16 h-16 rounded-lg bg-gray-100 items-center justify-center mr-4">
        <Text className="text-2xl">🍽️</Text>
      </View>
      
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-800 mb-1">{food.name}</Text>
        <View className="flex-row items-center mb-2">
          <Text className="text-sm text-gray-600 mr-4">{food.calories} kcal</Text>
          <Text className="text-sm text-gray-600 mr-4">{food.carbs}g คาร์บ</Text>
          <Text className="text-sm text-gray-600">{food.protein}g โปรตีน</Text>
        </View>
        <View className="flex-row items-center">
          {food.tags.map((tag, index) => (
            <View key={index} className="bg-gray-100 rounded-full px-2 py-1 mr-2">
              <Text className="text-xs text-gray-600">{tag}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <TouchableOpacity
        onPress={() => handleAddFood(food)}
        className="w-10 h-10 bg-blue-300 rounded-full items-center justify-center"
      >
        <Icon name="add" size={20} color="blue" />
      </TouchableOpacity>
    </View>
  );

  const renderFoodSection = (title: string, foods: FoodItem[]) => {
    if (foods.length === 0) return null;
    
    return (
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-3 px-1">{title}</Text>
        {foods.map(food => renderFoodCard(food))}
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
        
        <Text className="text-xl font-bold text-white">เลือกอาหาร</Text>
        
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
        {renderFoodSection('รายการอาหารล่าสุด', filteredRecentFoods)}
        {renderFoodSection('รายการอาหารที่แนะนำตามแผนการกิน', filteredRecommendedFoods)}
        
        {(filteredRecentFoods.length === 0 && filteredRecommendedFoods.length === 0) && (
          <View className="flex-1 items-center justify-center py-20">
            <Icon name="search" size={48} color="#9ca3af" />
            <Text className="text-gray-500 mt-4 text-center">ไม่พบอาหารที่ค้นหา</Text>
            <Text className="text-gray-400 text-center">ลองค้นหาด้วยคำอื่น</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={handleAddNewMenu}
          className="bg-primary rounded-xl p-4 items-center justify-center mx-4 mb-4"
        >
          <View className="flex-row items-center">
            <Icon name="add" size={20} color="white" />
            <Text className="text-white font-bold ml-2">+ เพิ่มเมนูใหม่</Text>
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
