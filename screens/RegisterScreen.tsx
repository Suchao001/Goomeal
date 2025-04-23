import { View, Text, TouchableOpacity } from 'react-native';
import { Text_input } from '../components/FormMaterial';
import { useTypedNavigation } from '../hooks/Navigation';
import {ArrowLeft} from '../components/GeneralMaterial';

const RegisterScreen = () => {
    const navigation = useTypedNavigation<'Register'>();
    return (
        <View className="flex-1 items-center bg-white p-6">
            <ArrowLeft />
            
            <Text className="text-3xl text-gray-800 mb-2 mt-32 font-promptSemiBold" >
                    ลงทะเบียน 
                  </Text>
                  <Text className="text-base text-gray-600 mb-6 font-prompt">
                    กรุณากรอกข้อมูลเพื่อลงทะเบียนเข้าใช้งาน
                  </Text>
            
                  <Text_input title="ชื่อผู้ใช้" placeholder="ชื่อผู้ใช้" keyboardType="default" />
                  <Text_input title="อีเมล" placeholder="อีเมล" keyboardType="default" />
                  <Text_input title="รหัสผ่าน" placeholder="รหัสผ่าน" keyboardType="default" secureTextEntry={true} />
                  <Text_input title="ยืนยันรหัสผ่าน" placeholder="ยืนยันรหัสผ่าน" keyboardType="default" secureTextEntry={true} />
            
                  <View className="w-full flex items-end my-3">
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                      <Text className="text-blue-500 font-prompt" >มีบัญชีแล้ว ?</Text>
                    </TouchableOpacity>
                  </View>
            
                  <TouchableOpacity className="w-[95%] bg-primary rounded-lg p-4 justify-center items-center " onPress={() => navigation.goBack()}>
                    <Text className="text-white text-lg font-promptBold" >ลงทะเบียน</Text>
                  </TouchableOpacity>
        </View>
    );
};

export default RegisterScreen;