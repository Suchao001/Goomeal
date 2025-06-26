import { View, Text, TouchableOpacity,Alert } from 'react-native';
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
       description: 'Invalid username or password',
       type: 'danger',
    });

    }
  }


  return (
    <View className="flex-1 items-center bg-white p-6 " >
      <Text className="text-3xl text-gray-800 mb-2 mt-36 font-promptSemiBold" >
        เข้าสู่ระบบ 
      </Text>
      <Text className="text-base text-gray-600 mb-6 font-prompt">
        กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ
      </Text>

      <Text_input title="ชื่อผู้ใช้" placeholder="ชื่อผู้ใช้" keyboardType="default"
        value={user.username}
        onChangeText={text => setUser(u => ({ ...u, username: text }))}
      />
      <Text_input title="รหัสผ่าน" placeholder="รหัสผ่าน" keyboardType="default" secureTextEntry={true}
        value={user.password}
        onChangeText={text => setUser(u => ({ ...u, password: text }))}
        autoCapitalize="none"
      />

      <View className="w-full flex-row justify-between my-3">
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text className="text-blue-500  font-prompt">ยังไม่มีบัญชี ?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=> navigation.navigate('ForgotPassword')}>
        <Text className="text-blue-500  font-prompt" >ลืมรหัสผ่าน ?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity className="w-[95%] bg-primary rounded-xl p-4 justify-center items-center " onPress={() => handleLogin()}>
        <Text className="text-white text-lg font-promptBold" >เข้าสู่ระบบ</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
