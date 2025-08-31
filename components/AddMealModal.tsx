import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatTime } from '../utils/mealPlanUtils';

interface AddMealModalProps {
  visible: boolean;
  onClose: () => void;
  onAddMeal: (name: string, time: string) => void;
}

export const AddMealModal: React.FC<AddMealModalProps> = ({
  visible,
  onClose,
  onAddMeal
}) => {
  const [newMealName, setNewMealName] = useState('');
  const [newMealTime, setNewMealTime] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (selectedDate) {
      setSelectedTime(selectedDate);
      const timeString = formatTime(selectedDate);
      setNewMealTime(timeString);
    }
  };

  const handleSubmit = () => {
    if (!newMealName.trim() || !newMealTime.trim()) {
      return;
    }
    
    onAddMeal(newMealName.trim(), newMealTime.trim());
    setNewMealName('');
    setNewMealTime('');
    onClose();
  };

  const handleClose = () => {
    setNewMealName('');
    setNewMealTime('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableOpacity 
        className="flex-1 justify-end"
        activeOpacity={1}
        onPress={handleClose}
      >
        <View className="bg-white rounded-t-3xl p-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-800">เพิ่มมื้ออาหาร</Text>
            <TouchableOpacity onPress={handleClose}>
              <Icon name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          {/* Meal Name Input */}
          <View className="mb-4">
            <Text className="text-base font-medium text-gray-700 mb-2">ชื่อมื้ออาหาร</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
              placeholder="เช่น ของว่างบ่าย, มื้อดึก..."
              value={newMealName}
              onChangeText={setNewMealName}
            />
          </View>

          {/* Meal Time Input */}
          <View className="mb-6">
            <Text className="text-base font-medium text-gray-700 mb-2">เวลาของมื้ออาหาร</Text>
            <TouchableOpacity
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex-row items-center justify-between"
              onPress={() => setShowTimePicker(true)}
            >
              <Text className={`${newMealTime ? 'text-gray-800' : 'text-gray-400'}`}>
                {newMealTime || 'เลือกเวลา'}
              </Text>
              <Icon name="time-outline" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View className="flex-row space-x-3 gap-1">
            <TouchableOpacity
              className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
              onPress={handleClose}
            >
              <Text className="text-gray-700 font-medium">ยกเลิก</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className={`flex-1 rounded-lg py-3 items-center ${
                newMealName.trim() && newMealTime.trim() 
                  ? 'bg-primary' 
                  : 'bg-gray-300'
              }`}
              onPress={handleSubmit}
              disabled={!newMealName.trim() || !newMealTime.trim()}
            >
              <Text className={`font-medium ${
                newMealName.trim() && newMealTime.trim() 
                  ? 'text-white' 
                  : 'text-gray-500'
              }`}>
                เพิ่มมื้ออาหาร
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Time Picker */}
          {showTimePicker && (
            <Modal
              visible={showTimePicker}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowTimePicker(false)}
            >
              <TouchableOpacity 
                className="flex-1 justify-end"
                activeOpacity={1}
                onPress={() => setShowTimePicker(false)}
              >
                <View className="bg-white rounded-t-3xl p-6">
                  <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-xl font-bold text-gray-800">เลือกเวลา</Text>
                    <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                      <Icon name="close" size={24} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                  
                  <DateTimePicker
                    value={selectedTime}
                    mode="time"
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                    style={{ alignSelf: 'center' }}
                  />
                  
                  {Platform.OS === 'ios' && (
                    <View className="flex-row space-x-3 mt-6 gap-1">
                      <TouchableOpacity
                        className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
                        onPress={() => setShowTimePicker(false)}
                      >
                        <Text className="text-gray-700 font-medium">ยกเลิก</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        className="flex-1 bg-primary rounded-lg py-3 items-center"
                        onPress={() => {
                          const timeString = formatTime(selectedTime);
                          setNewMealTime(timeString);
                          setShowTimePicker(false);
                        }}
                      >
                        <Text className="text-white font-medium">ยืนยัน</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </Modal>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
