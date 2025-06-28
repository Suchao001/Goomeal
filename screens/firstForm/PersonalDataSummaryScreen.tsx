import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTypedNavigation } from '../../hooks/Navigation';
import { ArrowLeft } from '../../components/GeneralMaterial';
import { usePersonalSetup } from '../../contexts/PersonalSetupContext';

const PersonalDataSummaryScreen = () => {
  const navigation = useTypedNavigation<'PersonalDataSummary'>();
  const { getSummary, resetSetupData } = usePersonalSetup();
  
  const summary = getSummary();

  const handleConfirm = () => {
    // ที่นี่จะเป็นที่เรียก API เพื่อส่งข้อมูลไปยัง backend
    console.log('✅ ยืนยันข้อมูลแล้ว - พร้อมส่งไปยัง backend');
    
    // รีเซ็ตข้อมูลหลังจากส่งเสร็จ
    resetSetupData();
    
    // ไปยังหน้าหลัก
    navigation.navigate('Home');
  };

  const SummarySection = ({ title, data }: { title: string; data: { label: string; value: string }[] }) => (
    <View className="mb-6">
      <Text className="text-lg font-promptSemiBold text-gray-800 mb-3">{title}</Text>
      <View className="bg-gray-50 rounded-xl p-4">
        {data.map((item, index) => (
          <View key={index} className="flex-row justify-between items-center py-2">
            <Text className="text-gray-600 font-promptMedium">{item.label}:</Text>
            <Text className="text-gray-800 font-promptRegular">{item.value}</Text>
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
        <SummarySection title="ข้อมูลส่วนตัว" data={summary.personal} />
        <SummarySection title="เป้าหมายและแพลน" data={summary.plan} />
        <SummarySection title="ระดับกิจกรรม" data={summary.activity} />
        <SummarySection title="ประเภทการกิน" data={summary.eating} />
        <SummarySection title="ข้อจำกัดและความต้องการ" data={summary.restrictions} />
      </ScrollView>

      {/* Action Buttons */}
      <View className="p-6 pt-4">
        <TouchableOpacity
          className="w-full bg-primary rounded-xl p-4 justify-center items-center mb-3"
          onPress={handleConfirm}
        >
          <Text className="text-white text-lg font-promptBold">ยืนยันข้อมูล</Text>
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
