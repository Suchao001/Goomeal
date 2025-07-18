import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Alert, Image } from 'react-native';
import { useTypedNavigation } from '../../hooks/Navigation';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { ApiClient } from '../../utils/apiClient';

/**
 * AddNewFoodScreen Component
 * หน้าฟอร์มสำหรับเพิ่มเมนูอาหารใหม่
 */
const AddNewFoodScreen = () => {
  const navigation = useTypedNavigation();
  const apiClient = useMemo(() => new ApiClient(), []);
  
  // Form states
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('0');
  const [carbs, setCarbs] = useState('0');
  const [protein, setProtein] = useState('0');
  const [fat, setFat] = useState('0');
  const [ingredient, setIngredient] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!foodName.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาระบุชื่ออาหาร');
      return;
    }

    // Validate numeric inputs
    const caloriesNum = parseFloat(calories);
    const carbsNum = parseFloat(carbs);
    const proteinNum = parseFloat(protein);
    const fatNum = parseFloat(fat);

    if (isNaN(caloriesNum) || caloriesNum < 0) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาระบุแคลอรี่ที่ถูกต้อง');
      return;
    }

    if (isNaN(carbsNum) || carbsNum < 0) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาระบุคาร์โบไฮเดรตที่ถูกต้อง');
      return;
    }

    if (isNaN(proteinNum) || proteinNum < 0) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาระบุโปรตีนที่ถูกต้อง');
      return;
    }

    if (isNaN(fatNum) || fatNum < 0) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาระบุไขมันที่ถูกต้อง');
      return;
    }

    setIsLoading(true);

    try {
      const result = await apiClient.addUserFood({
        name: foodName.trim(),
        calories: calories,
        carbs: carbs,
        protein: protein,
        fat: fat,
        ingredient: ingredient.trim() || undefined,
        img: selectedImage || undefined
      });

      if (result.success) {
        Alert.alert(
          'สำเร็จ!',
          result.message || 'เพิ่มเมนูอาหารใหม่เรียบร้อยแล้ว',
          [
            {
              text: 'ตกลง',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('ข้อผิดพลาด', result.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (error: any) {
      console.error('Error saving food:', error);
      Alert.alert('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'ต้องการสิทธิ์เข้าถึง',
        'แอปต้องการสิทธิ์เข้าถึงรูปภาพเพื่อเลือกรูปอาหาร',
        [
          { text: 'ยกเลิก', style: 'cancel' },
          { text: 'ตั้งค่า', onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync() }
        ]
      );
      return false;
    }
    return true;
  };

  const handleImagePicker = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    Alert.alert(
      'เลือกรูปภาพ',
      'เลือกวิธีการเพิ่มรูปภาพ',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ถ่ายรูป', onPress: openCamera },
        { text: 'เลือกจากอัลบั้ม', onPress: openImageLibrary }
      ]
    );
  };

  const openCamera = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermission.status !== 'granted') {
      Alert.alert('ข้อผิดพลาด', 'ต้องการสิทธิ์เข้าถึงกล้องเพื่อถ่ายรูป');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const openImageLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    Alert.alert(
      'ลบรูปภาพ',
      'คุณต้องการลบรูปภาพนี้หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ลบ', style: 'destructive', onPress: () => setSelectedImage(null) }
      ]
    );
  };

  const InputField = useCallback(({ 
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
  ), []);

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
          {selectedImage ? (
            <View className="relative">
              <Image
                source={{ uri: selectedImage }}
                className="w-full h-48 rounded-lg"
                resizeMode="cover"
              />
              {/* Remove button */}
              <TouchableOpacity
                onPress={removeImage}
                className="absolute top-2 right-2 bg-red-500 rounded-full w-8 h-8 items-center justify-center"
              >
                <Icon name="close" size={16} color="white" />
              </TouchableOpacity>
              {/* Change image button */}
              <TouchableOpacity
                onPress={handleImagePicker}
                className="absolute bottom-2 right-2 bg-primary rounded-full w-10 h-10 items-center justify-center"
              >
                <Icon name="camera" size={20} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleImagePicker}
              className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 items-center justify-center"
            >
              <Icon name="camera" size={32} color="#9ca3af" />
              <Text className="text-gray-500 mt-2 text-center">เพิ่มรูปภาพอาหาร</Text>
            </TouchableOpacity>
          )}
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

        {/* Ingredient */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-800 mb-2">ส่วนประกอบ</Text>
          <TextInput
            className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800 h-24"
            placeholder="เพิ่มส่วนประกอบ (ถ้ามี)"
            placeholderTextColor="#9ca3af"
            value={ingredient}
            onChangeText={setIngredient}
            multiline
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Save Button */}
      <View className="bg-white px-4 py-4 border-t border-gray-100">
        <TouchableOpacity
          onPress={handleSave}
          disabled={isLoading}
          className={`rounded-xl p-4 items-center justify-center ${
            isLoading ? 'bg-gray-400' : 'bg-primary'
          }`}
        >
          <Text className="text-white font-bold text-lg">
            {isLoading ? 'กำลังบันทึก...' : 'บันทึก'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AddNewFoodScreen;
