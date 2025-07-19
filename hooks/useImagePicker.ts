import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export const useImagePicker = () => {
  const requestPermissions = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'ต้องการสิทธิ์เข้าถึง',
        'แอปต้องการสิทธิ์เข้าถึงรูปภาพเพื่อเลือกรูป',
        [
          { text: 'ยกเลิก', style: 'cancel' },
          { text: 'ตั้งค่า', onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync() }
        ]
      );
      return false;
    }
    return true;
  };

  const openCamera = async (): Promise<string | null> => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermission.status !== 'granted') {
      Alert.alert('ข้อผิดพลาด', 'ต้องการสิทธิ์เข้าถึงกล้องเพื่อถ่ายรูป');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    return result.canceled ? null : result.assets[0].uri;
  };

  const openImageLibrary = async (): Promise<string | null> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    return result.canceled ? null : result.assets[0].uri;
  };

  const showImagePicker = async (title: string, message: string): Promise<string | null> => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return null;

    return new Promise((resolve) => {
      Alert.alert(
        title,
        message,
        [
          { text: 'ยกเลิก', style: 'cancel', onPress: () => resolve(null) },
          { 
            text: 'ถ่ายรูป', 
            onPress: async () => {
              const uri = await openCamera();
              resolve(uri);
            }
          },
          { 
            text: 'เลือกจากอัลบั้ม', 
            onPress: async () => {
              const uri = await openImageLibrary();
              resolve(uri);
            }
          }
        ]
      );
    });
  };

  return {
    showImagePicker
  };
};
