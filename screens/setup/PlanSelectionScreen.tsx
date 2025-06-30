import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../../hooks/Navigation';

const PlanSelectionScreen = () => {
  const navigation = useTypedNavigation<'PlanSelection'>();

  const [plans, setPlans] = useState([
    {
      id: 1,
      name: 'แผนลดน้ำหนัก',
      description: 'แผนการกินเพื่อลดน้ำหนักอย่างปลอดภัย',
      image: '🥗',
    },
    {
      id: 2,
      name: 'แผนเพิ่มกล้ามเนื้อ',
      description: 'แผนการกินเพื่อเพิ่มกล้ามเนื้อและพลังงาน',
      image: '🥩',
    },
  ]);

  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handlePlanOptions = (plan: any) => {
    setSelectedPlan(plan);
    setShowActionSheet(true);
  };

  const handleEdit = () => {
    if (selectedPlan) {
      setEditName(selectedPlan.name);
      setEditDescription(selectedPlan.description);
      setShowActionSheet(false);
      setShowEditModal(true);
    }
  };

  const handleDelete = () => {
    setShowActionSheet(false);
    if (selectedPlan) {
      Alert.alert(
        'ยืนยันการลบ',
        `คุณต้องการลบ "${selectedPlan.name}" หรือไม่?`,
        [
          { text: 'ยกเลิก', style: 'cancel' },
          {
            text: 'ลบ',
            style: 'destructive',
            onPress: () => {
              setPlans(plans.filter(p => p.id !== selectedPlan.id));
              setSelectedPlan(null);
            }
          }
        ]
      );
    }
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาระบุชื่อแผน');
      return;
    }

    if (selectedPlan) {
      setPlans(plans.map(p => 
        p.id === selectedPlan.id 
          ? { ...p, name: editName, description: editDescription }
          : p
      ));
      
      setShowEditModal(false);
      setSelectedPlan(null);
      setEditName('');
      setEditDescription('');
    }
  };

  const handleAddPlan = () => {
    const newPlan = {
      id: Date.now(),
      name: 'แผนใหม่',
      description: 'คำอธิบายแผนใหม่',
      image: '🍽️',
    };
    setPlans([...plans, newPlan]);
  };

  return (
    <View className="flex-1 bg-gray-100">
      <View className="flex-row items-center justify-between px-4 pt-10 pb-4 bg-white">
        <TouchableOpacity 
          className="w-10 h-10 rounded-full items-center justify-center"
          onPress={handleBackPress}
        >
          <Icon name="arrow-back" size={24} color="#9ca3af" />
        </TouchableOpacity>
        
        <View className="flex-row items-center gap-2">
          <Icon name="restaurant" size={32} color="#9ca3af" />
          <Text className="text-xl font-semibold text-gray-800">แผนการกิน</Text>
        </View>
        
        <Text className="text-base font-semibold text-gray-800"></Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="flex-1 px-4 pt-6">
          <View className="gap-4">
            {plans.map((plan) => (
              <View key={plan.id} className="bg-white rounded-2xl p-4 flex-row items-center justify-between shadow-lg shadow-slate-800">
                <View className="flex-row items-center flex-1">
                  <View className="w-15 h-15 rounded-xl bg-gray-100 items-center justify-center mr-4">
                    <Text className="text-3xl">{plan.image}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-800 mb-1">{plan.name}</Text>
                    <Text className="text-sm text-gray-600">{plan.description}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  className="p-2"
                  onPress={() => handlePlanOptions(plan)}
                >
                  <Icon name="ellipsis-vertical" size={20} color="#eab308" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <TouchableOpacity 
            className="bg-white rounded-2xl p-5 flex-row items-center justify-center mt-4 border-2 border-gray-200 border-dashed"
            onPress={handleAddPlan}
          >
            <Icon name="add" size={24} color="#eab308" />
            <Text className="text-base font-semibold text-gray-600 ml-2">+ เพิ่มแผนใหม่</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Action Sheet Modal */}
      <Modal
        visible={showActionSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowActionSheet(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View className="bg-white rounded-t-3xl pb-10">
            <TouchableOpacity 
              className="py-4 px-5 border-b border-gray-200"
              onPress={() => setShowActionSheet(false)}
            >
              <Text className="text-base text-gray-800 text-center">เลือก</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="py-4 px-5 border-b border-gray-200"
              onPress={handleEdit}
            >
              <Text className="text-base text-gray-800 text-center">แก้ไข</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="py-4 px-5 border-b border-gray-200 bg-red-50"
              onPress={handleDelete}
            >
              <Text className="text-base text-red-500 text-center">ลบ</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="py-4 px-5 bg-gray-100 mt-2"
              onPress={() => setShowActionSheet(false)}
            >
              <Text className="text-base text-gray-800 text-center">ยกเลิก</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-center">
          <View className="bg-white mx-5 rounded-3xl p-5 max-h-4/5">
            <Text className="text-xl font-bold text-gray-800 text-center mb-5">แก้ไขแผนการกิน</Text>
            
            <View className="mb-4">
              <Text className="text-base font-semibold text-gray-700 mb-2">ชื่อแผน</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-3 py-3 text-base text-gray-800"
                value={editName}
                onChangeText={setEditName}
                placeholder="ระบุชื่อแผน"
              />
            </View>

            <View className="mb-4">
              <Text className="text-base font-semibold text-gray-700 mb-2">คำอธิบาย</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-3 py-3 text-base text-gray-800 h-20"
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="ระบุคำอธิบาย"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View className="mb-4">
              <Text className="text-base font-semibold text-gray-700 mb-2">รูปภาพ</Text>
              <TouchableOpacity className="border-2 border-gray-300 border-dashed rounded-xl py-5 items-center justify-center">
                <Icon name="camera" size={32} color="#9ca3af" />
                <Text className="text-sm text-gray-600 mt-2">เพิ่มรูปภาพ</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-between gap-3 mt-5">
              <TouchableOpacity 
                className="flex-1 py-3 rounded-xl bg-gray-100 items-center"
                onPress={() => setShowEditModal(false)}
              >
                <Text className="text-base text-gray-600">ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 py-3 rounded-xl bg-yellow-400 items-center"
                onPress={handleSaveEdit}
              >
                <Text className="text-base font-semibold text-white">บันทึก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PlanSelectionScreen;
