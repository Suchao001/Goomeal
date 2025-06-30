import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const EditProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  
  const [height, setHeight] = useState('180');
  const [weight, setWeight] = useState('75');
  const [age, setAge] = useState('20');
  const [gender, setGender] = useState('ชาย');
  const [bmiReference, setBmiReference] = useState('ชาย');
  const [username, setUsername] = useState('suchao');

  const handleSave = () => {
    console.log('Saving profile data:', {
      height,
      weight,
      age,
      gender,
      bmiReference,
      username
    });
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-gray-100">
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4 bg-white">
        <TouchableOpacity 
          className="w-10 h-10 rounded-full bg-yellow-100 items-center justify-center"
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fbbf24" />
        </TouchableOpacity>
        
        <View className="flex-row items-center gap-2">
          <Icon name="person-circle" size={32} color="#9ca3af" />
          <Text className="text-lg font-semibold text-gray-800">แก้ไขโปรไฟล์</Text>
        </View>
        
        <Text className="text-base font-semibold text-gray-800">9:41</Text>
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

          <View className="mb-5">
            <Text className="text-base font-semibold text-gray-700 mb-2">ดัชนีมวลกาย</Text>
            <View className="flex-row gap-2">
              {['ชาย', 'หญิง', 'อื่นๆ'].map((option) => (
                <TouchableOpacity
                  key={option}
                  className={`flex-1 py-3 px-4 rounded-xl items-center ${
                    bmiReference === option ? 'bg-primary' : 'bg-gray-200'
                  }`}
                  onPress={() => setBmiReference(option)}
                >
                  <Text className={`text-base font-medium ${
                    bmiReference === option ? 'text-white' : 'text-gray-600'
                  }`}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mb-5">
            <Text className="text-base font-semibold text-gray-700 mb-2">ชื่อผู้ใช้</Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-3 py-4">
              <TextInput
                className="flex-1 text-base text-gray-700"
                value={username}
                onChangeText={setUsername}
                placeholder="ชื่อผู้ใช้"
                placeholderTextColor="#9ca3af"
              />
              <Icon name="chevron-forward" size={20} color="#fbbf24" />
            </View>
          </View>
 <TouchableOpacity 
        className="bg-primary mx-4 mb-5 rounded-xl py-4 items-center shadow-lg shadow-slate-800"
        onPress={handleSave}
      >
        <Text className="text-white text-lg font-bold">บันทึก</Text>
      </TouchableOpacity>
          
        </View>
       
      </ScrollView>

      
    </View>
  );
};

export default EditProfileScreen;