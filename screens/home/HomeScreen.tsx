import React, { useState, useEffect,useCallback,useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, FlatList, Linking, Animated, TouchableWithoutFeedback } from 'react-native';
import { useTypedNavigation } from '../../hooks/Navigation';
import { useFocusEffect } from '@react-navigation/native';
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
import { 
  getDailyNutritionSummary,
  DailyNutritionSummary 
} from '../../utils/api/dailyNutritionSummaryApi';
import { getEatingRecordsByDate, EatingRecord } from '../../utils/api/eatingRecordApi';
import { getTodayBangkokDate } from '../../utils/bangkokTime';
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
  const {user, fetchUserProfile} = useAuth();
  const [blogArticles, setBlogArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  
  // Today's meals state
  const [todayMealData, setTodayMealData] = useState<TodayMealData | null>(null);
  const [loadingTodayMeals, setLoadingTodayMeals] = useState(true);

  // Daily nutrition summary state
  const [dailySummary, setDailySummary] = useState<DailyNutritionSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // Saved records state
  const [savedRecords, setSavedRecords] = useState<EatingRecord[]>([]);
  const [loadingSavedRecords, setLoadingSavedRecords] = useState(true);

  // First time setting state
  const [firstTimeSetting, setFirstTimeSetting] = useState<boolean | null>(null);

  // InAppBrowser state
  const [browserVisible, setBrowserVisible] = useState(false);
  const [browserUrl, setBrowserUrl] = useState('');
  const [browserTitle, setBrowserTitle] = useState('');

  // Float button state
  const [showFloatMenu, setShowFloatMenu] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Default image fallback
  const defaultImage = require('../../assets/images/Foodtype_1.png');

  // Load articles on component mount
  useEffect(() => {
    loadTodayMeals();
    loadDailySummary();
    loadSavedRecords();
    fetchRecommendedMeals();
   
  }, []);

  // Load articles when component mounts
  useEffect(() => {
    loadBlogArticles();
  }, []); // Simple dependency array

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

  // Load daily nutrition summary
  const loadDailySummary = useCallback(async () => {
    try {
      setLoadingSummary(true);
      const today = getTodayBangkokDate();
      const summary = await getDailyNutritionSummary(today);
      // console.log('[HomeScreen] today (TH):', today)
      if (summary.success && summary.data) {
        setDailySummary(summary.data);
      } else {
        setDailySummary(null);
      }
    } catch (error) {
      console.error('❌ [HomeScreen] Error loading daily summary:', error);
      setDailySummary(null);
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  // Load saved records from API
  const loadSavedRecords = useCallback(async () => {
    try {
      setLoadingSavedRecords(true);
      const today = getTodayBangkokDate(); // Get today's date in Bangkok timezone
      const result = await getEatingRecordsByDate(today);
      
      if (result.success && result.data) {
        setSavedRecords(result.data.records || []);
      } else {
        setSavedRecords([]);
      }
    } catch (error) {
      console.error('❌ [HomeScreen] Error loading saved records:', error);
      setSavedRecords([]);
    } finally {
      setLoadingSavedRecords(false);
    }
  }, []);

  // Load blog articles from API
  const loadBlogArticles = async () => {
    try {
      setLoadingArticles(true);
      const articles = await fetchFeaturedArticles(2); // BaseApiClient handles auth automatically
      setBlogArticles(articles);
    } catch (error) {
      console.error('Error loading blog articles:', error);
      setBlogArticles([]);
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
       ;
        navigation.navigate('EatingBlog');
      }
    } catch (error) {
      console.error('Error opening article:', error);
    }
  };

  // Get real calories data from API
  const getCaloriesData = () => {
    // Calculate target nutrition from meal plan
    const getMealPlanNutritionTargets = () => {
      if (!todayMealData) return { protein: 75, carbs: 275, fat: 67 };
      
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      
      // Sum up breakfast
      todayMealData.breakfast.forEach(meal => {
        totalProtein += meal.protein || 0;
        totalCarbs += meal.carb || 0;
        totalFat += meal.fat || 0;
      });
      
      // Sum up lunch
      todayMealData.lunch.forEach(meal => {
        totalProtein += meal.protein || 0;
        totalCarbs += meal.carb || 0;
        totalFat += meal.fat || 0;
      });
      
      // Sum up dinner
      todayMealData.dinner.forEach(meal => {
        totalProtein += meal.protein || 0;
        totalCarbs += meal.carb || 0;
        totalFat += meal.fat || 0;
      });
      
      return {
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat
      };
    };
    
    const nutritionTargets = getMealPlanNutritionTargets();
    

    // Use data from daily_nutrition_summary if available
    if (dailySummary) {
      const targetCalories = todayMealData?.totalCalories || 2000;
      
      return {
        consumed: dailySummary.total_calories || 0,
        target: targetCalories,
        protein: { 
          current: dailySummary.total_protein || 0, 
          target: nutritionTargets.protein,
          unit: 'g', 
          color: '#ef4444', 
          icon: 'fitness' 
        },
        carbs: { 
          current: dailySummary.total_carbs || 0, 
          target: nutritionTargets.carbs,
          unit: 'g', 
          color: '#22c55e', 
          icon: 'leaf' 
        },
        fat: { 
          current: dailySummary.total_fat || 0, 
          target: nutritionTargets.fat,
          unit: 'g', 
          color: '#f59e0b', 
          icon: 'water' 
        }
      };
    }

    // If daily summary not available but have meal plan, use plan as target
    if (todayMealData) {
      return {
        consumed: 0, // No consumption data yet
        target: todayMealData.totalCalories,
        protein: { 
          current: 0, 
          target: nutritionTargets.protein,
          unit: 'g', 
          color: '#ef4444', 
          icon: 'fitness' 
        },
        carbs: { 
          current: 0, 
          target: nutritionTargets.carbs,
          unit: 'g', 
          color: '#22c55e', 
          icon: 'leaf' 
        },
        fat: { 
          current: 0, 
          target: nutritionTargets.fat,
          unit: 'g', 
          color: '#f59e0b', 
          icon: 'water' 
        }
      };
    }
    
    // Fallback to default values
    return {
      consumed: 0,
      target: 2000,
      protein: { current: 0, target: 75, unit: 'g', color: '#ef4444', icon: 'fitness' },
      carbs: { current: 0, target: 275, unit: 'g', color: '#22c55e', icon: 'leaf' },
      fat: { current: 0, target: 67, unit: 'g', color: '#f59e0b', icon: 'water' }
    };
  };

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Refresh data when screen comes into focus
      loadDailySummary();
      loadTodayMeals();
      loadSavedRecords();
    }, [loadDailySummary, loadTodayMeals, loadSavedRecords])
  );

  // Transform API data to component format
  const getTodayMealsForComponent = useMemo((): MealData[] => {
    if (!todayMealData) return []; 

    const meals: MealData[] = [];
    let mealIdCounter = 1;
    
    // Helper function to check if meal is saved
    const isMealSaved = (mealName: string, mealTypeLabel: string): boolean => {
      return savedRecords.some(record => 
        record.food_name === mealName && record.meal_type === mealTypeLabel
      );
    };

    // Helper function to generate unique ID
    const generateUniqueId = (mealType: string, index: number): string => {
      const today = new Date();
      return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}-${mealType}-${index}`;
    };

    // Convert breakfast meals
    todayMealData.breakfast.forEach((meal, index) => {
      const saved = isMealSaved(meal.name, 'มื้อเช้า');
      meals.push({
        id: `breakfast-${mealIdCounter++}`,
        mealType: 'breakfast',
        foodName: meal.name,
        calories: meal.calories,
        carbs: meal.carb,
        fat: meal.fat,
        protein: meal.protein,
        image: meal.image ? { uri: meal.image } : require('../../assets/images/Foodtype_1.png'),
        time: '07:30',
        fromPlan: true,
        saved: saved,
        uniqueId: generateUniqueId('breakfast', index)
      });
    });

    // Convert lunch meals
    todayMealData.lunch.forEach((meal, index) => {
      const saved = isMealSaved(meal.name, 'มื้อกลางวัน');
      meals.push({
        id: `lunch-${mealIdCounter++}`,
        mealType: 'lunch',
        foodName: meal.name,
        calories: meal.calories,
        carbs: meal.carb,
        fat: meal.fat,
        protein: meal.protein,
        image: meal.image ? { uri: meal.image } : require('../../assets/images/Foodtype_3.png'),
        time: '12:15',
        fromPlan: true,
        saved: saved,
        uniqueId: generateUniqueId('lunch', index)
      });
    });

    // Convert dinner meals
    todayMealData.dinner.forEach((meal, index) => {
      const saved = isMealSaved(meal.name, 'มื้อเย็น');
      meals.push({
        id: `dinner-${mealIdCounter++}`,
        mealType: 'dinner',
        foodName: meal.name,
        calories: meal.calories,
        carbs: meal.carb,
        fat: meal.fat,
        protein: meal.protein,
        image: meal.image ? { uri: meal.image } : require('../../assets/images/Foodtype_4.png'),
        time: '19:00',
        fromPlan: true,
        saved: saved,
        uniqueId: generateUniqueId('dinner', index)
      });
    });

    // Convert custom meals (keys other than default)
    const defaultKeys = new Set(['breakfast','lunch','dinner']);
    const mealsMap: any = (todayMealData as any).mealsMap || {};
    const mealsMeta: any = (todayMealData as any).mealsMeta || {};
    Object.keys(mealsMap)
      .filter(k => !defaultKeys.has(k))
      .forEach((k) => {
        const items = mealsMap[k] || [];
        const label = mealsMeta?.[k]?.label || k;
        const time = mealsMeta?.[k]?.time || '12:00';
        items.forEach((meal: TodayMealItem, index: number) => {
          const saved = isMealSaved(meal.name, label);
          meals.push({
            id: `${k}-${mealIdCounter++}`,
            mealType: k,
            foodName: meal.name,
            calories: meal.calories,
            carbs: meal.carb,
            fat: meal.fat,
            protein: meal.protein,
            image: meal.image ? { uri: meal.image } : require('../../assets/images/Foodtype_2.png'),
            time: typeof time === 'string' ? time : '12:00',
            fromPlan: true,
            saved: saved,
            uniqueId: generateUniqueId(k, index)
          });
        });
      });

    return meals;
  }, [todayMealData, savedRecords]);

  // Handlers for meal actions
 
  // Handle refresh data after saving meals
  const handleRefreshData = useCallback(() => {
    loadSavedRecords();
    loadDailySummary();
    loadBlogArticles(); // Always try to refresh articles
  }, [loadSavedRecords, loadDailySummary]);

  // Mock data for recommended meals
  const [recommendedMeals, setRecommendedMeals] = useState<RecommendedMeal[]>([]);

  // Fetch recommended meals (latest 2 AI-generated foods)
  const fetchRecommendedMeals = async () => {
    try {
      const apiClient = new ApiClient();
      const result = await apiClient.getUserFoods('', 2, 'ai'); // Get latest 2 AI foods
      if (result.success && result.data) {
        // Just take the first 2 items from the result data (no sort)
        
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

  // Float button menu items
  const floatMenuItems = [
    {
      id: 1,
      title: 'จัดการเมนูอาหาร',
      icon: 'fast-food',
    color: '#3b82f6',
      onPress: () => {
        setShowFloatMenu(false);
        navigation.navigate('MyFood');
      }
    },
    {
      id: 2,
      title: 'เพิ่มแพลนของฉัน',
      icon: 'sparkles',
      color: '#f59e0b',
      onPress: () => {
        setShowFloatMenu(false);
        navigation.navigate('OptionPlan', { from: 'Home' });
      }
    },
    {
      id: 3,
      title: 'แพลนการกินของฉัน',
      icon: 'restaurant',
      color: '#22c55e',
      onPress: () => {
        setShowFloatMenu(false);
        navigation.navigate('PlanSelection');
      }
    }
  ];

  // Handle float button press
  const handleFloatButtonPress = () => {
    if (showFloatMenu) {
      // Hide menu with animation
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowFloatMenu(false);
      });
    } else {
      // Show menu with animation
      setShowFloatMenu(true);
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  // Close float menu
  const closeFloatMenu = () => {
    if (showFloatMenu) {
      handleFloatButtonPress();
    }
  };

 

  return (
    <TouchableWithoutFeedback onPress={closeFloatMenu}>
      <View className="flex-1 bg-gray-100 ">
          <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>     
          <View style={{ paddingTop: 0 }}>
            <Header />
          </View>

        {/* Calories Summary */}
        {loadingTodayMeals || loadingSummary ? (
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
            onAddMeal={() => {}}
            onEditMeal={() => {}}
            onRefreshData={handleRefreshData}
          />
        )}
        {/* firsttime setting */}
        {firstTimeSetting === false && (
          <View className="w-[90%] bg-white rounded-lg shadow-md shadow-slate-600 p-6 mt-4 mx-auto items-center">
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
              onPress={() => navigation.navigate('PersonalSetup')}
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
                <View className="bg-white rounded-lg shadow-md shadow-slate-600  overflow-hidden h-64">
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
              <TouchableOpacity key={meal.id} className="bg-white rounded-lg shadow-md shadow-slate-600 mb-4 overflow-hidden">
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

      {/* Float Button with Quick Menu */}
      <View className="absolute bottom-24 right-4 z-50 items-end">
        {/* Float Menu Items */}
        {showFloatMenu && (
          <Animated.View 
            className="mb-4"
            style={{
              transform: [{ scale: scaleAnim }],
              opacity: scaleAnim,
            }}
          >
            {floatMenuItems.map((item, index) => (
              <Animated.View
                key={item.id}
                style={{
                  transform: [
                    {
                      translateY: scaleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30 + index * 10, 0],
                      }),
                    },
                  ],
                  opacity: scaleAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, index === 0 ? 1 : 0, 1],
                  }),
                  marginBottom: 12,
                }}
              >
                <TouchableOpacity
                  className="bg-white rounded-full shadow-lg shadow-slate-600 flex-row items-center"
                  style={{
                    paddingVertical: 10,
                    paddingLeft: 12,
                    paddingRight: 16,
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                    maxWidth: 140, // จำกัดความกว้างสูงสุด
                  }}
                  onPress={item.onPress}
                >
                  <View 
                    className="w-7 h-7 rounded-full items-center justify-center mr-2"
                    style={{ backgroundColor: item.color }}
                  >
                    <Icon name={item.icon} size={14} color="white" />
                  </View>
                  <Text className="font-promptMedium text-gray-700 text-sm flex-shrink">
                    {item.title}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </Animated.View>
        )}

        {/* Main Float Button */}
        <TouchableOpacity
          className="w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-slate-600"
          style={{
            backgroundColor: '#77dd77',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
          onPress={handleFloatButtonPress}
        >
          <Animated.View
            style={{
              transform: [
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '45deg'],
                  }),
                },
              ],
            }}
          >
            <Icon 
              name={showFloatMenu ? 'close' : 'add'} 
              size={24} 
              color="white"
            />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* InApp Browser Modal */}
      <InAppBrowser
        isVisible={browserVisible}
        url={browserUrl}
        title={browserTitle}
        onClose={() => setBrowserVisible(false)}
      />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Home;
