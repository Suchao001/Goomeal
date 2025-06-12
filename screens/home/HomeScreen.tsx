import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTypedNavigation } from '../../hooks/Navigation';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../material/Header';
import Menu from '../material/Menu';
// import { useAuth } from 'AuthContext'; // ปิดการใช้งาน Auth ชั่วคราว
// import { showConfirmAlert } from '../../components/Alert'; // ปิดการใช้งาน Alert ชั่วคราว

type RootStackParamList = {
  Home: undefined;
  RecordFood: undefined;
  Calendar: undefined;
  PersonalPlan1: undefined; // Add PersonalPlan1 to the navigation params
  EatingBlog: undefined;
};

/**
 * HomeScreen Component
 * หน้าแรกของแอปพลิเคชัน - แสดงข้อมูลแคลอรี่ และเมนูหลัก
 * 
 * Features:
 * - แสดงข้อมูลแคลอรี่ที่บริโภคในวัน
 * - แสดงปุ่มบันทึกอาหาร
 * - แสดงประเภทอาหารต่างๆ
 * - แสดงเมนูนำทาง
 */
const Home = () => {
  const navigation = useTypedNavigation<'Home'>();
  // const {logout,reloadUser} = useAuth(); // ปิดการใช้งาน Auth ชั่วคราว

  // Mock data for food blog articles
  const blogArticles = [
    {
      id: '1',
      title: '5 เทคนิคการทำอาหารเพื่อสุขภาพ',
      excerpt: 'เรียนรู้วิธีการปรุงอาหารที่ดีต่อสุขภาพและอร่อยไปพร้อมกัน...',
      image: require('../../assets/images/Foodtype_1.png'),
    },
    {
      id: '2',
      title: 'ประโยชน์ของการกินผักผลไม้ในชีวิตประจำวัน',
      excerpt: 'ผักผลไม้มีสารอาหารที่จำเป็นต่อร่างกาย ช่วยเสริมภูมิคุ้มกัน...',
      image: require('../../assets/images/Foodtype_2.png'),
    },
  ];

  // Mock data for recommended meals
  const recommendedMeals = [
    {
      id: '1',
      name: 'สลัดผักรวมกับไก่ย่าง',
      calories: 285,
      image: require('../../assets/images/Foodtype_3.png'),
    },
    {
      id: '2',
      name: 'ข้าวกล้องผัดผักโขม',
      calories: 320,
      image: require('../../assets/images/Foodtype_4.png'),
    },
  ];

  // ปิดการใช้งาน logout function ชั่วคราว
  // const handleLogout = async () => {
  //   showConfirmAlert({
  //     title: 'ยืนยัน',
  //     message: 'คุณต้องการออกจากระบบหรือไม่?',
  //     onConfirm: async () => {
  //       logout();
  //       await reloadUser();
  //     }
  //   });
  // }

  return (
    <View className="flex-1 bg-gray-100">
      {/* ทำให้หน้าเลื่อนได้ */}
      <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>

        {/* Header */}
        <View style={{ paddingTop: 0 /* เพิ่ม paddingTop เพื่อเว้นจาก Status Bar */ }}>
          <Header />
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
        </View>        {/* Navigate to PersonalPlan1 */}
        <TouchableOpacity
          className="w-[90%] bg-green-400 rounded-lg shadow-md p-6 mt-4 mx-auto items-center"
          onPress={() => navigation.navigate('PersonalPlan1')}
        >
          <Text className="text-white font-semibold">Go to Personal Plan</Text>
        </TouchableOpacity>

        {/* Food Blog Articles Section */}
        <View className="mt-6">          <View className="flex-row justify-between items-center px-4 mb-4">
            <Text className="text-xl font-bold text-gray-800">บทความการกิน</Text>
            <TouchableOpacity onPress={() => navigation.navigate('EatingBlog')}>
              <Text className="text-gray-500 text-sm">ดูเพิ่มเติม</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={blogArticles}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity className="mr-4 w-72">
                <View className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Article Image */}
                  <View className="h-40 bg-gray-200 items-center justify-center">
                    <Image
                      source={item.image}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>
                  
                  {/* Article Content */}
                  <View className="p-4">
                    <Text className="text-lg font-semibold text-gray-800 mb-2" numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text className="text-gray-600 text-sm" numberOfLines={3}>
                      {item.excerpt}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>

        {/* Recommended Meals Section */}
        <View className="mt-8 mb-4">
          <View className="px-4 mb-4">
            <Text className="text-xl font-bold text-gray-800 mb-2">เมนูแนะนำของคุณ</Text>
          </View>

          <View className="px-4">
            {recommendedMeals.map((meal) => (
              <TouchableOpacity key={meal.id} className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
                <View className="flex-row">
                  {/* Meal Image */}
                  <View className="w-24 h-24 bg-gray-200 items-center justify-center">
                    <Image
                      source={meal.image}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>
                  
                  {/* Meal Info */}
                  <View className="flex-1 p-4 justify-center">
                    <Text className="text-lg font-semibold text-gray-800 mb-1">
                      {meal.name}
                    </Text>
                    <Text className="text-orange-500 font-medium">
                      {meal.calories} แคลอรี่
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {/* Request Menu Button */}
            <TouchableOpacity className="bg-yellow-500 rounded-lg p-4 flex-row items-center justify-center mt-2">
              <Icon name="sparkles" size={24} color="white" />
              <Text className="text-white font-bold text-lg ml-2">ขอเมนูอาหาร</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* eating blog */}
        {/* Meal Suggestions */}
        
      </ScrollView>

      {/* Bottom Navigation */}
      <Menu />
    </View>
  );
};

export default Home;

