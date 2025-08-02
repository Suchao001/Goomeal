import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface KebabMenuMyFoodProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  position: { x: number; y: number };
}

const KebabMenuMyFood: React.FC<KebabMenuMyFoodProps> = ({
  visible,
  onClose,
  onEdit,
  onDelete,
  position
}) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        className="flex-1"
        activeOpacity={1}
        onPress={onClose}
      >
        <View 
          className="absolute bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-36"
          style={{
            left: Math.max(10, position.x - 120), // Ensure it doesn't go off screen
            top: position.y + 10,
          }}
        >
          <TouchableOpacity
            className="flex-row items-center px-4 py-3 active:bg-gray-50"
            onPress={() => {
              onEdit();
              onClose();
            }}
          >
            <Icon name="create" size={18} color="#3b82f6" />
            <Text className="text-gray-800 ml-3 font-prompt">แก้ไขเมนู</Text>
          </TouchableOpacity>
          
          <View className="h-px bg-gray-100 mx-2" />
          
          <TouchableOpacity
            className="flex-row items-center px-4 py-3 active:bg-gray-50"
            onPress={() => {
              onDelete();
              onClose();
            }}
          >
            <Icon name="trash" size={18} color="#ef4444" />
            <Text className="text-red-600 ml-3 font-prompt">ลบเมนู</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default KebabMenuMyFood;
