import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../AuthContext';
import axios from 'axios';
import { base_url } from '../../config';
import * as SecureStore from 'expo-secure-store';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * EditAccountSettingsScreen Component
 * หน้าแก้ไขการตั้งค่าบัญชี - แก้ไขข้อมูลบัญชีผู้ใช้
 */
const EditAccountSettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, logout: authLogout, reloadUser, fetchUserProfile } = useAuth();
  
  // State for form data
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  
  // State for editing mode
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from backend when component mounts
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      
      // Use fetchUserProfile from AuthContext to get data
      const userData = await fetchUserProfile();
      
      if (userData) {
        setUsername(userData.username || '');
        setEmail(userData.email || '');
        setPassword('••••••••');
      } else {
        // Fallback to logout instead of navigate to Login (which might not exist in current stack)
        Alert.alert(
          'ข้อผิดพลาด', 
          'ไม่สามารถโหลดข้อมูลได้ กรุณาเข้าสู่ระบบใหม่',
          [
            {
              text: 'ตกลง',
              onPress: async () => {
                await authLogout();
              }
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Load profile error:', error);
      Alert.alert(
        'ข้อผิดพลาด', 
        'ไม่สามารถโหลดข้อมูลโปรไฟล์ได้'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback to AuthContext data if API fails
  useEffect(() => {
    if (user && !isLoading) {
      if (!username) setUsername(user.username || '');
      if (!email) setEmail(user.email || '');
      if (password === '') setPassword('••••••••');
    }
  }, [user, isLoading]);

  const handleSaveAndEdit = () => {
    // Show password confirmation dialog before saving
    setShowPasswordConfirm(true);
  };

  const handleConfirmAndSave = async () => {
    if (!currentPassword) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกรหัสผ่านปัจจุบันเพื่อยืนยัน');
      return;
    }

    // If editing password, check if new passwords match
    if (isEditingPassword) {
      if (password !== confirmPassword) {
        Alert.alert('ข้อผิดพลาด', 'รหัสผ่านใหม่ไม่ตรงกัน');
        return;
      }
      if (password.length < 6) {
        Alert.alert('ข้อผิดพลาด', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
        return;
      }
    }

    try {
      // Prepare update data
      const updateData: any = {
        currentPassword,
        username,
        email,
      };

      if (isEditingPassword && password !== '••••••••') {
        updateData.newPassword = password;
      }

      const response = await axios.put(`${base_url}/user/update-profile`, updateData, {
        headers: {
          'Authorization': `Bearer ${await SecureStore.getItemAsync('accessToken')}`
        }
      });

      if (response.data.success) {
        // Update user data in SecureStore with the response
        await SecureStore.setItemAsync('user', JSON.stringify(response.data.user));

        Alert.alert(
          'สำเร็จ',
          'ข้อมูลถูกบันทึกเรียบร้อยแล้ว',
          [
            {
              text: 'ตกลง',
              onPress: () => {
                setShowPasswordConfirm(false);
                setCurrentPassword('');
                setConfirmPassword('');
                setIsEditingUsername(false);
                setIsEditingEmail(false);
                setIsEditingPassword(false);
                reloadUser(); // Reload user data
                navigation.goBack();
              }
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      Alert.alert(
        'ข้อผิดพลาด', 
        error.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้'
      );
    }
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
          onPress: async () => {
            await authLogout();
            // Don't navigate manually - AuthContext will handle navigation
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
          className="w-10 h-10  items-center justify-center"
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#ffb800" />
        </TouchableOpacity>
        
        <View className="flex-row items-center">
          <Icon name="person-circle" size={32} color="#ffb800" />
          <Text className="text-xl font-promptBold text-gray-800 ml-2">แก้ไข</Text>
        </View>
        
        <View className="w-10" />
      </View>

      {/* Loading State */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ffb800" />
          <Text className="text-gray-600 font-prompt mt-4">กำลังโหลดข้อมูล...</Text>
        </View>
      ) : (
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
                onPress={() => {
                  if (isEditingPassword) {
                    // Reset password fields when stopping edit
                    setPassword('••••••••');
                    setConfirmPassword('');
                  } else {
                    // Clear password field when starting edit
                    setPassword('');
                  }
                  setIsEditingPassword(!isEditingPassword);
                }}
              >
                <Icon 
                  name={isEditingPassword ? "checkmark" : "create"} 
                  size={16} 
                  color="#8b5cf6" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Field - Only show when editing password */}
          {isEditingPassword && (
            <View className="mb-6">
              <Text className="text-base font-promptMedium text-gray-700 mb-3">ยืนยันรหัสผ่าน</Text>
              <View className="bg-gray-50 rounded-xl p-4">
                <TextInput
                  className="font-prompt text-gray-800"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="ยืนยันรหัสผ่านใหม่"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={true}
                  autoCapitalize="none"
                />
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className="mt-6 space-y-3">
          {/* Save Button */}
          <TouchableOpacity
            className="bg-primary rounded-xl p-4 flex-row items-center justify-center shadow-sm"
            onPress={handleSaveAndEdit}
          >
            <Icon name="create" size={24} color="white" />
            <Text className="text-white text-lg font-promptBold ml-2">บันทึกและแก้ไข</Text>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
            className="bg-red-400 mt-1 rounded-xl p-4 flex-row items-center justify-center shadow-sm"
            onPress={handleLogout}
          >
            <Icon name="log-out" size={24} color="white" />
            <Text className="text-white text-lg font-promptBold ml-2">ออกจากระบบ</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View className="mt-8 items-center">
          <Text className="text-gray-400 font-prompt text-sm">GoodMeal App v1.0.0</Text>
          <Text className="text-gray-400 font-prompt text-xs mt-1">© 2025 GoodMeal Team</Text>
        </View>
        </ScrollView>
      )}

      {/* Password Confirmation Modal */}
      <Modal
        visible={showPasswordConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPasswordConfirm(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <View className="items-center mb-6">
              <Icon name="lock-closed" size={48} color="#ffb800" />
              <Text className="text-xl font-promptBold text-gray-800 mt-4 text-center">
                ยืนยันรหัสผ่าน
              </Text>
              <Text className="text-base font-prompt text-gray-600 mt-2 text-center">
                กรุณากรอกรหัสผ่านปัจจุบันเพื่อยืนยันการเปลี่ยนแปลง
              </Text>
            </View>

            <View className="mb-6">
              <Text className="text-base font-promptMedium text-gray-700 mb-3">รหัสผ่านปัจจุบัน</Text>
              <TextInput
                className="bg-gray-50 rounded-xl p-4 font-prompt text-gray-800"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="กรอกรหัสผ่านปัจจุบัน"
                placeholderTextColor="#9ca3af"
                secureTextEntry={true}
                autoCapitalize="none"
                autoFocus={true}
              />
            </View>

            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 bg-gray-200 rounded-xl p-4 items-center"
                onPress={() => {
                  setShowPasswordConfirm(false);
                  setCurrentPassword('');
                }}
              >
                <Text className="text-gray-700 font-promptBold">ยกเลิก</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-primary rounded-xl p-4 items-center"
                onPress={handleConfirmAndSave}
              >
                <Text className="text-white font-promptBold">ยืนยัน</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EditAccountSettingsScreen;
