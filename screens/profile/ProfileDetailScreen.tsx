import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import Menu from '../material/Menu';
import { apiClient, handleApiError } from '../../utils/apiClient';
import { useAuth } from '../../AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * ProfileDetailScreen Component
 * หน้าข้อมูลโปรไฟล์ - แสดงข้อมูลส่วนตัวและ BMI
 */
const ProfileDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  
  // State for profile data
  const [profileData, setProfileData] = useState({
    username: 'suchao',
    height: 180,
    weight: 75,
    age: 20,
    gender: 'male'
  });
  const [loading, setLoading] = useState(false);

  // Calculate BMI
  const calculateBMI = (weight: number, height: number) => {
    if (height <= 0 || weight <= 0) return 0;
    const heightInMeters = height / 100;
    return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2));
  };

  const bmiValue = calculateBMI(profileData.weight, profileData.height);

  // Convert gender from English to Thai
  const convertGenderToThai = (engGender: string) => {
    switch (engGender) {
      case 'male': return 'ชาย';
      case 'female': return 'หญิง';
      case 'other': return 'อื่นๆ';
      default: return 'อื่นๆ';
    }
  };

  // Fetch user profile data
  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      console.log('🔄 Fetching user profile for ProfileDetailScreen...');
      
      const response = await apiClient.get('/user/profile');
      
      console.log('✅ ProfileDetailScreen API Response:', response.data);

      if (response.data.success) {
        const userData = response.data.user;
        setProfileData({
          username: userData.username || 'suchao',
          height: userData.height ? parseFloat(userData.height) : 180,
          weight: userData.weight ? parseFloat(userData.weight) : 75,
          age: userData.age || 20,
          gender: userData.gender || 'male'
        });
        
        console.log('📋 ProfileDetailScreen data loaded:', {
          username: userData.username,
          height: userData.height,
          weight: userData.weight,
          age: userData.age,
          gender: userData.gender
        });
      }
    } catch (error: any) {
      console.error('❌ Error fetching profile in ProfileDetailScreen:', error);
      
      const errorInfo = handleApiError(error);
      
      // Only show alert for non-authentication errors
      if (!errorInfo.shouldLogout) {
        Alert.alert(
          errorInfo.title,
          errorInfo.message,
          [{ text: 'ตกลง' }]
        );
      } else {
        // For authentication errors, redirect silently
        apiClient.logout();
        navigation.navigate('Login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if user is authenticated and fetch profile
  const initializeProfile = async () => {
    const isAuthenticated = await apiClient.isAuthenticated();
    if (isAuthenticated) {
      fetchProfile();
    } else {
      // Redirect to login if not authenticated
      navigation.navigate('Login');
    }
  };

  useEffect(() => {
    initializeProfile();
  }, []);

  // Refresh profile when screen is focused (after editing)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh profile data when coming back from edit screen
      initializeProfile();
    });

    return unsubscribe;
  }, [navigation]);

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

  // Get BMI status text in Thai
  const getBMIStatusText = (bmi: number) => {
    if (bmi === 0) return 'กรุณาระบุข้อมูลส่วนสูงและน้ำหนัก';
    if (bmi < 18.5) return 'คุณมีน้ำหนักต่ำกว่าเกณฑ์ ควรเพิ่มน้ำหนักให้อยู่ในเกณฑ์ปกติ';
    if (bmi < 25) return 'คุณมีน้ำหนักอยู่ในเกณฑ์ปกติ ควรรักษาน้ำหนักให้อยู่ในระดับนี้ต่อไป';
    if (bmi < 30) return 'คุณมีน้ำหนักเกินเกณฑ์ ควรลดน้ำหนักและออกกำลังกายเพิ่มขึ้น';
    if (bmi < 35) return 'คุณมีน้ำหนักเกินมาก ควรปรึกษาแพทย์และวางแผนลดน้ำหนัก';
    return 'คุณมีน้ำหนักเกินมากที่สุด ควรปรึกษาแพทย์เพื่อการดูแลที่เหมาะสม';
  };

  const getBMILabelThai = (index: number) => {
    const thaiLabels = ['น้ำหนักต่ำ', 'ปกติ', 'เกิน', 'อ้วน', 'อ้วนมาก'];
    return thaiLabels[index] || 'ปกติ';
  };

  const currentCategory = getBMICategory(bmiValue);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary px-4 py-4 pt-10">
        <View className="flex-row items-center justify-between">
          <View className="w-8" />
          <Text className="text-2xl font-bold text-white text-center font-prompt">ข้อมูลโปรไฟล์</Text>
          <TouchableOpacity 
            onPress={fetchProfile}
            disabled={loading}
            className="w-8 h-8 rounded-full items-center justify-center"
          >
            <Icon 
              name="refresh" 
              size={20} 
              color={loading ? "#ffffff80" : "#ffffff"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {loading ? (
          /* Loading State */
          <View className="flex-1 justify-center items-center py-20">
            <ActivityIndicator size="large" color="#fbbf24" />
            <Text className="text-gray-500 mt-4">กำลังโหลดข้อมูล...</Text>
          </View>
        ) : (
          <>
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
              <Text className="text-2xl font-bold text-gray-800 mb-3">{profileData.username}</Text>
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
                <Text className="text-lg font-bold text-gray-800">{profileData.weight} kg</Text>
              </View>
              <View className="flex-1 bg-gray-50 p-4 rounded-xl mx-1 items-center">
                <Text className="text-sm text-gray-500 mb-1">ส่วนสูง</Text>
                <Text className="text-lg font-bold text-gray-800">{profileData.height} cm</Text>
              </View>
            </View>
            <View className="flex-row justify-between">
              <View className="flex-1 bg-gray-50 p-4 rounded-xl mx-1 items-center">
                <Text className="text-sm text-gray-500 mb-1">อายุ</Text>
                <Text className="text-lg font-bold text-gray-800">{profileData.age} ปี</Text>
              </View>
              <View className="flex-1 bg-gray-50 p-4 rounded-xl mx-1 items-center">
                <Text className="text-sm text-gray-500 mb-1">BMI</Text>
                <Text className="text-lg font-bold text-gray-800">{bmiValue || '--'}</Text>
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
                    {getBMILabelThai(index)}
                  </Text>
                  <Text className="text-xs text-gray-500 text-center">{category.range}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Current BMI Indicator */}
          <View className="my-4">
            <View className="relative h-8">
              {bmiValue > 0 && bmiValue >= 15 && bmiValue <= 40 && (
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
              )}
              {(bmiValue === 0 || bmiValue < 15 || bmiValue > 40) && (
                <View className="absolute items-center left-1/2" style={{ marginLeft: -30 }}>
                  <Text className="text-xs text-gray-500">ไม่สามารถแสดงได้</Text>
                </View>
              )}
            </View>
          </View>

          {/* BMI Status */}
          <View className="items-center mt-4">
            <Text className="text-base font-semibold text-gray-800 mb-2">สถานะปัจจุบัน</Text>
            {bmiValue > 0 ? (
              <>
                <View className="flex-row items-center mb-2">
                  <View 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: bmiCategories[currentCategory].color }}
                  />
                  <Text 
                    className="text-base font-semibold"
                    style={{ color: bmiCategories[currentCategory].color }}
                  >
                    {getBMILabelThai(currentCategory)}
                  </Text>
                </View>
                <Text className="text-sm text-gray-500 text-center leading-5">
                  {getBMIStatusText(bmiValue)}
                </Text>
              </>
            ) : (
              <View className="items-center">
                <View className="flex-row items-center mb-2">
                  <View className="w-3 h-3 rounded-full mr-2 bg-gray-400" />
                  <Text className="text-base font-semibold text-gray-400">
                    ไม่สามารถคำนวณได้
                  </Text>
                </View>
                <Text className="text-sm text-gray-500 text-center leading-5">
                  {getBMIStatusText(bmiValue)}
                </Text>
              </View>
            )}
          </View>
        </View>
          </>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <Menu />
    </SafeAreaView>
  );
};

export default ProfileDetailScreen;
