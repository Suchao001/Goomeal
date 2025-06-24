import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { Text_input } from '../../components/FormMaterial';
import { useTypedNavigation } from '../../hooks/Navigation';
import { ArrowLeft } from '../../components/GeneralMaterial';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { base_url } from '../../config';

// ✅ Forgot Password หน้าหลัก
export const ForgotPasswordScreen = () => {
  const navigation = useTypedNavigation<'ForgotPassword'>();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกอีเมล');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกอีเมลที่ถูกต้อง');
      return;
    }

    setIsLoading(true);    try {
      const response = await fetch(base_url+'/user/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Success - navigate to confirmation screen
        navigation.navigate('ForgotPassword_after');
      } else {
        // Error from server
        Alert.alert('ข้อผิดพลาด', data.message || 'เกิดข้อผิดพลาดในการส่งอีเมล');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center bg-white p-6">
      <ArrowLeft />
      <Text className="text-3xl text-gray-800 mb-2 mt-32 font-promptSemiBold">
        ลืมรหัสผ่านงั้นหรอ
      </Text>
      <Text className="text-base text-gray-600 mb-6 font-prompt">
        กรุณากรอกของคุณแล้ว เราจะลิ้งค์รีเซ็ตไปให้ทางอีเมล
      </Text>
      <Text_input 
        title="อีเมล" 
        placeholder="อีเมล" 
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TouchableOpacity
        className={`w-[95%] py-4 rounded-xl justify-center items-center mt-2 ${
          isLoading ? 'bg-gray-400' : 'bg-primary'
        }`}
        onPress={handleForgotPassword}
        disabled={isLoading}
      >
        <Text className="text-white text-lg font-promptBold">
          {isLoading ? 'กำลังส่ง...' : 'รีเซ็ตรหัสผ่าน'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// ✅ หน้าหลังส่งอีเมลแล้ว
export const ForgotPasswordScreen_after = () => {
  const navigation = useTypedNavigation<'ForgotPassword_after'>();

  return (
    <View className="flex-1 items-center bg-white p-6">
      <ArrowLeft goto={'Login'} />
      <Text className="text-3xl text-gray-800 mb-2 mt-32 font-promptSemiBold">
        ลืมรหัสผ่านงั้นหรอ
      </Text>
      <Text className="text-base text-gray-600 mb-6 font-prompt">
        หากอีเมลที่คุณกรอกตรงตามบัญชีที่มีอยู่ เราจะส่งลิงค์เพื่อรีเซ็ตรหัสผ่านให้คุณ
        โปรดตรวจสอบที่อีเมลคุณ แล้วคลิกลิงค์เพื่อรีเซ็ตรหัสผ่านของคุณ
        หากคุณไม่พบลิงค์ในอีเมลของคุณ เป็นไปได้ว่าอีเมลที่คุณใส่ไม่ตรงกับบัญชีที่มีอยู่
        หรือคุณอาจจะต้องลองอีกครั้งเพื่อรีเซ็ตรหัสผ่าน
      </Text>
    </View>
  );
};

// ✅ หน้ารีเซ็ตรหัสผ่านจริง (เมื่อคลิกลิงค์ในอีเมล)
export const ResetPasswordScreen = () => {
  const navigation = useTypedNavigation<'ResetPassword'>();
  const route = useRoute<RouteProp<RootStackParamList, 'ResetPassword'>>();
  const { token } = route.params;
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกรหัสผ่านทั้งสองช่อง');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('ข้อผิดพลาด', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('ข้อผิดพลาด', 'รหัสผ่านไม่ตรงกัน');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(base_url+'/user/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert(
          'สำเร็จ', 
          'รีเซ็ตรหัสผ่านเรียบร้อยแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่',
          [
            {
              text: 'ตกลง',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        Alert.alert('ข้อผิดพลาด', data.message || 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center bg-white p-6">
      <ArrowLeft goto={'Login'} />
      <Text className="text-3xl text-gray-800 mb-2 mt-32 font-promptSemiBold">
        รีเซ็ตรหัสผ่าน
      </Text>
      <Text className="text-base text-gray-600 mb-6 font-prompt">
        กรุณากรอกรหัสผ่านใหม่ของคุณ
      </Text>
      
      <Text_input 
        title="รหัสผ่านใหม่" 
        placeholder="รหัสผ่านใหม่" 
        keyboardType="default"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry={true}
      />
      
      <Text_input 
        title="ยืนยันรหัสผ่าน" 
        placeholder="ยืนยันรหัสผ่าน" 
        keyboardType="default"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={true}
      />

      <TouchableOpacity
        className={`w-[95%] py-4 rounded-xl justify-center items-center mt-2 ${
          isLoading ? 'bg-gray-400' : 'bg-primary'
        }`}
        onPress={handleResetPassword}
        disabled={isLoading}
      >
        <Text className="text-white text-lg font-promptBold">
          {isLoading ? 'กำลังรีเซ็ต...' : 'รีเซ็ตรหัสผ่าน'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
