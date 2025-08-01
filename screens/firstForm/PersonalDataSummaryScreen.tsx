import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTypedNavigation } from '../../hooks/Navigation';
import { ArrowLeft } from '../../components/GeneralMaterial';
import { usePersonalSetup } from '../../contexts/PersonalSetupContext';

const PersonalDataSummaryScreen = () => {
  const navigation = useTypedNavigation<'PersonalDataSummary'>();
  const { getSummary, submitToDatabase, getPlanSuggestions, resetSetupData } = usePersonalSetup();
  const [isLoading, setIsLoading] = useState(false);
  
  const summary = getSummary();

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const result = await submitToDatabase();
      if (result.success) {
        Alert.alert(
          'สำเร็จ!',
          result.message,
          [
            {
              text: 'ตกลง',
              onPress: () => {
                resetSetupData();
                navigation.navigate('Home');
              }
            }
          ]
        );
      } else {
        // แสดงข้อความผิดพลาด
        Alert.alert('เกิดข้อผิดพลาด', result.message);
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptAI = async () => {
    try {
      setIsLoading(true);
      const result = await getPlanSuggestions();
      if (result.success && result.message) {
        console.log('AI Suggestions:', result.message);
        navigation.navigate('AiPlanMealScreen', { aiPlanData: result.message });
        resetSetupData();
      } else {
        Alert.alert('เกิดข้อผิดพลาด', result.message || 'ไม่สามารถดึงข้อมูลจาก AI ได้');
      }
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถดึงข้อมูลจาก AI ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  }

  const SummarySection = ({ title, data }: { title: string; data: { label: string; value: string }[] }) => (
    <View className="mb-6">
      <Text className="text-lg font-promptSemiBold text-gray-800 mb-3">{title}</Text>
      <View className="bg-gray-50 rounded-xl p-4">
        {data.map((item, index) => (
          <View key={index} className="flex-row justify-between items-start py-2">
            <Text className="text-gray-600 font-promptMedium flex-1 mr-2">{item.label}:</Text>
            <Text className="text-gray-800 font-promptRegular flex-1 text-right">{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="p-6 pt-12">
        <ArrowLeft />
        <Text className="text-3xl font-promptSemiBold text-gray-800 text-center mt-6 mb-2">
          สรุปข้อมูลของคุณ
        </Text>
        <Text className="text-base font-promptLight text-gray-600 text-center mb-6">
          กรุณาตรวจสอบข้อมูลก่อนยืนยัน
        </Text>
      </View>

      {/* Summary Content */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {summary.isForAi == false && (
          <SummarySection title="ข้อมูลส่วนตัว" data={summary.personal} />
        )}
      
        <SummarySection title="เป้าหมายและแพลน" data={summary.plan} />
        <SummarySection title="ระดับกิจกรรม" data={summary.activity} />
        <SummarySection title="ประเภทการกิน" data={summary.eating} />
        <SummarySection title="ข้อจำกัดและความต้องการ" data={summary.restrictions} />
        {summary.isForAi && (
          <View className="mb-6">
            <Text className="text-lg font-promptSemiBold text-gray-800 mb-3">สำหรับ AI</Text>
            <View className="bg-gray-50 rounded-xl p-4">
              <Text className="text-gray-600 font-promptMedium">
                ระบบจะใช้ข้อมูลนี้ในการสร้างแผนการกินที่เหมาะสม
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View className="p-6 pt-4">
        <TouchableOpacity
          className={`w-full bg-primary rounded-xl p-4 justify-center items-center mb-3 ${isLoading ? 'opacity-50' : ''}`}
          onPress={ summary.isForAi ? () => handlePromptAI() : handleConfirm}
          disabled={isLoading}
        >
          <Text className="text-white text-lg font-promptBold">
            {isLoading ? 'กำลังบันทึก...' : 'ยืนยันข้อมูล'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="w-full bg-gray-100 rounded-xl p-4 justify-center items-center"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-gray-600 text-lg font-promptMedium">กลับไปแก้ไข</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PersonalDataSummaryScreen;
