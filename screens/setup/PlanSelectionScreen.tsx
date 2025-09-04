import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, Image, Switch, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../../hooks/Navigation';
import { ApiClient } from '../../utils/apiClient';
import { useFocusEffect } from '@react-navigation/native';
import { EditPlanModal } from '../../components/EditPlanModal';
import { useImagePicker } from '../../hooks/useImagePicker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';

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
        refreshPlans();
      }
    }, [isInitialLoad])
  );

  const loadUserFoodPlans = async () => {
    try {
      const result = await apiClient.getUserFoodPlansList();
      if (result.success) {
        setPlans(result.data);
      } else {
        Alert.alert('ข้อผิดพลาด', result.error);
      }
    } catch (error) {
      console.error('Error loading user food plans:', error);
      Alert.alert('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการโหลดรายการแผนอาหาร');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentPlan = async () => {
    try {
      console.log('🔄 Loading current plan...');
      const result = await apiClient.knowCurrentFoodPlan();
      console.log('📥 Current plan result:', result);
      
      if (result.success) {
        console.log('📊 Current plan data:', {
          food_plan_id: result.data.food_plan_id,
          is_repeat: result.data?.is_repeat,
          start_date: result.data?.start_date
        });
        
        setCurrentPlanId(result.data.food_plan_id);
        setCurrentPlanSettings(result.data);
        
        // Don't set isRepeat here - let loadPlanSettings handle it
        console.log('✅ Current plan loaded successfully');
      }
    } catch (error) {
      console.error('❌ Error loading current plan:', error);
      // user อาจยังไม่มี current plan ก็ไม่ต้อง alert
    }
  };

  const handleBackPress = () => {
    navigation.navigate('Menu');
  };

  const handlePlanOptions = (plan: any, event: any) => {
    setSelectedPlan(plan);
    const { pageX, pageY } = event.nativeEvent;
    setDropdownPosition({
      x: Math.max(10, pageX - 170),
      y: pageY - 15
    });
    setShowActionSheet(true);
  };

  const handleEditPlan = () => {
    if (selectedPlan) {
      setShowActionSheet(false);
      setEditName(selectedPlan.name);
      setEditDescription(selectedPlan.description || '');
      setEditImage(selectedPlan.img);
      setShowEditModal(true);
    }
  };
                  
  const handleEditMealPlan = () => {
    if (selectedPlan) {
      setShowActionSheet(false);
      navigation.navigate('MealPlanEdit', {
        mode: 'edit',
        foodPlanId: selectedPlan.id,
        from: 'PlanSelection'
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาระบุชื่อแผน');
      return;
    }

    setIsUpdating(true);
    try {
      const result = await apiClient.updateUserFoodPlan(selectedPlan.id, {
        name: editName.trim(),
        description: editDescription.trim(),
        plan: selectedPlan, // backend ต้องการ field นี้
        image: editImage || undefined
      });

      if (result.success) {
        setPlans(plans.map(p => 
          p.id === selectedPlan.id 
            ? { ...p, name: editName.trim(), description: editDescription.trim(), img: editImage }
            : p
        ));
        
        setShowEditModal(false);
        setSelectedPlan(null);
        setEditName('');
        setEditDescription('');
        setEditImage(null);
        Alert.alert('สำเร็จ', 'อัพเดทแผนอาหารเรียบร้อยแล้ว');
      } else {
        Alert.alert('ข้อผิดพลาด', result.error);
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      Alert.alert('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการอัพเดทแผนอาหาร');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImagePicker = async () => {
    const result = await showImagePicker('เลือกรูปภาพ', 'เลือกรูปภาพสำหรับแผนอาหาร');
    if (result) {
      setEditImage(result);
    }
  };

  const handleRemoveImage = () => {
    setEditImage(null);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditName('');
    setEditDescription('');
    setEditImage(null);
    setSelectedPlan(null);
  };

  const handleCreateNewPlan = () => {
    navigation.navigate('OptionPlan', {});
  };

  const onDateChange = (event: any, date?: Date) => {
    setShowNativeDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedStartDate(date);
    }
  };

    const loadPlanSettings = async () => {
    setIsLoadingSettings(true);
    try {
      console.log('🔄 Loading plan settings...');
      const result = await apiClient.getPlanSettings();
      console.log('📥 Plan settings result:', result);
      
      if (result.success && result.data) {
        console.log('📊 Plan settings data:', {
          start_date: result.data.start_date,
          is_repeat: result.data.is_repeat,
          food_plan_id: result.data.food_plan_id
        });
        
        if (result.data.start_date) {
          const dateStr = result.data.start_date;
          let loadedDate: Date;

          if (typeof dateStr === 'string') {
            if (dateStr.includes('-')) {
              // Handle YYYY-MM-DD format
              const [year, month, day] = dateStr.split('-').map(Number);
              loadedDate = new Date(year, month - 1, day); // month is 0-indexed
            } else if (dateStr.includes('/')) {
              loadedDate = new Date(dateStr);
            } else {
              loadedDate = new Date(dateStr);
            }
          } else {
            loadedDate = new Date(dateStr);
          }
          if (isNaN(loadedDate.getTime())) {
            console.warn('⚠️ Invalid date parsed, using current date');
            loadedDate = new Date();
          }
          console.log('📅 Setting date to:', loadedDate);
          setSelectedStartDate(loadedDate);
        }
        
        const repeatValue = Boolean(result.data.is_repeat);
        console.log('🔄 Setting is_repeat to:', repeatValue, 'from:', result.data.is_repeat, 'type:', typeof result.data.is_repeat);
        setIsRepeat(repeatValue);
      } else {
        console.log('❌ Failed to load plan settings:', result.error);
      }
    } catch (error) {
      console.error('❌ Error loading plan settings:', error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleOpenSettingsModal = () => {
    setShowSettingsModal(true);
    loadPlanSettings();
  };

  const handleSaveSettings = async () => {
    try {
      setShowSettingsModal(false);
      if (!currentPlanId) {
        Alert.alert('ข้อผิดพลาด', 'กรุณาเลือกแผนอาหารที่ต้องการใช้งานก่อน');
        return;
      }
      const year = selectedStartDate.getFullYear();
      const month = String(selectedStartDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedStartDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      const result = await apiClient.setPlanSettings({
        food_plan_id: currentPlanId,
        start_date: formattedDate,
        is_repeat: isRepeat
      });

      if (result.success) {
        // อัพเดท currentPlanSettings state ด้วย
        setCurrentPlanSettings((prevSettings: any) => ({
          ...prevSettings,
          start_date: formattedDate,
          is_repeat: isRepeat
        }));
        
        Alert.alert('สำเร็จ', 'บันทึกการตั้งค่าเรียบร้อยแล้ว');
      } else {
        Alert.alert('ข้อผิดพลาด', result.error || 'เกิดข้อผิดพลาดในการบันทึก');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า');
    }
  };

  const getMaxDate = () => {
    const today = new Date();
    const oneMonthAhead = new Date();
    oneMonthAhead.setMonth(today.getMonth() + 1);
    return oneMonthAhead;
  };

  const refreshPlans = async () => {
    await loadUserFoodPlans();
    await loadCurrentPlan();
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
                  setPlans(plans.filter(p => p.id !== selectedPlan.id));
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
      <View className="flex-row items-center justify-between px-4 pt-10 pb-4 bg-white shadow-md">
        <TouchableOpacity 
          className="w-10 h-10 rounded-full items-center justify-center"
          onPress={handleBackPress}
        >
          <Icon name="arrow-back" size={24} color="#9ca3af" />
        </TouchableOpacity>
        
        <View className="flex-row items-center gap-2">
          <Icon name="restaurant" size={32} color="#9ca3af" />
          <Text className="text-xl font-promptBold text-myBlack">แผนการกิน</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <TouchableOpacity 
            className="p-2 rounded-full"
            onPress={handleCreateNewPlan}
          >
            <Icon name='add' size={24} color="#ffb800" />
          </TouchableOpacity>
        </View>
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
                  {/* Current Plan Card */}
                  {currentPlanId && (() => {
                    const currentPlan = plans.find(plan => plan.id === currentPlanId);
                    if (!currentPlan) return null;
                    return (
                      <View className="mx-4 mb-4">
                        <View className="flex-row items-center justify-between mb-3">
                          <Text className="text-lg font-promptBold text-gray-800">แผนที่ใช้อยู่</Text>
                          <TouchableOpacity 
                            className="flex-row items-center bg-gray-50 px-3 py-2 rounded-full border border-gray-200"
                            onPress={handleOpenSettingsModal}
                          >
                            <Icon name='settings-outline' size={16} color="#9ca3af" />
                            <Text className="text-sm font-promptMedium text-gray-600 ml-2">ตั้งค่า</Text>
                          </TouchableOpacity>
                        </View>
                        <View 
                          className="bg-white rounded-3xl p-5 border-2 border-orange-200"
                          style={{
                            shadowColor: '#fff',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.15,
                            shadowRadius: 12,
                            elevation: 4,
                            backgroundColor: '#fff'
                          }}
                        >
                          <View className="flex-row items-center mb-4">
                            <View 
                              className="w-16 h-16 rounded-2xl  items-center justify-center mr-4 overflow-hidden"
                              style={{ width: 64, height: 64, borderRadius: 16, marginRight: 16, overflow: 'hidden' }}
                            >
                              {currentPlan.img ? (
                                <Image 
                                  source={{ uri: currentPlan.img }} 
                                  className="w-full h-full"
                                  style={{ width: '100%', height: '100%' }}
                                  resizeMode="cover"
                                />
                              ) : (
                                <Text style={{ fontSize: 28 }}>⭐</Text>
                              )}
                            </View>

                            <View className="flex-1">
                              <View className="flex-row items-center mb-2">
                                <Text className="text-xl font-promptBold text-primary mr-2">
                                  {currentPlan.name}
                                </Text>
                               
                              </View>
                              <Text className="text-sm text-gray-600 leading-5" numberOfLines={2}>
                                {currentPlan.description || 'แผนอาหารสำหรับสุขภาพที่ดี'}
                              </Text>
                            </View>

                            <TouchableOpacity 
                              className="p-2 rounded-full ml-3"
                              onPress={(event) => handlePlanOptions(currentPlan, event)}
                            >
                              <Icon name="ellipsis-vertical" size={18} color="#ffb800" />
                            </TouchableOpacity>
                          </View>

                          {/* Additional Settings Info */}
                          {currentPlanSettings && (
                            <View className="border-t border-primary/20 pt-3 mt-2">
                              <View className="flex-row justify-between items-center mb-2">
                                <View className="flex-row items-center">
                                  <Icon name="calendar-outline" size={16} color="#6b7280" />
                                  <Text className="text-sm text-gray-600 ml-2 font-prompt">
                                    เริ่มต้น: {currentPlanSettings.start_date ? 
                                      new Date(currentPlanSettings.start_date).toLocaleDateString('th-TH', {
                                        year: 'numeric',
                                        month: 'short', 
                                        day: 'numeric'
                                      }) : 'ไม่ระบุ'}
                                  </Text>
                                </View>
                                <View className="flex-row items-center">
                                  <Icon 
                                    name={Boolean(currentPlanSettings.is_repeat) ? "repeat" : ""} 
                                    size={16} 
                                    color={Boolean(currentPlanSettings.is_repeat) ? "#22c55e" : "#6b7280"} 
                                  />
                                  <Text className={`text-sm ml-2 font-prompt ${Boolean(currentPlanSettings.is_repeat) ? 'text-green-600' : 'text-gray-600'}`}>
                                    {Boolean(currentPlanSettings.is_repeat) ? 'วนซ้ำ' : 'ไม่วนซ้ำ'} 
                                  
                                  </Text>
                                </View>
                              </View>
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })()}

                  {/* Other Plans Section + Create Button wrapped in Fragment */}
                  {plans.filter(plan => plan.id !== currentPlanId).length > 0 && (
                    <>
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
                                <View 
                                  className="flex-row items-center justify-between py-4"
                                  style={{ paddingVertical: 16, paddingHorizontal: 8 }}
                                >
                                  <View className="flex-row items-center flex-1">
                                    <View 
                                      className="w-16 h-16 rounded-2xl bg-gradient-to-br  items-center justify-center mr-4 overflow-hidden"
                                      style={{ width: 56, height: 56, borderRadius: 14, marginRight: 16, overflow: 'hidden', backgroundColor: '#fff' }}
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
                                        style={{ fontSize: 13, color: '#fff', lineHeight: 18 }}
                                        numberOfLines={2}
                                      >
                                        {plan.description || 'แผนอาหารสำหรับสุขภาพที่ดี'}
                                      </Text>
                                    </View>
                                  </View>

                                  <TouchableOpacity 
                                    className="p-2 rounded-full ml-3"
                                    style={{ padding: 10, borderRadius: 50 }}
                                    onPress={(event) => handlePlanOptions(plan, event)}
                                  >
                                    <Icon name="ellipsis-vertical" size={18} color="#6b7280" />
                                  </TouchableOpacity>
                                </View>
                                
                                {!isLastItem && (
                                  <View 
                                    className="border-b border-gray-100 mx-4"
                                    style={{ borderBottomWidth: 1, borderBottomColor: '#f3f4f6', marginHorizontal: 16 }}
                                  />
                                )}
                              </View>
                            );
                          })}
                        </View>
                      </View>

                      {/* Create New Plan Button */}
                      <TouchableOpacity onPress={handleCreateNewPlan} style={{ marginTop: 24, marginHorizontal: 16 }}>
                        <LinearGradient
                          colors={['#ffb800', '#ff9a33']}
                          start={[0, 0]}
                          end={[1.5, 0]}
                          style={{
                            borderRadius: 24,
                            padding: 16,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: '#ffb800',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 8,
                          }}
                        >
                          <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                            <Icon name="add" size={20} color="white" />
                          </View>
                          <Text className="text-lg font-promptBold text-white">สร้างแผนใหม่</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </>
                  )}
                </>
              ) : (
                /* Empty State */
                <View className="flex-1 items-center justify-center py-12">
                  <View className="bg-white rounded-3xl p-8 shadow-lg items-center max-w-sm mx-auto">
                    <LinearGradient
                      colors={["#fed7aa", "#fff"]}
                      start={[0,0]}
                      end={[1,1]}
                      style={{ width: 96, height: 96, borderRadius: 48, marginBottom: 24, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Text style={{ fontSize: 48 }}>🍽️</Text>
                    </LinearGradient>
                    <Text className="text-xl font-promptBold text-gray-800 mb-2 text-center">
                      ยังไม่มีแผนอาหาร
                    </Text>
                    <Text className="text-sm text-gray-500 text-center mb-8 leading-6">
                      เริ่มต้นการใช้งานด้วยการสร้าง{'\n'}แผนอาหารแรกของคุณ
                    </Text>
                    <TouchableOpacity onPress={handleCreateNewPlan} style={{ marginTop: 16 }}>
                      <LinearGradient
                        colors={['#ffb800', '#e6a600']}
                        start={[0, 0]}
                        end={[1, 0]}
                        style={{
                          borderRadius: 16,
                          paddingHorizontal: 32,
                          paddingVertical: 16,
                          shadowColor: '#ffb800',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                          elevation: 1,
                        }}
                      >
                        <View className="flex-row items-center">
                          <Icon name="add-circle" size={24} color="white" />
                          <Text className="text-base font-promptBold text-white ml-2">สร้างแผนใหม่</Text>
                        </View>
                      </LinearGradient>
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
          className="flex-1 bg-black bg-opacity-20"
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0)' }}
          activeOpacity={1}
          onPress={() => setShowActionSheet(false)}
        >
          <View 
            className="absolute bg-white rounded-2xl shadow-xl border border-gray-100"
            style={{
              position: 'absolute',
              left: dropdownPosition.x,
              top: dropdownPosition.y,
              width: 200,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 12,
              backgroundColor: '#ffffff',
              borderRadius: 16,
              overflow: 'hidden'
            }}
          >
            {currentPlanId !== selectedPlan?.id && (
              <TouchableOpacity 
                className="py-4 px-5 border-b border-gray-100 flex-row items-center"
                style={{ borderBottomColor: '#f3f4f6', borderBottomWidth: 1 }}
                onPress={handleSetAsCurrent}
              >
                <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-3">
                  <Icon name="checkmark" size={16} color="#10b981" />
                </View>
                <Text className="text-sm font-promptMedium text-green-600">ตั้งเป็นแผนปัจจุบัน</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              className="py-4 px-5 border-b border-gray-100 flex-row items-center"
              style={{ borderBottomColor: '#f3f4f6', borderBottomWidth: 1 }}
              onPress={handleEditMealPlan}
            >
              <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3">
                <Icon name="restaurant" size={16} color="#3b82f6" />
              </View>
              <Text className="text-sm font-promptMedium text-blue-600">แก้ไขแผนการกิน</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="py-4 px-5 border-b border-gray-100 flex-row items-center"
              style={{ borderBottomColor: '#f3f4f6', borderBottomWidth: 1 }}
              onPress={handleEditPlan}
            >
              <View className="w-8 h-8 rounded-full bg-orange-100 items-center justify-center mr-3">
                <Icon name="create" size={16} color="#f59e0b" />
              </View>
              <Text className="text-sm font-promptMedium text-gray-700">แก้ไขข้อมูลแผน</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="py-4 px-5 flex-row items-center"
              onPress={handleDelete}
            >
              <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center mr-3">
                <Icon name="trash" size={16} color="#ef4444" />
              </View>
              <Text className="text-sm font-promptMedium text-red-500">ลบแผน</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Plan Modal */}
      <EditPlanModal
        visible={showEditModal}
        onClose={handleCloseEditModal}
        onSave={handleSaveEdit}
        planName={editName}
        setPlanName={setEditName}
        planDescription={editDescription}
        setPlanDescription={setEditDescription}
        selectedPlanImage={editImage}
        onImagePicker={handleImagePicker}
        onRemoveImage={handleRemoveImage}
        isLoading={isUpdating}
      />

      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <TouchableOpacity 
          className="flex-1 bg-black bg-opacity-20"
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }}
          activeOpacity={1}
          onPress={() => setShowSettingsModal(false)}
        >
          <View className="flex-1 justify-center items-center px-6">
            <TouchableOpacity activeOpacity={1} className="w-full">
              <View 
                className="bg-white rounded-3xl p-6 shadow-xl"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.15,
                  shadowRadius: 12,
                  elevation: 12,
                  backgroundColor: '#ffffff',
                  borderRadius: 24
                }}
              >
                <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-xl font-promptBold text-gray-800">ตั้งค่าแผนการกิน</Text>
                  <TouchableOpacity 
                    onPress={() => setShowSettingsModal(false)}
                    className="p-2 rounded-full bg-gray-100"
                  >
                    <Icon name="close" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>

              

                {isLoadingSettings ? (
                  <View className="items-center justify-center py-8">
                    <ActivityIndicator size="large" color="#f59e0b" />
                    <Text className="text-gray-600 mt-4 text-center font-promptMedium">กำลังโหลดการตั้งค่า...</Text>
                  </View>
                ) : (
                  <>
                    <View className="mb-6">
                      <Text className="text-lg font-promptSemiBold text-gray-800 mb-2">ตั้งค่าวันเริ่มต้นแผน</Text>
                      <Text className="text-sm text-gray-500 mb-4 leading-5">
                        ระบบปกติจะเลือกวันที่เริ่มต้นแผนการกินเป็นวันที่เซ็ทอาหารวันนั้น ๆ
                      </Text>
                  
                      <TouchableOpacity 
                        className="bg-gray-50 rounded-2xl p-4 flex-row items-center justify-between border border-gray-200"
                        onPress={() => setShowNativeDatePicker(true)}
                      >
                        <View className="flex-row items-center">
                          <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center mr-3">
                            <Icon name="calendar" size={20} color="#ffb800" />
                          </View>
                          <View>
                            <Text className="text-sm font-promptMedium text-gray-700">วันเริ่มต้นแผน</Text>
                            <Text className="text-lg font-promptSemiBold text-gray-800">
                              {(() => {
                                try {
                                  if (isNaN(selectedStartDate.getTime())) {
                                    return 'ยังไม่ได้ตั้งค่า';
                                  }
                                  return selectedStartDate.toLocaleDateString('th-TH', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  });
                                } catch (error) {
                                  console.error('Date formatting error:', error);
                                  return 'รูปแบบวันที่ไม่ถูกต้อง';
                                }
                              })()}
                            </Text>
                          </View>
                        </View>
                        <Icon name="chevron-forward" size={20} color="#9ca3af" />
                      </TouchableOpacity>
                    </View>

                    <View className="mb-8">
                      <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-1 mr-4">
                          <Text className="text-lg font-promptSemiBold text-gray-800 mb-1">วนซ้ำแผนการกิน</Text>
                          <Text className="text-sm text-gray-500 leading-5">
                            เมื่อสิ้นสุดแผนการกินของคุณระบบจะวนรอบ และเริ่มต้นแผนการกินของวันแรกให้อัตโนมัติ
                          </Text>
                        </View>
                        <Switch
                          value={isRepeat}
                          onValueChange={setIsRepeat}
                          trackColor={{ false: '#f3f4f6', true: '#ffd966' }}
                          thumbColor={isRepeat ? '#ffb800' : '#9ca3af'}
                          ios_backgroundColor="#f3f4f6"
                        />
                      </View>
                    </View>

                    <View className="flex-row gap-3">
                      <TouchableOpacity 
                        className="flex-1 bg-gray-100 rounded-2xl py-4 items-center"
                        onPress={() => setShowSettingsModal(false)}
                      >
                        <Text className="text-base font-promptSemiBold text-gray-600">ยกเลิก</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        className="flex-1 rounded-2xl py-4 items-center"
                        style={{ backgroundColor: '#ffb800' }}
                        onPress={handleSaveSettings}
                      >
                        <Text className="text-base font-promptBold text-white">บันทึก</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Native Date Picker */}
      {showNativeDatePicker && (
        <DateTimePicker
          value={selectedStartDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          minimumDate={new Date()}
          maximumDate={getMaxDate()}
        />
      )}
    </View>
  );
};

export default PlanSelectionScreen;
