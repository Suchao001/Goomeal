import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface FoodEntryMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  position: { x: number; y: number };
}

export const FoodEntryMenuModal: React.FC<FoodEntryMenuModalProps> = ({
  visible,
  onClose,
  onEdit,
  onDelete,
  position
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
        <View 
          className="absolute bg-white rounded-xl shadow-lg py-2" 
          style={{ 
            minWidth: 160,
            left: Math.max(10, Math.min(position.x - 80, 300)), // Center menu on touch point, with screen bounds
            top: position.y + 10 // Position below touch point
          }}
        >
          {/* Edit Option */}
          <TouchableOpacity
            className="flex-row items-center px-4 py-3 active:bg-gray-50"
            onPress={() => handleAction(onEdit)}
          >
            <Icon name="pencil-outline" size={20} color="#0ea5e9" />
            <Text className="text-gray-800 font-medium ml-3">แก้ไข</Text>
          </TouchableOpacity>
          
          {/* Divider */}
          <View className="h-px bg-gray-200 mx-2" />
          
          {/* Delete Option */}
          <TouchableOpacity
            className="flex-row items-center px-4 py-3 active:bg-gray-50"
            onPress={() => handleAction(onDelete)}
          >
            <Icon name="trash-outline" size={20} color="#dc2626" />
            <Text className="text-gray-800 font-medium ml-3">ลบ</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
