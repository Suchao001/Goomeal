import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useTypedNavigation } from '../../hooks/Navigation';
import Icon from 'react-native-vector-icons/Ionicons';
import { ApiClient } from 'utils/apiClient';

/**
 * SuggestionMenuScreen Component
 * หน้าขอแนะนำเมนูอาหาร - ให้ AI แนะนำเมนูตามความต้องการ
 */
const SuggestionMenuScreen = () => {
  const navigation = useTypedNavigation();
  const apiClient = new ApiClient();

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

  // State for loading indicator
  const [loading, setLoading] = useState(false);

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

  const handleGetSuggestion = async () => {
    try {
      setLoading(true);
      // Prepare data from form state
      const payload = {
        mealType: selectedMealType,
        hungerLevel: hungerLevel + 1,
        ingredients,
        foodType: selectedFoodType,
        dietaryRestrictions,
        complexityLevel,
      };
      const response = await apiClient.suggestFood(payload);
      setLoading(false);
      if (response.success && response.data?.answer) {
        // Navigate to FoodSuggestionScreen with suggestion data
        navigation.navigate('FoodSuggestion', { suggestion: response.data.answer });
      } else {
        Alert.alert('เกิดข้อผิดพลาด', response.error || 'ไม่สามารถขอคำแนะนำจาก AI ได้');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อ AI ได้');
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity 
          className="w-10 h-10  items-center justify-center mr-4"
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#ffb800" />
        </TouchableOpacity>
        
        <Text className="text-xl font-promptBold text-gray-900">แนะนำเมนูอาหาร</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* AI Assistant Message */}
        <View className="bg-white mx-4 mt-6 p-4 rounded-xl shadow-sm">
          <View className="flex-row items-center mb-2">
            <Icon name="sparkles" size={24} color="#ffb800" />
            <Text className="text-primary font-promptSemiBold ml-2">AI Assistant</Text>
          </View>
          <Text className="text-gray-700 font-promptMedium">
            กรุณาบอกความต้องการของคุณเพื่อให้ AI แนะนำเมนูที่เหมาะสม
          </Text>
        </View>

        {/* Meal Type Selection */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-sm">
          <Text className="text-lg font-promptSemiBold text-gray-800 mb-3">เลือกมื้ออาหาร</Text>
          <View className="flex-row flex-wrap">
            {mealTypes.map((meal) => (
              <TouchableOpacity
                key={meal.id}
                className={`flex-1 min-w-[45%] p-3 m-1 rounded-xl border-2 ${
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
                  <Text className={`mt-1 font-promptMedium ${
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
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-sm">
          <Text className="text-lg font-promptSemiBold text-gray-800 mb-3">ระดับความหิว</Text>
          <View className="flex-row items-center justify-between px-2">
            {hungerLevels.map((level, index) => (
              <View key={index} className="items-center">
                <TouchableOpacity
                  className={`w-14 h-14 rounded-full items-center justify-center border-2 ${
                    hungerLevel === index ? 'bg-primary border-primary' : 'bg-gray-100 border-gray-200'
                  }`}
                  onPress={() => setHungerLevel(index)}
                >
                  <Text className={`font-promptBold ${
                    hungerLevel === index ? 'text-white' : 'text-gray-600'
                  }`}>
                    {index + 1}
                  </Text>
                </TouchableOpacity>
                <Text className="text-sm text-gray-600 mt-1 font-promptRegular">{level}</Text>
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
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-sm">
          <Text className="text-lg font-promptSemiBold text-gray-800 mb-3">วัตถุดิบที่มี</Text>
          <View className="flex-row items-center mb-3">
            <TextInput
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mr-2 font-promptRegular"
              placeholder="พิมพ์ชื่อวัตถุดิบ..."
              value={currentIngredient}
              onChangeText={setCurrentIngredient}
              onSubmitEditing={addIngredient}
            />
            <TouchableOpacity
              className="w-12 h-12 bg-primary rounded-xl items-center justify-center"
              onPress={addIngredient}
            >
              <Icon name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap">
            {ingredients.map((ingredient, index) => (
              <TouchableOpacity
                key={index}
                className="bg-green-100 border border-green-300 rounded-full px-3 py-1 m-1 flex-row items-center"
                onPress={() => removeIngredient(ingredient)}
              >
                <Text className="text-green-800 mr-1 font-promptMedium">{ingredient}</Text>
                <Icon name="close" size={16} color="#059669" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Food Type */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-sm">
          <Text className="text-lg font-promptSemiBold text-gray-800 mb-3">ประเภทอาหารที่ต้องการ</Text>
          <View className="flex-row flex-wrap">
            {foodTypes.map((type) => (
              <TouchableOpacity
                key={type}
                className={`px-4 py-2 m-1 rounded-full border-2 ${
                  selectedFoodType === type
                    ? 'bg-primary border-primary'
                    : 'bg-gray-50 border-gray-200'
                }`}
                onPress={() => setSelectedFoodType(type)}
              >
                <Text className={`font-promptMedium ${
                  selectedFoodType === type ? 'text-white' : 'text-gray-700'
                }`}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dietary Restrictions */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-sm">
          <Text className="text-lg font-promptSemiBold text-gray-800 mb-3">ข้อจำกัดทางอาหาร</Text>
          <View className="flex-row flex-wrap mb-3">
            {commonRestrictions.map((restriction) => (
              <TouchableOpacity
                key={restriction}
                className={`px-4 py-2 m-1 rounded-full border-2 ${
                  dietaryRestrictions.includes(restriction)
                    ? 'bg-red-500 border-red-500'
                    : 'bg-gray-50 border-gray-200'
                }`}
                onPress={() => toggleDietaryRestriction(restriction)}
              >
                <Text className={`font-promptMedium ${
                  dietaryRestrictions.includes(restriction) ? 'text-white' : 'text-gray-700'
                }`}>
                  {restriction}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity
            className="flex-row items-center justify-center py-2 bg-gray-50 rounded-xl"
            onPress={() => setShowMoreRestrictions(!showMoreRestrictions)}
          >
            <Text className="text-primary font-promptMedium mr-1">เพิ่มเติม</Text>
            <Icon 
              name={showMoreRestrictions ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#ffb800" 
            />
          </TouchableOpacity>

          {showMoreRestrictions && (
            <View className="flex-row flex-wrap mt-2">
              {additionalRestrictions.map((restriction) => (
                <TouchableOpacity
                  key={restriction}
                  className={`px-4 py-2 m-1 rounded-full border-2 ${
                    dietaryRestrictions.includes(restriction)
                      ? 'bg-red-500 border-red-500'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                  onPress={() => toggleDietaryRestriction(restriction)}
                >
                  <Text className={`font-promptMedium ${
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
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-sm">
          <Text className="text-lg font-promptSemiBold text-gray-800 mb-3">ระดับความซับซ้อน</Text>
          <View className="flex-row justify-between">
            {complexityLevels.map((level) => (
              <TouchableOpacity
                key={level.id}
                className={`flex-1 p-4 mx-1 rounded-xl border-2 ${
                  complexityLevel === level.id
                    ? 'bg-primary border-primary'
                    : 'bg-gray-50 border-gray-200'
                }`}
                onPress={() => setComplexityLevel(level.id)}
              >
                <View className="items-center">
                  <Icon 
                    name={level.icon} 
                    size={28} 
                    color={complexityLevel === level.id ? 'white' : '#6b7280'} 
                  />
                  <Text className={`mt-2 font-promptMedium ${
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
            className={`bg-primary rounded-xl p-4 flex-row items-center justify-center shadow-lg ${loading ? 'opacity-60' : ''}`}
            onPress={handleGetSuggestion}
            disabled={loading}
          >
            {loading ? (
              <Icon name="sync" size={24} color="white" style={{ marginRight: 8 }} />
            ) : (
              <Icon name="sparkles" size={24} color="white" />
            )}
            <Text className="text-white font-promptBold text-lg ml-2">
              {loading ? 'กำลังขอเมนู...' : 'ขอแนะนำเมนู'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default SuggestionMenuScreen;
