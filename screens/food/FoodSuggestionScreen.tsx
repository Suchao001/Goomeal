import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../../hooks/Navigation';
import { RouteProp, useRoute } from '@react-navigation/native';
import { apiClient } from '../../utils/apiClient';
import { RootStackParamList } from '../../types/navigation';
import { base_url } from 'config';
import { Image } from 'react-native';

const PRIMARY = '#ffb800';
const SECONDARY = '#77dd77';

interface FoodSuggestion {
  name: string;
  cal: number;
  carbs: number;
  protein: number;
  fat: number;
  img?: string;
  ingredients: string[];
}

type FoodSuggestionScreenRouteProp = RouteProp<RootStackParamList, 'FoodSuggestion'>;



const FoodSuggestionScreen: React.FC = () => {
  const navigation = useTypedNavigation();
  const route = useRoute<FoodSuggestionScreenRouteProp>();
  const { suggestion } = route.params;

  const handleSaveToMyFood = async () => {
    try {
      const foodData = {
        name: suggestion.name,
        calories: suggestion.cal,
        carbs: suggestion.carbs,
        fat: suggestion.fat,
        protein: suggestion.protein,
        img: suggestion.img,
        src: 'ai',
        ingredient: suggestion.ingredients.join(', '),
      };
      const result = await apiClient.addUserFood(foodData);
      if (result && result.success) {
        Alert.alert('สำเร็จ', 'บันทึกเมนูนี้ในเมนูของฉันเรียบร้อยแล้ว!', [
          { text: 'ตกลง', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('ผิดพลาด', 'เกิดข้อผิดพลาดในการบันทึกเมนู');
      }
    } catch {
      Alert.alert('ผิดพลาด', 'เกิดข้อผิดพลาดในการบันทึกเมนู');
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 flex-row items-center border-b shadow-slate-500 shadow-md border-gray-100">
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center mr-3 rounded-full"
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={22} color={PRIMARY} />
        </TouchableOpacity>
        <Text className="text-xl font-promptBold text-gray-900">เมนูที่แนะนำ</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="bg-white mx-4 mt-6 p-6 rounded-2xl border border-gray-100 shadow-md shadow-slate-600">
          {/* Avatar */}
          
          <View
          className="w-28 h-28 rounded-full items-center justify-center mx-auto mb-5"
          style={{
            backgroundColor: 'rgba(255,184,0,0.12)', // primary soft
            borderWidth: 1,
            borderColor: 'rgba(255,184,0,0.25)',
          }}
        >
          {suggestion.img ? (
            <Image
              source={{ uri: `${base_url}${suggestion.img}` }}
              style={{ width: '100%', height: '100%', borderRadius: 999 }}
              resizeMode="cover"
            />
          ) : (
            <Icon name="fast-food-outline" size={40} color={PRIMARY} />
          )}
        </View>

          {/* Title */}
          <Text style={{ lineHeight: 30 }}  className="text-2xl font-promptBold text-center text-gray-900 mb-2">
            {suggestion.name}
          </Text>

          {/* Ingredients chips (ใช้สีรองแบบอ่อน) */}
          <View className="mt-3 mb-6">
            <Text className="text-gray-700 font-prompt mb-2">วัตถุดิบ</Text>
            <View className="flex-row flex-wrap">
              {suggestion.ingredients.map((ing, idx) => (
                <View
                  key={`${ing}-${idx}`}
                  className="px-3 py-1.5 rounded-full mr-2 mb-2"
                  style={{
                    backgroundColor: 'rgba(119,221,119,0.14)', // secondary soft
                    borderWidth: 1,
                    borderColor: 'rgba(119,221,119,0.25)',
                  }}
                >
                  <Text className="text-gray-700 text-xs font-prompt">{ing}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Macros */}
          <View className="flex-row justify-between w-full">
            {/* Calories (primary) */}
            <View className="flex-1 items-center px-2">
              <View
                className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mb-2"
              
              >
                <Icon name="flame-outline" size={18} color="red" />
              </View>
              <Text className="text-lg font-promptSemiBold text-gray-900">
                {suggestion.cal}
              </Text>
              <Text className="text-gray-500 text-xs font-prompt mt-0.5">แคลอรี่</Text>
            </View>

            {/* Protein (เทาเรียบ) */}
            <View className="flex-1 items-center px-2">
              <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mb-2 border border-transparent ">
                <Icon name="barbell-outline" size={18} color="#ef4444" />
              </View>
              <Text className="text-lg font-promptSemiBold text-gray-900">
                {suggestion.protein}g
              </Text>
              <Text className="text-gray-500 text-xs font-prompt mt-0.5">โปรตีน</Text>
            </View>

            {/* Carbs (เทาเรียบ) */}
            <View className="flex-1 items-center px-2">
              <View className="w-10 h-10 rounded-full bg-green-200 items-center justify-center mb-2 border border-transparent">
                <Icon name="leaf-outline" size={18} color="#22c55e" />
              </View>
              <Text className="text-lg font-promptSemiBold text-gray-900">
                {suggestion.carbs}g
              </Text>
              <Text className="text-gray-500 text-xs font-prompt mt-0.5">คาร์บ</Text>
            </View>

            {/* Fat (เทาเรียบ) */}
            <View className="flex-1 items-center px-2">
              <View className="w-10 h-10 rounded-full bg-orange-200 items-center justify-center mb-2 border border-transparent">
                <Icon name="water-outline" size={18} color="#f59e0b" />
              </View>
              <Text className="text-lg font-promptSemiBold text-gray-900">
                {suggestion.fat}g
              </Text>
              <Text className="text-gray-500 text-xs font-prompt mt-0.5">ไขมัน</Text>
            </View>
          </View>

          {/* Divider */}
          <View className="h-[1px] bg-gray-100 my-6" />

          {/* Save button (primary) */}
          <TouchableOpacity
            className="w-full rounded-xl py-3.5 flex-row items-center justify-center"
            style={{ backgroundColor: PRIMARY }}
            onPress={handleSaveToMyFood}
            activeOpacity={0.85}
          >
            <Icon name="add-circle-outline" size={22} color="#ffffff" />
            <Text className="text-white font-promptBold text-base ml-2">
              เพิ่มเป็นเมนูของฉัน
            </Text>
          </TouchableOpacity>

      
         
        </View>
      </ScrollView>
    </View>
  );
};

export default FoodSuggestionScreen;
