import React from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface EditPlanModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  planName: string;
  setPlanName: (name: string) => void;
  planDescription: string;
  setPlanDescription: (description: string) => void;
  selectedPlanImage: string | null;
  onImagePicker: () => void;
  onRemoveImage: () => void;
  isLoading?: boolean;
}

export const EditPlanModal: React.FC<EditPlanModalProps> = ({
  visible,
  onClose,
  onSave,
  planName,
  setPlanName,
  planDescription,
  setPlanDescription,
  selectedPlanImage,
  onImagePicker,
  onRemoveImage,
  isLoading = false
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
        <TouchableOpacity 
          className="flex-1 justify-end"
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View className="bg-white rounded-t-3xl p-6">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-gray-800">แก้ไขแผนอาหาร</Text>
                <TouchableOpacity onPress={onClose}>
                  <Icon name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              {/* Plan Name Input */}
              <View className="mb-4">
                <Text className="text-base font-medium text-gray-700 mb-2">ชื่อแผนอาหาร</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                  placeholder="เช่น แผนลดน้ำหนัก 7 วัน, เมนูเพิ่มกล้าม..."
                  value={planName}
                  onChangeText={setPlanName}
                />
              </View>

              {/* Plan Image */}
              <View className="mb-4">
                <Text className="text-base font-medium text-gray-700 mb-2">รูปภาพแผน</Text>
                <TouchableOpacity 
                  className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 items-center justify-center h-32"
                  onPress={onImagePicker}
                >
                  {selectedPlanImage ? (
                    <Image
                      source={{ uri: selectedPlanImage }}
                      className="w-full h-full rounded-lg"
                      resizeMode="cover"
                    />
                  ) : (
                    <>
                      <Icon name="camera-outline" size={32} color="#9ca3af" />
                      <Text className="text-gray-500 mt-2">แตะเพื่อเพิ่มรูปภาพ</Text>
                    </>
                  )}
                </TouchableOpacity>
                {selectedPlanImage && (
                  <TouchableOpacity
                    className="mt-2 self-center"
                    onPress={onRemoveImage}
                  >
                    <Text className="text-red-500 text-sm">ลบรูปภาพ</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Plan Description Input */}
              <View className="mb-6">
                <Text className="text-base font-medium text-gray-700 mb-2">คำอธิบาย</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                  placeholder="อธิบายเกี่ยวกับแผนอาหารนี้..."
                  value={planDescription}
                  onChangeText={setPlanDescription}
                  multiline
                  numberOfLines={3}
                  style={{ textAlignVertical: 'top' }}
                />
              </View>

              {/* Action Buttons */}
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
                  onPress={onClose}
                  disabled={isLoading}
                >
                  <Text className="text-gray-700 font-medium">ยกเลิก</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className={`flex-1 rounded-lg py-3 items-center ${isLoading ? 'bg-gray-400' : 'bg-yellow-400'}`}
                  onPress={onSave}
                  disabled={isLoading}
                >
                  <Text className="text-white font-medium">
                    {isLoading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};
