import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator, RefreshControl, Modal, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../AuthContext';
import Menu from '../material/Menu';
import { calculateBMIResult, getBMICategories, isChildForBMI } from '../../utils/bmiCalculator';
import { apiClient } from '../../utils/apiClient';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfileDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, fetchUserProfile, loading: authLoading } = useAuth();
  
  const [profileData, setProfileData] = useState(user);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Weight update modal states
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');

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

  // Calculate BMI using the new utility
  const weight = profileData?.weight || 0;
  const height = profileData?.height || 0;
  const age = profileData?.age || 0;
  const gender = profileData?.gender as 'male' | 'female' | 'other' | undefined;
  
  const bmiResult = calculateBMIResult(weight, height, age, gender);
  const bmiValue = bmiResult.bmi;
  const isChild = isChildForBMI(age);
  const bmiCategories = getBMICategories(age);

  const username = profileData?.username || 'ผู้ใช้';
  const targetWeight = profileData?.target_weight || 0;
  const startWeight = profileData?.last_updated_weight || 0;
  const targetGoal = profileData?.target_goal;

  // Weight update functions
  const showEditWeight = () => {
    setNewWeight(weight.toString());
    setShowWeightModal(true);
  };

  const handleWeightUpdate = async () => {
    try {
      const weightValue = parseFloat(newWeight);
      
      if (!weightValue || weightValue <= 0) {
        Alert.alert('ข้อผิดพลาด', 'กรุณากรอกน้ำหนักที่ถูกต้อง');
        return;
      }

      // Call API to update weight
      await apiClient.updateWeight(weightValue);
      
      // Close modal first
      setShowWeightModal(false);
      setNewWeight('');
      
      // Show success message
      Alert.alert('สำเร็จ', 'อัพเดทน้ำหนักเรียบร้อยแล้ว');
      
      // Refresh profile data
      await loadProfile();
      
    } catch (error: any) {
      console.error('Error updating weight:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถอัพเดทน้ำหนักได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const closeWeightModal = () => {
    setShowWeightModal(false);
    setNewWeight('');
  };

  // Helper functions for weight adjustment
  const increaseWeight = () => {
    const currentValue = parseFloat(newWeight) || weight;
    const newValue = currentValue + 0.1;
    setNewWeight(newValue.toFixed(1));
  };

  const decreaseWeight = () => {
    const currentValue = parseFloat(newWeight) || weight;
    const newValue = Math.max(0, currentValue - 0.1);
    setNewWeight(newValue.toFixed(1));
  };

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

  // Use BMI result from utility
  const currentCategory = bmiCategories.findIndex(cat => cat.label === bmiResult.category);
  const currentBMIColor = bmiResult.color;

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
                <TouchableOpacity
                  className="absolute right-4 top-4"
                  onPress={() => showEditWeight()}
                >
                  <Icon name="pencil" size={16} color="#ffb800" />
                </TouchableOpacity>
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
                  style={{ backgroundColor: bmiResult.color }}
                />
                <Text 
                  className="text-base font-promptSemiBold"
                  style={{ color: bmiResult.color }}
                >
                  {bmiResult.category}
                  {isChild && (
                    <Text className="text-xs text-gray-500"> (เด็ก)</Text>
                  )}
                </Text>
              </View>
              <Text className="text-sm text-gray-500 text-center leading-5 font-prompt">
                {bmiResult.description}
                {isChild && bmiResult.percentileInfo && (
                  <Text className="block mt-1 text-xs text-blue-600">
                    {bmiResult.percentileInfo}
                  </Text>
                )}
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

      <Menu />

      {/* Weight Update Modal */}
      <Modal
        visible={showWeightModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeWeightModal}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white mx-6 rounded-2xl p-6 w-80">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-promptBold text-gray-800">อัพเดทน้ำหนัก</Text>
              <TouchableOpacity onPress={closeWeightModal}>
                <Icon name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Description */}
            <View className="bg-blue-50 rounded-xl p-3 mb-6">
              <View className="flex-row items-center mb-1">
                <Icon name="information-circle" size={16} color="#3b82f6" />
                <Text className="text-sm font-promptMedium text-blue-700 ml-2">เกี่ยวกับการอัพเดทน้ำหนัก</Text>
              </View>
              <Text className="text-xs text-blue-600 font-prompt leading-4">
                การบันทึกน้ำหนักจะถูกเก็บไว้ในระบบเพื่อติดตามสถิติและความเปลี่ยนแปลงของคุณเมื่อเวลาผ่านไป
              </Text>
            </View>

           

            {/* New Weight Input */}
            <View className="mb-6">
              <Text className="text-base font-promptMedium text-gray-700 mb-2">น้ำหนักใหม่</Text>
              <View className="flex-row items-center">
                {/* Weight Input Container */}
                <View className="flex-1 bg-gray-50 rounded-xl px-4 py-3 flex-row items-center">
                  <TextInput
                    className="flex-1 text-lg font-promptMedium text-gray-800"
                    value={newWeight}
                    onChangeText={setNewWeight}
                    placeholder="กรอกน้ำหนักใหม่"
                    keyboardType="numeric"
                    autoFocus={true}
                    selectTextOnFocus={true}
                  />
                  <Text className="text-gray-500 font-prompt ml-2">kg</Text>
                </View>
                
                
                {/* Helper Buttons - Vertical Stack */}
                <View className="ml-3 items-center">
                  {/* Plus Button */}
                  <TouchableOpacity
                    className="bg-primary w-10 h-10 rounded-lg items-center justify-center mb-2"
                    onPress={increaseWeight}
                  >
                    <Icon name="add" size={20} color="white" />
                  </TouchableOpacity>
                  
                  {/* Minus Button */}
                  <TouchableOpacity
                    className="bg-gray-400 w-10 h-10 rounded-lg items-center justify-center"
                    onPress={decreaseWeight}
                  >
                    <Icon name="remove" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Weight Change Indicator */}
            {newWeight && !isNaN(parseFloat(newWeight)) && (
              <View className="mb-6">
                {(() => {
                  const newWeightValue = parseFloat(newWeight);
                  const weightDiff = newWeightValue - weight;
                  const isIncrease = weightDiff > 0;
                  const isDecrease = weightDiff < 0;
                  
                  if (Math.abs(weightDiff) < 0.1) {
                    return (
                      <View className="bg-gray-50 rounded-xl p-3">
                        <Text className="text-center text-gray-600 font-prompt">ไม่มีการเปลี่ยนแปลงน้ำหนัก</Text>
                      </View>
                    );
                  }
                  
                  return (
                    <View className={`rounded-xl p-3 ${isIncrease ? 'bg-orange-50' : 'bg-green-50'}`}>
                      <View className="flex-row items-center justify-center">
                        <Icon 
                          name={isIncrease ? "trending-up" : "trending-down"} 
                          size={16} 
                          color={isIncrease ? "#f97316" : "#22c55e"} 
                        />
                        <Text className={`ml-2 font-promptMedium ${isIncrease ? 'text-orange-600' : 'text-green-600'}`}>
                          {isIncrease ? 'เพิ่มขึ้น' : 'ลดลง'} {Math.abs(weightDiff).toFixed(1)} kg
                        </Text>
                      </View>
                    </View>
                  );
                })()}
              </View>
            )}

            {/* Action Buttons */}
            <View className="flex-row space-x-3 gap-1">
              <TouchableOpacity
                className="flex-1 bg-gray-200 rounded-xl py-3 items-center"
                onPress={closeWeightModal}
              >
                <Text className="text-gray-700 font-promptMedium">ยกเลิก</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className={`flex-1 rounded-xl py-3 items-center ${
                  newWeight && !isNaN(parseFloat(newWeight)) ? 'bg-primary' : 'bg-gray-300'
                }`}
                onPress={handleWeightUpdate}
                disabled={!newWeight || isNaN(parseFloat(newWeight))}
              >
                <Text className={`font-promptMedium ${
                  newWeight && !isNaN(parseFloat(newWeight)) ? 'text-white' : 'text-gray-500'
                }`}>
                  บันทึก
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileDetailScreen;
