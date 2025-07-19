import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface KebabMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  onClear: () => void;
  canSave: boolean;
}

export const KebabMenuModal: React.FC<KebabMenuModalProps> = ({
  visible,
  onClose,
  onSave,
  onClear,
  canSave
}) => {
  const handleAction = (action: () => void) => {
    onClose();
    action();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        className="flex-1"
        activeOpacity={1}
        onPress={onClose}
      >
        <View className="absolute top-20 right-4 bg-white rounded-xl shadow-lg py-2" style={{ minWidth: 180 }}>
          {/* Save Data Option */}
          <TouchableOpacity
            className={`flex-row items-center px-4 py-3 active:bg-gray-50 ${
              !canSave ? 'opacity-50' : ''
            }`}
            onPress={() => handleAction(onSave)}
            disabled={!canSave}
          >
            <Icon name="save-outline" size={20} color="#059669" />
            <Text className="text-gray-800 font-medium ml-3">บันทึกข้อมูล</Text>
          </TouchableOpacity>
          
          {/* Divider */}
          <View className="h-px bg-gray-200 mx-2" />
          
          {/* Clear Data Option */}
          <TouchableOpacity
            className="flex-row items-center px-4 py-3 active:bg-gray-50"
            onPress={() => handleAction(onClear)}
          >
            <Icon name="trash-outline" size={20} color="#dc2626" />
            <Text className="text-gray-800 font-medium ml-3">เคลียร์ข้อมูล</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
