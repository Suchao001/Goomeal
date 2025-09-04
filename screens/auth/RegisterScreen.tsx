import { useState,useEffect } from 'react';
import { View, Text, TouchableOpacity,Alert} from 'react-native';
import { Text_input } from '../../components/FormMaterial';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import {ArrowLeft} from '../../components/GeneralMaterial';
import axios from 'axios';
import { base_url } from '../../config';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;


const RegisterScreen = () => {

    const navigation = useNavigation<NavigationProp>();
    const [user, setUser] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const validateForm = () => {
        if (!user.username || !user.email || !user.password || !user.confirmPassword) {
            Alert.alert('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกข้อมูลให้ครบทุกช่อง');
            return false;
        }

        if (user.password !== user.confirmPassword) {
            Alert.alert('รหัsผ่านไม่ตรงกัน', 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
            return false;
        }

        if (user.password.length < 6) {
            Alert.alert('รหัสผ่านสั้นเกินไป', 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
            return false;
        }
        return true;
    }

    const handleRegister = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            const userData = {
                username: user.username,
                email: user.email,
                password: user.password,
            };
            
            console.log('Sending registration data:', userData);
            const response = await axios.post(`${base_url}/user/register`, userData);
            console.log('Registration successful:', response.data);
            Alert.alert('สำเร็จ', response.data.message || 'ลงทะเบียนเสร็จเรียบร้อยแล้ว');
          
            navigation.navigate('Login');
        } catch (error: any) {
            console.error('Registration error:', error);
            if (error.response) {
                // Server responded with error status
                console.log('Error response:', error.response.data);
                const errorMessage = error.response.data.message || 'การลงทะเบียนล้มเหลว';
                
                // Show the error message from backend directly (already in Thai)
                Alert.alert('ไม่สามารถลงทะเบียนได้', errorMessage);
            } else if (error.request) {
                // Request was made but no response received
                console.log('No response received:', error.request);
                Alert.alert('ปัญหาเครือข่าย', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
            } else {
                // Something else happened
                console.log('Error:', error.message);
                Alert.alert('เกิดข้อผิดพลาด', 'มีปัญหาบางอย่างเกิดขึ้น');
            }
        }
    };
    
    
    return (
        <View className="flex-1 items-center bg-white p-6">
            <ArrowLeft />
            
            <Text className="text-3xl text-gray-800 mb-2 mt-32 font-promptSemiBold" >
                    ลงทะเบียน 
                  </Text>
                  <Text className="text-base text-gray-600 mb-6 font-prompt">
                    กรุณากรอกข้อมูลเพื่อลงทะเบียนเข้าใช้งาน
                  </Text>
            
                  <Text_input title="ชื่อผู้ใช้" placeholder="ชื่อผู้ใช้" keyboardType="default"
                    value={user.username}
                    onChangeText={text => setUser(u => ({ ...u, username: text }))}
                    autoCapitalize="none"
                  />
                  <Text_input title="อีเมล" placeholder="อีเมล" keyboardType="default"
                    value={user.email}
                    onChangeText={text => setUser(u => ({ ...u, email: text }))}
                    autoCapitalize="none"
                  />
                  <Text_input title="รหัสผ่าน" placeholder="รหัสผ่าน" keyboardType="default" secureTextEntry={true}
                    value={user.password}
                    onChangeText={text => setUser(u => ({ ...u, password: text }))}
                    autoCapitalize="none"
                  />
                  <Text_input title="ยืนยันรหัสผ่าน" placeholder="ยืนยันรหัสผ่าน" keyboardType="default" secureTextEntry={true}
                    value={user.confirmPassword}
                    onChangeText={text => setUser(u => ({ ...u, confirmPassword: text }))}
                    autoCapitalize="none"
                  />
            
                  <View className="w-full flex items-end my-3">
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                      <Text className="text-blue-500 font-prompt" >มีบัญชีแล้ว ?</Text>
                    </TouchableOpacity>
                  </View>
            
                  <TouchableOpacity className="w-[95%] bg-primary rounded-xl p-4 justify-center items-center " onPress={() => handleRegister()}>
                    <Text className="text-white text-lg font-promptBold" >ลงทะเบียน</Text>
                  </TouchableOpacity>
        </View>
    );
};

export default RegisterScreen;