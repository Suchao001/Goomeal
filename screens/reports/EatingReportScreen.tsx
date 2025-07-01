import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../../hooks/Navigation';
import Menu from '../material/Menu';

/**
 * EatingReportScreen Component
 * หน้ารายงานการกิน
 */
const EatingReportScreen = () => {
  const navigation = useTypedNavigation<'EatingReport'>();
  const [selectedDay, setSelectedDay] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  

  const handleBackPress = () => {
    navigation.goBack();
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && selectedDay > 1) {
      setSelectedDay(selectedDay - 1);
    } else if (direction === 'next' && selectedDay < 30) {
      setSelectedDay(selectedDay + 1);
    }
  };

  const getDayName = (day: number) => {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(day);
    
    const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const monthNames = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    
    return `${day} ${monthNames[targetDate.getMonth()]} ${targetDate.getFullYear()}`;
  };

  const dayName = getDayName(selectedDay);

  const reportData = [
    { label: 'แคลอรี่วันนี้', value: '1,250', unit: 'kcal', color: '#ef4444' },
    { label: 'โปรตีน', value: '85', unit: 'g', color: '#22c55e' },
    { label: 'คาร์โบไฮเดรต', value: '120', unit: 'g', color: '#3b82f6' },
    { label: 'ไขมัน', value: '45', unit: 'g', color: '#f59e0b' },
  ];

  return (
    <View className="flex-1 bg-gray-100">
      <View className="flex-row items-center justify-between px-4 pt-10 pb-4 bg-primary">
        <TouchableOpacity 
          className="w-10 h-10 rounded-full items-center justify-center"
          onPress={handleBackPress}
        >
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View className="flex-row items-center gap-2">
          <Icon name="analytics" size={32} color="#ffff" />
          <Text className="text-xl font-semibold text-white">รายงานการกิน</Text>
        </View>
        
        <TouchableOpacity 
          className="flex-row items-center"
          onPress={() => navigation.navigate('WeeklyReport')}
        >
          <Icon name="calendar" size={20} color="#ffff" />
        </TouchableOpacity>
      </View>
      <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
              <TouchableOpacity
                className={`w-8 h-8 items-center justify-center ${selectedDay <= 1 ? 'opacity-50' : ''}`}
                onPress={() => navigateDay('prev')}
                disabled={selectedDay <= 1}
              >
                <Icon name="chevron-back" size={20} color="#374151" />
              </TouchableOpacity>
              
              <Text className="text-lg font-medium text-gray-800">
                {dayName}
              </Text>
              
              <TouchableOpacity
                className={`w-8 h-8 items-center justify-center ${selectedDay >= 30 ? 'opacity-50' : ''}`}
                onPress={() => navigateDay('next')}
                disabled={selectedDay >= 30}
              >
                <Icon name="chevron-forward" size={20} color="#374151" />
              </TouchableOpacity>
            </View>
      
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Main Content */}
        <View className="flex-1 px-4 pt-6">
          <Text className="text-2xl font-bold text-gray-800 mb-2">สถิติการกินของคุณ</Text>
          <View className="flex-row items-center justify-between mb-8">
            <Text className="text-base text-gray-600 leading-6">
              ดูสถิติและรายงานการบริโภคอาหารประจำวัน
            </Text>
            <TouchableOpacity
              className="bg-primary px-3 py-1 rounded-full"
              onPress={() => navigation.navigate('WeeklyReport')}
            >
              <Text className="text-white text-xs font-medium">ดูรายสัปดาห์</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Cards */}
          <View className="flex-row flex-wrap gap-3 mb-6">
            {reportData.map((item, index) => (
              <View key={index} className="bg-white rounded-2xl p-4 items-center flex-1 min-w-[45%] shadow-lg shadow-slate-800">
                <View 
                  className="w-12 h-12 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <Icon name="analytics" size={24} color={item.color} />
                </View>
                <Text className="text-2xl font-bold text-gray-800">{item.value}</Text>
                <Text className="text-xs text-gray-600">{item.unit}</Text>
                <Text className="text-sm text-gray-700 text-center mt-1">{item.label}</Text>
              </View>
            ))}
          </View>

          {/* Chart Placeholder */}
          <View className="bg-white rounded-2xl p-5 mb-6 shadow-lg shadow-slate-800">
            <Text className="text-lg font-bold text-gray-800 mb-4">กราฟการบริโภคแคลอรี่</Text>
            <View className="h-50 items-center justify-center bg-gray-50 rounded-xl">
              <Icon name="bar-chart" size={80} color="#9ca3af" />
              <Text className="text-base text-gray-500 mt-2">กราฟจะแสดงที่นี่</Text>
            </View>
          </View>

          {/* Recent Meals */}
          <View className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-800">
            <Text className="text-lg font-bold text-gray-800 mb-4">มื้ออาหารล่าสุด</Text>
            
            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-800">อาหารเช้า</Text>
                <Text className="text-sm text-gray-600">08:30</Text>
              </View>
              <Text className="text-base font-bold text-red-500">320 kcal</Text>
            </View>
            
            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-800">อาหารกลางวัน</Text>
                <Text className="text-sm text-gray-600">12:15</Text>
              </View>
              <Text className="text-base font-bold text-red-500">450 kcal</Text>
            </View>
            
            <View className="flex-row justify-between items-center py-3">
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-800">อาหารเย็น</Text>
                <Text className="text-sm text-gray-600">19:00</Text>
              </View>
              <Text className="text-base font-bold text-red-500">480 kcal</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <Menu/>
    </View>
  );
};

export default EatingReportScreen;
