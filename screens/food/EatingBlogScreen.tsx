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
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
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
        fetchFeaturedArticles(4),
        fetchArticles(),
        fetchAllTags()
      ]);

      setFeaturedArticles(featuredData);
      setArticles(featuredData);
      setLatestArticles(allArticlesData);
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
        if (featuredArticles.length === 0) {
          const data = await fetchFeaturedArticles(4);
          setFeaturedArticles(data);
          setArticles(data);
        } else {
          setArticles(featuredArticles);
        }
      } else if (tab === 'ล่าสุด') {
        if (latestArticles.length === 0) {
          const data = await fetchArticles();
          setLatestArticles(data);
          setArticles(data);
        } else {
          setArticles(latestArticles);
        }
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

  const renderFeaturedArticle = () => {
    if (!featuredArticles || featuredArticles.length === 0) {
      return null;
    }
    const featuredArticle = featuredArticles[0];
    return (
      <TouchableOpacity
        className="mx-4 mb-8 rounded-3xl overflow-hidden shadow-2xl"
        activeOpacity={0.93}
        onPress={() => openArticle(featuredArticle)}
        style={{ elevation: 8 }}
      >
        {/* Hero Image with gradient overlay */}
        <View className="h-56 w-full relative">
          <Image
            source={getImageSource(featuredArticle.img)}
            className="w-full h-full"
            resizeMode="cover"
          />
          <View
            className="absolute inset-0"
            style={{
              backgroundColor: 'rgba(0,0,0,0.18)',
              zIndex: 1,
            }}
          />
          {/* Featured Badge */}
          <View className="absolute top-4 left-4 bg-primary px-4 py-1.5 rounded-full z-10 shadow-md">
            <Text className="text-white text-xs font-bold tracking-wider">แนะนำ</Text>
          </View>
        </View>
        {/* Content */}
        <View className="p-6 bg-white rounded-b-3xl -mt-6 z-10 shadow-lg">
          <Text className="text-2xl font-promptBold text-gray-900 mb-2" numberOfLines={2}>
            {featuredArticle.title}
          </Text>
          <Text className="text-gray-600 text-base mb-4 font-prompt" numberOfLines={3}>
            {featuredArticle.excerpt_content || 'ไม่มีคำอธิบาย'}
          </Text>
          {/* Tags */}
          {featuredArticle.tags && featuredArticle.tags.length > 0 && (
            <View className="flex-row items-center mb-4">
              {featuredArticle.tags.slice(0, 3).map((tag, index) => (
                <View key={index} className="bg-yellow-50 px-3 py-1 rounded-full mr-2 border border-yellow-200">
                  <Text className="text-yellow-700 text-xs font-promptMedium">#{tag}</Text>
                </View>
              ))}
            </View>
          )}
          {/* Read More Indicator */}
          <View className="flex-row items-center mb-4">
            <Icon name="open-outline" size={18} color="#eab308" />
            <Text className="text-yellow-600 text-base ml-2 font-promptMedium">แตะเพื่ออ่านบทความเต็ม</Text>
          </View>
          {/* Meta Info */}
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-400 text-xs font-prompt">GoodMeal</Text>
            <View className="flex-row items-center">
              <Icon name="time-outline" size={13} color="#9ca3af" />
              <Text className="text-gray-400 text-xs ml-1 font-prompt">5 นาที</Text>
              <Text className="text-gray-400 text-xs mx-2">•</Text>
              <Text className="text-gray-400 text-xs font-prompt">{formatDate(featuredArticle.publish_date)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTabButton = (tab: string) => (
    <TouchableOpacity
      key={tab}
      className={`px-5 py-2 mr-3 rounded-full border ${selectedTab === tab ? 'bg-primary border-yellow-400' : 'bg-white border-gray-200'}`}
      style={{ shadowColor: selectedTab === tab ? '#eab308' : 'transparent', shadowOpacity: 0.12, shadowRadius: 6, elevation: selectedTab === tab ? 2 : 0 }}
      onPress={() => handleTabChange(tab)}
      activeOpacity={0.85}
    >
      <Text className={`font-promptSemiBold text-base ${selectedTab === tab ? 'text-white' : 'text-gray-700'}`}>{tab}</Text>
    </TouchableOpacity>
  );

  const renderArticleItem = ({ item }: { item: Article }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl shadow-lg overflow-hidden mb-5 mx-4"
      onPress={() => openArticle(item)}
      activeOpacity={0.92}
      style={{ elevation: 4 }}
    >
      <View className="flex-row">
        {/* Article Image */}
        <View className="w-24 h-24 bg-gray-200 rounded-xl overflow-hidden m-3">
          <Image
            source={getImageSource(item.img)}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        {/* Article Content */}
        <View className="flex-1 py-3 pr-3">
          <Text className="text-lg font-promptBold text-gray-900 mb-1" numberOfLines={2}>
            {item.title}
          </Text>
          <Text className="text-gray-600 text-base mb-2 font-prompt" numberOfLines={2}>
            {item.excerpt_content || 'ไม่มีคำอธิบาย'}
          </Text>
          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <View className="flex-row items-center mb-2">
              {item.tags.slice(0, 2).map((tag, index) => (
                <View key={index} className="bg-yellow-50 px-2 py-1 rounded-full mr-2 border border-yellow-100">
                  <Text className="text-yellow-700 text-xs font-promptMedium">#{tag}</Text>
                </View>
              ))}
            </View>
          )}
          {/* Meta Info */}
          <View className="flex-row items-center justify-between mt-2">
            <View className="flex-row items-center">
              <Icon name="time-outline" size={12} color="#9ca3af" />
              <Text className="text-gray-400 text-xs ml-1 font-prompt">3 นาที</Text>
              <Text className="text-gray-400 text-xs mx-2">•</Text>
              <Text className="text-gray-400 text-xs font-prompt">{formatDate(item.publish_date)}</Text>
            </View>
            <Icon name="open-outline" size={15} color="#eab308" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 flex-row items-center shadow-md sticky top-0 z-20">
      <TouchableOpacity
        className="w-10 h-10  items-center justify-center mr-4 "
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Icon name="arrow-back" size={24} color="#ffb800" />
      </TouchableOpacity>
        <Text className="text-2xl font-promptBold text-gray-900">บทความการกิน</Text>
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
            <View className="flex-1 justify-center items-center py-12">
              <ActivityIndicator size="large" color="#eab308" />
              <Text className="text-gray-400 mt-3 font-prompt">กำลังโหลดบทความ...</Text>
            </View>
          ) : error ? (
            <View className="flex-1 justify-center items-center py-12 mx-4">
              <Text className="text-red-500 text-center mb-4 font-promptBold">{error}</Text>
              <TouchableOpacity
                className="bg-yellow-400 px-6 py-3 rounded-xl shadow-md"
                onPress={loadData}
                activeOpacity={0.85}
              >
                <Text className="text-white font-promptSemiBold text-base">ลองใหม่</Text>
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
                <View className="flex-1 justify-center items-center py-12">
                  <Text className="text-gray-400 font-prompt">ไม่พบบทความ</Text>
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
