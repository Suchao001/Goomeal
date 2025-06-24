import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * EditAccountSettingsScreen Component
 * หน้าแก้ไขการตั้งค่าบัญชี - แก้ไขข้อมูลบัญชีผู้ใช้
 */
const EditAccountSettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  
  // State for form data
  const [username, setUsername] = useState('suchao');
  const [email, setEmail] = useState('suchao@gmail.com');
  const [password, setPassword] = useState('••••••••');
  
  // State for editing mode
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  const handleSaveAndEdit = () => {
    // Here you would typically save the data to your backend
    Alert.alert(
      'บันทึกข้อมูล',
      'ข้อมูลถูกบันทึกเรียบร้อยแล้ว',
      [
        {
          text: 'ตกลง',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'ออกจากระบบ',
      'คุณต้องการออกจากระบบหรือไม่?',
      [
        {
          text: 'ยกเลิก',
          style: 'cancel'
        },
        {
          text: 'ออกจากระบบ',
          style: 'destructive',
          onPress: () => {
            // Handle logout logic here
            navigation.navigate('Login');
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 flex-row items-center justify-between shadow-sm">
        <TouchableOpacity 
          className="w-10 h-10 rounded-full bg-yellow-100 items-center justify-center"
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#f59e0b" />
        </TouchableOpacity>
        
        <View className="flex-row items-center">
          <Icon name="person-circle" size={32} color="#9ca3af" />
          <Text className="text-xl font-promptBold text-gray-800 ml-2">แก้ไข</Text>
        </View>
        
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {/* Form Container */}
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          
          {/* Username Field */}
          <View className="mb-6">
            <Text className="text-base font-promptMedium text-gray-700 mb-3">ชื่อผู้ใช้</Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl p-4">
              <TextInput
                className="flex-1 font-prompt text-gray-800"
                value={username}
                onChangeText={setUsername}
                editable={isEditingUsername}
                placeholder="ชื่อผู้ใช้"
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity
                className="ml-3 w-8 h-8 rounded-full bg-blue-100 items-center justify-center"
                onPress={() => setIsEditingUsername(!isEditingUsername)}
              >
                <Icon 
                  name={isEditingUsername ? "checkmark" : "create"} 
                  size={16} 
                  color="#3b82f6" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Email Field */}
          <View className="mb-6">
            <Text className="text-base font-promptMedium text-gray-700 mb-3">อีเมล</Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl p-4">
              <TextInput
                className="flex-1 font-prompt text-gray-800"
                value={email}
                onChangeText={setEmail}
                editable={isEditingEmail}
                placeholder="อีเมล"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity
                className="ml-3 w-8 h-8 rounded-full bg-green-100 items-center justify-center"
                onPress={() => setIsEditingEmail(!isEditingEmail)}
              >
                <Icon 
                  name={isEditingEmail ? "checkmark" : "create"} 
                  size={16} 
                  color="#22c55e" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Password Field */}
          <View className="mb-6">
            <Text className="text-base font-promptMedium text-gray-700 mb-3">รหัสผ่าน</Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl p-4">
              <TextInput
                className="flex-1 font-prompt text-gray-800"
                value={password}
                onChangeText={setPassword}
                editable={isEditingPassword}
                placeholder="รหัสผ่าน"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!isEditingPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                className="ml-3 w-8 h-8 rounded-full bg-purple-100 items-center justify-center"
                onPress={() => setIsEditingPassword(!isEditingPassword)}
              >
                <Icon 
                  name={isEditingPassword ? "checkmark" : "create"} 
                  size={16} 
                  color="#8b5cf6" 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mt-6 space-y-3">
          {/* Save Button */}
          <TouchableOpacity
            className="bg-yellow-500 rounded-xl p-4 flex-row items-center justify-center shadow-sm"
            onPress={handleSaveAndEdit}
          >
            <Icon name="create" size={24} color="white" />
            <Text className="text-white text-lg font-promptBold ml-2">บันทึกและแก้ไข</Text>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
            className="bg-red-500 mt-1 rounded-xl p-4 flex-row items-center justify-center shadow-sm"
            onPress={handleLogout}
          >
            <Icon name="log-out" size={24} color="white" />
            <Text className="text-white text-lg font-promptBold ml-2">ออกจากระบบ</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View className="mt-8 items-center">
          <Text className="text-gray-400 font-prompt text-sm">GoodMeal App v1.0.0</Text>
          <Text className="text-gray-400 font-prompt text-xs mt-1">© 2024 GoodMeal Team</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default EditAccountSettingsScreen;
