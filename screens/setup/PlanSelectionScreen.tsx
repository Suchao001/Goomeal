import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../../hooks/Navigation';
import Header from '../material/Header';
import Menu from '../material/Menu';

/**
 * PlanSelectionScreen Component
 * หน้าเลือกแพลนการกิน
 */
const PlanSelectionScreen = () => {
  const navigation = useTypedNavigation<'PlanSelection'>();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const plans = [
    {
      id: 1,
      name: 'แพลนลดน้ำหนัก',
      description: 'เหมาะสำหรับคนที่ต้องการลดน้ำหนัก',
      icon: 'fitness',
      color: '#ef4444',
      bgColor: '#fecaca',
    },
    {
      id: 2,
      name: 'แพลนเพิ่มน้ำหนัก',
      description: 'เหมาะสำหรับคนที่ต้องการเพิ่มน้ำหนัก',
      icon: 'barbell',
      color: '#22c55e',
      bgColor: '#dcfce7',
    },
    {
      id: 3,
      name: 'แพลนรักษาน้ำหนัก',
      description: 'เหมาะสำหรับคนที่ต้องการรักษาน้ำหนักปัจจุบัน',
      icon: 'heart',
      color: '#3b82f6',
      bgColor: '#dbeafe',
    },
    {
      id: 4,
      name: 'แพลนสุขภาพ',
      description: 'เน้นการกินอาหารเพื่อสุขภาพ',
      icon: 'leaf',
      color: '#22c55e',
      bgColor: '#dcfce7',
    },
  ];

  return (
    <View style={styles.container}>
      <Header />
      
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Icon name="arrow-back" size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.title}>เลือกแพลนการกิน</Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <Text style={styles.subtitle}>เลือกแพลนที่เหมาะสมกับคุณ</Text>
          <Text style={styles.description}>
            เลือกแพลนการกินที่เหมาะสมกับเป้าหมายและไลฟ์สไตล์ของคุณ
          </Text>

          {/* Plans List */}
          <View style={styles.plansContainer}>
            {plans.map((plan) => (
              <TouchableOpacity key={plan.id} style={styles.planCard}>
                <View style={[styles.planIcon, { backgroundColor: plan.bgColor }]}>
                  <Icon name={plan.icon} size={32} color={plan.color} />
                </View>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planDescription}>{plan.description}</Text>
                </View>
                <Icon name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </View>
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
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 32,
  },
  plansContainer: {
    gap: 16,
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  planIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default PlanSelectionScreen;
