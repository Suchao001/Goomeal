import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useTypedNavigation } from '../hooks/Navigation';

/**
 * Demo Component - แสดงวิธีการใช้งาน MealPlanScreen ในโหมดใหม่
 * 
 * Component นี้สาธิตการ navigate ไป MealPlanScreen ในโหมดต่างๆ
 */
const MealPlanModeDemo: React.FC = () => {
  const navigation = useTypedNavigation();

  // สร้างแผนอาหารใหม่
  const handleCreateNewPlan = () => {
    navigation.navigate('MealPlan', {
      mode: 'add'
    });
  };

  // แก้ไขแผนอาหารที่มีอยู่
  const handleEditExistingPlan = () => {
    const samplePlanId = 123; // ในการใช้งานจริง จะได้จาก plan list
    
    navigation.navigate('MealPlan', {
      mode: 'edit',
      foodPlanId: samplePlanId
    });
  };

  // Navigate แบบเดิม (จะเป็น add mode อัตโนมัติ)
  const handleLegacyNavigation = () => {
    navigation.navigate('MealPlan');
  };

  // ตัวอย่างการใช้ใน Plan List Screen
  const handlePlanItemPress = (plan: any) => {
    Alert.alert(
      'เลือกการกระทำ',
      `แผนอาหาร: ${plan.name}`,
      [
        {
          text: 'ดูรายละเอียด',
          onPress: () => {
            // Navigate to plan detail screen
            console.log('View plan details');
          }
        },
        {
          text: 'แก้ไขแผน',
          onPress: () => {
            navigation.navigate('MealPlan', {
              mode: 'edit',
              foodPlanId: plan.id
            });
          }
        },
        {
          text: 'ยกเลิก',
          style: 'cancel'
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold text-gray-800 mb-6 text-center">
        MealPlan Mode Demo
      </Text>

      <View className="space-y-4">
        {/* Add Mode */}
        <View className="bg-white rounded-lg p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            Add Mode - สร้างแผนใหม่
          </Text>
          <Text className="text-gray-600 mb-4">
            เริ่มต้นด้วยหน้าว่างเปล่า ให้ผู้ใช้สร้างแผนอาหารใหม่
          </Text>
          <TouchableOpacity
            className="bg-green-500 rounded-lg py-3 px-4"
            onPress={handleCreateNewPlan}
          >
            <Text className="text-white font-medium text-center">
              สร้างแผนอาหารใหม่
            </Text>
          </TouchableOpacity>
        </View>

        {/* Edit Mode */}
        <View className="bg-white rounded-lg p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            Edit Mode - แก้ไขแผนที่มีอยู่
          </Text>
          <Text className="text-gray-600 mb-4">
            โหลดข้อมูลจาก API และให้ผู้ใช้แก้ไขแผนอาหาร
          </Text>
          <TouchableOpacity
            className="bg-blue-500 rounded-lg py-3 px-4"
            onPress={handleEditExistingPlan}
          >
            <Text className="text-white font-medium text-center">
              แก้ไขแผนอาหาร (ID: 123)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Legacy Mode */}
        <View className="bg-white rounded-lg p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            Legacy Navigation
          </Text>
          <Text className="text-gray-600 mb-4">
            Navigation แบบเดิม (จะเป็น add mode อัตโนมัติ)
          </Text>
          <TouchableOpacity
            className="bg-gray-500 rounded-lg py-3 px-4"
            onPress={handleLegacyNavigation}
          >
            <Text className="text-white font-medium text-center">
              เปิดแบบเดิม (No params)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Plan List Example */}
        <View className="bg-white rounded-lg p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            Plan List Example
          </Text>
          <Text className="text-gray-600 mb-4">
            ตัวอย่างการใช้งานใน Plan List Screen
          </Text>
          <TouchableOpacity
            className="bg-orange-500 rounded-lg py-3 px-4"
            onPress={() => handlePlanItemPress({ id: 123, name: 'แผนอาหารลดน้ำหนัก' })}
          >
            <Text className="text-white font-medium text-center">
              กดแผนอาหารใน List
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Info Box */}
      <View className="bg-blue-50 rounded-lg p-4 mt-6">
        <Text className="text-blue-800 font-semibold mb-2">
          ℹ️ การทำงานของโหมดใหม่
        </Text>
        <Text className="text-blue-700 text-sm leading-5">
          • Add Mode: เริ่มต้นหน้าว่าง, หัวข้อ "วางแผนเมนูอาหาร", ปุ่ม "บันทึกแผน"{'\n'}
          • Edit Mode: โหลดข้อมูลจาก API, หัวข้อ "แก้ไขแผนอาหาร", ปุ่ม "อัพเดทแผน"{'\n'}
          • Loading: แสดง loading screen ใน edit mode ขณะโหลดข้อมูล{'\n'}
          • Auto Navigation: กลับไปหน้าเดิมหลังอัพเดทใน edit mode
        </Text>
      </View>
    </View>
  );
};

export default MealPlanModeDemo;
