import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useTypedNavigation } from '../../hooks/Navigation';
import { ArrowLeft } from '../../components/GeneralMaterial';
import { useState, useEffect } from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';

// Type definitions for navigation
type PromptForm2RouteParams = {
  data?: {
    selectedDuration: string;
    customDays?: string;
    selectedCategories: string[];
    selectedBudget: string;
  };
};

type PromptForm2RouteProp = RouteProp<{ PromptForm2: PromptForm2RouteParams }, 'PromptForm2'>;

const PromptForm2 = () => {
  const navigation = useTypedNavigation();
  const route = useRoute<PromptForm2RouteProp>();
  
  // Variety level state
  const [varietyLevel, setVarietyLevel] = useState<'low' | 'medium' | 'high' | ''>('');
  
  // Ingredients state
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [customIngredient, setCustomIngredient] = useState('');

  useEffect(() => {
    console.log('Screen: PromptForm2');
    // Get data from previous screen
    const prevData = route.params?.data;
    console.log('Previous form data:', prevData);
  }, []);

  // Popular ingredients list
  const popularIngredients = [
    { key: 'chicken', label: 'ไก่', icon: '🐔' },
    { key: 'pork', label: 'หมู', icon: '🐷' },
    { key: 'beef', label: 'เนื้อ', icon: '🐄' },
    { key: 'fish', label: 'ปลา', icon: '🐟' },
    { key: 'shrimp', label: 'กุ้ง', icon: '🦐' },
    { key: 'egg', label: 'ไข่', icon: '🥚' },
    { key: 'vegetables', label: 'ผัก', icon: '🥬' },
    { key: 'rice', label: 'ข้าว', icon: '🍚' },
    { key: 'noodles', label: 'เส้น', icon: '🍜' },
    { key: 'tofu', label: 'เต้าหู้', icon: '🧊' },
    { key: 'coconut', label: 'มะพร้าว', icon: '🥥' },
    { key: 'mushroom', label: 'เห็ด', icon: '🍄' }
  ];

  // Variety level options
  const varietyOptions = [
    {
      key: 'low',
      title: 'หลากหลายน้อย',
      description: 'อาหารคุ้นเคย ทำง่าย ใช้วัตถุดิบพื้นฐาน',
      icon: '📋'
    },
    {
      key: 'medium',
      title: 'หลากหลายปานกลาง',
      description: 'ผสมผสานอาหารใหม่ๆ กับของเดิม',
      icon: '🎯'
    },
    {
      key: 'high',
      title: 'หลากหลายมาก',
      description: 'ลองของใหม่ทุกมื้อ ท้าทายรสชาติ',
      icon: '🌟'
    }
  ];

  const handleIngredientToggle = (ingredientKey: string) => {
    setSelectedIngredients(prev => 
      prev.includes(ingredientKey) 
        ? prev.filter(key => key !== ingredientKey)
        : [...prev, ingredientKey]
    );
  };

  const handleAddCustomIngredient = () => {
    const ingredient = customIngredient.trim();
    if (ingredient && !selectedIngredients.includes(ingredient)) {
      setSelectedIngredients(prev => [...prev, ingredient]);
      setCustomIngredient('');
    }
  };

  const handleRemoveIngredient = (ingredientToRemove: string) => {
    setSelectedIngredients(prev => prev.filter(ing => ing !== ingredientToRemove));
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    // Validate form
    if (!varietyLevel) {
      Alert.alert('กรุณาเลือกระดับความหลากหลาย', 'เพื่อให้ระบบสร้างแผนอาหารที่เหมาะสมกับคุณ');
      return;
    }

    if (selectedIngredients.length === 0) {
      Alert.alert('กรุณาเลือกวัตถุดิบ', 'เลือกวัตถุดิบที่คุณชื่นชอบอย่างน้อย 1 รายการ');
      return;
    }

    // Prepare data to pass to next screen
    const formData = {
      ...route.params?.data,
      varietyLevel,
      selectedIngredients
    };

    // Navigate to next screen
    navigation.navigate('PromptForm3', { data: formData });
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Back Arrow */}
      <ArrowLeft />

      {/* Header Text */}
      <View className="px-6 mt-20 mb-8">
        <Text className="text-3xl text-gray-800 mb-2 font-promptSemiBold text-center">
          ความหลากหลาย
          และวัตถุดิบ
        </Text>
        <Text className="text-gray-600 mb-2 font-promptMedium text-lg text-center">
          เลือกระดับความหลากหลายและวัตถุดิบที่ชอบ
        </Text>
        <Text className="text-primary font-promptMedium text-base text-center">
          หน้า 2/3
        </Text>
      </View>

      <View className="px-6">
        {/* Variety Level Selection */}
        <View className="mb-8">
          <Text className="text-gray-800 mb-4 font-promptSemiBold text-lg">
            🎯 ระดับความหลากหลาย
          </Text>
          <View className="space-y-3">
            {varietyOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                className={`rounded-xl p-4 border-2 ${
                  varietyLevel === option.key
                    ? 'bg-primary border-primary'
                    : 'bg-white border-gray-200'
                }`}
                onPress={() => setVarietyLevel(option.key as 'low' | 'medium' | 'high')}
              >
                <View className="flex-row items-start">
                  <Text className="text-2xl mr-3">{option.icon}</Text>
                  <View className="flex-1">
                    <Text className={`font-promptSemiBold text-lg mb-1 ${
                      varietyLevel === option.key ? 'text-white' : 'text-gray-800'
                    }`}>
                      {option.title}
                    </Text>
                    <Text className={`font-promptLight text-sm ${
                      varietyLevel === option.key ? 'text-white/90' : 'text-gray-600'
                    }`}>
                      {option.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Popular Ingredients */}
        <View className="mb-6">
          <Text className="text-gray-800 mb-4 font-promptSemiBold text-lg">
            🥘 วัตถุดิบที่นิยม
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {popularIngredients.map((ingredient) => (
              <TouchableOpacity
                key={ingredient.key}
                className={`rounded-full px-3 py-2 mr-1 mb-2 flex-row items-center ${
                  selectedIngredients.includes(ingredient.key)
                    ? 'bg-[#77dd77] border-2 border-[#77dd77]'
                    : 'bg-gray-100 border border-gray-200'
                }`}
                onPress={() => handleIngredientToggle(ingredient.key)}
              >
                <Text className="mr-1 text-sm">{ingredient.icon}</Text>
                <Text className={`font-promptMedium text-sm ${
                  selectedIngredients.includes(ingredient.key) ? 'text-white' : 'text-gray-700'
                }`}>
                  {ingredient.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Ingredient Input */}
        <View className="mb-6">
          <Text className="text-gray-800 mb-3 font-promptSemiBold text-base">
            ➕ เพิ่มวัตถุดิบที่ชอบ
          </Text>
          <View className="flex-row gap-2">
            <TextInput
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 font-promptRegular"
              placeholder="เช่น ปลาทู, ใบมะกรูด, พริกแกง..."
              value={customIngredient}
              onChangeText={setCustomIngredient}
              onSubmitEditing={handleAddCustomIngredient}
            />
            <TouchableOpacity
              className="bg-primary rounded-lg px-4 py-2 justify-center"
              onPress={handleAddCustomIngredient}
              disabled={!customIngredient.trim()}
            >
              <Text className="text-white font-promptBold text-sm">เพิ่ม</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Selected Ingredients Display */}
        {selectedIngredients.length > 0 && (
          <View className="mb-8">
            <Text className="text-gray-800 mb-3 font-promptSemiBold text-base">
              ✅ วัตถุดิบที่เลือก ({selectedIngredients.length})
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {selectedIngredients.map((ingredient, index) => {
                // Check if it's a popular ingredient or custom
                const popularItem = popularIngredients.find(item => item.key === ingredient);
                return (
                  <View
                    key={index}
                    className="bg-[#77dd77] rounded-full px-3 py-2 mr-1 mb-2 flex-row items-center"
                  >
                    {popularItem && <Text className="mr-1 text-sm">{popularItem.icon}</Text>}
                    <Text className="text-white font-promptMedium text-sm mr-2">
                      {popularItem ? popularItem.label : ingredient}
                    </Text>
                    <TouchableOpacity onPress={() => handleRemoveIngredient(ingredient)}>
                      <Text className="text-white font-promptBold text-sm">×</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* Navigation Buttons */}
      <View className="px-6 pb-8">
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 border-2 border-primary rounded-xl p-4 justify-center items-center"
            onPress={handleBack}
          >
            <Text className="text-primary text-lg font-promptBold">กลับ</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="flex-1 bg-primary rounded-xl p-4 justify-center items-center"
            onPress={handleNext}
          >
            <Text className="text-white text-lg font-promptBold">ต่อไป</Text>
          </TouchableOpacity>
        </View>
        
        {/* Progress indicator */}
        <View className="flex-row justify-center mt-4 space-x-2">
          <View className="w-8 h-2 bg-gray-300 rounded-full" />
          <View className="w-8 h-2 bg-primary rounded-full" />
          <View className="w-8 h-2 bg-gray-300 rounded-full" />
        </View>
      </View>
    </ScrollView>
  );
};

export default PromptForm2;
