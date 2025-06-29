import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../../hooks/Navigation';
import Header from '../material/Header';
import Menu from '../material/Menu';

const RecordSettingsScreen = () => {
  const navigation = useTypedNavigation<'RecordSettings'>();
  
  const [autoRecord, setAutoRecord] = useState(false);

  const handleToggle = () => {
    setAutoRecord(prev => !prev);
  };

  return (
    <View className="flex-1 bg-gray-100">
      <Header />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-200">
          <TouchableOpacity className="mr-4" onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">ตั้งค่าบันทึกการกิน</Text>
          <View className="ml-auto">
            <Icon name="create" size={24} color="#f59e0b" />
          </View>
        </View>

        <View className="bg-white mx-4 my-4 rounded-xl p-5 shadow-lg shadow-slate-800">
          <Text className="text-xl font-promptSemiBold text-gray-800 mb-6">การบันทึกอัตโนมัติ</Text>
          
          <View className="flex-row items-center justify-between py-4">
            <View className="flex-1 mr-4">
              <Text className="text-lg font-promptMedium text-gray-800 mb-2">บันทึกตามแผนการกินอัตโนมัติ</Text>
              <Text className="text-sm font-promptLight text-gray-600 leading-5">
                ระบบจะทำการบันทึกข้อมูลการกินของคุณตามแผนการกินที่คุณได้เลือกใช้ หรือวางแผนเอาไว้ หากคุณกินตามแผนการกินระบบจะช่วยให้คุณไม่ต้องเสียเวลาในการบันทึกการกิน
              </Text>
            </View>
            <Switch
              value={autoRecord}
              onValueChange={handleToggle}
              trackColor={{ false: '#e5e7eb', true: '#f59e0b' }}
              thumbColor={autoRecord ? '#ffffff' : '#ffffff'}
              ios_backgroundColor="#e5e7eb"
            />
          </View>
        </View>

       
      </ScrollView>
      <Menu />
    </View>
  );
};

export default RecordSettingsScreen;
