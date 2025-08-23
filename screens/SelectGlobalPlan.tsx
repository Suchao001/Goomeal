import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../hooks/Navigation';
import { base_url, seconde_url } from '../config';

interface GlobalFoodPlan {
  plan_id: number;
  plan_name: string;
  duration: number;
  description: string;
  created_at: string;
  image: string | null;
}

const SelectGlobalPlan = () => {
  const navigation = useTypedNavigation();
  const [globalPlans, setGlobalPlans] = useState<GlobalFoodPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch global food plans from API
  useEffect(() => {
    const fetchGlobalPlans = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${base_url}/api/global-food-plans?limit=4`);
        const data = await response.json();

        if (data.success) {
          setGlobalPlans(data.data);
          setError(null);
        } else {
          setError(data.message || 'Failed to fetch plans');
        }
      } catch (err) {
        console.error('Error fetching global food plans:', err);
        setError('Failed to connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalPlans();
    console.log('Screen : SelectGlobalPlan');
  }, []);

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) {
      // Return a default placeholder image if imagePath is null or undefined
      return 'https://via.placeholder.com/120x120/E5E7EB/6B7280?text=No+Image';
    }
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `${seconde_url}${imagePath}`;
  };

  const handlePlanPress = (planId: number) => {
    navigation.navigate('GlobalPlanMeal', { planId });
  };

  const handleSeeMorePlans = () => {
    navigation.navigate('SeeMoreGlobalPlans');
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-8">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity 
            className="p-2"
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#4A4A4A" />
          </TouchableOpacity>
          <View className="flex-1" />
        </View>
        
        {/* Main Title - Centered */}
        <Text className="text-3xl font-promptSemiBold text-[#4A4A4A] mb-4 text-center">
          เลือกแผนการกินจากทางเรา
        </Text>
        
        {/* Subtitle */}
        <View className="items-center">
          <Text className="text-base font-promptLight text-[#4A4A4A] text-center leading-6">
            เลือกแผนการกินตามแบบต่างๆ
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-4">
          {loading ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color="#f59e0b" />
              <Text className="text-[#4A4A4A] mt-4">กำลังโหลดแผนอาหาร...</Text>
            </View>
          ) : error ? (
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-red-500 text-center">{error}</Text>
              <TouchableOpacity
                onPress={() => window.location.reload()}
                className="mt-4 bg-primary px-4 py-2 rounded-lg"
              >
                <Text className="text-white">ลองใหม่</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Plan Cards */}
              <View className="space-y-4">
                {globalPlans.map((plan) => (
                  <View
                    key={plan.plan_id}
                    className="bg-white rounded-xl shadow-md mx-2 mb-4 overflow-hidden"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: {
                        width: 0,
                        height: 2,
                      },
                      shadowOpacity: 0.1,
                      shadowRadius: 3.84,
                      elevation: 5,
                    }}
                  >
                    <View className="flex-row">
                      {/* Image Column */}
                      <View className="w-32 h-32">
                        <Image
                          source={{ uri: getImageUrl(plan.image) }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      </View>
                      
                      {/* Content Column */}
                      <View className="flex-1 p-4 justify-between">
                        {/* Title and Subtitle */}
                        <View className="flex-1">
                          <Text className="text-lg font-promptSemiBold text-[#4A4A4A] mb-2 leading-5">
                            {plan.plan_name}
                          </Text>
                          <Text className="text-sm font-promptLight text-[#4A4A4A] leading-4 mb-3">
                            {plan.description}
                          </Text>
                        </View>
                        
                        {/* Bottom Row */}
                        <View className="flex-row justify-between items-end">
                          {/* Duration */}
                          <View className="flex-row items-center">
                            <Text className="text-xs font-promptMedium text-[#4A4A4A]">
                              {plan.duration} วัน
                            </Text>
                          </View>
                          
                          {/* View Details Button */}
                          <TouchableOpacity
                            onPress={() => handlePlanPress(plan.plan_id)}
                            activeOpacity={0.7}
                          >
                            <Text className="text-sm font-promptMedium text-primary">
                              ดูรายการอาหาร &gt;&gt;
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* See More Plans Button */}
              <View className="px-4 mt-6 mb-8">
                <TouchableOpacity
                  onPress={handleSeeMorePlans}
                  activeOpacity={0.7}
                  className="items-center"
                >
                  <Text className="text-lg font-promptMedium text-primary">
                    ดูแพลนอาหารเพิ่มเติม
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default SelectGlobalPlan;
