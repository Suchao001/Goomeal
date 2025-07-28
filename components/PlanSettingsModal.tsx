import React, { useState, useEffect } from 'react';
import { Modal, TouchableOpacity, View, Text, Switch, Platform, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../AuthContext';
import * as SecureStore from 'expo-secure-store';
import DateTimePicker from '@react-native-community/datetimepicker';

interface PlanSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (settings: { start_date: Date; auto_loop: boolean }) => void;
  apiClient: any;
  currentPlanId: number | null;
}

const PlanSettingsModal: React.FC<PlanSettingsModalProps> = ({
  visible,
  onClose,
  onSave,
  apiClient,
  currentPlanId,
}) => {
  const { user } = useAuth();
  const [selectedStartDate, setSelectedStartDate] = useState<Date>(new Date());
  const [isAutoLoop, setIsAutoLoop] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [showNativeDatePicker, setShowNativeDatePicker] = useState(false);

  // useEffect(() => {
  //   if (visible) {
  //     loadPlanSettings();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [visible]);

  // Use real API: call apiClient.getPlanSettings()
  const loadPlanSettings = async () => {
    setIsLoadingSettings(true);
    try {
      const result = await apiClient.getPlanSettingsTest();
      if (result.success && result.data) {
        if (result.data.start_date) {
          setSelectedStartDate(new Date(result.data.start_date));
        }
        setIsAutoLoop(result.data.auto_loop || false);
      }
      console.log('Plan settings loaded:', result);
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการโหลดการตั้งค่าแผน');
      console.error('Error loading plan settings:', error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedStartDate(date);
    setShowNativeDatePicker(false);
  };

  const onDateChange = (event: any, date?: Date) => {
    setShowNativeDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedStartDate(date);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    return oneMonthAgo;
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        className="flex-1 bg-black bg-opacity-20"
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }}
        activeOpacity={1}
        onPress={onClose}
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
                  onPress={onClose}
                  className="p-2 rounded-full bg-gray-100"
                >
                  <Icon name="close" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

      {/* TEST BUTTON: Load Plan Settings Manually */}
      <TouchableOpacity
        style={{ backgroundColor: '#ddd', padding: 10, borderRadius: 8, marginBottom: 12 }}
        onPress={loadPlanSettings}
      >
        <Text style={{ color: '#333', textAlign: 'center' }}>TEST LOAD PLAN SETTINGS</Text>
      </TouchableOpacity>

      {isLoadingSettings ? (
        <View className="items-center justify-center py-8">
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text className="text-gray-600 mt-4 text-center font-medium">กำลังโหลดการตั้งค่า...</Text>
        </View>
      ) : (
        <>
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
                            {selectedStartDate.toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
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
                      onPress={onClose}
                    >
                      <Text className="text-base font-semibold text-gray-600">ยกเลิก</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      className="flex-1 rounded-2xl py-4 items-center"
                      style={{ backgroundColor: '#ffb800' }}
                      onPress={() => onSave({ start_date: selectedStartDate, auto_loop: isAutoLoop })}
                    >
                      <Text className="text-base font-bold text-white">บันทึก</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>
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
      </TouchableOpacity>
    </Modal>
  );
};

export default PlanSettingsModal;
