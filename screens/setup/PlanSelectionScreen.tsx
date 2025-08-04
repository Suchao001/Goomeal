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
  const [isAutoLoop, setIsAutoLoop] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [showNativeDatePicker, setShowNativeDatePicker] = useState(false);

  // Image picker hook
  const { showImagePicker } = useImagePicker();

  // Load user food plans and current plan on component mount
  useEffect(() => {
    loadUserFoodPlans();
    loadCurrentPlan();
    setIsInitialLoad(false);
    
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
      const result = await apiClient.knowCurrentFoodPlan();
      
      if (result.success) {
        setCurrentPlanId(result.data.food_plan_id);
      }
    } catch (error) {
      console.error('Error loading current plan:', error);
      // Don't show error for this as user might not have current plan set
    }
  };

  const handleBackPress = () => {
    navigation.navigate('Menu');
  };

  const handlePlanOptions = (plan: any, event: any) => {
    setSelectedPlan(plan);
    
    // Get the position of the button that was pressed
    const { pageX, pageY } = event.nativeEvent;
    setDropdownPosition({
      x: Math.max(10, pageX - 170), // Keep dropdown within screen, 180 is dropdown width
      y: pageY -15 // Position slightly below the touch point
    });
    
    setShowActionSheet(true);
  };

  const handleEditPlan = () => {
    if (selectedPlan) {
      setShowActionSheet(false);
      // Set edit modal data
      setEditName(selectedPlan.name);
      setEditDescription(selectedPlan.description || '');
      setEditImage(selectedPlan.img);
      setShowEditModal(true);
    }
  };
                  
  const handleEditMealPlan = () => {
    if (selectedPlan) {
      setShowActionSheet(false);
      // Navigate to MealPlan screen in edit mode with the selected plan ID
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
        plan: selectedPlan, // Add the required plan property
        image: editImage || undefined
      });

    

      if (result.success) {
        // Update local state
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
    // Navigate to MealPlan screen in add mode
    navigation.navigate('OptionPlan')
  };

  const handleDateSelect = (date: Date) => {
    setSelectedStartDate(date);
    setShowDatePicker(false);
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
      const result = await apiClient.getPlanSettings();
      if (result.success && result.data) {
        if (result.data.start_date) {
          // Parse date safely without timezone issues
          const dateStr = result.data.start_date;
          
          
          let loadedDate: Date;
          
          // Handle different date formats
          if (typeof dateStr === 'string') {
            if (dateStr.includes('-')) {
              // Format: YYYY-MM-DD
              const [year, month, day] = dateStr.split('-').map(Number);
              loadedDate = new Date(year, month - 1, day); // month is 0-indexed
            } else if (dateStr.includes('/')) {
              // Format: MM/DD/YYYY or DD/MM/YYYY
              loadedDate = new Date(dateStr);
            } else {
              // Try parsing as is
              loadedDate = new Date(dateStr);
            }
          } else {
            // If it's already a Date object or timestamp
            loadedDate = new Date(dateStr);
          }
          
          // Validate the parsed date
          if (isNaN(loadedDate.getTime())) {
            console.warn('⚠️ Invalid date parsed, using current date');
            loadedDate = new Date();
          }
          
         
          setSelectedStartDate(loadedDate);
        }
        setIsAutoLoop(result.data.auto_loop || false);
      }
    } catch (error) {
      console.error('Error loading plan settings:', error);
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
      
      // Check if user has selected a current plan
      if (!currentPlanId) {
        Alert.alert('ข้อผิดพลาด', 'กรุณาเลือกแผนอาหารที่ต้องการใช้งานก่อน');
        return;
      }
      
      // Format date for API (avoid timezone issues)
      const year = selectedStartDate.getFullYear();
      const month = String(selectedStartDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedStartDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`; // YYYY-MM-DD format
      
      // Call API to save plan settings
      const result = await apiClient.setPlanSettings({
        food_plan_id: currentPlanId,
        start_date: formattedDate,
        auto_loop: isAutoLoop
      });

      if (result.success) {
        Alert.alert('สำเร็จ', 'บันทึกการตั้งค่าเรียบร้อยแล้ว');
      } else {
        Alert.alert('ข้อผิดพลาด', result.error || 'เกิดข้อผิดพลาดในการบันทึก');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า');
    }
  };

  const getMinDate = () => {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    return oneMonthAgo;
  };

  const getMaxDate = () => {
    return new Date(); // Today
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
        <View className="flex-row items-center gap-1">
          <TouchableOpacity 
            className="p-2 rounded-full"
            onPress={handleCreateNewPlan}
          >
            <Icon name='add' size={24} color="#ffb800" />
          </TouchableOpacity>
          <TouchableOpacity 
            className="p-2 rounded-full"
            onPress={handleOpenSettingsModal}
          >
            <Icon name='settings-outline' size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="flex-1 px-6 pt-6">
          
          {isLoading ? (
            <View className="flex-1 items-center justify-center py-20">
              <View className="bg-white rounded-3xl p-8 shadow-lg">
                <ActivityIndicator size="large" color="#f59e0b" />
                <Text className="text-gray-600 mt-4 text-center font-medium">กำลังโหลดรายการแผนอาหาร...</Text>
              </View>
            </View>
          ) : (
            <>
              {plans && plans.length > 0 ? (
                <>
                  {/* Header Section */}
                  

                  <View className="gap-4">
                    {plans.map((plan) => {
                      const isCurrentPlan = currentPlanId === plan.id;
                      return (
                        <View 
                          key={plan.id} 
                          className={`bg-white rounded-3xl p-4 flex-row items-center justify-between ${isCurrentPlan ? 'border-2 border-primary' : ''}`}
                          style={{ 
                            marginBottom: 8,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.1,
                            shadowRadius: 8,
                            elevation: 1,
                            ...(isCurrentPlan && {
                              borderColor: '#ffb800',
                              borderWidth: 2,
                             
                            })
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
                                overflow: 'hidden',
                                backgroundColor: isCurrentPlan ? '#fed7aa' : '#fef3c7'
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
                                <Text style={{ fontSize: 28 }}>
                                  {isCurrentPlan ? '⭐' : '🍽️'}
                                </Text>
                              )}
                            </View>

                            {/* Plan Info */}
                            <View className="flex-1">
                              <View className="flex-row items-center mb-1">
                                <Text 
                                  className={`text-lg font-bold mb-1 ${isCurrentPlan ? 'text-primary' : 'text-gray-800'}`}
                                  style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}
                                >
                                  {plan.name}
                                </Text>
                                {/* {isCurrentPlan && (
                                  <View 
                                    className="ml-2 px-3 py-1 bg-primary rounded-full"
                                    style={{ 
                                      marginLeft: 8, 
                                      paddingHorizontal: 12, 
                                      paddingVertical: 4, 
                                      backgroundColor: '#f59e0b', 
                                      borderRadius: 16 
                                    }}
                                  >
                                    <Text 
                                      className="text-xs text-white font-semibold"
                                      style={{ fontSize: 11, color: '#ffffff', fontWeight: '600' }}
                                    >
                                      ปัจจุบัน
                                    </Text>
                                  </View>
                                )} */}
                              </View>
                              <Text 
                                className="text-sm text-gray-600 leading-5"
                                style={{ fontSize: 14, color: '#6b7280', lineHeight: 20 }}
                                numberOfLines={2}
                              >
                                {plan.description || 'แผนอาหารสำหรับสุขภาพที่ดี'}
                              </Text>
                            </View>
                          </View>

                          {/* Options Button */}
                          <TouchableOpacity 
                            className="p-3 rounded-full  ml-3"
                            style={{ 
                              padding: 12,
                              borderRadius: 50,
                           
                            }}
                            onPress={(event) => handlePlanOptions(plan, event)}
                          >
                            <Icon 
                              name="ellipsis-vertical" 
                              size={20} 
                              color={isCurrentPlan ? '#f59e0b' : '#6b7280'} 
                            />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>

                  {/* Create New Plan Button */}
                  <TouchableOpacity 
                    className="bg-gradient-to-r from-orange-400 to-yellow-400 rounded-3xl p-6 flex-row items-center justify-center mt-6 shadow-lg"
                    style={{
                      marginTop: 24,
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
                    <Text className="text-lg font-bold text-white">สร้างแผนใหม่</Text>
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
                    <Text className="text-xl font-bold text-gray-800 mb-2 text-center">
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
                        <Text className="text-base font-bold text-white ml-2">สร้างแผนใหม่</Text>
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
                <Text className="text-sm font-medium text-green-600">ตั้งเป็นแผนปัจจุบัน</Text>
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
              <Text className="text-sm font-medium text-blue-600">แก้ไขแผนการกิน</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="py-4 px-5 border-b border-gray-100 flex-row items-center"
              style={{ borderBottomColor: '#f3f4f6', borderBottomWidth: 1 }}
              onPress={handleEditPlan}
            >
              <View className="w-8 h-8 rounded-full bg-orange-100 items-center justify-center mr-3">
                <Icon name="create" size={16} color="#f59e0b" />
              </View>
              <Text className="text-sm font-medium text-gray-700">แก้ไขข้อมูลแผน</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="py-4 px-5 flex-row items-center"
              onPress={handleDelete}
            >
              <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center mr-3">
                <Icon name="trash" size={16} color="#ef4444" />
              </View>
              <Text className="text-sm font-medium text-red-500">ลบแผน</Text>
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
                {/* Header */}
                <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-xl font-bold text-gray-800">ตั้งค่าแผนการกิน</Text>
                  <TouchableOpacity 
                    onPress={() => setShowSettingsModal(false)}
                    className="p-2 rounded-full bg-gray-100"
                  >
                    <Icon name="close" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                {/* Start Date Setting */}
                <View className="mb-6">
                  <Text className="text-lg font-semibold text-gray-800 mb-2">ตั้งค่าวันเริ่มต้นแผน</Text>
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
                        <Text className="text-sm font-medium text-gray-700">วันเริ่มต้นแผน</Text>
                        <Text className="text-lg font-semibold text-gray-800">
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

                {/* Auto Loop Setting */}
                <View className="mb-8">
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-1 mr-4">
                      <Text className="text-lg font-semibold text-gray-800 mb-1">วนซ้ำแผนการกิน</Text>
                      <Text className="text-sm text-gray-500 leading-5">
                        เมื่อสิ้นสุดแผนการกินของคุณระบบจะวนรอบ และเริ่มต้นแผนการกินของวันแรกให้อัตโนมัติ
                      </Text>
                    </View>
                    <Switch
                      value={isAutoLoop}
                      onValueChange={setIsAutoLoop}
                      trackColor={{ false: '#f3f4f6', true: '#ffd966' }}
                      thumbColor={isAutoLoop ? '#ffb800' : '#9ca3af'}
                      ios_backgroundColor="#f3f4f6"
                    />
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-3">
                  <TouchableOpacity 
                    className="flex-1 bg-gray-100 rounded-2xl py-4 items-center"
                    onPress={() => setShowSettingsModal(false)}
                  >
                    <Text className="text-base font-semibold text-gray-600">ยกเลิก</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="flex-1 rounded-2xl py-4 items-center"
                    style={{ backgroundColor: '#ffb800' }}
                    onPress={handleSaveSettings}
                  >
                    <Text className="text-base font-bold text-white">บันทึก</Text>
                  </TouchableOpacity>
                </View>
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
          maximumDate={new Date()}
          minimumDate={getMinDate()}
        />
      )}
    </View>
  );
};

export default PlanSelectionScreen;
