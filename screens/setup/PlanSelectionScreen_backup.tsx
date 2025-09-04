import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, Image, Switch, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../../hooks/Navigation';
import { ApiClient } from '../../utils/apiClient';
import { useFocusEffect } from '@react-navigation/native';
import { EditPlanModal } from '../../components/EditPlanModal';
import { useImagePicker } from '../../hooks/useImagePicker';
import DateTimePicker from '@react-native-community/datetimepicker';

const PlanSelectionScreen = () => {
  const navigation = useTypedNavigation();
  const apiClient = new ApiClient();

  const [plans, setPlans] = useState<any[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<number | null>(null);
  const [currentPlanSettings, setCurrentPlanSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editImage, setEditImage] = useState<string | null>(null);
  
  // Settings modal states
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date>(new Date());
  const [isRepeat, setIsRepeat] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [showNativeDatePicker, setShowNativeDatePicker] = useState(false);

  // Image picker hook
  const { showImagePicker } = useImagePicker();

  // Load user food plans and current plan on component mount
  useEffect(() => {
    loadUserFoodPlans();
    loadCurrentPlan();
    setIsInitialLoad(false);
    console.log('screen: PlanSelectionScreen');
  }, []);

  // Refresh data when screen comes into focus (but not on initial load)
  useFocusEffect(
    React.useCallback(() => {
      if (!isInitialLoad) {
        loadUserFoodPlans();
        loadCurrentPlan();
      }
    }, [isInitialLoad])
  );

  const loadUserFoodPlans = async () => {
    try {
      const response = await apiClient.get('/food-plan-users/user/plans');
      if (response.success) {
        setPlans(response.data);
      } else {
        console.error('Failed to load plans:', response.message);
      }
    } catch (error) {
      console.error('Error loading user food plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentPlan = async () => {
    try {
      const response = await apiClient.get('/food-plan-users/user/current-plan');
      if (response.success && response.data) {
        setCurrentPlanId(response.data.plan_id);
        setCurrentPlanSettings(response.data);
      } else {
        setCurrentPlanId(null);
        setCurrentPlanSettings(null);
      }
    } catch (error) {
      console.error('Error loading current plan:', error);
    }
  };

  const handleSelectPlan = async (plan: any) => {
    if (currentPlanId === plan.id) {
      Alert.alert('แจ้งเตือน', 'คุณใช้แผนอาหารนี้อยู่แล้ว');
      return;
    }

    Alert.alert(
      'เลือกแผนอาหาร',
      `คุณต้องการใช้แผนอาหาร "${plan.name}" ใช่หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'เลือก',
          style: 'default',
          onPress: async () => {
            try {
              setIsUpdating(true);
              const response = await apiClient.post('/food-plan-users/user/select-plan', {
                plan_id: plan.id
              });

              if (response.success) {
                setCurrentPlanId(plan.id);
                Alert.alert('สำเร็จ', 'เลือกแผนอาหารเรียบร้อยแล้ว');
                await loadCurrentPlan();
              } else {
                Alert.alert('เกิดข้อผิดพลาด', response.message || 'ไม่สามารถเลือกแผนอาหารได้');
              }
            } catch (error) {
              console.error('Error selecting plan:', error);
              Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเลือกแผนอาหารได้');
            } finally {
              setIsUpdating(false);
            }
          }
        }
      ]
    );
  };

  const handlePlanOptions = (plan: any, event?: any) => {
    if (event && typeof event.nativeEvent !== 'undefined') {
      const { pageY } = event.nativeEvent;
      setDropdownPosition({ x: 0, y: pageY });
    } else {
      setDropdownPosition({ x: 0, y: 200 });
    }
    setSelectedPlan(plan);
    setShowActionSheet(true);
  };

  const handleDeletePlan = async () => {
    if (!selectedPlan) return;

    Alert.alert(
      'ลบแผนอาหาร',
      `คุณต้องการลบแผนอาหาร "${selectedPlan.name}" ใช่หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบ',
          style: 'destructive',
          onPress: async () => {
            try {
              setShowActionSheet(false);
              const response = await apiClient.delete(`/food-plan-users/${selectedPlan.user_plan_id}`);

              if (response.success) {
                Alert.alert('สำเร็จ', 'ลบแผนอาหารเรียบร้อยแล้ว');
                loadUserFoodPlans();
                if (currentPlanId === selectedPlan.id) {
                  setCurrentPlanId(null);
                  loadCurrentPlan();
                }
              } else {
                Alert.alert('เกิดข้อผิดพลาด', response.message || 'ไม่สามารถลบแผนอาหารได้');
              }
            } catch (error) {
              console.error('Error deleting plan:', error);
              Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถลบแผนอาหารได้');
            }
          }
        }
      ]
    );
  };

  const handleEditPlan = () => {
    setEditName(selectedPlan.name);
    setEditDescription(selectedPlan.description || '');
    setEditImage(selectedPlan.img);
    setShowActionSheet(false);
    setShowEditModal(true);
  };

  const handleSavePlan = async () => {
    if (!editName.trim()) {
      Alert.alert('เกิดข้อผิดพลาด', 'กรุณาใส่ชื่อแผนอาหาร');
      return;
    }

    try {
      const response = await apiClient.put(`/food-plans/${selectedPlan.id}`, {
        name: editName.trim(),
        description: editDescription.trim(),
        img: editImage
      });

      if (response.success) {
        Alert.alert('สำเร็จ', 'บันทึกการแก้ไขเรียบร้อยแล้ว');
        setShowEditModal(false);
        loadUserFoodPlans();
      } else {
        Alert.alert('เกิดข้อผิดพลาด', response.message || 'ไม่สามารถบันทึกการแก้ไขได้');
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกการแก้ไขได้');
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditName('');
    setEditDescription('');
    setEditImage(null);
  };

  const handleImageEdit = () => {
    showImagePicker(
      (imageUri) => {
        setEditImage(imageUri);
      },
      (error) => {
        Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเลือกรูปภาพได้: ' + error);
      }
    );
  };

  const handleCreateNewPlan = () => {
    navigation.navigate('OptionPlanScreen', {
      fromSetup: false,
      isFromPlanSelection: true
    });
  };

  const handlePlanSettings = () => {
    setShowActionSheet(false);
    setShowSettingsModal(true);
  };

  const handleSaveSettings = async () => {
    if (!selectedPlan) return;

    try {
      setIsLoadingSettings(true);

      const response = await apiClient.put(`/food-plan-users/${selectedPlan.user_plan_id}/settings`, {
        start_date: selectedStartDate.toISOString(),
        is_repeat: isRepeat
      });

      if (response.success) {
        Alert.alert('สำเร็จ', 'บันทึกการตั้งค่าเรียบร้อยแล้ว');
        setShowSettingsModal(false);
        await loadCurrentPlan();
      } else {
        Alert.alert('เกิดข้อผิดพลาด', response.message || 'ไม่สามารถบันทึกการตั้งค่าได้');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกการตั้งค่าได้');
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleCloseDatePicker = () => {
    setShowDatePicker(false);
    setShowNativeDatePicker(false);
  };

  const onDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowNativeDatePicker(false);
    }
    
    if (date) {
      setSelectedStartDate(date);
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-4 rounded-b-3xl shadow-md">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
              <Icon name="chevron-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-2xl font-promptBold text-gray-800">เลือกแผนอาหาร</Text>
          </View>
        </View>
        <Text className="text-base text-gray-600 mt-2 ml-10 font-promptRegular">
          เลือกแผนอาหารที่คุณต้องการใช้
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="flex-1 px-6 pt-6">
          {isLoading ? (
            <View className="flex-1 items-center justify-center py-20">
              <View className="bg-white rounded-3xl p-8 shadow-lg">
                <ActivityIndicator size="large" color="#f59e0b" />
                <Text className="text-gray-600 mt-4 text-center font-promptMedium">กำลังโหลดรายการแผนอาหาร...</Text>
              </View>
            </View>
          ) : (
            <>
              {plans && plans.length > 0 ? (
                <>
                  {/* Current Plan Card - Show at top if exists */}
                  {currentPlanId && (() => {
                    const currentPlan = plans.find(plan => plan.id === currentPlanId);
                    if (!currentPlan) return null;
                    
                    return (
                      <View className="mx-4 mb-4">
                        <Text className="text-lg font-promptBold text-gray-800 mb-3">แผนที่ใช้อยู่</Text>
                        <View 
                          className="bg-gradient-to-r from-primary/10 to-orange-100 rounded-3xl p-5 border-2 border-primary/20"
                          style={{
                            shadowColor: '#f59e0b',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.15,
                            shadowRadius: 12,
                            elevation: 4,
                          }}
                        >
                          <TouchableOpacity 
                            onPress={() => handleSelectPlan(currentPlan)}
                            className="flex-row items-center"
                          >
                            {/* Plan Image */}
                            <View 
                              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-200 to-yellow-200 items-center justify-center mr-4 overflow-hidden"
                              style={{ 
                                width: 80, 
                                height: 80, 
                                borderRadius: 20,
                                marginRight: 16,
                                overflow: 'hidden'
                              }}
                            >
                              {currentPlan.img ? (
                                <Image 
                                  source={{ uri: currentPlan.img }} 
                                  className="w-full h-full"
                                  style={{ width: '100%', height: '100%' }}
                                  resizeMode="cover"
                                />
                              ) : (
                                <Text style={{ fontSize: 32 }}>🍽️</Text>
                              )}
                            </View>

                            {/* Plan Info */}
                            <View className="flex-1">
                              <View className="flex-row items-center mb-2">
                                <Text 
                                  className="text-xl font-promptBold text-gray-800"
                                  style={{ fontSize: 18, fontWeight: 'bold' }}
                                >
                                  {currentPlan.name}
                                </Text>
                                <View 
                                  className="ml-3 px-3 py-1 rounded-full bg-orange-500"
                                  style={{ backgroundColor: '#f59e0b' }}
                                >
                                  <Text 
                                    className="text-xs font-promptMedium text-white"
                                    style={{ fontSize: 11, fontWeight: '600' }}
                                  >
                                    กำลังใช้
                                  </Text>
                                </View>
                              </View>

                              {/* Settings Info */}
                              {currentPlanSettings && (
                                <View className="mb-2">
                                  <Text 
                                    className="text-sm text-gray-600"
                                    style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}
                                  >
                                    เริ่มใช้: {currentPlanSettings.start_date ? 
                                      new Date(currentPlanSettings.start_date).toLocaleDateString('th-TH', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                      }) : 'ไม่ระบุ'
                                    }
                                  </Text>
                                  <Text 
                                    className="text-sm text-gray-600"
                                    style={{ fontSize: 13, color: '#6b7280' }}
                                  >
                                    วนลูป: {currentPlanSettings.is_repeat ? 'เปิด' : 'ปิด'}
                                  </Text>
                                </View>
                              )}

                              <Text 
                                className="text-sm text-gray-600 leading-5"
                                style={{ fontSize: 13, color: '#6b7280', lineHeight: 18 }}
                                numberOfLines={2}
                              >
                                {currentPlan.description || 'แผนอาหารสำหรับสุขภาพที่ดี'}
                              </Text>
                            </View>

                            {/* Options Button */}
                            <TouchableOpacity 
                              className="p-2 rounded-full ml-3"
                              style={{ 
                                padding: 12,
                                borderRadius: 50,
                              }}
                              onPress={(event) => handlePlanOptions(currentPlan, event)}
                            >
                              <Icon 
                                name="ellipsis-vertical" 
                                size={20} 
                                color="#6b7280" 
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    );
                  })()}

                  {/* Other Plans Section */}
                  {plans.filter(plan => plan.id !== currentPlanId).length > 0 && (
                    <View className="mx-4">
                      <Text className="text-lg font-promptBold text-gray-800 mb-3">แผนอาหารทั้งหมด</Text>
                      <View 
                        className="bg-white rounded-3xl p-4 shadow-md shadow-slate-500"
                        style={{
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.1,
                          shadowRadius: 8,
                          elevation: 2,
                        }}
                      >
                        {plans.filter(plan => plan.id !== currentPlanId).map((plan, index, filteredPlans) => {
                          const isLastItem = index === filteredPlans.length - 1;
                      
                          return (
                            <View key={plan.id}>
                              <TouchableOpacity 
                                onPress={() => handleSelectPlan(plan)}
                                className="flex-row items-center justify-between py-4"
                                style={{
                                  paddingVertical: 16,
                                  paddingHorizontal: 8,
                                }}
                              >
                                <View className="flex-row items-center flex-1">
                                  {/* Plan Image */}
                                  <View 
                                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-yellow-100 items-center justify-center mr-4 overflow-hidden"
                                    style={{ 
                                      width: 64, 
                                      height: 64, 
                                      borderRadius: 16,
                                      marginRight: 16,
                                      overflow: 'hidden'
                                    }}
                                  >
                                    {plan.img ? (
                                      <Image 
                                        source={{ uri: plan.img }} 
                                        className="w-full h-full"
                                        style={{ width: '100%', height: '100%' }}
                                        resizeMode="cover"
                                      />
                                    ) : (
                                      <Text style={{ fontSize: 24 }}>🍽️</Text>
                                    )}
                                  </View>

                                  {/* Plan Info */}
                                  <View className="flex-1">
                                    <View className="flex-row items-center mb-1">
                                      <Text 
                                        className="text-lg font-promptBold text-gray-800"
                                        style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 2 }}
                                      >
                                        {plan.name}
                                      </Text>
                                      
                                    </View>
                                    <Text 
                                      className="text-sm text-gray-600 leading-5"
                                      style={{ fontSize: 13, color: '#6b7280', lineHeight: 18 }}
                                      numberOfLines={2}
                                    >
                                      {plan.description || 'แผนอาหารสำหรับสุขภาพที่ดี'}
                                    </Text>
                                  </View>
                                </View>

                                {/* Options Button */}
                                <TouchableOpacity 
                                  className="p-2 rounded-full ml-3"
                                  style={{ 
                                    padding: 10,
                                    borderRadius: 50,
                                  }}
                                  onPress={(event) => {
                                    event.stopPropagation();
                                    handlePlanOptions(plan, event);
                                  }}
                                >
                                  <Icon 
                                    name="ellipsis-vertical" 
                                    size={18} 
                                    color="#6b7280" 
                                  />
                                </TouchableOpacity>
                              </TouchableOpacity>
                          
                              {/* Divider Line */}
                              {!isLastItem && (
                                <View 
                                  className="border-b border-gray-100 mx-4"
                                  style={{ 
                                    borderBottomWidth: 1, 
                                    borderBottomColor: '#f3f4f6',
                                    marginHorizontal: 16
                                  }}
                                />
                              )}
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {/* Create New Plan Button */}
                  <TouchableOpacity 
                    className="bg-gradient-to-r from-orange-400 to-yellow-400 rounded-3xl p-6 flex-row items-center justify-center mt-6 shadow-lg"
                    style={{
                      marginTop: 24,
                      marginHorizontal: 16,
                      shadowColor: '#f59e0b',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 8,
                      backgroundColor: '#f59e0b'
                    }}
                    onPress={handleCreateNewPlan}
                  >
                    <View className="w-8 h-8 rounded-full bg-opacity-20 items-center justify-center mr-3">
                      <Icon name="add" size={20} color="white" />
                    </View>
                    <Text className="text-lg font-promptBold text-white">สร้างแผนใหม่</Text>
                  </TouchableOpacity>
                </>
              ) : (
                /* Empty State */
                <View className="flex-1 items-center justify-center py-12">
                  <View className="bg-white rounded-3xl p-8 shadow-lg items-center max-w-sm mx-auto">
                    {/* Illustration */}
                    <View className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-100 to-yellow-100 items-center justify-center mb-6">
                      <Text style={{ fontSize: 48 }}>🍽️</Text>
                    </View>
                    
                    {/* Empty State Text */}
                    <Text className="text-xl font-promptBold text-gray-800 mb-2 text-center">
                      ยังไม่มีแผนอาหาร
                    </Text>
                    <Text className="text-sm text-gray-500 text-center mb-8 leading-6">
                      เริ่มต้นการใช้งานด้วยการสร้าง{'\n'}แผนอาหารแรกของคุณ
                    </Text>
                    
                    {/* Create Plan Button */}
                    <TouchableOpacity 
                      className="bg-gradient-to-r from-orange-400 to-yellow-400 rounded-2xl px-8 py-4 shadow-lg"
                      style={{
                        shadowColor: '#ffff',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 1,
                        
                      }}
                      onPress={handleCreateNewPlan}
                    >
                      <View className="flex-row items-center">
                        <Icon name="add-circle" size={24} color="white" />
                        <Text className="text-base font-promptBold text-white ml-2">สร้างแผนใหม่</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Dropdown Menu */}
      <Modal
        visible={showActionSheet}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowActionSheet(false)}
      >
        <TouchableOpacity 
          className="flex-1 bg-black bg-opacity-50"
          onPress={() => setShowActionSheet(false)}
        >
          <View 
            className="bg-white rounded-3xl mx-4 shadow-lg"
            style={{
              position: 'absolute',
              top: dropdownPosition.y + 10,
              left: 16,
              right: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            {/* Edit Option */}
            <TouchableOpacity 
              className="flex-row items-center py-4 px-6 border-b border-gray-100"
              onPress={handleEditPlan}
            >
              <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-4">
                <Icon name="create-outline" size={20} color="#3b82f6" />
              </View>
              <Text className="text-base text-gray-800 font-promptMedium">แก้ไขแผนอาหาร</Text>
            </TouchableOpacity>

            {/* Settings Option - Only show for current plan */}
            {selectedPlan && selectedPlan.id === currentPlanId && (
              <TouchableOpacity 
                className="flex-row items-center py-4 px-6 border-b border-gray-100"
                onPress={handlePlanSettings}
              >
                <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center mr-4">
                  <Icon name="settings-outline" size={20} color="#6b7280" />
                </View>
                <Text className="text-base text-gray-800 font-promptMedium">ตั้งค่าแผนอาหาร</Text>
              </TouchableOpacity>
            )}

            {/* Delete Option */}
            <TouchableOpacity 
              className="flex-row items-center py-4 px-6"
              onPress={handleDeletePlan}
            >
              <View className="w-10 h-10 rounded-full bg-red-50 items-center justify-center mr-4">
                <Icon name="trash-outline" size={20} color="#ef4444" />
              </View>
              <Text className="text-base text-red-500 font-promptMedium">ลบแผนอาหาร</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Plan Modal */}
      <EditPlanModal
        visible={showEditModal}
        planName={editName}
        planDescription={editDescription}
        planImage={editImage}
        onPlanNameChange={setEditName}
        onPlanDescriptionChange={setEditDescription}
        onSave={handleSavePlan}
        onCancel={handleCancelEdit}
        onImageEdit={handleImageEdit}
      />

      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-promptBold text-gray-800">ตั้งค่าแผนอาหาร</Text>
              <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                <Icon name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Start Date Setting */}
            <View className="mb-6">
              <Text className="text-base font-promptMedium text-gray-800 mb-3">วันเริ่มต้นแผนอาหาร</Text>
              <TouchableOpacity 
                className="bg-gray-50 rounded-2xl p-4 flex-row items-center justify-between"
                onPress={() => {
                  if (Platform.OS === 'ios') {
                    setShowDatePicker(true);
                  } else {
                    setShowNativeDatePicker(true);
                  }
                }}
              >
                <Text className="text-base text-gray-700 font-promptRegular">
                  {selectedStartDate.toLocaleDateString('th-TH', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </Text>
                <Icon name="calendar-outline" size={20} color="#6b7280" />
              </TouchableOpacity>

              {/* iOS Date Picker */}
              {showDatePicker && Platform.OS === 'ios' && (
                <View className="mt-4 bg-white rounded-2xl">
                  <DateTimePicker
                    value={selectedStartDate}
                    mode="date"
                    display="compact"
                    onChange={onDateChange}
                    locale="th-TH"
                  />
                </View>
              )}

              {/* Android Date Picker */}
              {showNativeDatePicker && Platform.OS === 'android' && (
                <DateTimePicker
                  value={selectedStartDate}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}
            </View>

            {/* Auto Loop Setting */}
            <View className="mb-8">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-base font-promptMedium text-gray-800 mb-1">วนลูปแผนอาหาร</Text>
                  <Text className="text-sm text-gray-600 font-promptRegular">
                    เมื่อแผนอาหารสิ้นสุดจะเริ่มต้นใหม่อัตโนมัติ
                  </Text>
                </View>
                <Switch
                  value={isRepeat}
                  onValueChange={setIsRepeat}
                  trackColor={{ false: '#e5e7eb', true: '#fed7aa' }}
                  thumbColor={isRepeat ? '#f59e0b' : '#f3f4f6'}
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row space-x-4">
              <TouchableOpacity 
                className="flex-1 bg-gray-100 rounded-2xl py-4"
                onPress={() => setShowSettingsModal(false)}
              >
                <Text className="text-center text-gray-700 font-promptMedium">ยกเลิก</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-1 bg-orange-500 rounded-2xl py-4"
                onPress={handleSaveSettings}
                disabled={isLoadingSettings}
              >
                {isLoadingSettings ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-center text-white font-promptMedium">บันทึก</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PlanSelectionScreen;
