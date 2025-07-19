/**
 * Test MealPlanScreen Mode functionality
 * วิธีการทดสอบ:
 * 1. เรียกใช้ในโหมด Add
 * 2. เรียกใช้ในโหมด Edit
 * 3. ตรวจสอบ infinite loop
 */

import { Alert } from 'react-native';

// Test Add Mode
export const testAddMode = (navigation: any) => {
  console.log('Testing Add Mode...');
  navigation.navigate('MealPlan', {
    mode: 'add'
  });
};

// Test Edit Mode
export const testEditMode = (navigation: any, planId: number = 123) => {
  console.log('Testing Edit Mode with planId:', planId);
  navigation.navigate('MealPlan', {
    mode: 'edit',
    foodPlanId: planId
  });
};

// Test Legacy Navigation (should default to Add mode)
export const testLegacyMode = (navigation: any) => {
  console.log('Testing Legacy Navigation...');
  navigation.navigate('MealPlan');
};

// Error Handling Test
export const testErrorHandling = () => {
  // Simulate API error
  console.log('Testing error handling...');
  Alert.alert('Test', 'This is a test error alert');
};

export default {
  testAddMode,
  testEditMode,
  testLegacyMode,
  testErrorHandling
};
