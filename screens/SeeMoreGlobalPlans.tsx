import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, TextInput, FlatList, RefreshControl } from 'react-native';
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

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const SeeMoreGlobalPlans = () => {
  const navigation = useTypedNavigation();
  const [globalPlans, setGlobalPlans] = useState<GlobalFoodPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) {
      return 'https://via.placeholder.com/120x120/E5E7EB/6B7280?text=No+Image';
    }
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `${seconde_url}${imagePath}`;
  };

  const fetchGlobalPlans = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search })
      });

      const response = await fetch(`${base_url}/api/global-food-plans?${params}`);
      const data = await response.json();

      if (data.success) {
        setGlobalPlans(data.data);
        setPagination(data.pagination);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch plans');
      }
    } catch (err) {
      console.error('Error fetching global food plans:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    fetchGlobalPlans(1, searchText);
  }, []);

  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
    fetchGlobalPlans(1, text);
  }, [fetchGlobalPlans]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && !loading) {
      fetchGlobalPlans(newPage, searchText);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchGlobalPlans(pagination.page, searchText);
  };

  const handlePlanPress = (planId: number) => {
    console.log('Selected plan:', planId);
    navigation.navigate('GlobalPlanMeal');
  };

  const renderPlanCard = ({ item: plan }: { item: GlobalFoodPlan }) => (
    <View className="w-1/2 px-2 mb-4">
      <View
        className="bg-white rounded-xl shadow-md overflow-hidden"
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
        {/* Image */}
        <View className="h-32">
          <Image
            source={{ uri: getImageUrl(plan.image) }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        
        {/* Content */}
        <View className="p-3">
          <Text className="text-sm font-promptSemiBold text-[#4A4A4A] mb-1 leading-4" numberOfLines={2}>
            {plan.plan_name}
          </Text>
          <Text className="text-xs font-promptLight text-[#4A4A4A] leading-3 mb-2" numberOfLines={2}>
            {plan.description}
          </Text>
          
          {/* Duration and Button */}
          <View className="flex-row justify-between items-center">
            <Text className="text-xs font-promptMedium text-[#4A4A4A]">
              {plan.duration} วัน
            </Text>
            <TouchableOpacity
              onPress={() => handlePlanPress(plan.plan_id)}
              activeOpacity={0.7}
            >
              <Text className="text-xs font-promptMedium text-primary">
                ดูรายการ &gt;
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderFooter = () => null;

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const maxVisiblePages = 5;
    const currentPage = pagination.page;
    const totalPages = pagination.totalPages;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <View className="bg-white px-4 py-3 border-t border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm text-gray-600 font-prompt">
            หน้า {currentPage} จาก {totalPages} ({pagination.total} รายการ)
          </Text>
        </View>
        
        <View className="flex-row items-center justify-center">
          {/* Previous Button */}
          <TouchableOpacity
            onPress={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPrev || loading}
            className={`px-3 py-2 mx-1 rounded-lg ${
              pagination.hasPrev && !loading
                ? 'bg-primary'
                : 'bg-gray-200'
            }`}
          >
            <Icon 
              name="chevron-back" 
              size={16} 
              color={pagination.hasPrev && !loading ? 'white' : '#9CA3AF'} 
            />
          </TouchableOpacity>

          {/* First page if not visible */}
          {startPage > 1 && (
            <>
              <TouchableOpacity
                onPress={() => handlePageChange(1)}
                disabled={loading}
                className="px-3 py-2 mx-1 rounded-lg bg-gray-100"
              >
                <Text className="text-sm font-promptMedium text-gray-700">1</Text>
              </TouchableOpacity>
              {startPage > 2 && (
                <Text className="mx-1 text-gray-500">...</Text>
              )}
            </>
          )}

          {/* Page Numbers */}
          {pageNumbers.map(page => (
            <TouchableOpacity
              key={page}
              onPress={() => handlePageChange(page)}
              disabled={loading}
              className={`px-3 py-2 mx-1 rounded-lg ${
                page === currentPage
                  ? 'bg-primary'
                  : 'bg-gray-100'
              }`}
            >
              <Text className={`text-sm font-promptMedium ${
                page === currentPage ? 'text-white' : 'text-gray-700'
              }`}>
                {page}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Last page if not visible */}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <Text className="mx-1 text-gray-500">...</Text>
              )}
              <TouchableOpacity
                onPress={() => handlePageChange(totalPages)}
                disabled={loading}
                className="px-3 py-2 mx-1 rounded-lg bg-gray-100"
              >
                <Text className="text-sm font-promptMedium text-gray-700">{totalPages}</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Next Button */}
          <TouchableOpacity
            onPress={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNext || loading}
            className={`px-3 py-2 mx-1 rounded-lg ${
              pagination.hasNext && !loading
                ? 'bg-primary'
                : 'bg-gray-200'
            }`}
          >
            <Icon 
              name="chevron-forward" 
              size={16} 
              color={pagination.hasNext && !loading ? 'white' : '#9CA3AF'} 
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Icon name="search-outline" size={48} color="#9CA3AF" />
        <Text className="text-[#4A4A4A] mt-4 text-center">
          {searchText ? 'ไม่พบแผนอาหารที่ค้นหา' : 'ไม่มีแผนอาหาร'}
        </Text>
        {searchText && (
          <Text className="text-gray-500 mt-2 text-center">
            ลองค้นหาด้วยคำอื่น
          </Text>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 pt-12 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity 
            className="p-2"
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#4A4A4A" />
          </TouchableOpacity>
          <Text className="text-xl font-promptSemiBold text-[#4A4A4A]">
            แผนอาหารทั้งหมด
          </Text>
          <View className="w-10" />
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
          <Icon name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-[#4A4A4A] font-prompt"
            placeholder="ค้นหาแผนอาหาร..."
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={handleSearch}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Icon name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Results Info */}
        {!loading && (
          <View className="mt-3">
            <Text className="text-sm text-gray-600 font-prompt">
              {searchText 
                ? `พบ ${pagination.total} แผนจากการค้นหา "${searchText}"`
                : `แผนอาหารทั้งหมด ${pagination.total} แผน`
              }
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text className="text-[#4A4A4A] mt-4">กำลังโหลดแผนอาหาร...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-red-500 text-center mb-4">{error}</Text>
          <TouchableOpacity
            onPress={() => fetchGlobalPlans(1, searchText)}
            className="bg-primary px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-promptMedium">ลองใหม่</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-1">
          <FlatList
            data={globalPlans}
            renderItem={renderPlanCard}
            keyExtractor={(item) => item.plan_id.toString()}
            numColumns={2}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#f59e0b']}
              />
            }
          />
          {renderPagination()}
        </View>
      )}
    </View>
  );
};

export default SeeMoreGlobalPlans;
