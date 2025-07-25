import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import Menu from '../material/Menu';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;


const ProfileDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const bmiValue = 23.15;
  const weight = 75;
  const height = 180;
  const age = 20;

  // BMI categories with colors
  const bmiCategories = [
    { label: 'Underweight', color: '#3b82f6', range: '< 18.5' },
    { label: 'Normal', color: '#22c55e', range: '18.5-24.9' },
    { label: 'Overweight', color: '#f59e0b', range: '25-29.9' },
    { label: 'Obese', color: '#f97316', range: '30-34.9' },
    { label: 'Extremely Obese', color: '#ef4444', range: '≥ 35' },
  ];

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return 0;
    if (bmi < 25) return 1;
    if (bmi < 30) return 2;
    if (bmi < 35) return 3;
    return 4;
  };

  const currentCategory = getBMICategory(bmiValue);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary px-4 py-4 pt-10">
        <Text className="text-2xl font-bold text-white text-center font-prompt">ข้อมูลโปรไฟล์</Text>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Profile Section */}
        <View className="bg-white mx-4 mt-6 rounded-xl p-5 shadow-sm">
          <TouchableOpacity 
            className="absolute top-3 right-4 w-10 h-10 rounded-full items-center justify-center z-10"
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#fbbf24" />
          </TouchableOpacity>
          
          {/* Profile Header */}
          <View className="flex-row items-center mb-5">
            <View className="mr-4">
              <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center">
                <Icon name="person" size={48} color="#9ca3af" />
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-800 mb-3">suchao</Text>
              <TouchableOpacity 
                className="bg-yellow-400 px-5 py-2 rounded-full self-start"
                onPress={() => navigation.navigate('EditProfile')}
              >
                <Text className="text-white font-semibold text-sm">แก้ไข</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Personal Information */}
          <View className="mt-2">
            <View className="flex-row justify-between mb-3">
              <View className="flex-1 bg-gray-50 p-4 rounded-xl mx-1 items-center">
                <Text className="text-sm text-gray-500 mb-1">น้ำหนัก</Text>
                <Text className="text-lg font-bold text-gray-800">{weight} kg</Text>
              </View>
              <View className="flex-1 bg-gray-50 p-4 rounded-xl mx-1 items-center">
                <Text className="text-sm text-gray-500 mb-1">ส่วนสูง</Text>
                <Text className="text-lg font-bold text-gray-800">{height} cm</Text>
              </View>
            </View>
            <View className="flex-row justify-between">
              <View className="flex-1 bg-gray-50 p-4 rounded-xl mx-1 items-center">
                <Text className="text-sm text-gray-500 mb-1">อายุ</Text>
                <Text className="text-lg font-bold text-gray-800">{age} ปี</Text>
              </View>
              <View className="flex-1 bg-gray-50 p-4 rounded-xl mx-1 items-center">
                <Text className="text-sm text-gray-500 mb-1">BMI</Text>
                <Text className="text-lg font-bold text-gray-800">{bmiValue}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* BMI Chart Section */}
        <View className="bg-white mx-4 mt-4 rounded-xl p-5 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-5 text-center">ดัชนีมวลกาย (BMI)</Text>
          
          {/* BMI Scale */}
          <View className="mb-5">
            <View className="flex-row justify-between mb-2">
              <Text className="text-xs text-gray-500">15</Text>
              <Text className="text-xs text-gray-500">20</Text>
              <Text className="text-xs text-gray-500">25</Text>
              <Text className="text-xs text-gray-500">30</Text>
              <Text className="text-xs text-gray-500">35</Text>
              <Text className="text-xs text-gray-500">40</Text>
            </View>
            
            {/* BMI Bars */}
            <View className="flex-row h-15">
              {bmiCategories.map((category, index) => (
                <View key={index} className="flex-1 items-center mx-0.5">
                  <View 
                    className={`w-full h-8 rounded mb-1 ${
                      currentCategory === index ? 'border-2 border-gray-800' : ''
                    }`}
                    style={{ backgroundColor: category.color }}
                  />
                  <Text className="text-xs font-semibold text-center mb-0.5" style={{ color: category.color }}>
                    {category.label}
                  </Text>
                  <Text className="text-xs text-gray-500 text-center">{category.range}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Current BMI Indicator */}
          <View className="my-4">
            <View className="relative h-8">
              <View 
                className="absolute items-center"
                style={{ left: `${((bmiValue - 15) / 25) * 100}%`, marginLeft: -15 }}
              >
                <View 
                  className="w-0 h-0 border-l-2 border-r-2 border-b-3 border-transparent"
                  style={{ 
                    borderLeftColor: 'transparent',
                    borderRightColor: 'transparent',
                    borderBottomColor: '#1f2937',
                    borderLeftWidth: 8,
                    borderRightWidth: 8,
                    borderBottomWidth: 12
                  }}
                />
                <Text className="text-xs font-bold text-gray-800 mt-1">{bmiValue}</Text>
              </View>
            </View>
          </View>

          {/* BMI Status */}
          <View className="items-center mt-4">
            <Text className="text-base font-semibold text-gray-800 mb-2">สถานะปัจจุบัน</Text>
            <View className="flex-row items-center mb-2">
              <View 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: bmiCategories[currentCategory].color }}
              />
              <Text 
                className="text-base font-semibold"
                style={{ color: bmiCategories[currentCategory].color }}
              >
                {bmiCategories[currentCategory].label}
              </Text>
            </View>
            <Text className="text-sm text-gray-500 text-center leading-5">
              คุณมีน้ำหนักอยู่ในเกณฑ์ปกติ ควรรักษาน้ำหนักให้อยู่ในระดับนี้ต่อไป
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <Menu />
    </SafeAreaView>
  );
};

export default ProfileDetailScreen;
