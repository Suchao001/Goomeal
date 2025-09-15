import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTypedNavigation } from '../../hooks/Navigation';
import { ArrowLeft } from '../../components/GeneralMaterial';
import { useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AiApiClient } from '../../utils/api/aiApiClient';
import { usePersonalSetup } from '../../contexts/PersonalSetupContext';

// Type definitions for navigation
type PromptSummaryRouteParams = {
  data?: {
    planDuration: string;
    selectedCategories: string[];
    selectedBudget: string;
    varietyLevel: string;
    selectedIngredients: string[];
    additionalRequirements: string;
    selectedRestrictions: string[];
    selectedGoals: string[];
  };
};

type PromptSummaryRouteProp = RouteProp<{ PromptSummary: PromptSummaryRouteParams }, 'PromptSummary'>;

const PromptSummaryScreen = () => {
  const navigation = useTypedNavigation();
  const route = useRoute<PromptSummaryRouteProp>();
  const [isLoading, setIsLoading] = useState(false);
  const { resetSetupData } = usePersonalSetup();
  
  const data = route.params?.data;

  // Helper functions to get display text
  const getBudgetDisplayText = (budget: string) => {
    const budgetMap: { [key: string]: string } = {
      'low': 'ประหยัด (50-150 บาท/มื้อ)',
      'medium': 'ปานกลาง (150-300 บาท/มื้อ)',
      'high': 'หรูหรา (300+ บาท/มื้อ)',
      'flexible': 'งบยืดหยุ่น (ปรับตามสถานการณ์)'
    };
    return budgetMap[budget] || budget;
  };

  const getVarietyDisplayText = (variety: string) => {
    const varietyMap: { [key: string]: string } = {
      'low': 'หลากหลายน้อย - อาหารคุ้นเคย ทำง่าย',
      'medium': 'หลากหลายปานกลาง - ผสมผสานอาหารใหม่ๆ',
      'high': 'หลากหลายมาก - ลองของใหม่ทุกมื้อ'
    };
    return varietyMap[variety] || variety;
  };

  const getCategoriesDisplayText = (categories: string[]) => {
    const categoryMap: { [key: string]: string } = {
      'thai': 'อาหารไทย',
      'chinese': 'อาหารจีน',
      'japanese': 'อาหารญี่ปุ่น',
      'western': 'อาหารตะวันตก',
      'healthy': 'อาหารสุขภาพ',
      'vegetarian': 'อาหารเจ',
      'street': 'อาหารข้างทาง',
      'dessert': 'ของหวาน'
    };
    return categories.map(cat => categoryMap[cat] || cat).join(', ');
  };

  const getIngredientsDisplayText = (ingredients: string[]) => {
    const ingredientMap: { [key: string]: string } = {
      'chicken': 'ไก่',
      'pork': 'หมู',
      'beef': 'เนื้อ',
      'fish': 'ปลา',
      'shrimp': 'กุ้ง',
      'egg': 'ไข่',
      'vegetables': 'ผัก',
      'rice': 'ข้าว',
      'noodles': 'เส้น',
      'tofu': 'เต้าหู้',
      'coconut': 'มะพร้าว',
      'mushroom': 'เห็ด'
    };
    return ingredients.map(ing => ingredientMap[ing] || ing).join(', ');
  };

  const getRestrictionsDisplayText = (restrictions: string[]) => {
    const restrictionMap: { [key: string]: string } = {
      'halal': 'อาหารฮาลาล',
      'vegetarian': 'เจ',
      'no-pork': 'ไม่ทานหมู',
      'no-beef': 'ไม่ทานเนื้อ',
      'no-seafood': 'ไม่ทานอาหารทะเล',
      'no-spicy': 'ไม่ทานเผ็ด',
      'low-sodium': 'ลดเกลือ',
      'no-sugar': 'ไม่ทานหวาน'
    };
    return restrictions.map(rest => restrictionMap[rest] || rest).join(', ');
  };

  const getGoalsDisplayText = (goals: string[]) => {
    const goalMap: { [key: string]: string } = {
      'weight-loss': 'ลดน้ำหนัก',
      'muscle-gain': 'เพิ่มกล้ามเนื้อ',
      'maintain': 'คงน้ำหนัก',
      'energy': 'เพิ่มพลังงาน',
      'health': 'สุขภาพดี',
      'digestion': 'ระบบย่อยดี'
    };
    return goals.map(goal => goalMap[goal] || goal).join(', ');
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      console.log('Final Prompt Data:', data);
      
      // เรียกใช้ AI API client
      const aiClient = new AiApiClient();
      const result = await aiClient.getFoodPlanSuggestionsByPrompt(data);
      
      console.log('AI API Response:', result);
      
      if (result.success) {
        // Navigate ไปยัง AiPlanMealScreen พร้อมข้อมูล
        navigation.navigate('AiPlanMealScreen', { aiPlanData: result.message });
        resetSetupData();
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error generating meal plan:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถสร้างแผนการกินได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const SummarySection = ({ 
    title, 
    data: sectionData, 
    icon 
  }: { 
    title: string; 
    data: { label: string; value: string }[]; 
    icon?: string;
  }) => (
    <View className="mb-6">
      <View className="flex-row items-center mb-3">
        {icon && <Text className="text-lg mr-2">{icon}</Text>}
        <Text className="text-lg font-promptSemiBold text-gray-800">{title}</Text>
      </View>
      <View className="bg-gray-50 rounded-xl p-4">
        {sectionData.map((item, index) => (
          <View key={index} className="flex-row justify-between items-start py-2">
            <Text className="text-gray-600 font-promptMedium flex-1 mr-2">{item.label}:</Text>
            <Text className="text-gray-800 font-promptRegular flex-1 text-right">{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  if (!data) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-600 font-promptMedium">ไม่พบข้อมูล</Text>
      </View>
    );
  }

  // Prepare summary data
  const planSummary = [
    { label: 'ระยะเวลา', value: `${data.planDuration} วัน` },
    { label: 'งบประมาณต่อมื้อ', value: getBudgetDisplayText(data.selectedBudget) },
    { label: 'ระดับความหลากหลาย', value: getVarietyDisplayText(data.varietyLevel) }
  ];

  const foodPreferences = [
    { label: 'ประเภทอาหาร', value: getCategoriesDisplayText(data.selectedCategories) },
    { label: 'วัตถุดิบที่ชอบ', value: getIngredientsDisplayText(data.selectedIngredients) || 'ไม่ได้ระบุ' }
  ];

  const requirements = [];
  if (data.selectedRestrictions.length > 0) {
    requirements.push({ label: 'การเลือกทานอาหาร', value: getRestrictionsDisplayText(data.selectedRestrictions) });
  }
  if (data.selectedGoals.length > 0) {
    requirements.push({ label: 'เป้าหมายสุขภาพ', value: getGoalsDisplayText(data.selectedGoals) });
  }
  if (data.additionalRequirements.trim()) {
    requirements.push({ label: 'ความต้องการเพิ่มเติ่ม', value: data.additionalRequirements.trim() });
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="p-6 pt-12">
        <ArrowLeft />
        <Text 
          className="text-3xl font-promptSemiBold text-gray-800 text-center mt-6 mb-2"
          style={{ lineHeight: 48 }}
        >
          สรุปข้อมูลแผนการกิน
        </Text>
        <Text className="text-base font-promptLight text-gray-600 text-center mb-6">
          กรุณาตรวจสอบข้อมูลก่อนสร้างแผน
        </Text>
      </View>

      {/* Summary Content */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <SummarySection title="แผนการกิน" data={planSummary}  />
        <SummarySection title="ความชอบด้านอาหาร" data={foodPreferences}  />
        {requirements.length > 0 && (
          <SummarySection title="การเลือกทานอาหารและความต้องการ" data={requirements}  />
        )}

        {/* AI Generation Notice */}
        <View className="mb-6 bg-primary/5 rounded-xl p-4">
          <View className="flex-row items-center mb-2">
            <Icon name="sparkles" size={20} color="#ffb800" />
            <Text className="text-primary font-promptSemiBold text-base ml-2">
              สร้างแผนด้วย AI
            </Text>
          </View>
          <Text className="text-gray-600 font-promptMedium text-sm">
            ระบบ AI จะใช้ข้อมูลที่คุณกรอกในการสร้างแผนการกินที่เหมาะสมกับคุณโดยเฉพาะ
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="p-6 pt-4">
        <TouchableOpacity
          className={`w-full bg-primary rounded-xl p-4 justify-center items-center mb-3 flex-row ${
            isLoading ? 'opacity-50' : ''
          }`}
          onPress={handleConfirm}
          disabled={isLoading}
        >
          <Icon name="checkmark-circle" size={24} color="white" />
          <Text className="text-white text-lg font-promptBold ml-2">
            {isLoading ? 'กำลังสร้างแผน...' : 'สร้างแผนการกิน'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="w-full bg-gray-100 rounded-xl p-4 justify-center items-center flex-row"
          onPress={handleBack}
          disabled={isLoading}
        >
          <Icon name="arrow-back" size={20} color="#6B7280" />
          <Text className="text-gray-600 text-lg font-promptMedium ml-2">กลับไปแก้ไข</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PromptSummaryScreen;
