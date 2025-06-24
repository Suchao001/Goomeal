import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../hooks/Navigation';
import Header from './material/Header';
import Menu from './material/Menu';

/**
 * EatingReportScreen Component
 * หน้ารายงานการกิน
 */
const EatingReportScreen = () => {
  const navigation = useTypedNavigation<'EatingReport'>();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const reportData = [
    { label: 'แคลอรี่วันนี้', value: '1,250', unit: 'kcal', color: '#ef4444' },
    { label: 'โปรตีน', value: '85', unit: 'g', color: '#22c55e' },
    { label: 'คาร์โบไฮเดรต', value: '120', unit: 'g', color: '#3b82f6' },
    { label: 'ไขมัน', value: '45', unit: 'g', color: '#f59e0b' },
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
          <Text style={styles.title}>รายงานการกิน</Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <Text style={styles.subtitle}>สถิติการกินของคุณ</Text>
          <Text style={styles.description}>
            ดูสถิติและรายงานการบริโภคอาหารประจำวัน
          </Text>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            {reportData.map((item, index) => (
              <View key={index} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: `${item.color}20` }]}>
                  <Icon name="analytics" size={24} color={item.color} />
                </View>
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statUnit}>{item.unit}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          {/* Chart Placeholder */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>กราฟการบริโภคแคลอรี่</Text>
            <View style={styles.chartPlaceholder}>
              <Icon name="bar-chart" size={80} color="#9ca3af" />
              <Text style={styles.chartText}>กราฟจะแสดงที่นี่</Text>
            </View>
          </View>

          {/* Recent Meals */}
          <View style={styles.mealsCard}>
            <Text style={styles.mealsTitle}>มื้ออาหารล่าสุด</Text>
            <View style={styles.mealItem}>
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>อาหารเช้า</Text>
                <Text style={styles.mealTime}>08:30</Text>
              </View>
              <Text style={styles.mealCalories}>320 kcal</Text>
            </View>
            <View style={styles.mealItem}>
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>อาหารกลางวัน</Text>
                <Text style={styles.mealTime}>12:15</Text>
              </View>
              <Text style={styles.mealCalories}>450 kcal</Text>
            </View>
            <View style={styles.mealItem}>
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>อาหารเย็น</Text>
                <Text style={styles.mealTime}>19:00</Text>
              </View>
              <Text style={styles.mealCalories}>480 kcal</Text>
            </View>
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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statUnit: {
    fontSize: 12,
    color: '#6b7280',
  },
  statLabel: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  chartPlaceholder: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  chartText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 8,
  },
  mealsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mealsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  mealTime: {
    fontSize: 14,
    color: '#6b7280',
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
  },
});

export default EatingReportScreen;
