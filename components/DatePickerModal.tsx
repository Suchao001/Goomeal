import React from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface DatePickerModalProps {
  visible: boolean;
  selectedDay: number;
  days: number[];
  onSelectDay: (day: number) => void;
  onClose: () => void;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  selectedDay,
  days,
  onSelectDay,
  onClose
}) => {
  const renderDatePickerItem = ({ item }: { item: number }) => (
    <TouchableOpacity
      className={`p-2 m-1 rounded-lg items-center justify-center ${
        selectedDay === item 
          ? 'bg-primary shadow-lg' 
          : 'bg-gray-100 hover:bg-gray-200'
      }`}
      style={{ width: 40, height: 40 }}
      onPress={() => {
        onSelectDay(item);
        onClose();
      }}
    >
      <Text className={`text-sm font-semibold ${
        selectedDay === item ? 'text-white' : 'text-gray-700'
      }`}>
        {item}
      </Text>
    </TouchableOpacity>
  );

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
        <View className="absolute top-20 left-4 right-4 bg-white rounded-xl shadow-lg p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-800">เลือกวันที่</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={days}
            renderItem={renderDatePickerItem}
            keyExtractor={(item) => item.toString()}
            numColumns={6}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ 
              paddingHorizontal: 8,
              paddingBottom: 16
            }}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
          />
          
          <TouchableOpacity
            className="bg-primary rounded-lg py-3 items-center mt-2"
            onPress={onClose}
          >
            <Text className="text-white font-semibold">ยืนยัน</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
