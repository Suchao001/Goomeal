import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Header from '../material/Header';
import Menu from '../material/Menu';

// Define your navigation stack params
type RootStackParamList = {
  Home: undefined;
  RecordFood: undefined;
  Calendar: undefined;
  PersonalPlan1: undefined; // Add PersonalPlan1 to the navigation params
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Home = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View className="flex-1 bg-gray-100">
      {/* ทำให้หน้าเลื่อนได้ */}
      <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>

        {/* Header */}
        <View style={{ paddingTop: 0 /* เพิ่ม paddingTop เพื่อเว้นจาก Status Bar */ }}>
          <Header />
        </View>

        {/* Calorie Tracker */}
        <View className="w-[90%] bg-white rounded-lg shadow-md p-6 mt-4 mx-auto items-center">
          <Text className="text-xl font-semibold mb-2">แคลอรี่</Text>
          <View className="flex-row items-baseline mb-4">
            <Text className="text-4xl font-bold text-orange-400">1,250</Text>
            <Text className="text-gray-500 ml-2">/1750 กิโลแคลอรี่</Text>
          </View>
          <View className="flex-row justify-between w-full">
            <View className="items-center">
              <Text className="text-gray-600">คาร์บ</Text>
              <Text className="font-semibold">0g</Text>
            </View>
            <View className="items-center">
              <Text className="text-gray-600">โปรตีน</Text>
              <Text className="font-semibold">0g</Text>
            </View>
            <View className="items-center">
              <Text className="text-gray-600">ไขมัน</Text>
              <Text className="font-semibold">0g</Text>
            </View>
          </View>
        </View>

        {/* Record Food Section */}
        <View className="w-[90%] bg-white rounded-lg shadow-md p-6 mt-4 mx-auto items-center">
          <View className="flex-row items-center mb-4">
            <View className="w-6 h-6 bg-orange-400 rounded-full mr-2 items-center justify-center">
              <Text className="text-white font-bold">✎</Text>
            </View>
            <Text className="text-gray-600 text-center">
              บันทึกสิ่งที่คุณกินในวันนี้{'\n'}เพื่อให้เราคำนวณแคลอรี่ให้คุณ
            </Text>
          </View>
          <TouchableOpacity
            className="bg-orange-400 px-6 py-2 rounded-full"
            onPress={() => navigation.navigate('RecordFood')}
          >
            <Text className="text-white font-semibold">บันทึกอาหารวันนี้</Text>
          </TouchableOpacity>
        </View>

        {/* Navigate to PersonalPlan1 */}
        <TouchableOpacity
          className="w-[90%] bg-green-400 rounded-lg shadow-md p-6 mt-4 mx-auto items-center"
          onPress={() => navigation.navigate('PersonalPlan1')}
        >
          <Text className="text-white font-semibold">Go to Personal Plan</Text>
        </TouchableOpacity>

        {/* Meal Suggestions */}
        <View className="w-[90%] mt-4 mx-auto flex-row justify-between">
          <View className="w-[48%] bg-white rounded-lg shadow-md p-4">
            <Image
              source={{ uri: 'https://via.placeholder.com/150' }}
              className="w-full h-32 rounded-lg mb-2"
              resizeMode="cover"
            />
            <Text className="text-sm text-gray-600">
              10 เมนูอาหารเพื่อสุขภาพ ทำง่าย{'\n'}อร่อยได้ในวันหยุดสุดสัปดาห์
            </Text>
          </View>
          <View className="w-[48%] bg-white rounded-lg shadow-md p-4">
            <Image
              source={{ uri: 'https://via.placeholder.com/150' }}
              className="w-full h-32 rounded-lg mb-2"
              resizeMode="cover"
            />
            <Text className="text-sm text-gray-600">เลือกเมนู{'\n'}สำหรับคุณ:</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <Menu />
    </View>
  );
};

export default Home;
