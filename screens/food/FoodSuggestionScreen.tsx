import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../../hooks/Navigation';
import { apiClient } from '../../utils/apiClient';

interface FoodSuggestion {
  name: string;
  cal: number;
  carbs: number;
  protein: number;
  fat: number;
  ingredients: string[];
}

interface Props {
  route: {
    params: {
      suggestion: FoodSuggestion;
    };
  };
}

const FoodSuggestionScreen: React.FC<Props> = ({ route }) => {  
  const navigation = useTypedNavigation();
  const { suggestion } = route.params;

  const handleSaveToMyFood = async () => {
    try {
      const foodData = {
        name: suggestion.name,
        calories: suggestion.cal,
        carbs: suggestion.carbs,
        fat: suggestion.fat,
        protein: suggestion.protein,
        src: 'ai',
        ingredient: suggestion.ingredients.join(', '),
      };
      const result = await apiClient.addUserFood(foodData);
      if (result && result.success) {
        // Show success message or navigate
        alert('บันทึกเมนูนี้ในเมนูของฉันเรียบร้อยแล้ว!');
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึกเมนู');
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการบันทึกเมนู');
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity 
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4"
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">เมนูที่แนะนำ</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="bg-white mx-4 mt-6 p-6 rounded-lg shadow-md items-center">
          {/* Food Image Placeholder */}
          <View className="w-32 h-32 bg-primary rounded-full items-center justify-center mb-4">
            <Icon name="restaurant" size={48} color="white" />
          </View>
          <Text className="text-2xl font-bold text-primary mb-2">{suggestion.name}</Text>
          <Text className="text-gray-700 text-base mb-4">วัตถุดิบ: {suggestion.ingredients.join(', ')}</Text>

          <View className="flex-row justify-between w-full mb-4">
            <View className="flex-1 items-center">
              <Text className="text-lg font-semibold text-gray-800">{suggestion.cal}</Text>
              <Text className="text-gray-500 text-sm">แคลอรี่</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-lg font-semibold text-gray-800">{suggestion.protein}g</Text>
              <Text className="text-gray-500 text-sm">โปรตีน</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-lg font-semibold text-gray-800">{suggestion.carbs}g</Text>
              <Text className="text-gray-500 text-sm">คาร์บ</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-lg font-semibold text-gray-800">{suggestion.fat}g</Text>
              <Text className="text-gray-500 text-sm">ไขมัน</Text>
            </View>
          </View>

          {/* Save to My Food Button */}
          <TouchableOpacity 
            className="w-full bg-primary rounded-lg py-3 flex-row items-center justify-center mt-4"
            onPress={handleSaveToMyFood}
          >
            <Icon name="add-circle" size={24} color="white" />
            <Text className="text-white font-bold text-lg ml-2">เพิ่มเป็น menu ของฉัน</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default FoodSuggestionScreen;
