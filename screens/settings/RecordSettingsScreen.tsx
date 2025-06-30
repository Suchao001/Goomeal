import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../../hooks/Navigation';

const RecordSettingsScreen = () => {
  const navigation = useTypedNavigation<'RecordSettings'>();
  
  const [autoRecord, setAutoRecord] = useState(false);

  const handleToggle = () => {
    setAutoRecord(prev => !prev);
  };

  return (
    <View className="flex-1 bg-gray-100">
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4 bg-white">
        <TouchableOpacity 
          className="w-10 h-10 rounded-full  items-center justify-center"
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#9ca3af" />
        </TouchableOpacity>
        
        <View className="flex-row items-center gap-2">
          <Icon name="create" size={32} color="#9ca3af" />
          <Text className="text-lg font-semibold text-gray-800">บันทึกการกิน</Text>
        </View>
        
        <Text className="text-base font-semibold text-gray-800"></Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
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
    </View>
  );
};

export default RecordSettingsScreen;
