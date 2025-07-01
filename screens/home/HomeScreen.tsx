import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, FlatList } from 'react-native';
import { useTypedNavigation } from '../../hooks/Navigation';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../material/Header';
import Menu from '../material/Menu';
import CaloriesSummary from '../../components/CaloriesSummary';
import TodayMeals, { MealData } from '../../components/TodayMeals';
// import { useAuth } from 'AuthContext'; // ปิดการใช้งาน Auth ชั่วคราว
// import { showConfirmAlert } from '../../components/Alert'; // ปิดการใช้งาน Alert ชั่วคราว

const Home = () => {
  const navigation = useTypedNavigation<'Home'>();
  // const {logout,reloadUser} = useAuth(); // ปิดการใช้งาน Auth ชั่วคราว

  // Mock data for calories and nutrition
  const caloriesData = {
    consumed: 800,
    target: 1500,
    protein: { current: 45, target: 75, unit: 'g', color: '#ef4444', icon: 'fitness' },
    carbs: { current: 120, target: 200, unit: 'g', color: '#22c55e', icon: 'leaf' },
    fat: { current: 30, target: 60, unit: 'g', color: '#f59e0b', icon: 'water' }
  };

  // Mock data for today's meals
  const todayMeals: MealData[] = [
    {
      id: '1',
      mealType: 'breakfast',
      foodName: 'ข้าวโอ๊ตกับผลไม้',
      calories: 250,
      image: require('../../assets/images/Foodtype_1.png'),
      time: '07:30'
    },
    {
      id: '2',
      mealType: 'breakfast',
      foodName: 'กาแฟดำ',
      calories: 5,
      time: '07:35'
    },
    {
      id: '3',
      mealType: 'lunch',
      foodName: 'สลัดไก่ย่าง',
      calories: 320,
      image: require('../../assets/images/Foodtype_3.png'),
      time: '12:15'
    },
    {
      id: '4',
      mealType: 'snack',
      foodName: 'โยเกิร์ตกรีก',
      calories: 150,
      time: '15:30'
    },
    {
      id: '5',
      mealType: 'dinner',
      foodName: 'ปลาย่างกับผักโขม',
      calories: 75,
      image: require('../../assets/images/Foodtype_4.png'),
      time: '19:00'
    }
  ];

  // Handlers for meal actions
  const handleAddMeal = (mealType: MealData['mealType']) => {
    console.log('Add meal for:', mealType);
    // Navigate to add meal screen or show modal
    navigation.navigate('RecordFood');
  };

  const handleEditMeal = (meal: MealData) => {
    console.log('Edit meal:', meal);
    // Navigate to edit meal screen
    navigation.navigate('RecordFood');
  };

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
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>     
        <View style={{ paddingTop: 0 }}>
          <Header />
        </View>

        {/* Calories Summary */}
        <CaloriesSummary
          caloriesConsumed={caloriesData.consumed}
          caloriesTarget={caloriesData.target}
          protein={caloriesData.protein}
          carbs={caloriesData.carbs}
          fat={caloriesData.fat}
        />

        {/* Today's Meals */}
        <TodayMeals
          meals={todayMeals}
          onAddMeal={handleAddMeal}
          onEditMeal={handleEditMeal}
        />
        
        <View className="w-[90%] bg-white rounded-lg shadow-md p-6 mt-4 mx-auto items-center">
          <View className="flex-row items-center mb-4">
            <View className="w-6 h-6 bg-orange-400 rounded-full mr-2 items-center justify-center">
              <Text className="text-white font-bold">✎</Text>
            </View>
            <Text className="text-gray-600 text-center">
              กรอกข้อมูลที่จำเป็น{'\n'}เพื่อให้สร้างแผนการกินที่เหมาะสมกับคุณ
            </Text>
          </View>
          <TouchableOpacity
            className="bg-orange-400 px-6 py-2 rounded-full"
            onPress={() => navigation.navigate('PersonalPlan1')}
          >
            <Text className="text-white font-semibold">กรอกข้อมูลครั้งแรก</Text>
          </TouchableOpacity>
        </View>        
       
        <View className="mt-6">          
            <View className="flex-row justify-between items-center px-4 mb-4">
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
                 
                  <View className="h-40 bg-gray-200 items-center justify-center">
                    <Image
                      source={item.image}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>
                  
                 
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
                  
                  <View className="w-24 h-24 bg-gray-200 items-center justify-center">
                    <Image
                      source={meal.image}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>
                  
                  
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
            <TouchableOpacity 
              className="bg-primary rounded-lg p-4 flex-row items-center justify-center mt-2"
              onPress={() => navigation.navigate('FoodMenu')}
            >
              <Icon name="sparkles" size={24} color="white" />
              <Text className="text-white font-bold text-lg ml-2">ขอเมนูอาหาร</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ----- จุดที่แก้ไข: ลบคอมเมนต์ที่อาจเป็นปัญหาออกไป ----- */}
        
      </ScrollView>

      {/* Bottom Navigation */}
      <Menu />
    </View>
  );
};

export default Home;