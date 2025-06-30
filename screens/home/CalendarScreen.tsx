import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView, Modal, FlatList } from 'react-native';
import { useTypedNavigation } from '../../hooks/Navigation';
import Icon from 'react-native-vector-icons/Ionicons';
import Menu from '../material/Menu';

/**
 * CalendarScreen Component
 * หน้าจัดการเมนูอาหาร - แสดงเมนูอาหารตามวันและเวลา
 */
const CalendarScreen = () => {
  const navigation = useTypedNavigation();

  // State for selected date and modal
  const [selectedDay, setSelectedDay] = useState(12); // Default to day 12
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showKebabMenu, setShowKebabMenu] = useState(false);

  // Generate days 1-30 for date picker
  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  // Get current date info
  const getCurrentDate = () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear() + 543; // Convert to Buddhist Era
    
    return {
      dayName: `วันที่ ${selectedDay}`,
      fullDate: `${selectedDay}/${month}/${year}`
    };
  };

  const { dayName, fullDate } = getCurrentDate();

  // Navigate to previous/next day
  const navigateDay = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && selectedDay > 1) {
      setSelectedDay(selectedDay - 1);
    } else if (direction === 'next' && selectedDay < 30) {
      setSelectedDay(selectedDay + 1);
    }
  };

  const renderDatePickerItem = ({ item }: { item: number }) => (
    <TouchableOpacity
      className={`p-4 m-2 rounded-lg ${selectedDay === item ? 'bg-yellow-500' : 'bg-gray-100'}`}
      onPress={() => {
        setSelectedDay(item);
        setShowDatePicker(false);
      }}
    >
      <Text className={`text-center font-medium ${selectedDay === item ? 'text-white' : 'text-gray-700'}`}>
         {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary px-4 py-4 mt-6 flex-row items-center justify-between border-b border-gray-100">
        {/* Menu Button */}
        <TouchableOpacity className="w-10 h-10  rounded-lg items-center justify-center">
          <Icon name="menu" size={24} color="white" />
        </TouchableOpacity>
        
        {/* Title */}
        <Text className="text-xl font-bold text-white font-prompt">จัดการเมนูอาหาร</Text>
        
        {/* Calendar Info */}
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="flex-row items-center"
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="calendar" size={20} color="#ffff" />
            <View className="ml-2">
              <Text className="text-sm font-medium text-white">{dayName}</Text>
            </View>
          </TouchableOpacity>
          
          {/* Kebab Menu */}
          <TouchableOpacity 
            className="ml-3 w-8 h-8 items-center justify-center"
            onPress={() => setShowKebabMenu(true)}
          >
            <Icon name="ellipsis-vertical" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Navigation Bar */}
      <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity
          className={`w-8 h-8 items-center justify-center ${selectedDay <= 1 ? 'opacity-50' : ''}`}
          onPress={() => navigateDay('prev')}
          disabled={selectedDay <= 1}
        >
          <Icon name="chevron-back" size={20} color="#374151" />
        </TouchableOpacity>
        
        <Text className="text-lg font-medium text-gray-800">
          {dayName}
        </Text>
        
        <TouchableOpacity
          className={`w-8 h-8 items-center justify-center ${selectedDay >= 30 ? 'opacity-50' : ''}`}
          onPress={() => navigateDay('next')}
          disabled={selectedDay >= 30}
        >
          <Icon name="chevron-forward" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View className="flex-1 items-center justify-center px-4">
        {/* Fruit Illustration */}
        <Image 
          source={require('../../assets/images/bg1.png')} 
          className="w-64 h-64 mb-6"
          resizeMode="contain"
        />

        {/* Text Content */}
        <View className="items-center mb-8">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            แนะนำการกินเพื่อสุขภาพ
          </Text>
          <Text className="text-gray-600 text-center leading-6">
            แนะนำเมนูอาหารเช้าและอาหารเย็น{'\n'}
            เพื่อสุขภาพที่ดีในแต่ละวัน
          </Text>
        </View>

        {/* Add Menu Button */}
        <TouchableOpacity 
          className="bg-primary rounded-xl px-8 py-4 flex-row items-center shadow-md"
          onPress={() => navigation.navigate('MealPlan')}
        >
          <Icon name="add-circle" size={24} color="white" />
          <Text className="text-white font-bold text-lg ml-2">เพิ่มเมนู</Text>
        </TouchableOpacity>

        
      </View>

      {/* Bottom Navigation */}
      <Menu />

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">เลือกวันที่</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Icon name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={days}
              renderItem={renderDatePickerItem}
              keyExtractor={(item) => item.toString()}
              numColumns={5}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </View>
        </View>
      </Modal>

      {/* Kebab Menu Modal */}
      <Modal
        visible={showKebabMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowKebabMenu(false)}
      >
        <TouchableOpacity 
          className="flex-1 bg-black bg-opacity-50"
          onPress={() => setShowKebabMenu(false)}
        >
          <View className="absolute top-20 right-4 bg-white rounded-lg shadow-lg py-2 min-w-[150px]">
            <TouchableOpacity
              className="px-4 py-3 flex-row items-center"
              onPress={() => {
                setShowKebabMenu(false);
                navigation.navigate('FoodMenu');
              }}
            >
              <Icon name="restaurant" size={20} color="#6b7280" />
              <Text className="ml-3 text-gray-700">ดูเมนูทั้งหมด</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="px-4 py-3 flex-row items-center"
              onPress={() => {
                setShowKebabMenu(false);
                navigation.navigate('SuggestionMenu');
              }}
            >
              <Icon name="add-circle" size={20} color="#6b7280" />
              <Text className="ml-3 text-gray-700">เพิ่มเมนูใหม่</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="px-4 py-3 flex-row items-center"
              onPress={() => {
                setShowKebabMenu(false);
                navigation.navigate('RecordFood');
              }}
            >
              <Icon name="create" size={20} color="#6b7280" />
              <Text className="ml-3 text-gray-700">บันทึกอาหาร</Text>
            </TouchableOpacity>
            
            <View className="border-t border-gray-100 my-1" />
            
            <TouchableOpacity
              className="px-4 py-3 flex-row items-center"
              onPress={() => setShowKebabMenu(false)}
            >
              <Icon name="settings" size={20} color="#6b7280" />
              <Text className="ml-3 text-gray-700">ตั้งค่า</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};




export default CalendarScreen;
