import { View, Text, TouchableOpacity, Alert, Image } from 'react-native';
import { Text_input } from '../../components/FormMaterial'; 
import { useTypedNavigation } from '../../hooks/Navigation';
import axios from 'axios';
import { base_url } from '../../config';
import { useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { showAlert } from '../../components/Alert';
import { useAuth } from '../../AuthContext';




const LoginScreen = () => {
  const { reloadUser } = useAuth();
  const [user, setUser] = useState({
    username: '',
    password: '',
  });

  const navigation = useTypedNavigation<'Login'>();

  const handleLogin = async () => {
    if (!user.username || !user.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const userData = {
      username: user.username,
      password: user.password,
    };
    try {
      const response = await axios.post(`${base_url}/user/login`, userData);
      const { accessToken,refreshToken, user } = response.data;
      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
      await SecureStore.setItemAsync('user', JSON.stringify(user));
      await reloadUser();
      console.log('Login successful:', response.data);
    }catch(error) {
      console.error('Login error:', error);
    showAlert({
       message: 'Error',
       description: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
       type: 'danger',
    });

    }
  }


  return (
    <View className="flex-1 items-center bg-white p-6">
      {/* Logo Section */}
      <View className="items-center mt-20 mb-8">
        <View className="w-24 h-24 mb-4">
          <Image 
            source={require('../../assets/images/app_logo.png')} 
            className="w-full h-full"
            style={{ width: 96, height: 96 }}
            resizeMode="contain"
          />
        </View>
        <Text className="text-3xl text-gray-800 mb-2 font-promptSemiBold">
          เข้าสู่ระบบ 
        </Text>
        <Text className="text-base text-gray-600 mb-6 font-prompt text-center">
          กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ
        </Text>
      </View>

      {/* Form Section */}
      <View className="w-full max-w-sm">
        <Text_input title="ชื่อผู้ใช้" placeholder="ชื่อผู้ใช้" keyboardType="default"
          value={user.username}
          onChangeText={text => setUser(u => ({ ...u, username: text }))}
        />
        <Text_input title="รหัสผ่าน" placeholder="รหัสผ่าน" keyboardType="default" secureTextEntry={true}
          value={user.password}
          onChangeText={text => setUser(u => ({ ...u, password: text }))}
          autoCapitalize="none"
        />

        <View className="w-full flex-row justify-between my-4">
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text className="text-blue-500 font-prompt">ยังไม่มีบัญชี ?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text className="text-blue-500 font-prompt">ลืมรหัสผ่าน ?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          className="w-full bg-primary rounded-xl p-4 justify-center items-center mt-4" 
          onPress={() => handleLogin()}
        >
          <Text className="text-white text-lg font-promptBold">เข้าสู่ระบบ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;
