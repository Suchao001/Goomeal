import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../AuthContext';
import { apiClient, handleApiError } from '../../utils/apiClient';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const EditProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  
  const [height, setHeight] = useState('180');
  const [weight, setWeight] = useState('75');
  const [age, setAge] = useState('20');
  const [gender, setGender] = useState('ชาย');
  const [username, setUsername] = useState('suchao');
  const [loading, setLoading] = useState(false);

  // Check if user is logged in
  const checkAuthStatus = async () => {
    const isAuthenticated = await apiClient.isAuthenticated();
    if (!isAuthenticated) {
      Alert.alert(
        'ไม่ได้เข้าสู่ระบบ',
        'กรุณาเข้าสู่ระบบก่อนใช้งาน',
        [
          { 
            text: 'ไปเข้าสู่ระบบ', 
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
      return false;
    }
    return true;
  };

  // Convert gender from English to Thai and vice versa
  const convertGenderToEng = (thaiGender: string) => {
    switch (thaiGender) {
      case 'ชาย': return 'male';
      case 'หญิง': return 'female';
      case 'อื่นๆ': return 'other';
      default: return 'other';
    }
  };

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
      
      console.log('� Fetching user profile...');
      
      const response = await apiClient.get('/user/profile');
      
      console.log('✅ API Response:', response.data);

      if (response.data.success) {
        const userData = response.data.user;
        setUsername(userData.username || 'suchao');
        setHeight(userData.height?.toString() || '180');
        setWeight(userData.weight?.toString() || '75');
        setAge(userData.age?.toString() || '20');
        setGender(convertGenderToThai(userData.gender || 'other'));
        
        console.log('📋 Profile data loaded:', {
          username: userData.username,
          height: userData.height,
          weight: userData.weight,
          age: userData.age,
          gender: userData.gender
        });
      }
    } catch (error: any) {
      console.error('❌ Error fetching profile:', error);
      
      const errorInfo = handleApiError(error);
      
      Alert.alert(
        errorInfo.title,
        errorInfo.message,
        [
          { 
            text: 'ตกลง', 
            onPress: () => {
              if (errorInfo.shouldLogout) {
                apiClient.logout();
                navigation.navigate('Login');
              }
            }
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeProfile = async () => {
      const isAuthenticated = await checkAuthStatus();
      if (isAuthenticated) {
        fetchProfile();
      }
    };
    
    initializeProfile();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const updateData = {
        height: parseFloat(height),
        weight: parseFloat(weight),
        age: parseInt(age),
        gender: convertGenderToEng(gender)
      };

      console.log('📝 Updating profile data:', updateData);

      const response = await apiClient.put('/user/update-personal-data', updateData);

      console.log('✅ Update Response:', response.data);

      if (response.data.success) {
        Alert.alert('สำเร็จ', 'บันทึกข้อมูลเรียบร้อยแล้ว', [
          { text: 'ตกลง', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('ข้อผิดพลาด', response.data.message || 'ไม่สามารถบันทึกข้อมูลได้');
      }
    } catch (error: any) {
      console.error('❌ Error updating profile:', error);
      
      const errorInfo = handleApiError(error);
      
      Alert.alert(
        errorInfo.title,
        errorInfo.message,
        [
          { 
            text: 'ตกลง', 
            onPress: () => {
              if (errorInfo.shouldLogout) {
                apiClient.logout();
                navigation.navigate('Login');
              }
            }
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4 bg-white">
        <TouchableOpacity 
          className="w-10 h-10 rounded-full items-center justify-center"
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fbbf24" />
        </TouchableOpacity>
        
        <View className="flex-row items-center gap-2">
          <Icon name="person-circle" size={32} color="#9ca3af" />
          <Text className="text-lg font-semibold text-gray-800">แก้ไขโปรไฟล์</Text>
        </View>
        
        <Text className="text-base font-semibold text-gray-800"></Text>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="bg-white mt-4 rounded-2xl p-5 shadow-lg shadow-slate-800">
          
          <View className="mb-5">
            <Text className="text-base font-semibold text-gray-700 mb-2">ส่วนสูง</Text>
            <View className="bg-gray-50 rounded-xl border border-gray-200">
              <Picker
                selectedValue={height}
                onValueChange={(itemValue) => setHeight(itemValue)}
                style={{ color: '#374151' }}
              >
                {Array.from({ length: 151 }, (_, i) => {
                  const value = (100 + i).toString();
                  return (
                    <Picker.Item 
                      key={value} 
                      label={`${value} cm`} 
                      value={value} 
                    />
                  );
                })}
              </Picker>
            </View>
          </View>

          <View className="mb-5">
            <Text className="text-base font-semibold text-gray-700 mb-2">น้ำหนัก</Text>
            <View className="bg-gray-50 rounded-xl border border-gray-200">
              <Picker
                selectedValue={weight}
                onValueChange={(itemValue) => setWeight(itemValue)}
                style={{ color: '#374151' }}
              >
                {Array.from({ length: 121 }, (_, i) => {
                  const value = (30 + i).toString();
                  return (
                    <Picker.Item 
                      key={value} 
                      label={`${value} kg`} 
                      value={value} 
                    />
                  );
                })}
              </Picker>
            </View>
          </View>

          <View className="mb-5">
            <Text className="text-base font-semibold text-gray-700 mb-2">อายุ</Text>
            <View className="bg-gray-50 rounded-xl border border-gray-200">
              <Picker
                selectedValue={age}
                onValueChange={(itemValue) => setAge(itemValue)}
                style={{ color: '#374151' }}
              >
                {Array.from({ length: 91 }, (_, i) => {
                  const value = (10 + i).toString();
                  return (
                    <Picker.Item 
                      key={value} 
                      label={`${value} ปี`} 
                      value={value} 
                    />
                  );
                })}
              </Picker>
            </View>
          </View>

          <View className="mb-5">
            <Text className="text-base font-semibold text-gray-700 mb-2">เพศ</Text>
            <View className="flex-row gap-2">
              {['ชาย', 'หญิง', 'อื่นๆ'].map((option) => (
                <TouchableOpacity
                  key={option}
                  className={`flex-1 py-3 px-4 rounded-xl items-center ${
                    gender === option ? 'bg-primary' : 'bg-gray-200'
                  }`}
                  onPress={() => setGender(option)}
                >
                  <Text className={`text-base font-medium ${
                    gender === option ? 'text-white' : 'text-gray-600'
                  }`}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          
          <TouchableOpacity 
            className={`mx-4 mb-5 rounded-xl py-4 items-center shadow-lg shadow-slate-800 ${
              loading ? 'bg-gray-400' : 'bg-primary'
            }`}
            onPress={handleSave}
            disabled={loading}
          >
            <Text className="text-white text-lg font-bold">
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </Text>
          </TouchableOpacity>
          
        </View>
       
      </ScrollView>

      
    </View>
  );
};

export default EditProfileScreen;