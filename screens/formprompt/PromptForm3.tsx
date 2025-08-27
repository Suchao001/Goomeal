import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useTypedNavigation } from '../../hooks/Navigation';
import { ArrowLeft } from '../../components/GeneralMaterial';
import { useState, useEffect } from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

// Type definitions for navigation
type PromptForm3RouteParams = {
  data?: {
    selectedDuration: string;
    customDays?: string;
    selectedCategories: string[];
    selectedBudget: string;
    varietyLevel: string;
    selectedIngredients: string[];
  };
};

type PromptForm3RouteProp = RouteProp<{ PromptForm3: PromptForm3RouteParams }, 'PromptForm3'>;

const PromptForm3 = () => {
  const navigation = useTypedNavigation();
  const route = useRoute<PromptForm3RouteProp>();
  
  // Additional requirements state
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  
  // Character count
  const maxCharacters = 500;
  
  useEffect(() => {
    console.log('Screen: PromptForm3');
    // Get data from previous screens
    const prevData = route.params?.data;
    console.log('All previous form data:', prevData);
  }, []);

  // Dietary restrictions
  const dietaryRestrictions = [
    { key: 'halal', label: 'อาหารฮาลาล', icon: '☪️' },
    { key: 'vegetarian', label: 'เจ', icon: '🥬' },
    { key: 'no-pork', label: 'ไม่ทานหมู', icon: '🚫🐷' },
    { key: 'no-beef', label: 'ไม่ทานเนื้อ', icon: '🚫🐄' },
    { key: 'no-seafood', label: 'ไม่ทานอาหารทะเล', icon: '🚫🦐' },
    { key: 'no-spicy', label: 'ไม่ทานเผ็ด', icon: '🚫🌶️' },
    { key: 'low-sodium', label: 'ลดเกลือ', icon: '🧂' },
    { key: 'no-sugar', label: 'ไม่ทานหวาน', icon: '🚫🍭' }
  ];

  // Health goals
  const healthGoals = [
    { key: 'weight-loss', label: 'ลดน้ำหนัก', icon: '⚖️' },
    { key: 'muscle-gain', label: 'เพิ่มกล้ามเนื้อ', icon: '💪' },
    { key: 'maintain', label: 'คงน้ำหนัก', icon: '🎯' },
    { key: 'energy', label: 'เพิ่มพลังงาน', icon: '⚡' },
    { key: 'health', label: 'สุขภาพดี', icon: '❤️' },
    { key: 'digestion', label: 'ระบบย่อยดี', icon: '🌱' }
  ];

  const handleRestrictionToggle = (restrictionKey: string) => {
    setSelectedRestrictions(prev => 
      prev.includes(restrictionKey) 
        ? prev.filter(key => key !== restrictionKey)
        : [...prev, restrictionKey]
    );
  };

  const handleGoalToggle = (goalKey: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalKey) 
        ? prev.filter(key => key !== goalKey)
        : [...prev, goalKey]
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSubmit = () => {
    // Validate form
    if (additionalRequirements.trim().length < 10 && selectedRestrictions.length === 0 && selectedGoals.length === 0) {
      Alert.alert(
        'กรุณากรอกข้อมูล',
        'กรุณาเลือกข้อจำกัดในการรับประทาน หรือเป้าหมาย หรือกรอกความต้องการเพิ่มเติมอย่างน้อย 10 ตัวอักษร'
      );
      return;
    }

    // Collect all form data
    const finalFormData = {
      ...route.params?.data,
      additionalRequirements: additionalRequirements.trim(),
      selectedRestrictions,
      selectedGoals
    };
    
    console.log('Final Form Data:', finalFormData);
    
    // Show success message
    Alert.alert(
      'สำเร็จ!',
      'ระบบกำลังสร้างแผนการกินสำหรับคุณ',
      [
        {
          text: 'ตกลง',
          onPress: () => {
            // TODO: Navigate to result screen or processing screen
            navigation.navigate('Home');
          }
        }
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Back Arrow */}
      <ArrowLeft />

      {/* Header Text */}
      <View className="px-6 mt-20 mb-8">
        <Text className="text-3xl text-gray-800 mb-2 font-promptSemiBold text-center">
          ความต้องการ
          เพิ่มเติม
        </Text>
        <Text className="text-gray-600 mb-2 font-promptMedium text-lg text-center">
          บอกเราเกี่ยวกับข้อจำกัดและเป้าหมายของคุณ
        </Text>
        <Text className="text-primary font-promptMedium text-base text-center">
          หน้า 3/3
        </Text>
      </View>

      <View className="px-6">
        {/* Dietary Restrictions */}
        <View className="mb-8">
          <Text className="text-gray-800 mb-4 font-promptSemiBold text-lg">
            🚫 ข้อจำกัดในการรับประทาน
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {dietaryRestrictions.map((restriction) => (
              <TouchableOpacity
                key={restriction.key}
                className={`rounded-full px-3 py-2 mr-1 mb-2 flex-row items-center ${
                  selectedRestrictions.includes(restriction.key)
                    ? 'bg-red-100 border-2 border-red-400'
                    : 'bg-gray-100 border border-gray-200'
                }`}
                onPress={() => handleRestrictionToggle(restriction.key)}
              >
                <Text className="mr-1 text-sm">{restriction.icon}</Text>
                <Text className={`font-promptMedium text-sm ${
                  selectedRestrictions.includes(restriction.key) ? 'text-red-700' : 'text-gray-700'
                }`}>
                  {restriction.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {selectedRestrictions.length > 0 && (
            <Text className="text-red-600 font-promptLight text-sm mt-2">
              ✓ เลือกข้อจำกัด {selectedRestrictions.length} รายการ
            </Text>
          )}
        </View>

        {/* Health Goals */}
        <View className="mb-8">
          <Text className="text-gray-800 mb-4 font-promptSemiBold text-lg">
            🎯 เป้าหมายสุขภาพ
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {healthGoals.map((goal) => (
              <TouchableOpacity
                key={goal.key}
                className={`rounded-full px-3 py-2 mr-1 mb-2 flex-row items-center ${
                  selectedGoals.includes(goal.key)
                    ? 'bg-[#77dd77] border-2 border-[#77dd77]'
                    : 'bg-gray-100 border border-gray-200'
                }`}
                onPress={() => handleGoalToggle(goal.key)}
              >
                <Text className="mr-1 text-sm">{goal.icon}</Text>
                <Text className={`font-promptMedium text-sm ${
                  selectedGoals.includes(goal.key) ? 'text-white' : 'text-gray-700'
                }`}>
                  {goal.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {selectedGoals.length > 0 && (
            <Text className="text-[#77dd77] font-promptLight text-sm mt-2">
              ✓ เลือกเป้าหมาย {selectedGoals.length} รายการ
            </Text>
          )}
        </View>

        {/* Additional Requirements Text Input */}
        <View className="mb-8">
          <Text className="text-gray-800 mb-4 font-promptSemiBold text-lg">
            💬 ความต้องการเพิ่มเติม
          </Text>
          <Text className="text-gray-600 font-promptLight text-sm mb-3">
            บอกเราเกี่ยวกับความต้องการพิเศษ เช่น เวลาที่สะดวกในการกิน, อาหารที่ชื่นชอบ, หรือข้อมูลอื่นๆ
          </Text>
          <View className="relative">
            <TextInput
              className="border border-gray-300 rounded-lg p-4 font-promptRegular text-base min-h-[120px]"
              placeholder="เช่น ชอบกินอาหารเช้าง่ายๆ, ไม่ชอบกินผัก, ต้องการอาหารที่ทำง่าย, มีเวลาทำอาหารเพียง 30 นาที..."
              value={additionalRequirements}
              onChangeText={setAdditionalRequirements}
              maxLength={maxCharacters}
              multiline
              textAlignVertical="top"
            />
            <View className="absolute bottom-2 right-3 bg-white px-2">
              <Text className={`text-xs font-promptLight ${
                additionalRequirements.length > maxCharacters * 0.9 ? 'text-red-500' : 'text-gray-500'
              }`}>
                {additionalRequirements.length}/{maxCharacters}
              </Text>
            </View>
          </View>
        </View>

        {/* Summary Preview */}
        <View className="mb-8 bg-primary/5 rounded-xl p-4">
          <Text className="text-primary font-promptSemiBold text-base mb-3 flex-row items-center">
            📋 สรุปข้อมูลที่กรอก
          </Text>
          <View className="space-y-2">
            {selectedRestrictions.length > 0 && (
              <Text className="text-gray-700 font-promptMedium text-sm">
                ข้อจำกัด: {selectedRestrictions.length} รายการ
              </Text>
            )}
            {selectedGoals.length > 0 && (
              <Text className="text-gray-700 font-promptMedium text-sm">
                เป้าหมาย: {selectedGoals.length} รายการ
              </Text>
            )}
            {additionalRequirements.trim() && (
              <Text className="text-gray-700 font-promptMedium text-sm">
                ความต้องการเพิ่มเติม: {additionalRequirements.trim().length} ตัวอักษร
              </Text>
            )}
          </View>
        </View>
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
            className="flex-1 bg-primary rounded-xl p-4 justify-center items-center flex-row"
            onPress={handleSubmit}
          >
            <Icon name="checkmark-circle" size={24} color="white" className="mr-2" />
            <Text className="text-white text-lg font-promptBold ml-2">สร้างแผน</Text>
          </TouchableOpacity>
        </View>
        
        {/* Progress indicator */}
        <View className="flex-row justify-center mt-4 space-x-2">
          <View className="w-8 h-2 bg-gray-300 rounded-full" />
          <View className="w-8 h-2 bg-gray-300 rounded-full" />
          <View className="w-8 h-2 bg-primary rounded-full" />
        </View>
      </View>
    </ScrollView>
  );
};

export default PromptForm3;
