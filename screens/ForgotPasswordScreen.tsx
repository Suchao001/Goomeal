import { View, Text, TouchableOpacity } from 'react-native';
import { Text_input } from '../components/FormMaterial';
import { useTypedNavigation } from '../hooks/Navigation';
import { ArrowLeft } from '../components/GeneralMaterial';

// ✅ Forgot Password หน้าหลัก
export const ForgotPasswordScreen = () => {
  const navigation = useTypedNavigation<'ForgotPassword'>();

  return (
    <View className="flex-1 items-center bg-white p-6">
      <ArrowLeft />
      <Text className="text-3xl text-gray-800 mb-2 mt-32 font-promptSemiBold">
        ลืมรหัสผ่านงั้นหรอ
      </Text>
      <Text className="text-base text-gray-600 mb-6 font-prompt">
        กรุณากรอกของคุณแล้ว เราจะลิ้งค์รีเซ็ตไปให้ทางอีเมล
      </Text>
      <Text_input title="อีเมล" placeholder="อีเมล" keyboardType="default" />

      <TouchableOpacity
        className="w-[95%] py-4 bg-primary rounded-xl justify-center items-center mt-2"
        onPress={() => navigation.navigate('ForgotPassword_after')}
      >
        <Text className="text-white text-lg font-promptBold">รีเซ็ตรหัสผ่าน</Text>
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
