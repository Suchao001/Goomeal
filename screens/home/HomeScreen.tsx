import React, { useState, useEffect,useCallback,useMemo } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, FlatList, Linking } from 'react-native';
import { useTypedNavigation } from '../../hooks/Navigation';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../material/Header';
import Menu from '../material/Menu';
import CaloriesSummary from '../../components/CaloriesSummary';
import TodayMeals, { MealData } from '../../components/TodayMeals';
import { useAuth } from 'AuthContext';
import { showConfirmAlert } from '../../components/Alert';
import InAppBrowser from '../../components/InAppBrowser';

import { 
  fetchFeaturedArticles, 
  generateArticleUrl,
  Article 
} from '../../utils/articleApi';
import { 
  fetchTodayMeals, 
  getTodayNutritionSummary,
  TodayMealData,
  TodayMealItem 
} from '../../utils/todayMealApi';
import { blog_url, base_url } from '../../config';
import { ApiClient } from '../../utils/apiClient';

interface RecommendedMeal {
  id: string;
  name: string;
  cal: number;
  carb: number;
  fat: number;
  protein: number;
  img: string | null;
  ingredient: string;
  src?: string;
  created_at?: string;
} 

const Home = () => {
  const navigation = useTypedNavigation<'Home'>();
  const {fetchUserProfile} = useAuth();
  const [blogArticles, setBlogArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  
  // Today's meals state
  const [todayMealData, setTodayMealData] = useState<TodayMealData | null>(null);
  const [loadingTodayMeals, setLoadingTodayMeals] = useState(true);

  // First time setting state
  const [firstTimeSetting, setFirstTimeSetting] = useState<boolean | null>(null);

  // InAppBrowser state
  const [browserVisible, setBrowserVisible] = useState(false);
  const [browserUrl, setBrowserUrl] = useState('');
  const [browserTitle, setBrowserTitle] = useState('');

  // Default image fallback
  const defaultImage = require('../../assets/images/Foodtype_1.png');

  // Load articles on component mount
  useEffect(() => {
    loadBlogArticles();
    loadTodayMeals();
    fetchRecommendedMeals();
  }, []);

  // Fetch user profile to check first_time_setting
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await fetchUserProfile();
        setFirstTimeSetting(!!profile?.first_time_setting === true);
      } catch (e) {
        setFirstTimeSetting(null);
      }
    };
    fetchProfile();
  }, []); // Remove fetchUserProfile dependency to prevent infinite loop

  // Load today's meals from API
  const loadTodayMeals = useCallback(async () => {
    try {
      setLoadingTodayMeals(true);
      const todayMeals = await fetchTodayMeals();
      setTodayMealData(todayMeals);
   
    } catch (error) {
      console.error('❌ [HomeScreen] Error loading today\'s meals:', error);
      setTodayMealData(null);
    } finally {
      setLoadingTodayMeals(false);
    }
  }, []);

  // Load blog articles from API
  const loadBlogArticles = async () => {
    try {
      setLoadingArticles(true);
      const articles = await fetchFeaturedArticles(2); // ดึง 2 รายการ
      setBlogArticles(articles);
    } catch (error) {
      console.error('Error loading blog articles:', error);
      // Fallback to mock data if API fails
    
    } finally {
      setLoadingArticles(false);
    }
  };

  // Remove the duplicate useEffect that causes infinite loop
  // useEffect(() => {
  //   const checkProfile = async () => {
  //     try {
  //       const profile = await fetchUserProfile();
  //       setFirstTimeSetting(!!profile?.first_time_setting);
  //     } catch (e) {
  //       console.error('Failed to fetch profile for first time setting check', e);
  //       setFirstTimeSetting(null);
  //     }
  //   };
  //   checkProfile();
  // }, [fetchUserProfile]);

  // Get image source for articles
  const getImageSource = (imageUrl?: string, fallbackIndex: number = 0) => {
    if (imageUrl && imageUrl.trim() !== '') {
      // สร้าง URL รูปภาพจาก BLOG_URL + public/ + item.img
      const fullImageUrl = `${blog_url}/${imageUrl}`;
    
      return { uri: fullImageUrl };
    }
   
    // Use different fallback images
    const fallbackImages = [
      require('../../assets/images/Foodtype_1.png'),
      require('../../assets/images/Foodtype_2.png'),
      require('../../assets/images/Foodtype_3.png'),
      require('../../assets/images/Foodtype_4.png')
    ];
    return fallbackImages[fallbackIndex % fallbackImages.length];
  };

  // Handle article click
  const handleArticleClick = async (article: Article) => {
    try {
      const url = generateArticleUrl(article.id);
      if (url && url.trim() !== '') {
        setBrowserUrl(url);
        setBrowserTitle(article.title || 'บทความ');
        setBrowserVisible(true);
      } else {
        console.log('Cannot generate URL, navigate to EatingBlog instead');
        navigation.navigate('EatingBlog');
      }
    } catch (error) {
      console.error('Error opening article:', error);
    }
  };

  // Mock data for calories and nutrition (or use real data from API)
  const getCaloriesData = () => {
    // if (todayMealData) {
    //   const nutritionSummary = getTodayNutritionSummary(todayMealData);
    //   return {
    //     consumed: nutritionSummary.calories,
    //     target: 1500,
    //     protein: { current: nutritionSummary.protein, target: 75, unit: 'g', color: '#ef4444', icon: 'fitness' },
    //     carbs: { current: nutritionSummary.carbs, target: 200, unit: 'g', color: '#22c55e', icon: 'leaf' },
    //     fat: { current: nutritionSummary.fat, target: 60, unit: 'g', color: '#f59e0b', icon: 'water' }
    //   };
    // }
    
    // Fallback to mock data
    return {
      consumed: 800,
      target: 1500,
      protein: { current: 45, target: 75, unit: 'g', color: '#ef4444', icon: 'fitness' },
      carbs: { current: 120, target: 200, unit: 'g', color: '#22c55e', icon: 'leaf' },
      fat: { current: 30, target: 60, unit: 'g', color: '#f59e0b', icon: 'water' }
    };
  };

  // Transform API data to component format
  const getTodayMealsForComponent = useMemo((): MealData[] => {
    if (!todayMealData) return []; 

    const meals: MealData[] = [];
    let mealIdCounter = 1;

   
    // Convert breakfast meals
    todayMealData.breakfast.forEach((meal, index) => {
      // console.log( meal);
      meals.push({
        id: `breakfast-${mealIdCounter++}`,
        mealType: 'breakfast',
        foodName: meal.name,
        calories: meal.calories,
        image: meal.image ? { uri: meal.image } : require('../../assets/images/Foodtype_1.png'),
        time: '07:30' // Could be enhanced to use actual time
      });
    });

    // Convert lunch meals
    todayMealData.lunch.forEach((meal, index) => {
      meals.push({
        id: `lunch-${mealIdCounter++}`,
        mealType: 'lunch',
        foodName: meal.name,
        calories: meal.calories,
        image: meal.image ? { uri: meal.image } : require('../../assets/images/Foodtype_3.png'),
        time: '12:15'
      });
    });

    // Convert dinner meals
    todayMealData.dinner.forEach((meal, index) => {
      meals.push({
        id: `dinner-${mealIdCounter++}`,
        mealType: 'dinner',
        foodName: meal.name,
        calories: meal.calories,
        image: meal.image ? { uri: meal.image } : require('../../assets/images/Foodtype_4.png'),
        time: '19:00'
      });
    });

    return meals;
  }, [todayMealData]);

  // Handlers for meal actions
  const handleAddMeal = (mealType: MealData['mealType']) => {
    console.log('Add meal for:', mealType);
    // Navigate to add meal screen or show modal
    // navigation.navigate('RecordFood');
  };

  const handleEditMeal = (meal: MealData) => {
    console.log('Edit meal:', meal);
    // Navigate to edit meal screen
    // navigation.navigate('RecordFood');
  };

  // Mock data for recommended meals
  const [recommendedMeals, setRecommendedMeals] = useState<RecommendedMeal[]>([]);

  // Fetch recommended meals (latest 2 AI-generated foods)
  const fetchRecommendedMeals = async () => {
    try {
      const apiClient = new ApiClient();
      const result = await apiClient.getUserFoods('', 2, 'ai'); // Get latest 2 AI foods
      if (result.success && result.data) {
        // Just take the first 2 items from the result data (no sort)
        console.log('Recommended meals fetched:', result.data);
        if (Array.isArray(result.data.userFoods)) {
          setRecommendedMeals(
            result.data.userFoods.slice(0, 2).map((item: any) => ({
              id: item.id,
              name: item.name,
              cal: item.cal,
              carb: item.carb,
              fat: item.fat,
              protein: item.protein,
              img: item.img,
              ingredient: item.ingredient,
              src: item.src,
              created_at: item.createdAt,
            }))
          );
        } else {
          setRecommendedMeals([]);
        }
      }
    } catch (error) {
      console.error('Error fetching recommended meals:', error);
      // Fallback to mock data if API fails
      setRecommendedMeals([
        {
          id: '1',
          name: 'สลัดผักรวมกับไก่ย่าง',
          cal: 285,
          carb: 15,
          fat: 12,
          protein: 25,
          img: null,
          ingredient: 'ผักสด, ไก่ย่าง',
          src: 'ai'
        },
        {
          id: '2',
          name: 'ข้าวกล้องผัดผักโขม',
          cal: 320,
          carb: 45,
          fat: 8,
          protein: 12,
          img: null,
          ingredient: 'ข้าวกล้อง, ผักโขม',
          src: 'ai'
        },
      ]);
    }
  };

 

  return (
    <View className="flex-1 bg-gray-100 ">
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>     
        <View style={{ paddingTop: 0 }}>
          <Header />
        </View>

        {/* Calories Summary */}
        {loadingTodayMeals ? (
          <View className="w-[90%] bg-white rounded-lg shadow-md p-6 mt-4 mx-auto items-center">
            <Text className="text-gray-500 font-prompt">กำลังโหลดข้อมูลโภชนาการ...</Text>
          </View>
        ) : (
          <CaloriesSummary
            caloriesConsumed={getCaloriesData().consumed}
            caloriesTarget={getCaloriesData().target}
            protein={getCaloriesData().protein}
            carbs={getCaloriesData().carbs}
            fat={getCaloriesData().fat}
          />
        )}

        {/* Today's Meals */}
        {loadingTodayMeals ? (
          <View className="w-[90%] bg-white rounded-lg shadow-md p-6 mt-4 mx-auto items-center">
            <Text className="text-gray-500 font-prompt">กำลังโหลดเมนูอาหารวันนี้...</Text>
          </View>
        ) : (
          <TodayMeals
            meals={getTodayMealsForComponent}
            onAddMeal={handleAddMeal}
            onEditMeal={handleEditMeal}
          />
        )}
        {/* firsttime setting */}
        {firstTimeSetting === false && (
          <View className="w-[90%] bg-white rounded-lg shadow-md p-6 mt-4 mx-auto items-center">
            <View className="flex-row items-center mb-4">
              <View className="w-6 h-6 bg-orange-400 rounded-full mr-2 items-center justify-center">
                <Text className="text-white font-promptBold">✎</Text>
              </View>
              <Text className="text-gray-600 text-center font-prompt">
                กรอกข้อมูลที่จำเป็น{"\n"}เพื่อให้สร้างแผนการกินที่เหมาะสมกับคุณ
              </Text>
            </View>
            <TouchableOpacity
              className="bg-orange-400 px-6 py-2 rounded-full"
              onPress={() => navigation.navigate('PersonalPlan1', {})}
            >
              <Text className="text-white font-promptSemiBold">กรอกข้อมูลครั้งแรก</Text>
            </TouchableOpacity>
          </View>
        )}        
       
        <View className="mt-6">          
            <View className="flex-row justify-between items-center px-4 mb-4">
                <Text className="text-xl font-promptBold text-myBlack">บทความการกิน</Text>
                <TouchableOpacity onPress={() => navigation.navigate('EatingBlog')}>
                <Text className="text-gray-500 text-sm font-prompt">ดูเพิ่มเติม</Text>
                </TouchableOpacity>
            </View>

          <FlatList
            data={blogArticles}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item, index }) => (
              <TouchableOpacity 
                className="mr-4 w-72"
                onPress={() => handleArticleClick(item)}
              >
                <View className="bg-white rounded-lg shadow-md overflow-hidden h-64">
                  {/* Article Image */}
                  <View className="h-40 bg-gray-200 items-center justify-center">
                    <Image
                      source={getImageSource(item.img, index)}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>
                  
                  {/* Article Content */}
                  <View className="flex-1 p-4 justify-between">
                    <View>
                      <Text className="text-lg font-promptSemiBold text-myBlack mb-2" numberOfLines={2}>
                        {item.title}
                      </Text>
                      <Text className="text-gray-600 text-sm font-prompt" numberOfLines={3}>
                        {item.excerpt_content || 'ไม่มีคำอธิบาย'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>

        {/* Recommended Meals Section */}
        <View className="mt-8 mb-4">
          <View className="px-4 mb-4 flex-row justify-between items-center">
            <Text className="text-xl font-promptBold text-myBlack mb-2">เมนูแนะนำของคุณ</Text>
             <TouchableOpacity onPress={() => navigation.navigate('MyFood')}>
                <Text className="text-gray-500 text-sm font-prompt">ดูเพิ่มเติม</Text>
                </TouchableOpacity>
          </View>

          <View className="px-4">
            {recommendedMeals.map((meal) => (
              <TouchableOpacity key={meal.id} className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
                <View className="flex-row">
                  
                  <View className="w-24 h-24 bg-gray-200 items-center justify-center">
                    <Image
                      source={meal.img ? { uri: meal.img } : require('../../assets/images/Foodtype_3.png')}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>
                  
                  
                  <View className="flex-1 p-4 justify-center">
                    <Text className="text-lg font-promptSemiBold text-myBlack mb-1">
                      {meal.name}
                    </Text>
                    <Text className="text-orange-500 font-promptMedium">
                      {meal.cal} แคลอรี่
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}           
            <TouchableOpacity 
              className="bg-primary rounded-lg p-4 flex-row items-center justify-center mt-2"
              onPress={() => navigation.navigate('SuggestionMenu')}
            >
              <Icon name="sparkles" size={24} color="white" />
              <Text className="text-white font-promptBold text-lg ml-2">ขอเมนูอาหาร</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* Bottom Navigation */}
      <Menu />

      {/* InApp Browser Modal */}
      {browserUrl && (
        <InAppBrowser
          isVisible={browserVisible}
          url={browserUrl}
          title={browserTitle}
          onClose={() => {
            setBrowserVisible(false);
            setBrowserUrl('');
            setBrowserTitle('');
          }}
        />
      )}
    </View>
  );
};

export default Home;