import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../AuthContext';
import Menu from '../material/Menu';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfileDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, fetchUserProfile, loading: authLoading } = useAuth();
  
  const [profileData, setProfileData] = useState(user);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const latestProfile = await fetchUserProfile();
      if (latestProfile) {
        setProfileData(latestProfile);
      }
    } catch (error) {
      console.error('❌ Error loading profile:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถดึงข้อมูลโปรไฟล์ได้');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchUserProfile]);

  useEffect(() => {
    setLoading(true);
    loadProfile();
  }, [loadProfile]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadProfile();
    }, [loadProfile])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    console.log('ProfileDetailScreen data:', {
      bmiValue,
      weight,
      height,
      age,
      username,
      targetWeight,
      startWeight,
      targetGoal,
    });
  }, [profileData]);

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
  const targetWeight = profileData?.target_weight || 0;
  const startWeight = profileData?.last_updated_weight || 0;
  const targetGoal = profileData?.target_goal;

  const WeightProgressChart = ({
    currentWeight,
    startWeight,
    targetWeight,
    targetGoal,
  }: {
    currentWeight: number;
    startWeight: number;
    targetWeight: number;
    targetGoal?: 'increase' | 'decrease' | 'healthy' | null;
  }) => {
    console.log('WeightProgressChart props:', { currentWeight, startWeight, targetWeight, targetGoal });
    if (targetGoal === 'healthy' || !startWeight || !targetWeight || startWeight === targetWeight) {
      console.log('WeightProgressChart: Not rendering due to conditions.', {
        isHealthy: targetGoal === 'healthy',
        noStartWeight: !startWeight,
        noTargetWeight: !targetWeight,
        isSameWeight: startWeight === targetWeight,
      });
      return null; // Don't render if goal is healthy or data is invalid
    }
  
    const minWeight = Math.min(startWeight, targetWeight);
    const maxWeight = Math.max(startWeight, targetWeight);
  
    const progress = maxWeight - minWeight === 0 ? 0 : ((currentWeight - minWeight) / (maxWeight - minWeight)) * 100;
    const clampedProgress = Math.max(0, Math.min(100, progress));
  
    const weightLost = Math.max(0, startWeight - currentWeight).toFixed(1);
    const weightGained = Math.max(0, currentWeight - startWeight).toFixed(1);
    const weightRemaining = Math.abs(targetWeight - currentWeight).toFixed(1);
  
    return (
      <View className="bg-white mx-4 mt-4 rounded-xl p-5 shadow-sm">
        <Text className="text-lg font-promptBold text-gray-800 mb-5 text-center">
          ติดตามเป้าหมายน้ำหนัก
        </Text>
        <View className="w-full">
          {/* Labels */}
          <View className="flex-row justify-between mb-2 px-2">
            <View className="items-center">
              <Text className="font-promptSemiBold text-gray-700">{startWeight} kg</Text>
              <Text className="font-prompt text-xs text-gray-500">เริ่มต้น</Text>
            </View>
            <View className="items-center">
              <Text className="font-promptSemiBold text-gray-700">{targetWeight} kg</Text>
              <Text className="font-prompt text-xs text-gray-500">เป้าหมาย</Text>
            </View>
          </View>
  
          {/* Progress Bar */}
          <View className="h-3 bg-gray-200 rounded-full w-full relative my-4">
             <View style={{ width: `${clampedProgress}%` }} className="h-full bg-primary rounded-full" />
            {/* Current Weight Indicator */}
            <View
              style={{ left: `${clampedProgress}%`, transform: [{ translateX: -12 }] }}
              className="absolute -top-5 items-center"
            >
              <Text className="font-promptBold text-primary text-base">{currentWeight} kg</Text>
              <View className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-primary" />
            </View>
          </View>
          
          {/* Progress description */}
          <View className="mt-6 items-center">
              <Text className="font-prompt text-center text-gray-600">
                  {targetGoal === 'decrease' ? `ลดไปแล้ว ${weightLost} kg` : `เพิ่มขึ้นมา ${weightGained} kg`}
              </Text>
              <Text className="font-prompt text-center text-gray-500 text-sm">
                  {`เหลืออีก ${weightRemaining} kg ถึงเป้าหมาย`}
              </Text>
          </View>
        </View>
      </View>
    );
  };

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

  if (authLoading || loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View>
          
        </View>
        <View className="bg-primary px-4 py-4 pt-10">
          <Text className="text-2xl font-bold text-white text-center font-prompt">ข้อมูลโปรไฟล์</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text className="text-gray-600 mt-4 text-lg font-prompt">
            {authLoading ? 'กำลังตรวจสอบการเข้าสู่ระบบ...' : 'กำลังโหลดข้อมูลโปรไฟล์...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profileData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="bg-primary px-4 py-4 pt-10">
          <Text className="text-2xl font-bold text-white text-center font-prompt">ข้อมูลโปรไฟล์</Text>
        </View>
        <View className="flex-1 items-center justify-center px-4">
          <Icon name="person-circle-outline" size={80} color="#9ca3af" />
          <Text className="text-gray-600 text-lg text-center mt-4 font-prompt">ไม่พบข้อมูลโปรไฟล์</Text>
          <TouchableOpacity 
            className="bg-primary px-6 py-3 rounded-xl mt-4"
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text className="text-white font-promptSemiBold">เพิ่มข้อมูลโปรไฟล์</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary px-4 py-4 pt-10 flex-row items-center justify-center relative">
        <TouchableOpacity 
            className="absolute left-4 top-8 w-10 h-10 items-center justify-center"
            onPress={() => navigation.reset({
              index: 0,
              routes: [{ name: 'Menu' }]
            })}
          >
            <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text className="text-2xl text-white font-promptBold">ข้อมูลโปรไฟล์</Text>
      </View>

      {/* Main Content */}
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#f59e0b"]}/>}
      >
        {/* Profile Section */}
        <View className="bg-white mx-4 mt-6 rounded-xl p-5 shadow-sm">
          
          
          {/* Profile Header */}
          <View className="flex-row items-center mb-5">
            <View className="mr-4">
              <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center">
                <Icon name="person" size={48} color="#9ca3af" />
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-2xl text-gray-800 mb-3 font-promptBold">{username}</Text>
              <TouchableOpacity 
                className="bg-primary px-5 py-2 rounded-full self-start"
                onPress={() => navigation.navigate('EditProfile')}
              >
                <Text className="text-white text-sm font-promptSemiBold">แก้ไข</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Personal Information */}
          <View className="mt-2">
            <View className="flex-row justify-between mb-3">
              <View className="flex-1 bg-gray-50 p-4 rounded-xl mx-1 items-center">
                <Text className="text-sm text-gray-500 mb-1 font-prompt">น้ำหนัก</Text>
                <Text className="text-lg text-gray-800 font-promptSemiBold">
                  {weight > 0 ? `${weight} kg` : 'ไม่ระบุ'}
                </Text>
              </View>
              <View className="flex-1 bg-gray-50 p-4 rounded-xl mx-1 items-center">
                <Text className="text-sm text-gray-500 mb-1 font-prompt">ส่วนสูง</Text>
                <Text className="text-lg text-gray-800 font-promptSemiBold">
                  {height > 0 ? `${height} cm` : 'ไม่ระบุ'}
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between">
              <View className="flex-1 bg-gray-50 p-4 rounded-xl mx-1 items-center">
                <Text className="text-sm text-gray-500 mb-1 font-prompt">อายุ</Text>
                <Text className="text-lg text-gray-800 font-promptSemiBold">
                  {age > 0 ? `${age} ปี` : 'ไม่ระบุ'}
                </Text>
              </View>
              <View className="flex-1 bg-gray-50 p-4 rounded-xl mx-1 items-center">
                <Text className="text-sm text-gray-500 mb-1 font-prompt">BMI</Text>
                <Text className="text-lg text-gray-800 font-promptSemiBold">
                  {bmiValue > 0 ? bmiValue : 'ไม่ระบุ'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Weight Progress Chart */}
        {/* <WeightProgressChart 
          currentWeight={weight}
          startWeight={startWeight}
          targetWeight={targetWeight}
          targetGoal={targetGoal}
        /> */}

        {/* BMI Chart Section */}
        {bmiValue > 0 ? (
          <View className="bg-white mx-4 mt-4 rounded-xl p-5 shadow-sm">
            <Text className="text-lg text-gray-800 mb-5 text-center font-promptBold">ดัชนีมวลกาย (BMI)</Text>
            
            {/* BMI Scale */}
            <View className="mb-5">
              <View className="flex-row justify-between mb-2">
                <Text className="text-xs text-gray-500 font-prompt">15</Text>
                <Text className="text-xs text-gray-500 font-prompt">20</Text>
                <Text className="text-xs text-gray-500 font-prompt">25</Text>
                <Text className="text-xs text-gray-500 font-prompt">30</Text>
                <Text className="text-xs text-gray-500 font-prompt">35</Text>
                <Text className="text-xs text-gray-500 font-prompt">40</Text>
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
                    <Text className="text-xs text-center mb-0.5 font-promptSemiBold" style={{ color: category.color }}>
                      {category.label}
                    </Text>
                    <Text className="text-xs text-gray-500 text-center font-prompt">{category.range}</Text>
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
                  <Text className="text-xs text-gray-800 mt-1 font-promptBold">{bmiValue}</Text>
                </View>
              </View>
            </View>

            {/* BMI Status */}
            <View className="items-center mt-4">
              <Text className="text-base text-gray-800 mb-2 font-promptSemiBold">สถานะปัจจุบัน</Text>
              <View className="flex-row items-center mb-2">
                <View 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: bmiCategories[currentCategory].color }}
                />
                <Text 
                  className="text-base font-promptSemiBold"
                  style={{ color: bmiCategories[currentCategory].color }}
                >
                  {bmiCategories[currentCategory].label}
                </Text>
              </View>
              <Text className="text-sm text-gray-500 text-center leading-5 font-prompt">
                {getBMIDescription(currentCategory)}
              </Text>
            </View>
          </View>
        ) : (
          <View className="bg-white mx-4 mt-4 rounded-xl p-5 shadow-sm">
            <Text className="text-lg text-gray-800 mb-5 text-center font-promptBold">ดัชนีมวลกาย (BMI)</Text>
            <View className="items-center py-8">
              <Icon name="analytics-outline" size={60} color="#9ca3af" />
              <Text className="text-gray-500 text-center mt-4 leading-6 font-prompt">
                กรุณาเพิ่มข้อมูลน้ำหนักและส่วนสูง{'\n'}เพื่อดูดัชนีมวลกายของคุณ
              </Text>
              <TouchableOpacity 
                className="bg-primary px-6 py-3 rounded-xl mt-4"
                onPress={() => navigation.navigate('EditProfile')}
              >
                <Text className="text-white font-promptSemiBold">เพิ่มข้อมูล</Text>
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
