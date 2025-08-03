import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, FlatList, Linking, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTypedNavigation } from '../../hooks/Navigation';
import Icon from 'react-native-vector-icons/Ionicons';
import { ArrowLeft } from 'components/GeneralMaterial';
import { 
  fetchArticles, 
  fetchFeaturedArticles, 
  fetchArticlesByTag, 
  fetchAllTags,
  generateArticleUrl,
  Article,
  Tag 
} from '../../utils/articleApi';
import { blog_url } from '../../config';
import InAppBrowser from '../../components/InAppBrowser';


const EatingBlogScreen = () => {
  const navigation = useTypedNavigation();
  const [selectedTab, setSelectedTab] = useState('แนะนำ');
  const [articles, setArticles] = useState<Article[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // InAppBrowser state
  const [browserVisible, setBrowserVisible] = useState(false);
  const [browserUrl, setBrowserUrl] = useState('');
  const [browserTitle, setBrowserTitle] = useState('');

  // Default image fallback
  const defaultImage = require('../../assets/images/Foodtype_1.png');

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Load data from API
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load featured articles and all articles in parallel
      const [featuredData, allArticlesData, tagsData] = await Promise.all([
        fetchFeaturedArticles(1),
        fetchArticles(),
        fetchAllTags()
      ]);

      setFeaturedArticles(featuredData);
      setArticles(allArticlesData);
      setTags(tagsData);
    } catch (err) {
      console.error('Error loading articles:', err);
      setError('ไม่สามารถโหลดบทความได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  // Load articles by tab
  const loadArticlesByTab = async (tab: string) => {
    try {
      if (tab === 'แนะนำ') {
        const data = await fetchFeaturedArticles(10);
        setArticles(data);
      } else if (tab === 'ล่าสุด') {
        const data = await fetchArticles();
        setArticles(data);
      }
    } catch (err) {
      console.error('Error loading articles by tab:', err);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดบทความได้');
    }
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    loadArticlesByTab(tab);
  };

  const tabs = ['แนะนำ', 'ล่าสุด'];

  // Function to open article URL
  const openArticle = async (article: Article) => {
    const url = generateArticleUrl(article.id);
    
    if (!url) {
      Alert.alert('ขออภัย', 'ไม่พบลิงก์บทความ');
      return;
    }

    try {
      setBrowserUrl(url);
      setBrowserTitle(article.title);
      setBrowserVisible(true);
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการเปิดลิงก์');
    }
  };

  // Format date function
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'ไม่ระบุวันที่';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'ไม่ระบุวันที่';
    }
  };

  // Get image source
  const getImageSource = (imageUrl?: string) => {
    if (imageUrl && imageUrl.trim() !== '') {
      // สร้าง URL รูปภาพจาก BLOG_URL + public/ + item.img
      const fullImageUrl = `${blog_url}/${imageUrl}`;
      
      return { uri: fullImageUrl };
    }
    return defaultImage;
  };

  const renderTabButton = (tab: string) => (
    <TouchableOpacity
      key={tab}
      className={`px-4 py-2 mr-3 rounded-full ${
        selectedTab === tab ? 'bg-yellow-500' : 'bg-gray-200'
      }`}
      onPress={() => handleTabChange(tab)}
    >
      <Text
        className={`font-medium ${
          selectedTab === tab ? 'text-white' : 'text-gray-600'
        }`}
      >
        {tab}
      </Text>
    </TouchableOpacity>
  );

  const renderFeaturedArticle = () => {
    if (!featuredArticles || featuredArticles.length === 0) {
      return null;
    }

    const featuredArticle = featuredArticles[0];

    return (
      <TouchableOpacity 
        className="bg-white rounded-lg shadow-md overflow-hidden mb-6 mx-4"
        onPress={() => openArticle(featuredArticle)}
      >
        {/* Featured Badge */}
        <View className="absolute top-3 left-3 bg-yellow-500 px-3 py-1 rounded-full z-10">
          <Text className="text-white text-xs font-bold">แนะนำ</Text>
        </View>
        
        {/* Featured Image */}
        <View className="h-48 bg-gray-200">
          <Image
            source={getImageSource(featuredArticle.img)}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        
        {/* Featured Content */}
        <View className="p-4">
          <Text className="text-xl font-bold text-gray-800 mb-2" numberOfLines={2}>
            {featuredArticle.title}
          </Text>
          <Text className="text-gray-600 text-sm mb-3" numberOfLines={3}>
            {featuredArticle.excerpt_content || 'ไม่มีคำอธิบาย'}
          </Text>
          
          {/* Tags */}
          {featuredArticle.tags && featuredArticle.tags.length > 0 && (
            <View className="flex-row items-center mb-3">
              {featuredArticle.tags.slice(0, 3).map((tag, index) => (
                <View key={index} className="bg-gray-100 px-2 py-1 rounded-full mr-2">
                  <Text className="text-gray-600 text-xs">{tag}</Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Read More Indicator */}
          <View className="flex-row items-center mb-3">
            <Icon name="open-outline" size={16} color="#eab308" />
            <Text className="text-yellow-600 text-sm ml-2 font-medium">แตะเพื่ออ่านบทความเต็ม</Text>
          </View>
          
          {/* Meta Info */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-gray-500 text-xs">GoodMeal</Text>
            </View>
            <View className="flex-row items-center">
              <Icon name="time-outline" size={12} color="#9ca3af" />
              <Text className="text-gray-500 text-xs ml-1">5 นาที</Text>
              <Text className="text-gray-500 text-xs mx-2">•</Text>
              <Text className="text-gray-500 text-xs">{formatDate(featuredArticle.publish_date)}</Text>
              <Icon name="open-outline" size={16} color="#eab308" className="ml-2" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderArticleItem = ({ item }: { item: Article }) => (
    <TouchableOpacity 
      className="bg-white rounded-lg shadow-md overflow-hidden mb-4 mx-4"
      onPress={() => openArticle(item)}
    >
      <View className="flex-row">
        {/* Article Image */}
        <View className="w-24 h-24 bg-gray-200">
          <Image
            source={getImageSource(item.img)}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        
        {/* Article Content */}
        <View className="flex-1 p-4">
          <Text className="text-lg font-semibold text-gray-800 mb-1" numberOfLines={2}>
            {item.title}
          </Text>
          <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
            {item.excerpt_content || 'ไม่มีคำอธิบาย'}
          </Text>
          
          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <View className="flex-row items-center mb-2">
              {item.tags.slice(0, 2).map((tag, index) => (
                <View key={index} className="bg-gray-100 px-2 py-1 rounded-full mr-2">
                  <Text className="text-gray-600 text-xs">{tag}</Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Meta Info */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Icon name="time-outline" size={12} color="#9ca3af" />
              <Text className="text-gray-500 text-xs ml-1">3 นาที</Text>
              <Text className="text-gray-500 text-xs mx-2">•</Text>
              <Text className="text-gray-500 text-xs">{formatDate(item.publish_date)}</Text>
            </View>
            <Icon name="open-outline" size={14} color="#eab308" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 flex-row items-center shadow-sm">
      <TouchableOpacity 
        className="w-10 h-10 rounded-full items-center justify-center mr-4"
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color="#eab308" />
      </TouchableOpacity>
        
        <Text className="text-xl font-bold text-gray-800">บทความการกิน</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Featured Article */}
        <View className="mt-6">
          {renderFeaturedArticle()}
        </View>

        {/* Filter Tabs */}
        <View className="mb-4">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {tabs.map(renderTabButton)}
          </ScrollView>
        </View>

        {/* Articles List */}
        <View className="pb-6">
          {loading ? (
            <View className="flex-1 justify-center items-center py-8">
              <ActivityIndicator size="large" color="#eab308" />
              <Text className="text-gray-500 mt-2">กำลังโหลดบทความ...</Text>
            </View>
          ) : error ? (
            <View className="flex-1 justify-center items-center py-8 mx-4">
              <Text className="text-red-500 text-center mb-4">{error}</Text>
              <TouchableOpacity 
                className="bg-yellow-500 px-4 py-2 rounded-lg"
                onPress={loadData}
              >
                <Text className="text-white font-medium">ลองใหม่</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={articles}
              renderItem={renderArticleItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View className="flex-1 justify-center items-center py-8">
                  <Text className="text-gray-500">ไม่พบบทความ</Text>
                </View>
              )}
            />
          )}
        </View>

      </ScrollView>

      {/* InApp Browser Modal */}
      <InAppBrowser
        isVisible={browserVisible}
        url={browserUrl}
        title={browserTitle}
        onClose={() => setBrowserVisible(false)}
      />
    </View>
  );
};

export default EatingBlogScreen;
