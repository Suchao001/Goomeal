import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../../hooks/Navigation';
import { ApiClient } from '../../utils/apiClient';
import { useFocusEffect } from '@react-navigation/native';

const PlanSelectionScreen = () => {
  const navigation = useTypedNavigation();
  const apiClient = new ApiClient();

  const [plans, setPlans] = useState<any[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load user food plans and current plan on component mount
  useEffect(() => {
    console.log('🚀 [PlanSelection] Component mounted, starting initial load...');
    loadUserFoodPlans();
    loadCurrentPlan();
    setIsInitialLoad(false);
  }, []);

  // Refresh data when screen comes into focus (but not on initial load)
  useFocusEffect(
    React.useCallback(() => {
      if (!isInitialLoad) {
        console.log('👁️ [PlanSelection] Screen focused, refreshing...');
        refreshPlans();
      }
    }, [isInitialLoad])
  );

  // Log state changes
  useEffect(() => {
    console.log('📊 [PlanSelection] State update - plans:', plans);
    console.log('📊 [PlanSelection] State update - plans length:', plans.length);
    console.log('📊 [PlanSelection] State update - currentPlanId:', currentPlanId);
    console.log('📊 [PlanSelection] State update - isLoading:', isLoading);
  }, [plans, currentPlanId, isLoading]);

  const loadUserFoodPlans = async () => {
    console.log('🔄 [PlanSelection] Loading user food plans...');
    try {
      const result = await apiClient.getUserFoodPlansList();
      console.log('📊 [PlanSelection] API result:', result);
      
      if (result.success) {
        console.log('✅ [PlanSelection] Plans loaded successfully:', result.data);
        console.log('📝 [PlanSelection] Number of plans:', result.data?.length || 0);
        setPlans(result.data);
      } else {
        console.error('❌ [PlanSelection] Failed to load plans:', result.error);
        Alert.alert('ข้อผิดพลาด', result.error);
      }
    } catch (error) {
      console.error('💥 [PlanSelection] Exception loading user food plans:', error);
      Alert.alert('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการโหลดรายการแผนอาหาร');
    } finally {
      setIsLoading(false);
      console.log('🏁 [PlanSelection] Loading finished, isLoading set to false');
    }
  };

  const loadCurrentPlan = async () => {
    console.log('🔄 [PlanSelection] Loading current plan...');
    try {
      const result = await apiClient.knowCurrentFoodPlan();
      console.log('📊 [PlanSelection] Current plan API result:', result);
      
      if (result.success) {
        console.log('✅ [PlanSelection] Current plan loaded:', result.data);
        setCurrentPlanId(result.data.food_plan_id);
      } else {
        console.log('⚠️ [PlanSelection] No current plan found:', result.error);
      }
    } catch (error) {
      console.error('💥 [PlanSelection] Exception loading current plan:', error);
      // Don't show error for this as user might not have current plan set
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handlePlanOptions = (plan: any) => {
    setSelectedPlan(plan);
    setShowActionSheet(true);
  };

  const handleEditPlan = () => {
    if (selectedPlan) {
      setShowActionSheet(false);
      // Navigate to MealPlan screen in edit mode
      navigation.navigate('MealPlan', {
        mode: 'edit',
        foodPlanId: selectedPlan.id
      });
    }
  };

  const handleCreateNewPlan = () => {
    // Navigate to MealPlan screen in add mode
    navigation.navigate('MealPlan', {
      mode: 'add'
    });
  };

  const refreshPlans = async () => {
    console.log('🔄 [PlanSelection] Refreshing plans...');
    await loadUserFoodPlans();
    await loadCurrentPlan();
    console.log('✅ [PlanSelection] Refresh completed');
  };

  const handleSetAsCurrent = async () => {
    setShowActionSheet(false);
    if (selectedPlan) {
      try {
        const result = await apiClient.setCurrentFoodPlan(selectedPlan.id);
        if (result.success) {
          setCurrentPlanId(selectedPlan.id);
          Alert.alert('สำเร็จ', 'ตั้งเป็นแผนปัจจุบันเรียบร้อยแล้ว');
        } else {
          Alert.alert('ข้อผิดพลาด', result.error);
        }
      } catch (error) {
        console.error('Error setting current plan:', error);
        Alert.alert('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการตั้งแผนปัจจุบัน');
      }
      setSelectedPlan(null);
    }
  };

  const handleDelete = async () => {
    setShowActionSheet(false);
    if (selectedPlan) {
      Alert.alert(
        'ยืนยันการลบ',
        `คุณต้องการลบ "${selectedPlan.name}" หรือไม่?`,
        [
          { text: 'ยกเลิก', style: 'cancel' },
          {
            text: 'ลบ',
            style: 'destructive',
            onPress: async () => {
              try {
                const result = await apiClient.deleteUserFoodPlan(selectedPlan.id);
                if (result.success) {
                  // Remove from local state
                  setPlans(plans.filter(p => p.id !== selectedPlan.id));
                  // If deleted plan was current plan, clear current plan ID
                  if (currentPlanId === selectedPlan.id) {
                    setCurrentPlanId(null);
                  }
                  Alert.alert('สำเร็จ', 'ลบแผนอาหารเรียบร้อยแล้ว');
                } else {
                  Alert.alert('ข้อผิดพลาด', result.error);
                }
              } catch (error) {
                console.error('Error deleting plan:', error);
                Alert.alert('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการลบแผนอาหาร');
              }
              setSelectedPlan(null);
            }
          }
        ]
      );
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      <View className="flex-row items-center justify-between px-4 pt-10 pb-4 bg-white">
        <TouchableOpacity 
          className="w-10 h-10 rounded-full items-center justify-center"
          onPress={handleBackPress}
        >
          <Icon name="arrow-back" size={24} color="#9ca3af" />
        </TouchableOpacity>
        
        <View className="flex-row items-center gap-2">
          <Icon name="restaurant" size={32} color="#9ca3af" />
          <Text className="text-xl font-semibold text-gray-800">แผนการกิน</Text>
        </View>
        
        <Text className="text-base font-semibold text-gray-800"></Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="flex-1 px-4 pt-6">
          {/* Debug Section - Remove in production */}
          {__DEV__ && (
            <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4" style={{ backgroundColor: '#fefce8', borderColor: '#fde047', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 16 }}>
              <Text className="text-xs font-bold text-yellow-800 mb-1" style={{ fontSize: 12, fontWeight: 'bold', color: '#92400e', marginBottom: 4 }}>🐛 Debug Info:</Text>
              <Text className="text-xs text-yellow-700" style={{ fontSize: 12, color: '#a16207' }}>Loading: {isLoading ? 'true' : 'false'}</Text>
              <Text className="text-xs text-yellow-700" style={{ fontSize: 12, color: '#a16207' }}>Plans count: {plans?.length || 0}</Text>
              <Text className="text-xs text-yellow-700" style={{ fontSize: 12, color: '#a16207' }}>Current plan ID: {currentPlanId || 'none'}</Text>
              <Text className="text-xs text-yellow-700" style={{ fontSize: 12, color: '#a16207' }}>First plan: {plans[0] ? `${plans[0].name} (ID: ${plans[0].id})` : 'none'}</Text>
              {plans[0] && plans[0].img && (
                <Text className="text-xs text-yellow-700" style={{ fontSize: 12, color: '#a16207' }}>First img: {plans[0].img}</Text>
              )}
            </View>
          )}
          
          {isLoading ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color="#eab308" />
              <Text className="text-gray-600 mt-4">กำลังโหลดรายการแผนอาหาร...</Text>
            </View>
          ) : (
            <>
              {plans && plans.length > 0 ? (
                <>
                  <View className="gap-4">
                    {plans.map((plan) => {
                      console.log('🎨 [PlanSelection] Rendering plan:', plan.id, plan.name, 'Current?', currentPlanId === plan.id);
                      console.log('🖼️ [PlanSelection] Plan image URL:', plan.img);
                      console.log('📝 [PlanSelection] Plan description:', plan.description);
                      return (
                        <View key={plan.id} className="bg-white rounded-2xl p-4 flex-row items-center justify-between shadow-lg shadow-slate-800" style={{ marginBottom: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16 }}>
                          <View className="flex-row items-center flex-1" style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <View className="w-15 h-15 rounded-xl bg-gray-100 items-center justify-center mr-4 overflow-hidden" style={{ width: 60, height: 60, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginRight: 16, overflow: 'hidden' }}>
                              {plan.img ? (
                                <Image 
                                  source={{ uri: plan.img }} 
                                  className="w-full h-full"
                                  style={{ width: '100%', height: '100%' }}
                                  resizeMode="cover"
                                  onLoad={() => console.log('🖼️ [PlanSelection] Image loaded:', plan.img)}
                                  onError={(error) => console.error('❌ [PlanSelection] Image error:', plan.img, error.nativeEvent.error)}
                                />
                              ) : (
                                <Text className="text-3xl" style={{ fontSize: 32 }}>🍽️</Text>
                              )}
                              {/* Debug overlay for image URL */}
                              {__DEV__ && plan.img && (
                                <View className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 px-1" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 4 }}>
                                  <Text className="text-xs text-white" style={{ fontSize: 10, color: 'white' }} numberOfLines={1}>
                                    {plan.img.split('/').pop()}
                                  </Text>
                                </View>
                              )}
                            </View>
                            <View className="flex-1" style={{ flex: 1 }}>
                              <View className="flex-row items-center" style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text className="text-lg font-bold text-gray-800 mb-1" style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 }}>{plan.name}</Text>
                                {currentPlanId === plan.id && (
                                  <View className="ml-2 px-2 py-1 bg-green-100 rounded-full" style={{ marginLeft: 8, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#dcfce7', borderRadius: 16 }}>
                                    <Text className="text-xs text-green-600 font-medium" style={{ fontSize: 12, color: '#16a34a', fontWeight: '500' }}>ปัจจุบัน</Text>
                                  </View>
                                )}
                              </View>
                              <Text className="text-sm text-gray-600" style={{ fontSize: 14, color: '#4b5563' }}>{plan.description || 'ไม่มีคำอธิบาย'}</Text>
                            </View>
                          </View>
                          <TouchableOpacity 
                            className="p-2"
                            style={{ padding: 8 }}
                            onPress={() => handlePlanOptions(plan)}
                          >
                            <Icon name="ellipsis-vertical" size={20} color="#eab308" />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>

                  <TouchableOpacity 
                    className="bg-white rounded-2xl p-5 flex-row items-center justify-center mt-4 border-2 border-gray-200 border-dashed"
                    onPress={handleCreateNewPlan}
                  >
                    <Icon name="add" size={24} color="#eab308" />
                    <Text className="text-base font-semibold text-gray-600 ml-2">+ สร้างแผนใหม่</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View className="flex-1 items-center justify-center py-20">
                  <Icon name="restaurant-outline" size={64} color="#9ca3af" />
                  <Text className="text-lg font-semibold text-gray-600 mt-4">ไม่มีแผนอาหาร</Text>
                  <Text className="text-sm text-gray-500 text-center mt-2 px-8">
                    คุณยังไม่มีแผนอาหาร{'\n'}เริ่มต้นสร้างแผนใหม่ได้เลย
                  </Text>
                  <TouchableOpacity 
                    className="bg-yellow-400 rounded-2xl px-6 py-3 mt-6"
                    onPress={handleCreateNewPlan}
                  >
                    <Text className="text-base font-semibold text-white">+ สร้างแผนใหม่</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Action Sheet Modal */}
      <Modal
        visible={showActionSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowActionSheet(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View className="bg-white rounded-t-3xl pb-10">
            <TouchableOpacity 
              className="py-4 px-5 border-b border-gray-200"
              onPress={() => setShowActionSheet(false)}
            >
              <Text className="text-base text-gray-800 text-center">ยกเลิก</Text>
            </TouchableOpacity>
            {currentPlanId !== selectedPlan?.id && (
              <TouchableOpacity 
                className="py-4 px-5 border-b border-gray-200 bg-green-50"
                onPress={handleSetAsCurrent}
              >
                <Text className="text-base text-green-600 text-center">ตั้งเป็นแผนปัจจุบัน</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              className="py-4 px-5 border-b border-gray-200"
              onPress={handleEditPlan}
            >
              <Text className="text-base text-gray-800 text-center">แก้ไขแผน</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="py-4 px-5 border-b border-gray-200 bg-red-50"
              onPress={handleDelete}
            >
              <Text className="text-base text-red-500 text-center">ลบ</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="py-4 px-5 bg-gray-100 mt-2"
              onPress={() => setShowActionSheet(false)}
            >
              <Text className="text-base text-gray-800 text-center">ยกเลิก</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PlanSelectionScreen;
