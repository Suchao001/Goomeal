import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTypedNavigation } from '../hooks/Navigation';
import Icon from 'react-native-vector-icons/Ionicons';

/**
 * EatingBlogScreen Component
 * หน้าบทความการกิน - แสดงบทความเกี่ยวกับอาหารและโภชนาการ
 * 
 * Features:
 * - แสดงบทความแนะนำ
 * - Tab สำหรับกรองบทความ
 * - ปุ่มย้อนกลับ
 */
const EatingBlogScreen = () => {
  const navigation = useTypedNavigation();
  const [selectedTab, setSelectedTab] = useState('แนะนำ');

  const tabs = ['แนะนำ', 'โภชนาการ', 'สูตรอาหาร', 'สุขภาพ', 'ลดน้ำหนัก'];

  // Mock data for featured article
  const featuredArticle = {
    id: 'featured',
    title: '10 วิธีการทำอาหารเพื่อสุขภาพที่ง่ายและอร่อย',
    excerpt: 'เรียนรู้เทคนิคการปรุงอาหารที่ดีต่อสุขภาพ ลดไขมัน เพิ่มคุณค่าโภชนาการ และยังคงรสชาติที่อร่อย...',
    image: require('../assets/images/Foodtype_1.png'),
    author: 'นักโภชนาการ GoodMeal',
    readTime: '5 นาที',
    date: '12 มิ.ย. 2567',
  };

  // Mock data for articles based on selected tab
  const getArticlesByTab = (tab: string) => {
    const baseArticles = [
      {
        id: '1',
        title: '5 เทคนิคการทำอาหารเพื่อสุขภาพ',
        excerpt: 'เรียนรู้วิธีการปรุงอาหารที่ดีต่อสุขภาพและอร่อยไปพร้อมกัน...',
        image: require('../assets/images/Foodtype_2.png'),
        readTime: '3 นาที',
        date: '10 มิ.ย. 2567',
      },
      {
        id: '2',
        title: 'ประโยชน์ของการกินผักผลไม้ในชีวิตประจำวัน',
        excerpt: 'ผักผลไม้มีสารอาหารที่จำเป็นต่อร่างกาย ช่วยเสริมภูมิคุ้มกัน...',
        image: require('../assets/images/Foodtype_3.png'),
        readTime: '4 นาที',
        date: '8 มิ.ย. 2567',
      },
      {
        id: '3',
        title: 'วิธีการเลือกซื้อผักผลไม้ที่สด',
        excerpt: 'เคล็ดลับในการเลือกซื้อผักผลไม้ที่มีคุณภาพดี เพื่อสุขภาพที่ดี...',
        image: require('../assets/images/Foodtype_4.png'),
        readTime: '2 นาที',
        date: '5 มิ.ย. 2567',
      },
    ];

    // Filter articles based on tab (simplified for demo)
    return baseArticles;
  };

  const articles = getArticlesByTab(selectedTab);

  const renderTabButton = (tab: string) => (
    <TouchableOpacity
      key={tab}
      className={`px-4 py-2 mr-3 rounded-full ${
        selectedTab === tab ? 'bg-yellow-500' : 'bg-gray-200'
      }`}
      onPress={() => setSelectedTab(tab)}
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

  const renderFeaturedArticle = () => (
    <TouchableOpacity className="bg-white rounded-lg shadow-md overflow-hidden mb-6 mx-4">
      {/* Featured Badge */}
      <View className="absolute top-3 left-3 bg-yellow-500 px-3 py-1 rounded-full z-10">
        <Text className="text-white text-xs font-bold">แนะนำ</Text>
      </View>
      
      {/* Featured Image */}
      <View className="h-48 bg-gray-200">
        <Image
          source={featuredArticle.image}
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
          {featuredArticle.excerpt}
        </Text>
        
        {/* Meta Info */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Text className="text-gray-500 text-xs">{featuredArticle.author}</Text>
          </View>
          <View className="flex-row items-center">
            <Icon name="time-outline" size={12} color="#9ca3af" />
            <Text className="text-gray-500 text-xs ml-1">{featuredArticle.readTime}</Text>
            <Text className="text-gray-500 text-xs mx-2">•</Text>
            <Text className="text-gray-500 text-xs">{featuredArticle.date}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderArticleItem = ({ item }: { item: any }) => (
    <TouchableOpacity className="bg-white rounded-lg shadow-md overflow-hidden mb-4 mx-4">
      <View className="flex-row">
        {/* Article Image */}
        <View className="w-24 h-24 bg-gray-200">
          <Image
            source={item.image}
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
            {item.excerpt}
          </Text>
          
          {/* Meta Info */}
          <View className="flex-row items-center">
            <Icon name="time-outline" size={12} color="#9ca3af" />
            <Text className="text-gray-500 text-xs ml-1">{item.readTime}</Text>
            <Text className="text-gray-500 text-xs mx-2">•</Text>
            <Text className="text-gray-500 text-xs">{item.date}</Text>
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
          className="w-10 h-10 rounded-full bg-yellow-100 items-center justify-center mr-4"
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
          <FlatList
            data={articles}
            renderItem={renderArticleItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default EatingBlogScreen;
