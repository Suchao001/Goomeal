import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../AuthContext';
import Menu from '../material/Menu';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;


const ProfileDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, fetchUserProfile, loading: authLoading } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileData, setProfileData] = useState(user);
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false); // Track if we've loaded profile

  // Calculate BMI
  const calculateBMI = (weight?: number, height?: number) => {
    if (!weight || !height) return 0;
    const heightInMeters = height / 100;
    return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
  };

  const bmiValue = calculateBMI(profileData?.weight, profileData?.height);
  const weight = profileData?.weight || 0;
  const height = profileData?.height || 0;
  const age = profileData?.age || 0;
  const username = profileData?.username || 'ผู้ใช้';

  // Fetch latest profile data
  const loadProfile = async () => {
    if (profileLoading || hasLoadedProfile) return; // Prevent multiple calls
    
    try {
      setProfileLoading(true);
    
      const latestProfile = await fetchUserProfile();
      if (latestProfile) {
        setProfileData(latestProfile);
        setHasLoadedProfile(true);
     
      }
    } catch (error) {
      console.error('❌ Error loading profile:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถดึงข้อมูลโปรไฟล์ได้');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (user && !hasLoadedProfile) {
      setProfileData(user);
      // Only load fresh profile if we haven't loaded it yet
      loadProfile();
    }
  }, [user]); // Remove loadProfile from dependencies to prevent infinite loop

  // Add a refresh function for manual refresh
  const refreshProfile = async () => {
    setHasLoadedProfile(false);
    await loadProfile();
  };

  // Listen for navigation focus to refresh profile when returning from EditProfile
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Only refresh if we're returning from EditProfile and have loaded before
      if (hasLoadedProfile) {
       
        refreshProfile();
      }
    });

    return unsubscribe;
  }, [navigation, hasLoadedProfile]);

  // Show loading if auth is loading or profile is loading
  if (authLoading) {
  
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="bg-primary px-4 py-4 pt-10">
          <Text className="text-2xl font-bold text-white text-center font-prompt">ข้อมูลโปรไฟล์</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text className="text-gray-600 mt-4 text-lg">กำลังตรวจสอบการเข้าสู่ระบบ...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (profileLoading) {
    
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="bg-primary px-4 py-4 pt-10 flex-row items-center justify-between">
          <View className="w-10" />
          <Text className="text-2xl font-bold text-white text-center font-prompt">ข้อมูลโปรไฟล์</Text>
          <TouchableOpacity 
            onPress={refreshProfile}
            disabled={profileLoading}
            className="w-10 h-10 items-center justify-center"
          >
            <Icon 
              name="refresh" 
              size={24} 
              color="#ffffff80"
            />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text className="text-gray-600 mt-4 text-lg">กำลังโหลดข้อมูลโปรไฟล์...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show message if no profile data
  if (!profileData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="bg-primary px-4 py-4 pt-10">
          <Text className="text-2xl font-bold text-white text-center font-prompt">ข้อมูลโปรไฟล์</Text>
        </View>
        <View className="flex-1 items-center justify-center px-4">
          <Icon name="person-circle-outline" size={80} color="#9ca3af" />
          <Text className="text-gray-600 text-lg text-center mt-4">ไม่พบข้อมูลโปรไฟล์</Text>
          <TouchableOpacity 
            className="bg-primary px-6 py-3 rounded-xl mt-4"
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text className="text-white font-semibold">เพิ่มข้อมูลโปรไฟล์</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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

  const getBMIDescription = (categoryIndex: number) => {
    const descriptions = [
      'คุณมีน้ำหนักต่ำกว่าเกณฑ์ ควรเพิ่มน้ำหนักให้อยู่ในเกณฑ์ปกติ',
      'คุณมีน้ำหนักอยู่ในเกณฑ์ปกติ ควรรักษาน้ำหนักให้อยู่ในระดับนี้ต่อไป',
      'คุณมีน้ำหนักเกินเกณฑ์ ควรลดน้ำหนักให้อยู่ในเกณฑ์ปกติ',
      'คุณมีน้ำหนักเกินมาก ควรปรึกษาแพทย์และลดน้ำหนัก',
      'คุณมีน้ำหนักเกินมากเป็นอันตราย ควรปรึกษาแพทย์โดยด่วน'
    ];
    return descriptions[categoryIndex] || 'ไม่สามารถประเมินได้';
  };

  const currentCategory = getBMICategory(bmiValue);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary px-4 py-4 pt-10 flex-row items-center justify-between">
        <View className="w-10" />
        <Text className="text-2xl font-bold text-white text-center font-prompt">ข้อมูลโปรไฟล์</Text>

        <View>
          
        </View>
        {/* <TouchableOpacity 
          onPress={refreshProfile}
          disabled={profileLoading}
          className="w-10 h-10 items-center justify-center"
        >
          <Icon 
            name="refresh" 
            size={24} 
            color={profileLoading ? "#ffffff80" : "#ffffff"} 
          />
        </TouchableOpacity> */}
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Profile Section */}
        <View className="bg-white mx-4 mt-6 rounded-xl p-5 shadow-sm">
          <TouchableOpacity 
            className="absolute top-3 right-4 w-10 h-10 rounded-full items-center justify-center z-10"
            onPress={() => navigation.reset({
              index: 0,
              routes: [{ name: 'Menu' }]
            })}
          >
            <Icon name="arrow-back" size={24} color="#ffb800" />
          </TouchableOpacity>
          
          {/* Profile Header */}
          <View className="flex-row items-center mb-5">
            <View className="mr-4">
              <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center">
                <Icon name="person" size={48} color="#9ca3af" />
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-800 mb-3">{username}</Text>
              <TouchableOpacity 
                className="bg-primary px-5 py-2 rounded-full self-start"
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
                <Text className="text-lg font-bold text-gray-800">
                  {weight > 0 ? `${weight} kg` : 'ไม่ระบุ'}
                </Text>
              </View>
              <View className="flex-1 bg-gray-50 p-4 rounded-xl mx-1 items-center">
                <Text className="text-sm text-gray-500 mb-1">ส่วนสูง</Text>
                <Text className="text-lg font-bold text-gray-800">
                  {height > 0 ? `${height} cm` : 'ไม่ระบุ'}
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between">
              <View className="flex-1 bg-gray-50 p-4 rounded-xl mx-1 items-center">
                <Text className="text-sm text-gray-500 mb-1">อายุ</Text>
                <Text className="text-lg font-bold text-gray-800">
                  {age > 0 ? `${age} ปี` : 'ไม่ระบุ'}
                </Text>
              </View>
              <View className="flex-1 bg-gray-50 p-4 rounded-xl mx-1 items-center">
                <Text className="text-sm text-gray-500 mb-1">BMI</Text>
                <Text className="text-lg font-bold text-gray-800">
                  {bmiValue > 0 ? bmiValue : 'ไม่ระบุ'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* BMI Chart Section */}
        {bmiValue > 0 ? (
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
                  style={{ left: `${Math.min(Math.max(((bmiValue - 15) / 25) * 100, 0), 100)}%`, marginLeft: -15 }}
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
                {getBMIDescription(currentCategory)}
              </Text>
            </View>
          </View>
        ) : (
          <View className="bg-white mx-4 mt-4 rounded-xl p-5 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-5 text-center">ดัชนีมวลกาย (BMI)</Text>
            <View className="items-center py-8">
              <Icon name="analytics-outline" size={60} color="#9ca3af" />
              <Text className="text-gray-500 text-center mt-4 leading-6">
                กรุณาเพิ่มข้อมูลน้ำหนักและส่วนสูง{'\n'}เพื่อดูดัชนีมวลกายของคุณ
              </Text>
              <TouchableOpacity 
                className="bg-primary px-6 py-3 rounded-xl mt-4"
                onPress={() => navigation.navigate('EditProfile')}
              >
                <Text className="text-white font-semibold">เพิ่มข้อมูล</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <Menu />
    </SafeAreaView>
  );
};

export default ProfileDetailScreen;
