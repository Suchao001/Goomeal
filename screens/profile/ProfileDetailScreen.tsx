import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import Header from '../material/Header';
import Menu from '../material/Menu';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * ProfileDetailScreen Component
 * หน้าข้อมูลโปรไฟล์ - แสดงข้อมูลส่วนตัวและ BMI
 */
const ProfileDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const bmiValue = 23.15;
  const weight = 75;
  const height = 180;
  const age = 20;

  // BMI categories with colors
  const bmiCategories = [
    { label: 'Underweight', color: '#3b82f6', range: '< 18.5' },
    { label: 'Normal', color: '#22c55e', range: '18.5-24.9' },
    { label: 'Overweight', color: '#f59e0b', range: '25-29.9' },
    { label: 'Obese', color: '#f97316', range: '30-34.9' },
    { label: 'Extremely Obese', color: '#ef4444', range: '≥ 35' },
  ];

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return 0;
    if (bmi < 25) return 1;
    if (bmi < 30) return 2;
    if (bmi < 35) return 3;
    return 4;
  };

  const currentCategory = getBMICategory(bmiValue);

  return (
    <View style={styles.container}>
      {/* Header */}
      

      {/* Main Content */}
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Profile Section */}
        <View style={styles.profileCard}>
          <TouchableOpacity 
          style={styles.backButtonRight}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fbbf24" />
        </TouchableOpacity>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage}>
                <Icon name="person" size={48} color="#9ca3af" />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>suchao</Text>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => navigation.navigate('EditProfile')}
              >
                <Text style={styles.editButtonText}>แก้ไข</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Personal Information */}
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>น้ำหนัก</Text>
                <Text style={styles.infoValue}>{weight} kg</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>ส่วนสูง</Text>
                <Text style={styles.infoValue}>{height} cm</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>อายุ</Text>
                <Text style={styles.infoValue}>{age} ปี</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>BMI</Text>
                <Text style={styles.infoValue}>{bmiValue}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* BMI Chart Section */}
        <View style={styles.bmiCard}>
          <Text style={styles.bmiTitle}>ดัชนีมวลกาย (BMI)</Text>
          
          {/* BMI Scale */}
          <View style={styles.bmiScale}>
            <View style={styles.scaleNumbers}>
              <Text style={styles.scaleNumber}>15</Text>
              <Text style={styles.scaleNumber}>20</Text>
              <Text style={styles.scaleNumber}>25</Text>
              <Text style={styles.scaleNumber}>30</Text>
              <Text style={styles.scaleNumber}>35</Text>
              <Text style={styles.scaleNumber}>40</Text>
            </View>
            
            {/* BMI Bars */}
            <View style={styles.bmiBars}>
              {bmiCategories.map((category, index) => (
                <View key={index} style={styles.bmiBarContainer}>
                  <View 
                    style={[
                      styles.bmiBar, 
                      { backgroundColor: category.color },
                      currentCategory === index && styles.activeBmiBar
                    ]} 
                  />
                  <Text style={[styles.bmiLabel, { color: category.color }]}>
                    {category.label}
                  </Text>
                  <Text style={styles.bmiRange}>{category.range}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Current BMI Indicator */}
          <View style={styles.currentBmiContainer}>
            <View style={styles.bmiIndicator}>
              <View style={[styles.bmiPointer, { left: `${((bmiValue - 15) / 25) * 100}%` }]}>
                <View style={styles.bmiArrow} />
                <Text style={styles.bmiCurrentValue}>{bmiValue}</Text>
              </View>
            </View>
          </View>

          {/* BMI Status */}
          <View style={styles.bmiStatusContainer}>
            <Text style={styles.bmiStatusTitle}>สถานะปัจจุบัน</Text>
            <View style={styles.bmiStatus}>
              <View style={[styles.statusDot, { backgroundColor: bmiCategories[currentCategory].color }]} />
              <Text style={[styles.statusText, { color: bmiCategories[currentCategory].color }]}>
                {bmiCategories[currentCategory].label}
              </Text>
            </View>
            <Text style={styles.bmiDescription}>
              คุณมีน้ำหนักอยู่ในเกณฑ์ปกติ ควรรักษาน้ำหนักให้อยู่ในระดับนี้ต่อไป
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <Menu />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 3,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#6b7280',
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    backgroundColor: '#e5e7eb',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  infoContainer: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  bmiCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bmiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  bmiScale: {
    marginBottom: 20,
  },
  scaleNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scaleNumber: {
    fontSize: 12,
    color: '#6b7280',
  },
  bmiBars: {
    flexDirection: 'row',
    height: 60,
  },
  bmiBarContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  bmiBar: {
    width: '100%',
    height: 30,
    borderRadius: 4,
    marginBottom: 4,
  },
  activeBmiBar: {
    borderWidth: 2,
    borderColor: '#1f2937',
  },
  bmiLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  bmiRange: {
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'center',
  },
  currentBmiContainer: {
    marginVertical: 16,
  },
  bmiIndicator: {
    position: 'relative',
    height: 30,
  },
  bmiPointer: {
    position: 'absolute',
    alignItems: 'center',
    marginLeft: -15,
  },
  bmiArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#1f2937',
  },
  bmiCurrentValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 4,
  },
  bmiStatusContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  bmiStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  bmiStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bmiDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  backButtonRight: {
    position: 'absolute',
    top: 10,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});

export default ProfileDetailScreen;
