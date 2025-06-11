import { useState,useEffect } from 'react';
import { View, Text, TouchableOpacity,Alert} from 'react-native';
import { Text_input } from '../components/FormMaterial';
import { useTypedNavigation } from '../hooks/Navigation';
import {ArrowLeft} from '../components/GeneralMaterial';
import axios from 'axios';
import { base_url } from 'config';


const RegisterScreen = () => {


    const navigation = useTypedNavigation<'Register'>();
    const [user, setUser] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const validateForm = () => {
        if (!user.username || !user.email || !user.password || !user.confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return false;
        }

        if (user.password !== user.confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (user.password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
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
            
            console.log('Sending registration data:', userData); // Add this line
            const response = await axios.post(`${base_url}/user/register`, userData);
            console.log('Registration successful:', response.data);
            Alert.alert('Success', 'Registration successful');
          
            navigation.navigate('Login');
        } catch (error: any) {
            console.error('Registration error:', error);
            
            // Better error handling
            if (error.response) {
                // Server responded with error status
                console.log('Error response:', error.response.data);
                Alert.alert('Registration Failed', error.response.data.message || 'Registration failed');
            } else if (error.request) {
                // Request was made but no response received
                console.log('No response received:', error.request);
                Alert.alert('Network Error', 'Unable to connect to server');
            } else {
                // Something else happened
                console.log('Error:', error.message);
                Alert.alert('Error', 'Something went wrong');
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