import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Alert } from 'react-native';
import { useTypedNavigation } from '../../hooks/Navigation';
import Icon from 'react-native-vector-icons/Ionicons';

/**
 * AddNewFoodScreen Component
 * หน้าฟอร์มสำหรับเพิ่มเมนูอาหารใหม่
 */
const AddNewFoodScreen = () => {
  const navigation = useTypedNavigation();
  
  // Form states
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('0');
  const [carbs, setCarbs] = useState('0');
  const [protein, setProtein] = useState('0');
  const [fat, setFat] = useState('0');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!foodName.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาระบุชื่ออาหาร');
      return;
    }

    // TODO: บันทึกข้อมูลอาหารใหม่
    console.log('บันทึกอาหารใหม่:', {
      name: foodName,
      calories: parseFloat(calories),
      carbs: parseFloat(carbs),
      protein: parseFloat(protein),
      fat: parseFloat(fat),
      notes
    });

    Alert.alert(
      'สำเร็จ!',
      'เพิ่มเมนูอาหารใหม่เรียบร้อยแล้ว',
      [
        {
          text: 'ตกลง',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const handleTakePhoto = () => {
    Alert.alert('ถ่ายรูป', 'ฟีเจอร์ถ่ายรูปอยู่ระหว่างการพัฒนา');
  };

  const InputField = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder, 
    unit, 
    keyboardType = 'default' 
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    unit?: string;
    keyboardType?: 'default' | 'numeric';
  }) => (
    <View className="mb-4">
      <Text className="text-base font-semibold text-gray-800 mb-2">{label}</Text>
      <View className="flex-row items-center">
        <TextInput
          className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
        />
        {unit && (
          <Text className="ml-3 text-gray-600 font-medium">{unit}</Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary px-4 py-4 mt-6 flex-row items-center justify-between border-b border-gray-100">
        {/* Back Button */}
        <TouchableOpacity 
          className="w-10 h-10 rounded-lg items-center justify-center"
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        {/* Title */}
        <Text className="text-xl font-bold text-white">เพิ่มเมนูใหม่</Text>
        
        {/* Placeholder */}
        <View className="w-10 h-10" />
      </View>

      {/* Form Content */}
      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {/* Food Name */}
        <InputField
          label="ชื่อ"
          value={foodName}
          onChangeText={setFoodName}
          placeholder="ระบุชื่ออาหาร"
        />

        {/* Photo Section */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-800 mb-2">รูปภาพ</Text>
          <TouchableOpacity
            onPress={handleTakePhoto}
            className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 items-center justify-center"
          >
            <Icon name="camera" size={32} color="#9ca3af" />
            <Text className="text-gray-500 mt-2 text-center">เพิ่มรูปภาพอาหาร</Text>
          </TouchableOpacity>
        </View>

        {/* Nutrition Information */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">ข้อมูลโภชนาการ</Text>
          
          <InputField
            label="พลังงาน"
            value={calories}
            onChangeText={setCalories}
            placeholder="0"
            unit="kcal"
            keyboardType="numeric"
          />

          <InputField
            label="คาร์บ"
            value={carbs}
            onChangeText={setCarbs}
            placeholder="0"
            unit="g"
            keyboardType="numeric"
          />

          <InputField
            label="โปรตีน"
            value={protein}
            onChangeText={setProtein}
            placeholder="0"
            unit="g"
            keyboardType="numeric"
          />

          <InputField
            label="ไขมัน"
            value={fat}
            onChangeText={setFat}
            placeholder="0"
            unit="g"
            keyboardType="numeric"
          />
        </View>

        {/* Notes */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-800 mb-2">หมายเหตุ</Text>
          <TextInput
            className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800 h-24"
            placeholder="เพิ่มหมายเหตุ (ถ้ามี)"
            placeholderTextColor="#9ca3af"
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Save Button */}
      <View className="bg-white px-4 py-4 border-t border-gray-100">
        <TouchableOpacity
          onPress={handleSave}
          className="bg-primary rounded-xl p-4 items-center justify-center"
        >
          <Text className="text-white font-bold text-lg">บันทึก</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AddNewFoodScreen;
