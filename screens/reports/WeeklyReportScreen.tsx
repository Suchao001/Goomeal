import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../../hooks/Navigation';
import Menu from '../material/Menu';

/**
 * WeeklyReportScreen Component
 * หน้ารายงานการกินรายสัปดาห์
 */

const { width } = Dimensions.get('window');

const WeeklyReportScreen = () => {
  const navigation = useTypedNavigation<'WeeklyReport'>();
  const [selectedWeek, setSelectedWeek] = useState(1);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && selectedWeek > 1) {
      setSelectedWeek(selectedWeek - 1);
    } else if (direction === 'next' && selectedWeek < 52) {
      setSelectedWeek(selectedWeek + 1);
    }
  };

  const getWeekRange = (week: number) => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const startOfWeek = new Date(startOfYear);
    startOfWeek.setDate(startOfYear.getDate() + (week - 1) * 7);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const monthNames = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    
    return `${startOfWeek.getDate()} ${monthNames[startOfWeek.getMonth()]} - ${endOfWeek.getDate()} ${monthNames[endOfWeek.getMonth()]}`;
  };

  // Mock data for 7 days
  const weeklyData = [
    { day: 'จ', date: '1', calories: 1200, target: 1500, protein: 60, carbs: 150, fat: 40 },
    { day: 'อ', date: '2', calories: 1350, target: 1500, protein: 65, carbs: 160, fat: 45 },
    { day: 'พ', date: '3', calories: 1450, target: 1500, protein: 70, carbs: 170, fat: 50 },
    { day: 'พฤ', date: '4', calories: 1100, target: 1500, protein: 55, carbs: 140, fat: 35 },
    { day: 'ศ', date: '5', calories: 1600, target: 1500, protein: 75, carbs: 180, fat: 55 },
    { day: 'ส', date: '6', calories: 1400, target: 1500, protein: 68, carbs: 165, fat: 48 },
    { day: 'อา', date: '7', calories: 1300, target: 1500, protein: 62, carbs: 155, fat: 42 },
  ];

  const weekAverage = {
    calories: Math.round(weeklyData.reduce((sum, day) => sum + day.calories, 0) / 7),
    protein: Math.round(weeklyData.reduce((sum, day) => sum + day.protein, 0) / 7),
    carbs: Math.round(weeklyData.reduce((sum, day) => sum + day.carbs, 0) / 7),
    fat: Math.round(weeklyData.reduce((sum, day) => sum + day.fat, 0) / 7),
  };

  const weightChange = {
    current: 68.5,
    previous: 69.2,
    change: -0.7,
    goal: 65.0
  };

  const recommendations = [
    {
      icon: 'checkmark-circle',
      color: '#22c55e',
      title: 'ดีมาก!',
      message: 'คุณทานอาหารสม่ำเสมอในสัปดาห์นี้'
    },
    {
      icon: 'trending-down',
      color: '#3b82f6',
      title: 'น้ำหนักลดลง',
      message: 'น้ำหนักลดลง 0.7 กก. ในสัปดาห์นี้'
    },
    {
      icon: 'water',
      color: '#06b6d4',
      title: 'ดื่มน้ำเพิ่ม',
      message: 'ควรดื่มน้ำให้มากขึ้น 2-3 แก้วต่อวัน'
    },
    {
      icon: 'fitness',
      color: '#f59e0b',
      title: 'เพิ่มโปรตีน',
      message: 'ควรทานโปรตีนเพิ่มขึ้น 10-15 กรัมต่อวัน'
    }
  ];

  const renderChart = () => {
    const maxCalories = Math.max(...weeklyData.map(d => d.target));
    const chartHeight = 120; // ลดจาก 150 เป็น 120
    const barWidth = (width - 80) / 7;

    return (
      <View className="bg-white rounded-2xl p-5 mb-6 shadow-lg shadow-slate-800">
        <Text className="text-lg font-bold text-gray-800 mb-4">กราฟแคลอรี่ 7 วัน</Text>
        
        <View style={{ height: chartHeight + 35 }} className="items-center"> {/* ลดจาก +40 เป็น +35 */}
          <View className="flex-row items-end justify-between w-full" style={{ height: chartHeight }}>
            {weeklyData.map((day, index) => {
              const caloriesHeight = (day.calories / maxCalories) * chartHeight;
              const targetHeight = (day.target / maxCalories) * chartHeight;
              const isOver = day.calories > day.target;
              
              return (
                <TouchableOpacity
                  key={index}
                  className="items-center flex-1"
                  onPress={() => navigation.navigate('EatingReport')}
                >
                  {/* Target line */}
                  <View 
                    className="w-full border-t-2 border-dashed border-gray-300 absolute"
                    style={{ bottom: targetHeight }}
                  />
                  
                  {/* Calories bar */}
                  <View 
                    className={`w-6 rounded-t-lg ${isOver ? 'bg-red-400' : 'bg-primary'}`}
                    style={{ height: caloriesHeight }}
                  />
                  
                  {/* Day label */}
                  <Text className="text-xs text-gray-600 mt-1 font-medium">{day.day}</Text>
                  <Text className="text-xs text-gray-400">{day.date}</Text>
                  
                  {/* Calories value */}
                  <Text className="text-xs font-bold text-gray-800 mt-1">
                    {day.calories}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          
          {/* Legend */}
          <View className="flex-row items-center justify-center mt-3 space-x-3">
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-primary rounded mr-1" />
              <Text className="text-xs text-gray-600">ปกติ</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-0.5 border-t border-dashed border-gray-400 mr-1" />
              <Text className="text-xs text-gray-600">เป้าหมาย</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-red-400 rounded mr-1" />
              <Text className="text-xs text-gray-600">เกิน</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-10 pb-4 bg-primary">
        <TouchableOpacity 
          className="w-10 h-10 rounded-full items-center justify-center"
          onPress={handleBackPress}
        >
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View className="flex-row items-center gap-2">
          <Icon name="calendar" size={32} color="white" />
          <Text className="text-xl font-semibold text-white">รายงานสัปดาห์</Text>
        </View>
        
        <View className="w-10" />
      </View>

      {/* Week Navigation */}
      <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity
          className={`w-8 h-8 items-center justify-center ${selectedWeek <= 1 ? 'opacity-50' : ''}`}
          onPress={() => navigateWeek('prev')}
          disabled={selectedWeek <= 1}
        >
          <Icon name="chevron-back" size={20} color="#374151" />
        </TouchableOpacity>
        
        <View className="items-center">
         
          <Text className="text-sm text-gray-500">
            {getWeekRange(selectedWeek)}
          </Text>
        </View>
        
        <TouchableOpacity
          className={`w-8 h-8 items-center justify-center ${selectedWeek >= 52 ? 'opacity-50' : ''}`}
          onPress={() => navigateWeek('next')}
          disabled={selectedWeek >= 52}
        >
          <Icon name="chevron-forward" size={20} color="#374151" />
        </TouchableOpacity>
      </View>
      
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="flex-1 px-4 pt-6">
          
          {/* Weekly Summary Cards */}
          <View className="flex-row flex-wrap gap-3 mb-6">
            <View className="bg-white rounded-2xl p-4 items-center flex-1 min-w-[45%] shadow-lg shadow-slate-800">
              <View className="w-12 h-12 rounded-full items-center justify-center mb-2 bg-red-100">
                <Icon name="flame" size={24} color="#ef4444" />
              </View>
              <Text className="text-2xl font-bold text-gray-800">{weekAverage.calories}</Text>
              <Text className="text-xs text-gray-600">kcal/วัน</Text>
              <Text className="text-sm text-gray-700 text-center mt-1">เฉลี่ยต่อวัน</Text>
            </View>

            <View className="bg-white rounded-2xl p-4 items-center flex-1 min-w-[45%] shadow-lg shadow-slate-800">
              <View className="w-12 h-12 rounded-full items-center justify-center mb-2 bg-green-100">
                <Icon name="fitness" size={24} color="#22c55e" />
              </View>
              <Text className="text-2xl font-bold text-gray-800">{weekAverage.protein}</Text>
              <Text className="text-xs text-gray-600">g/วัน</Text>
              <Text className="text-sm text-gray-700 text-center mt-1">โปรตีนเฉลี่ย</Text>
            </View>
          </View>

          {/* Chart */}
          {renderChart()}

          {/* Weight Progress */}
          <View className="bg-white rounded-2xl p-5 mb-6 shadow-lg shadow-slate-800">
            <Text className="text-lg font-bold text-gray-800 mb-4">ความคืบหน้าน้ำหนัก</Text>
            
            <View className="flex-row justify-between items-center mb-4">
              <View className="items-center flex-1">
                <Text className="text-sm text-gray-500">น้ำหนักปัจจุบัน</Text>
                <Text className="text-2xl font-bold text-gray-800">{weightChange.current}</Text>
                <Text className="text-xs text-gray-400">กิโลกรัม</Text>
              </View>
              
              <View className="items-center flex-1">
                <Text className="text-sm text-gray-500">เปลี่ยนแปลง</Text>
                <View className="flex-row items-center">
                  <Icon 
                    name={weightChange.change < 0 ? "trending-down" : "trending-up"} 
                    size={20} 
                    color={weightChange.change < 0 ? "#22c55e" : "#ef4444"} 
                  />
                  <Text className={`text-2xl font-bold ml-1 ${
                    weightChange.change < 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {weightChange.change > 0 ? '+' : ''}{weightChange.change}
                  </Text>
                </View>
                <Text className="text-xs text-gray-400">กิโลกรัม</Text>
              </View>
              
              <View className="items-center flex-1">
                <Text className="text-sm text-gray-500">เป้าหมาย</Text>
                <Text className="text-2xl font-bold text-blue-500">{weightChange.goal}</Text>
                <Text className="text-xs text-gray-400">กิโลกรัม</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View className="bg-gray-200 rounded-full h-2 mb-2">
              <View 
                className="bg-primary rounded-full h-2"
                style={{ 
                  width: `${Math.min(100, ((weightChange.previous - weightChange.current) / (weightChange.previous - weightChange.goal)) * 100)}%` 
                }}
              />
            </View>
            <Text className="text-xs text-gray-500 text-center">
              เหลืออีก {(weightChange.current - weightChange.goal).toFixed(1)} กก. เพื่อถึงเป้าหมาย
            </Text>
          </View>

          {/* Recommendations */}
          <View className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-800">
            <Text className="text-lg font-bold text-gray-800 mb-4">คำแนะนำสำหรับสัปดาห์นี้</Text>
            
            {recommendations.map((rec, index) => (
              <View key={index} className="flex-row items-start mb-4 last:mb-0">
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${rec.color}20` }}
                >
                  <Icon name={rec.icon} size={20} color={rec.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-800 mb-1">
                    {rec.title}
                  </Text>
                  <Text className="text-sm text-gray-600 leading-5">
                    {rec.message}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      
      <Menu />
    </View>
  );
};

export default WeeklyReportScreen;
