import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Alert,
  ScrollView,
  SafeAreaView 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { type FoodItem } from '../stores/mealPlanStore';

interface EditFoodModalProps {
  visible: boolean;
  food: FoodItem | null;
  onClose: () => void;
  onSave: (updatedFood: FoodItem) => void;
}

export const EditFoodModal: React.FC<EditFoodModalProps> = ({
  visible,
  food,
  onClose,
  onSave
}) => {
  const [editedFood, setEditedFood] = useState<FoodItem | null>(null);

  // Reset form when food changes
  useEffect(() => {
    if (food) {
      setEditedFood({ ...food });
    }
  }, [food]);

  const handleSave = () => {
    if (!editedFood) return;

    // Validate required fields
    if (!editedFood.name.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาระบุชื่ออาหาร');
      return;
    }

  
    onSave(editedFood);
    onClose();
  };

  const handleCancel = () => {
    // Reset to original values
    if (food) {
      setEditedFood({ ...food });
    }
    onClose();
  };

  const updateNutrition = (field: keyof Pick<FoodItem, 'cal' | 'carb' | 'protein' | 'fat'>, value: string) => {
    if (!editedFood) return;
    
    const numValue = parseFloat(value) || 0;
    setEditedFood({
      ...editedFood,
      [field]: Math.max(0, numValue) // Ensure non-negative values
    });
  };

  if (!editedFood) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-primary px-4 py-4 flex-row items-center justify-between border-b border-gray-100">
          <TouchableOpacity 
            className="w-10 h-10 rounded-lg items-center justify-center"
            onPress={handleCancel}
          >
            <Icon name="close" size={24} color="white" />
          </TouchableOpacity>
          
          <Text className="text-xl font-bold text-white font-prompt">แก้ไขรายการอาหาร</Text>
          
          <TouchableOpacity 
            className=" bg-opacity-20 rounded-lg px-4 py-2"
            onPress={handleSave}
          >
            <Text className="text-white font-medium">บันทึก</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-4 py-6">
          {/* Food Name */}
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-3">ชื่ออาหาร</Text>
            <TextInput
              className="bg-gray-50 rounded-lg px-4 py-3 text-gray-800 text-base"
              value={editedFood.name}
              onChangeText={(text) => setEditedFood({ ...editedFood, name: text })}
              placeholder="ระบุชื่ออาหาร"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Nutrition Information */}
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-4">ข้อมูลโภชนาการ</Text>
            
            {/* Calories */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">แคลอรี่ (kcal)</Text>
              <View className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3">
                <Icon name="flame" size={20} color="#ef4444" />
                <TextInput
                  className="flex-1 ml-3 text-gray-800 text-base"
                  value={editedFood.cal.toString()}
                  onChangeText={(text) => updateNutrition('cal', text)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                />
                <Text className="text-gray-500 text-sm">kcal</Text>
              </View>
            </View>

            {/* Carbohydrates */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">คาร์โบไฮเดรต (g)</Text>
              <View className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3">
                <Icon name="nutrition" size={20} color="#f59e0b" />
                <TextInput
                  className="flex-1 ml-3 text-gray-800 text-base"
                  value={editedFood.carb.toString()}
                  onChangeText={(text) => updateNutrition('carb', text)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                />
                <Text className="text-gray-500 text-sm">g</Text>
              </View>
            </View>

            {/* Protein */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">โปรตีน (g)</Text>
              <View className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3">
                <Icon name="fitness" size={20} color="#10b981" />
                <TextInput
                  className="flex-1 ml-3 text-gray-800 text-base"
                  value={editedFood.protein.toString()}
                  onChangeText={(text) => updateNutrition('protein', text)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                />
                <Text className="text-gray-500 text-sm">g</Text>
              </View>
            </View>

            {/* Fat */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">ไขมัน (g)</Text>
              <View className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3">
                <Icon name="water" size={20} color="#8b5cf6" />
                <TextInput
                  className="flex-1 ml-3 text-gray-800 text-base"
                  value={editedFood.fat.toString()}
                  onChangeText={(text) => updateNutrition('fat', text)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                />
                <Text className="text-gray-500 text-sm">g</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons - Modern Button Group Style */}
          <View className="bg-white rounded-2xl overflow-hidden shadow-lg mt-8 mb-4 border border-gray-100">
            <View className="flex-row">
              <TouchableOpacity
                className="flex-1 bg-gray-50 hover:bg-gray-100 py-4 px-6 items-center justify-center border-r border-gray-200"
                onPress={handleCancel}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <Icon name="close-outline" size={20} color="#6b7280" />
                  <Text className="text-gray-700 font-semibold text-base ml-2">ยกเลิก</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 bg-primary hover:bg-primary-dark py-4 px-6 items-center justify-center"
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center">
                  <Icon name="checkmark-outline" size={20} color="white" />
                  <Text className="text-white font-semibold text-base ml-2">บันทึก</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};
