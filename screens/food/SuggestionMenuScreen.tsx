import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useTypedNavigation } from '../../hooks/Navigation';
import Icon from 'react-native-vector-icons/Ionicons';

/**
 * SuggestionMenuScreen Component
 * หน้าขอแนะนำเมนูอาหาร - ให้ AI แนะนำเมนูตามความต้องการ
 */
const SuggestionMenuScreen = () => {
  const navigation = useTypedNavigation();

  // State for meal type selection
  const [selectedMealType, setSelectedMealType] = useState('');
  const mealTypes = [
    { id: 'breakfast', label: 'มื้อเช้า', icon: 'sunny' },
    { id: 'lunch', label: 'มื้อกลางวัน', icon: 'partly-sunny' },
    { id: 'dinner', label: 'มื้อเย็น', icon: 'moon' },
    { id: 'snack', label: 'ของว่าง', icon: 'cafe' }
  ];

  // State for hunger level
  const [hungerLevel, setHungerLevel] = useState(1);
  const hungerLevels = ['น้อย', 'กลาง', 'มาก'];

  // State for ingredients
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState('');

  // State for food type
  const [selectedFoodType, setSelectedFoodType] = useState('');
  const foodTypes = [
    'อาหารไทย', 'อาหารจีน', 'อาหารญี่ปุ่น', 'อาหารเกาหลี',
    'อาหารอิตาเลียน', 'อาหารอเมริกัน', 'อาหารอินเดีย', 'อาหารเม็กซิกัน'
  ];

  // State for dietary restrictions
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const commonRestrictions = ['มังสวิรัติ', 'ไม่กินหมู'];
  const additionalRestrictions = [
    'ไม่กินเนื้อ', 'ไม่กินไข่', 'ไม่กินนม', 'ไม่กินถั่ว',
    'ไม่กินอาหารทะเล', 'ไม่กินเผ็ด', 'เบาหวาน', 'ความดันสูง'
  ];

  // State for complexity level
  const [complexityLevel, setComplexityLevel] = useState('');
  const complexityLevels = [
    { id: 'easy', label: 'ง่าย', icon: 'happy' },
    { id: 'medium', label: 'กลาง', icon: 'remove' },
    { id: 'hard', label: 'ยาก', icon: 'flame' }
  ];

  // State for showing additional restrictions
  const [showMoreRestrictions, setShowMoreRestrictions] = useState(false);

  const addIngredient = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim())) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient('');
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(item => item !== ingredient));
  };

  const toggleDietaryRestriction = (restriction: string) => {
    if (dietaryRestrictions.includes(restriction)) {
      setDietaryRestrictions(dietaryRestrictions.filter(item => item !== restriction));
    } else {
      setDietaryRestrictions([...dietaryRestrictions, restriction]);
    }
  };

  const handleGetSuggestion = () => {
    if (!selectedMealType) {
      Alert.alert('กรุณาเลือกมื้ออาหาร', 'โปรดเลือกมื้ออาหารที่ต้องการ');
      return;
    }

    // Here you would typically send the data to your AI service
    Alert.alert(
      'กำลังสร้างเมนูแนะนำ',
      'AI กำลังวิเคราะห์ความต้องการของคุณ...',
      [
        {
          text: 'ตกลง',
          onPress: () => {
            // Navigate to results or back
            navigation.goBack();
          }
        }
      ]
    );
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
        
        <Text className="text-xl font-bold text-gray-900">แนะนำเมนูอาหาร</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* AI Assistant Message */}
        <View className="bg-white mx-4 mt-6 p-4 rounded-lg shadow-sm">
          <View className="flex-row items-center mb-2">
            <Icon name="chatbubble-ellipses" size={24} color="#3b82f6" />
            <Text className="text-blue-600 font-semibold ml-2">AI Assistant</Text>
          </View>
          <Text className="text-gray-700">
            กรุณาบอกความต้องการของคุณเพื่อให้ AI แนะนำเมนูที่เหมาะสม
          </Text>
        </View>

        {/* Meal Type Selection */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-lg shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">เลือกมื้ออาหาร</Text>
          <View className="flex-row flex-wrap">
            {mealTypes.map((meal) => (
              <TouchableOpacity
                key={meal.id}
                className={`flex-1 min-w-[45%] p-3 m-1 rounded-lg border ${
                  selectedMealType === meal.id
                    ? 'bg-primary border-primary'
                    : 'bg-gray-50 border-gray-200'
                }`}
                onPress={() => setSelectedMealType(meal.id)}
              >
                <View className="items-center">
                  <Icon 
                    name={meal.icon} 
                    size={24} 
                    color={selectedMealType === meal.id ? 'white' : '#6b7280'} 
                  />
                  <Text className={`mt-1 font-medium ${
                    selectedMealType === meal.id ? 'text-white' : 'text-gray-700'
                  }`}>
                    {meal.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Hunger Level */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-lg shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">ระดับความหิว</Text>
          <View className="flex-row items-center justify-between px-2">
            {hungerLevels.map((level, index) => (
              <View key={index} className="items-center">
                <TouchableOpacity
                  className={`w-12 h-12 rounded-full items-center justify-center ${
                    hungerLevel === index ? 'bg-primary' : 'bg-gray-200'
                  }`}
                  onPress={() => setHungerLevel(index)}
                >
                  <Text className={`font-bold ${
                    hungerLevel === index ? 'text-white' : 'text-gray-600'
                  }`}>
                    {index + 1}
                  </Text>
                </TouchableOpacity>
                <Text className="text-sm text-gray-600 mt-1">{level}</Text>
              </View>
            ))}
          </View>
          {/* Slider track */}
          <View className="mt-4 mx-2">
            <View className="h-2 bg-gray-200 rounded-full">
              <View 
                className="h-2 bg-primary rounded-full"
                style={{ width: `${((hungerLevel + 1) / 3) * 100}%` }}
              />
            </View>
          </View>
        </View>

        {/* Ingredients */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-lg shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">วัตถุดิบ</Text>
          <View className="flex-row items-center mb-3">
            <TextInput
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mr-2"
              placeholder="พิมพ์ชื่อวัตถุดิบ..."
              value={currentIngredient}
              onChangeText={setCurrentIngredient}
              onSubmitEditing={addIngredient}
            />
            <TouchableOpacity
              className="w-10 h-10 bg-primary rounded-lg items-center justify-center"
              onPress={addIngredient}
            >
              <Icon name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap">
            {ingredients.map((ingredient, index) => (
              <TouchableOpacity
                key={index}
                className="bg-yellow-100 border border-yellow-300 rounded-full px-3 py-1 m-1 flex-row items-center"
                onPress={() => removeIngredient(ingredient)}
              >
                <Text className="text-yellow-800 mr-1">{ingredient}</Text>
                <Icon name="close" size={16} color="#d97706" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Food Type */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-lg shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">ประเภทอาหาร</Text>
          <View className="flex-row flex-wrap">
            {foodTypes.map((type) => (
              <TouchableOpacity
                key={type}
                className={`px-4 py-2 m-1 rounded-full border ${
                  selectedFoodType === type
                    ? 'bg-primary border-primary'
                    : 'bg-gray-50 border-gray-200'
                }`}
                onPress={() => setSelectedFoodType(type)}
              >
                <Text className={`${
                  selectedFoodType === type ? 'text-white' : 'text-gray-700'
                }`}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dietary Restrictions */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-lg shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">ข้อจำกัดทางอาหาร</Text>
          <View className="flex-row flex-wrap mb-3">
            {commonRestrictions.map((restriction) => (
              <TouchableOpacity
                key={restriction}
                className={`px-4 py-2 m-1 rounded-full border ${
                  dietaryRestrictions.includes(restriction)
                    ? 'bg-red-500 border-red-500'
                    : 'bg-gray-50 border-gray-200'
                }`}
                onPress={() => toggleDietaryRestriction(restriction)}
              >
                <Text className={`${
                  dietaryRestrictions.includes(restriction) ? 'text-white' : 'text-gray-700'
                }`}>
                  {restriction}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity
            className="flex-row items-center justify-center py-2"
            onPress={() => setShowMoreRestrictions(!showMoreRestrictions)}
          >
            <Text className="text-blue-600 mr-1">เพิ่มเติม</Text>
            <Icon 
              name={showMoreRestrictions ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#2563eb" 
            />
          </TouchableOpacity>

          {showMoreRestrictions && (
            <View className="flex-row flex-wrap mt-2">
              {additionalRestrictions.map((restriction) => (
                <TouchableOpacity
                  key={restriction}
                  className={`px-4 py-2 m-1 rounded-full border ${
                    dietaryRestrictions.includes(restriction)
                      ? 'bg-red-500 border-red-500'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                  onPress={() => toggleDietaryRestriction(restriction)}
                >
                  <Text className={`${
                    dietaryRestrictions.includes(restriction) ? 'text-white' : 'text-gray-700'
                  }`}>
                    {restriction}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Complexity Level */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-lg shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">ระดับความซับซ้อน</Text>
          <View className="flex-row justify-between">
            {complexityLevels.map((level) => (
              <TouchableOpacity
                key={level.id}
                className={`flex-1 p-3 mx-1 rounded-lg border ${
                  complexityLevel === level.id
                    ? 'bg-primary border-primary'
                    : 'bg-gray-50 border-gray-200'
                }`}
                onPress={() => setComplexityLevel(level.id)}
              >
                <View className="items-center">
                  <Icon 
                    name={level.icon} 
                    size={24} 
                    color={complexityLevel === level.id ? 'white' : '#6b7280'} 
                  />
                  <Text className={`mt-1 font-medium ${
                    complexityLevel === level.id ? 'text-white' : 'text-gray-700'
                  }`}>
                    {level.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Get Suggestion Button */}
        <View className="mx-4 mt-6 mb-8">
          <TouchableOpacity
            className="bg-primary rounded-xl p-4 flex-row items-center justify-center shadow-md"
            onPress={handleGetSuggestion}
          >
            <Icon name="sparkles" size={24} color="white" />
            <Text className="text-white font-bold text-lg ml-2">ขอแนะนำเมนู</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default SuggestionMenuScreen;
