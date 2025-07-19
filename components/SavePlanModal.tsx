import React from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface SavePlanModalProps {
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
  totalDays: number;
  totalMenus: number;
  saveButtonText?: string;
  setAsCurrentPlan: boolean;
  setSetAsCurrentPlan: (value: boolean) => void;
}

export const SavePlanModal: React.FC<SavePlanModalProps> = ({
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
  totalDays,
  totalMenus,
  saveButtonText = 'บันทึกแผน',
  setAsCurrentPlan,
  setSetAsCurrentPlan
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
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">บันทึกแผนอาหาร</Text>
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

            {/* Summary Info */}
            <View className="bg-blue-50 rounded-lg p-4 mb-6">
              <Text className="text-sm font-medium text-blue-800 mb-2">สรุปแผนอาหาร</Text>
              <Text className="text-sm text-blue-700">• จำนวนวัน: {totalDays} วัน</Text>
              <Text className="text-sm text-blue-700">• รวมเมนูอาหาร: {totalMenus} เมนู</Text>
            </View>

            {/* Set as Current Plan Checkbox */}
            <TouchableOpacity 
              className="flex-row items-center mb-6 p-3 bg-green-50 rounded-lg border border-green-200"
              onPress={() => setSetAsCurrentPlan(!setAsCurrentPlan)}
            >
              <View className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                setAsCurrentPlan ? 'bg-green-500 border-green-500' : 'border-gray-300'
              }`}>
                {setAsCurrentPlan && (
                  <Icon name="checkmark" size={12} color="white" />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-green-800">ตั้งเป็นแผนปัจจุบัน</Text>
                <Text className="text-sm text-green-600">ใช้แผนนี้เป็นแผนอาหารหลักในการทำงานของแอป</Text>
              </View>
            </TouchableOpacity>

            {/* Action Buttons */}
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
                onPress={onClose}
              >
                <Text className="text-gray-700 font-medium">ยกเลิก</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 bg-primary rounded-lg py-3 items-center"
                onPress={onSave}
              >
                <Text className="text-white font-medium">{saveButtonText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};
