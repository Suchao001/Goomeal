import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../hooks/Navigation';
import Header from './material/Header';
import Menu from './material/Menu';

const MealTimeSettingsScreen = () => {
  const navigation = useTypedNavigation<'MealTimeSettings'>();

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.headerSection}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.title}>ตั้งเวลามื้ออาหาร</Text>
        </View>
        <View style={styles.mainContent}>
          <View style={styles.iconContainer}>
            <Icon name="time" size={80} color="#14b8a6" />
          </View>
          <Text style={styles.subtitle}>เวลามื้ออาหาร</Text>
          <Text style={styles.description}>กำหนดเวลาสำหรับแต่ละมื้ออาหารของคุณ</Text>
        </View>
      </ScrollView>
      <Menu />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { flex: 1 },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: { marginRight: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  mainContent: { flex: 1, paddingHorizontal: 24, paddingTop: 40, alignItems: 'center' },
  iconContainer: { marginBottom: 32 },
  subtitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 16, textAlign: 'center' },
  description: { fontSize: 16, color: '#6b7280', textAlign: 'center', lineHeight: 24 },
});

export default MealTimeSettingsScreen;
