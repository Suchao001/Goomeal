
import { View, Text, TouchableOpacity } from 'react-native';
import { Text_input } from '../components/FormMaterial'; 
import { useTypedNavigation } from '../hooks/Navigation';


const LoginScreen = () => {

  const navigation = useTypedNavigation<'Login'>();
  return (
    <View className="flex-1 items-center bg-white p-6 " >
      <Text className="text-3xl text-gray-800 mb-2 mt-36 font-promptSemiBold" >
        เข้าสู่ระบบ 
      </Text>
      <Text className="text-base text-gray-600 mb-6 font-prompt">
        กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ
      </Text>

      <Text_input title="ชื่อผู้ใช้" placeholder="ชื่อผู้ใช้" keyboardType="default" />
      <Text_input title="รหัสผ่าน" placeholder="รหัสผ่าน" keyboardType="default" secureTextEntry={true} />

      <View className="w-full flex-row justify-between my-3">
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text className="text-blue-500  font-prompt">ยังไม่มีบัญชี ?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=> navigation.navigate('ForgotPassword')}>
        <Text className="text-blue-500  font-prompt" >ลืมรหัสผ่าน ?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity className="w-[95%] bg-primary rounded-lg p-4 justify-center items-center " onPress={() => navigation.navigate('PersonalSetup')}>
        <Text className="text-white text-lg font-promptBold" >เข้าสู่ระบบ</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
