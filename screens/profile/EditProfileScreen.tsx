import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../AuthContext';
import { apiClient } from '../../utils/apiClient';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const EditProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, fetchUserProfile, loading: authLoading } = useAuth();
  
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('ชาย');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  // New fields
  const [targetGoal, setTargetGoal] = useState<'decrease' | 'increase' | 'healthy'>('healthy');
  const [targetWeight, setTargetWeight] = useState('');
  const [bodyFat, setBodyFat] = useState<'low' | 'normal' | 'high' | 'don\'t know'>('normal');
  const [activityLevel, setActivityLevel] = useState('');
  
  // Dropdown states
  const [openTargetWeight, setOpenTargetWeight] = useState(false);
  const [openActivityLevel, setOpenActivityLevel] = useState(false);

  // Memoized dropdown items
  const weightChangeItems = useMemo(
    () =>
      [...Array(30).keys()].map((weight) => ({
        label: `${weight + 1} kg`,
        value: `${weight + 1}`,
      })),
    []
  );

  const bodyFatItems = useMemo(() => [
    { label: 'ต่ำ', value: 'low' },
    { label: 'ปานกลาง', value: 'normal' },
    { label: 'สูง', value: 'high' },
    { label: 'ไม่ทราบ', value: 'don\'t know' }
  ], []);

  const activityLevelItems = useMemo(() => [
    { label: 'น้อย (ไม่ออกกำลังกาย)', value: 'sedentary' },
    { label: 'เบา (ออกกำลังกาย 1-3 วัน/สัปดาห์)', value: 'light' },
    { label: 'ปานกลาง (ออกกำลังกาย 3-5 วัน/สัปดาห์)', value: 'moderate' },
    { label: 'หนัก (ออกกำลังกาย 6-7 วัน/สัปดาห์)', value: 'active' },
    { label: 'หนักมาก (ออกกำลังกาย 2 ครั้ง/วัน)', value: 'very_active' }
  ], []);

  // Initialize form with user data
  useEffect(() => {
    console.log('EditProfileScreen');
    if (user) {
      const userHeight = typeof user.height === 'string' ? parseFloat(user.height) : user.height;
      const userWeight = typeof user.weight === 'string' ? parseFloat(user.weight) : user.weight;
      const userAge = typeof user.age === 'string' ? parseInt(user.age) : user.age;
      
      setUsername(user.username || '');
      setHeight(userHeight ? Math.round(userHeight).toString() : '');
      setWeight(userWeight ? Math.round(userWeight).toString() : '');
      setAge(userAge ? userAge.toString() : '');
      setGender(convertGenderToThai(user.gender || 'other'));

      // Set new fields if available
      if (user.target_goal) {
        setTargetGoal(user.target_goal as 'decrease' | 'increase' | 'healthy');
      }
      if (user.target_weight && user.target_goal && user.target_goal !== 'healthy') {
        const currentWeight = userWeight;
        if (currentWeight) {
          const displayWeight = Math.abs(user.target_weight - currentWeight);
          setTargetWeight(displayWeight > 0 ? displayWeight.toString() : '1');
        }
      }
      if (user.body_fat) {
        setBodyFat(user.body_fat as 'low' | 'normal' | 'high' | 'don\'t know');
      }
      if (user.activity_level) {
        setActivityLevel(user.activity_level);
      }
          
     console.log('weightChangeItems length:', weightChangeItems.length, 'first 5 items:', weightChangeItems.slice(0, 5), 'last 5 items:', weightChangeItems.slice(-5));
     console.log('bodyFatItems:', bodyFatItems, 'activityLevelItems:', activityLevelItems);
    } else {
      console.log('⚠️ [EditProfile] No user data available in AuthContext');
    }
  }, [user]);

  // Handle API errors
  const handleApiError = (error: any) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      return {
        title: 'หมดเวลาเซสชัน',
        message: 'กรุณาเข้าสู่ระบบใหม่',
        shouldLogout: true
      };
    } else if (error.response?.status === 403) {
      return {
        title: 'ไม่มีสิทธิ์',
        message: 'คุณไม่มีสิทธิ์ในการดำเนินการนี้',
        shouldLogout: false
      };
    } else if (error.response?.status >= 500) {
      return {
        title: 'ข้อผิดพลาดของเซิร์ฟเวอร์',
        message: 'กรุณาลองใหม่อีกครั้งในภายหลัง',
        shouldLogout: false
      };
    } else if (!error.response) {
      return {
        title: 'ไม่สามารถเชื่อมต่อได้',
        message: 'กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
        shouldLogout: false
      };
    } else {
      return {
        title: 'ข้อผิดพลาด',
        message: error.response?.data?.message || 'เกิดข้อผิดพลาดที่ไม่คาดคิด',
        shouldLogout: false
      };
    }
  };

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

  // Fetch user profile data using AuthContext
  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      const userData = await fetchUserProfile();

      if (userData) {
        // Convert string values to proper format
        const userHeight = typeof userData.height === 'string' ? parseFloat(userData.height) : userData.height;
        const userWeight = typeof userData.weight === 'string' ? parseFloat(userData.weight) : userData.weight;
        const userAge = typeof userData.age === 'string' ? parseInt(userData.age) : userData.age;
        
        setUsername(userData.username || '');
        setHeight(userHeight ? Math.round(userHeight).toString() : '');
        setWeight(userWeight ? Math.round(userWeight).toString() : '');
        setAge(userAge ? userAge.toString() : '');
        setGender(convertGenderToThai(userData.gender || 'other'));

       
        if (userData.target_goal) {
          setTargetGoal(userData.target_goal as 'decrease' | 'increase' | 'healthy');
        }
        if (userData.target_weight && userData.target_goal && userData.target_goal !== 'healthy') {
          // Calculate display value: target_weight - current_weight for both increase and decrease
          const currentWeight = userWeight;
          if (currentWeight) {
            const displayWeight = Math.abs(userData.target_weight - currentWeight);
            setTargetWeight(displayWeight > 0 ? displayWeight.toString() : '1');
          }
        }
        if (userData.body_fat) {
          setBodyFat(userData.body_fat as 'low' | 'normal' | 'high' | 'don\'t know');
        }
        if (userData.activity_level) {
          setActivityLevel(userData.activity_level);
        }
        
        
      } else {
        console.log('⚠️ [EditProfile] No user data returned from fetchUserProfile');
      }
    } catch (error: any) {
      console.error('❌ [EditProfile] Error fetching profile:', error);
      
      const errorInfo = handleApiError(error);
      
      Alert.alert(
        errorInfo.title,
        errorInfo.message,
        [
          { 
            text: 'ตกลง', 
            onPress: () => {
              if (errorInfo.shouldLogout) {
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

  // Listen for navigation focus to refresh profile
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('🔄 [EditProfile] Screen focused, refreshing profile...');
      if (user) {
        fetchProfile();
      }
    });

    return unsubscribe;
  }, [navigation, user]);

  // Show loading if auth is loading
  if (authLoading) {
    return (
      <View className="flex-1 bg-gray-100 items-center justify-center">
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text className="text-gray-600 mt-4 text-lg">กำลังตรวจสอบการเข้าสู่ระบบ...</Text>
      </View>
    );
  }
 // Set new fields if available
  const handleSave = async () => {
    try {
      // Validate required fields
      if (!height || !weight || !age) {
        Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกข้อมูลส่วนสูง น้ำหนัก และอายุให้ครบถ้วน');
        return;
      }

      if (targetGoal !== 'healthy' && !targetWeight) {
        Alert.alert('ข้อมูลไม่ครบ', 'กรุณาเลือกน้ำหนักที่ต้องการเปลี่ยนแปลง');
        return;
      }

      if (!activityLevel) {
        Alert.alert('ข้อมูลไม่ครบ', 'กรุณาเลือกระดับกิจกรรม');
        return;
      }

      setLoading(true);
      
      // Calculate actual target weight for API
      let actualTargetWeight = undefined;
      if (targetGoal !== 'healthy') {
        const currentWeight = parseFloat(weight);
        const changeAmount = parseInt(targetWeight);
        
        if (targetGoal === 'increase') {
          actualTargetWeight = currentWeight + changeAmount;
        } else if (targetGoal === 'decrease') {
          actualTargetWeight = currentWeight - changeAmount;
        }
      }
      
      const updateData = {
        height: parseFloat(height),
        weight: parseFloat(weight),
        age: parseInt(age),
        gender: convertGenderToEng(gender),
        target_goal: targetGoal,
        target_weight: actualTargetWeight,
        body_fat: bodyFat,
        activity_level: activityLevel
      };

      

      const response = await apiClient.put('/user/update-personal-data', updateData);


      if (response.data.success) {
        // Refresh user profile in AuthContext
        await fetchUserProfile();
        
        Alert.alert('สำเร็จ', 'บันทึกข้อมูลเรียบร้อยแล้ว', [
          { text: 'ตกลง', onPress: () => navigation.reset({
            index: 0,
            routes: [{ name: 'ProfileDetail' }]
          }) }
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
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-primary px-4 py-4 mt-6 flex-row items-center justify-between">
        <TouchableOpacity 
          className="w-10 h-10 rounded-lg items-center justify-center"
          onPress={() => navigation.reset({
            index: 0,
            routes: [{ name: 'ProfileDetail' }]
          })}
        >
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <Text className="text-xl  text-white font-promptBold">แก้ไขโปรไฟล์</Text>
        
        <View className="w-10 h-10" />
      </View>

      <ScrollView 
        className="flex-1 px-6 py-6" 
        showsVerticalScrollIndicator={false}
        style={{ zIndex: 0 }}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* Basic Info Section */}
        <Text className="text-2xl text-gray-800 mb-6 font-promptSemiBold text-center">
          ข้อมูลพื้นฐาน
        </Text>

        {/* Height and Weight Inputs */}
        <View className="w-full flex-row justify-between mb-6">
          <View className="w-[48%]">
            <Text className="text-base font-semibold text-gray-700 mb-3 font-prompt">ส่วนสูง</Text>
            <View className="bg-gray-100 rounded-xl">
              <Picker
                selectedValue={height}
                onValueChange={(itemValue) => setHeight(itemValue)}
                style={{ color: '#374151' }}
              >
                <Picker.Item label="เลือกส่วนสูง" value="" />
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
          <View className="w-[48%]">
            <Text className="text-base font-semibold text-gray-700 mb-3 font-prompt">น้ำหนัก</Text>
            <View className="bg-gray-100 rounded-xl">
              <Picker
                selectedValue={weight}
                onValueChange={(itemValue) => setWeight(itemValue)}
                style={{ color: '#374151' }}
              >
                <Picker.Item label="เลือกน้ำหนัก" value="" />
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
        </View>

        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-700 mb-3 font-prompt">อายุ</Text>
          <View className="bg-gray-100 rounded-xl">
            <Picker
              selectedValue={age}
              onValueChange={(itemValue) => setAge(itemValue)}
              style={{ color: '#374151' }}
            >
              <Picker.Item label="เลือกอายุ" value="" />
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

        <View className="mb-8">
          <Text className="text-base font-semibold text-gray-700 mb-3 font-prompt">เพศ</Text>
          <View className="flex-row justify-between">
            {['ชาย', 'หญิง'].map((option) => (
              <TouchableOpacity
                key={option}
                className={`w-[48%] rounded-xl p-3 items-center ${
                  gender === option ? 'border border-primary bg-white' : 'bg-gray-100'
                }`}
                onPress={() => setGender(option)}
              >
                <Text className="font-prompt text-black">
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Goals Section */}
        <Text className="text-lg text-black mb-6 font-promptMedium">
          เป้าหมายของคุณ
        </Text>

        <View className="mb-6">
          <View className="flex-row flex-wrap justify-between">
            {[
              { key: 'decrease', label: 'ลดน้ำหนัก' },
              { key: 'healthy', label: 'สุขภาพดี' },
              { key: 'increase', label: 'เพิ่มน้ำหนัก' }
            ].map((target) => (
              <TouchableOpacity
                key={target.key}
                className={`w-[31%] rounded-xl p-3 items-center mb-2 ${
                  targetGoal === target.key ? 'border border-primary bg-white' : 'bg-gray-100'
                }`}
                onPress={() => setTargetGoal(target.key as 'decrease' | 'increase' | 'healthy')}
              >
                <Text className="font-prompt text-black text-sm">
                  {target.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

     
        {/* Target Weight - แสดงเฉพาะเมื่อเลือก เพิ่ม หรือ ลดน้ำหนัก */}
        {targetGoal !== 'healthy' && (
          <View className="mb-6" style={{ zIndex: openTargetWeight ? 5000 : 5 }}>
            <Text className="text-black mb-2 font-promptMedium  text-lg">
              {targetGoal === 'increase' ? 'น้ำหนักที่ต้องการเพิ่ม' : 'น้ำหนักที่ต้องการลด'}
            </Text>
            
            <DropDownPicker
              open={openTargetWeight}
              zIndex={5000}
              zIndexInverse={3000}
              onOpen={() => setOpenActivityLevel(false)}
              value={targetWeight}
              items={weightChangeItems}
              setOpen={(callback) => {
                const newOpenState = typeof callback === 'function' ? callback(openTargetWeight) : callback;
                setOpenTargetWeight(newOpenState);
                if (newOpenState) {
                  setOpenActivityLevel(false);
                }
              }}
              setValue={setTargetWeight}
              placeholder={`เลือกจำนวนกิโลกรัมที่จะ${targetGoal === 'increase' ? 'เพิ่ม' : 'ลด'}`}
              containerStyle={{ height: 50, marginBottom: openTargetWeight ? 200 : 10 }}
              style={{
                backgroundColor: '#F3F4F6',
                borderRadius: 14,
                borderWidth: 0,
                paddingHorizontal: 12,
              }}
              dropDownContainerStyle={{
                backgroundColor: '#F3F4F6',
                borderRadius: 8,
                borderWidth: 0,
                zIndex: 5000,
               
              }}
              textStyle={{
                fontFamily: 'Prompt-Regular',
                fontSize: 16,
              }}
              scrollViewProps={{
                nestedScrollEnabled: true,
              }}
              listMode="SCROLLVIEW"
              
            />
          </View>
        )}


        {/* Body Fat */}
        <View className="mb-6">
          <Text className="text-black mb-2 font-promptMedium  text-lg">ระดับไขมันในร่างกาย</Text>
          <Text className="text-gray-500 mb-4 font-promptLight  text-sm px-4">
            เลือกระดับที่เหมาะสมกับคุณ
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {bodyFatItems.map((level) => (
              <TouchableOpacity
                key={level.value}
                className={`w-[23%] rounded-xl p-2 items-center ${
                  bodyFat === level.value ? 'border border-primary bg-white' : 'bg-gray-100'
                }`}
                onPress={() => setBodyFat(level.value as 'low' | 'normal' | 'high' | 'don\'t know')}
              >
                <Text className="font-prompt text-sm">{level.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Activity Level */}
        <View className="mb-8"  style={{ zIndex: openActivityLevel ? 4000 : 4 }}>
          <Text className="text-gray-600 mb-2 font-promptMedium  text-lg">ระดับกิจกรรม</Text>
          <Text className="text-gray-500 mb-4 font-promptLight  text-sm px-4">
            ระดับการออกกำลังกายของคุณ
          </Text>
          <DropDownPicker
            open={openActivityLevel}
            zIndex={4000}
            zIndexInverse={2000}
            value={activityLevel}
            items={activityLevelItems}
            setOpen={(callback) => {
              const newOpenState = typeof callback === 'function' ? callback(openActivityLevel) : callback;
              setOpenActivityLevel(newOpenState);
              if (newOpenState) {
                setOpenTargetWeight(false);
              }
            }}
            setValue={setActivityLevel}
            placeholder="เลือกระดับกิจกรรม"
            containerStyle={{ height: 50, marginBottom: openActivityLevel ? 160 : 10 }}
            style={{
              backgroundColor: '#F3F4F6',
              borderRadius: 14,
              borderWidth: 0,
              paddingHorizontal: 12,
            }}
            dropDownContainerStyle={{
              backgroundColor: '#F3F4F6',
              borderRadius: 8,
              borderWidth: 0,
              zIndex: 4000,
              maxHeight: 150,
            }}
            textStyle={{
              fontFamily: 'Prompt-Regular',
              fontSize: 16,
            }}
            scrollViewProps={{
              nestedScrollEnabled: true,
            }}
            listMode="SCROLLVIEW"
           
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          className={`w-full rounded-xl p-4 justify-center items-center mb-8 ${
            loading ? 'bg-gray-400' : 'bg-primary'
          }`}
          onPress={handleSave}
          disabled={loading}
        >
          <Text className="text-white text-lg font-promptBold">
            {loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default EditProfileScreen;