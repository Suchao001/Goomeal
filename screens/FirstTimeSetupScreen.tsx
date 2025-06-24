import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../hooks/Navigation';
import Header from './material/Header';
import Menu from './material/Menu';

/**
 * FirstTimeSetupScreen Component
 * หน้ากรอกข้อมูลครั้งแรก
 */
const FirstTimeSetupScreen = () => {
  const navigation = useTypedNavigation<'FirstTimeSetup'>();

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Header />
      
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Icon name="arrow-back" size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.title}>กรอกข้อมูลครั้งแรก</Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <View style={styles.iconContainer}>
            <Icon name="document-text" size={80} color="#3b82f6" />
          </View>
          
          <Text style={styles.subtitle}>ยินดีต้อนรับสู่ GoodMeal</Text>
          <Text style={styles.description}>
            กรุณากรอกข้อมูลส่วนตัวเพื่อเริ่มใช้งานระบบ
            เราจะใช้ข้อมูลเหล่านี้เพื่อปรับแต่งประสบการณ์การใช้งานให้เหมาะสมกับคุณ
          </Text>

          {/* Steps */}
          <View style={styles.stepsContainer}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>กรอกข้อมูลส่วนตัว</Text>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>เลือกเป้าหมายสุขภาพ</Text>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>ตั้งค่าความต้องการ</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={() => navigation.navigate('PersonalSetup')}>
            <Text style={styles.startButtonText}>เริ่มต้นใช้งาน</Text>
            <Icon name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Menu />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  stepsContainer: {
    width: '100%',
    marginBottom: 40,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepText: {
    fontSize: 16,
    color: '#374151',
  },
  startButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default FirstTimeSetupScreen;
