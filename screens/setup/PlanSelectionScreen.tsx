import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../../hooks/Navigation';
import { ApiClient } from '../../utils/apiClient';
import { useFocusEffect } from '@react-navigation/native';
import { EditPlanModal } from '../../components/EditPlanModal';
import { useImagePicker } from '../../hooks/useImagePicker';

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
    navigation.goBack();
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
      navigation.navigate('MealPlan', {
        mode: 'edit',
        foodPlanId: selectedPlan.id
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
    navigation.navigate('MealPlan', {
      mode: 'add'
    });
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
        
        <Text className="text-base font-semibold text-gray-800"></Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="flex-1 px-4 pt-6">
          
          
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
                                />
                              ) : (
                                <Text className="text-3xl" style={{ fontSize: 32 }}>🍽️</Text>
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
                            onPress={(event) => handlePlanOptions(plan, event)}
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

      {/* Dropdown Menu */}
      <Modal
        visible={showActionSheet}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowActionSheet(false)}
      >
        <TouchableOpacity 
          className="flex-1"
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={() => setShowActionSheet(false)}
        >
          <View 
            className="absolute bg-white rounded-lg shadow-lg border border-gray-200"
            style={{
              position: 'absolute',
              left: dropdownPosition.x,
              top: dropdownPosition.y,
              width: 180,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            {currentPlanId !== selectedPlan?.id && (
              <TouchableOpacity 
                className="py-3 px-4 border-b border-gray-200"
                onPress={handleSetAsCurrent}
              >
                <Text className="text-sm text-green-600">✓ ตั้งเป็นแผนปัจจุบัน</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              className="py-3 px-4 border-b border-gray-200"
              onPress={handleEditMealPlan}
            >
              <Text className="text-sm text-blue-600">📝 แก้ไขแผนการกิน</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="py-3 px-4 border-b border-gray-200"
              onPress={handleEditPlan}
            >
              <Text className="text-sm text-gray-800">✏️ แก้ไขข้อมูลแผน</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="py-3 px-4"
              onPress={handleDelete}
            >
              <Text className="text-sm text-red-500">🗑️ ลบ</Text>
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
    </View>
  );
};

export default PlanSelectionScreen;
