import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../../hooks/Navigation';
import Header from '../material/Header';
import Menu from '../material/Menu';

const MealTimeSettingsScreen = () => {
  const navigation = useTypedNavigation<'MealTimeSettings'>();

  const [selectedTimes, setSelectedTimes] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
  });

  const [mealTimes, setMealTimes] = useState({
    breakfast: '7:30',
    lunch: '12:30',
    dinner: '18:30',
  });

  const [editingTime, setEditingTime] = useState<keyof typeof mealTimes | null>(null);
  const [tempTime, setTempTime] = useState('');
  const [customTime, setCustomTime] = useState('18:30');

  const handleTimeToggle = (key: keyof typeof selectedTimes) => {
    setSelectedTimes(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleEditTime = (key: keyof typeof mealTimes) => {
    setEditingTime(key);
    setTempTime(mealTimes[key]);
  };

  const handleSaveTime = () => {
    if (editingTime && tempTime) {
      setMealTimes(prev => ({
        ...prev,
        [editingTime]: tempTime
      }));
    }
    setEditingTime(null);
    setTempTime('');
  };

  const handleCancelEdit = () => {
    setEditingTime(null);
    setTempTime('');
  };

  const handleConfirm = () => {
    Alert.alert(
      'ยืนยันการตั้งค่า',
      'คุณต้องการบันทึกการตั้งค่าเวลามื้ออาหารหรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'ยืนยัน', 
          onPress: () => {
            Alert.alert('สำเร็จ', 'บันทึกการตั้งค่าเวลาเรียบร้อยแล้ว');
          }
        }
      ]
    );
  };

  const timeOptions = [
    { key: 'breakfast' as const, label: 'มื้อเช้า', time: mealTimes.breakfast },
    { key: 'lunch' as const, label: 'มื้อกลางวัน', time: mealTimes.lunch },
    { key: 'dinner' as const, label: 'มื้อเย็น', time: mealTimes.dinner },
  ];

  return (
    <View className="flex-1 bg-gray-100">
      <Header />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-200">
          <TouchableOpacity className="mr-4" onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">ตั้งเวลามื้ออาหาร</Text>
          <View className="ml-auto">
            <Icon name="time" size={24} color="#f59e0b" />
          </View>
        </View>

        <View className="bg-white mx-4 my-4 rounded-xl p-5 shadow-lg shadow-slate-800">
          <Text className="text-xl font-promptSemiBold text-gray-800 mb-6">เลือกเวลามื้ออาหาร</Text>
          
          {timeOptions.map((option) => (
            <View key={option.key} className="flex-row items-center py-4 border-b border-gray-100 last:border-b-0">
              <TouchableOpacity 
                className="flex-row items-center flex-1"
                onPress={() => handleTimeToggle(option.key)}
              >
                <View className={`w-6 h-6 border-2 rounded mr-4 items-center justify-center ${
                  selectedTimes[option.key] ? 'border-primary bg-primary' : 'border-gray-300 bg-white'
                }`}>
                  {selectedTimes[option.key] && (
                    <Icon name="checkmark" size={16} color="white" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-promptMedium text-gray-800">{option.label}</Text>
                  {editingTime === option.key ? (
                    <View className="flex-row items-center mt-2">
                      <View className="border border-primary rounded px-3 py-1 mr-2">
                        <TextInput
                          className="text-sm font-promptMedium text-gray-800 w-16"
                          value={tempTime}
                          onChangeText={setTempTime}
                          placeholder="เช่น 7:30"
                          autoFocus
                        />
                      </View>
                      <TouchableOpacity 
                        className="bg-primary rounded px-3 py-1 mr-2"
                        onPress={handleSaveTime}
                      >
                        <Text className="text-white text-xs font-promptMedium">บันทึก</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        className="bg-gray-300 rounded px-3 py-1"
                        onPress={handleCancelEdit}
                      >
                        <Text className="text-gray-700 text-xs font-promptMedium">ยกเลิก</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => handleEditTime(option.key)}>
                      <Text className="text-sm font-promptLight text-primary">{option.time} น. (แตะเพื่อแก้ไข)</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity className="flex-row items-center py-4 mt-4 border border-gray-200 rounded-lg px-4">
            <View className="w-6 h-6 border-2 border-gray-300 rounded mr-4 items-center justify-center">
              <Icon name="add" size={16} color="#6b7280" />
            </View>
            <Text className="text-lg font-promptMedium text-gray-600">เพิ่มเวลาใหม่</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white mx-4 my-2 rounded-xl p-5 shadow-lg shadow-slate-800">
          <Text className="text-xl font-promptSemiBold text-gray-800 mb-6">ตั้งเวลาเพิ่มเติม</Text>
          
          <View className="mb-6">
            <Text className="text-lg font-promptMedium text-gray-800 mb-3">เวลาแจ้งเตือนก่อนมื้ออาหาร</Text>
            <View className="border border-gray-200 rounded-lg px-4 py-3">
              <TextInput
                className="text-lg font-promptMedium text-gray-800"
                value={customTime}
                onChangeText={setCustomTime}
                placeholder="เช่น 18:30"
                keyboardType="default"
              />
            </View>
            <Text className="text-sm font-promptLight text-gray-500 mt-2">
              ตั้งค่าเริ่มต้น {customTime} น.
            </Text>
          </View>

          <TouchableOpacity
            className="w-full bg-primary rounded-xl p-4 justify-center items-center"
            onPress={handleConfirm}
          >
            <Text className="text-white text-lg font-promptBold">ยืนยันการตั้งค่า</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Menu />
    </View>
  );
};

export default MealTimeSettingsScreen;
