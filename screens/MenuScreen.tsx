import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../hooks/Navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../AuthContext';
import Header from './material/Header';
import Menu from './material/Menu';


/**
 * MenuScreen Component
 * หน้าเมนู - เมนูหลักของแอปพลิเคชัน
 */
const MenuScreen = () => {
  const navigation = useTypedNavigation<'Menu'>(); 
  const { logout } = useAuth();

  const handleProfilePress = () => {
    navigation.navigate('ProfileDetail');
  };

  const handleAccountSettingsPress = () => {
    navigation.navigate('EditAccountSettings');
  };

  const handleLogout = () => {
    Alert.alert(
      'ออกจากระบบ',
      'คุณต้องการออกจากระบบหรือไม่?',
      [
        {
          text: 'ยกเลิก',
          style: 'cancel',
        },
        {
          text: 'ออกจากระบบ',
          style: 'destructive',
          onPress: () => {
            logout();
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* User Profile Section */}
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>schaao</Text>
              <View style={styles.statusRow}>
                <View style={styles.statusDot}></View>
                <Text style={styles.statusText}>ออนไลน์</Text>
              </View>
            </View>
            <View />
            
            <TouchableOpacity style={styles.settingsButton} onPress={handleAccountSettingsPress}>
              <View style={styles.settingsIconContainer}>
                <Icon name="person" size={18} color="#6b7280" />
                <Icon name="settings" size={12} color="#6b7280" style={{ position: 'absolute', bottom: -2, right: -2 }} />
              </View>
              
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          
          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={styles.quickActionCard} onPress={handleProfilePress}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#dbeafe' }]}>
                <Icon name="person" size={24} color="#3b82f6" />
                </View>
              <Text style={styles.quickActionText}>ข้อมูส่วนตัว</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#dcfce7' }]}>
                <Icon name="restaurant" size={24} color="#22c55e" />
              </View>
              <Text style={styles.quickActionText}>เลือกแพลน</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#f3e8ff' }]}>
                <Icon name="analytics" size={24} color="#8b5cf6" />
              </View>
              <Text style={styles.quickActionText}>รายงาน</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>เมนูหลัก</Text>
          <View style={styles.menuCard}>
            
            <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]}>
              <View style={[styles.menuIcon, { backgroundColor: '#dbeafe' }]}>
                <Icon name="document-text" size={20} color="#3b82f6" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>กรอกข้อมูลครั้งแรก</Text>
                <Text style={styles.menuSubtitle}>กรอกข้อมูลส่วนตัวเพื่อเริ่มใช้งาน</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]}>
              <View style={[styles.menuIcon, { backgroundColor: '#dcfce7' }]}>
                <Icon name="restaurant" size={20} color="#22c55e" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>เลือกแพลนการกิน</Text>
                <Text style={styles.menuSubtitle}>เลือกแพลนอาหารที่เหมาะสมกับคุณ</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]}>
              <View style={[styles.menuIcon, { backgroundColor: '#fef3c7' }]}>
                <Icon name="analytics" size={20} color="#f59e0b" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>รายงานการกิน</Text>
                <Text style={styles.menuSubtitle}>ดูสถิติและรายงานการบริโภคอาหาร</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]}>
              <View style={[styles.menuIcon, { backgroundColor: '#f3e8ff' }]}>
                <Icon name="options" size={20} color="#8b5cf6" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>ตั้งค่าการรูปแบบการกิน</Text>
                <Text style={styles.menuSubtitle}>กำหนดรูปแบบการกินที่เหมาะสม</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]}>
              <View style={[styles.menuIcon, { backgroundColor: '#fed7aa' }]}>
                <Icon name="notifications" size={20} color="#f97316" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>ตั้งค่าการแจ้งเตือน</Text>
                <Text style={styles.menuSubtitle}>จัดการการแจ้งเตือนต่างๆ</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]}>
              <View style={[styles.menuIcon, { backgroundColor: '#e0e7ff' }]}>
                <Icon name="create" size={20} color="#6366f1" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>ตั้งค่าบันทึกการกิน</Text>
                <Text style={styles.menuSubtitle}>กำหนดวิธีการบันทึกอาหาร</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.menuIcon, { backgroundColor: '#ccfbf1' }]}>
                <Icon name="time" size={20} color="#14b8a6" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>ตั้งเวลามื้ออาหาร</Text>
                <Text style={styles.menuSubtitle}>กำหนดเวลาสำหรับแต่ละมื้อ</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Additional Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>อื่นๆ</Text>
          <View style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <View style={[styles.menuIcon, { backgroundColor: '#fecaca' }]}>
                <Icon name="log-out" size={20} color="#ef4444" />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: '#ef4444' }]}>ออกจากระบบ</Text>
                <Text style={[styles.menuSubtitle, { color: '#f87171' }]}>ลงชื่อออกจากบัญชี</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Version */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>
            GoodMeal App v1.0.0
          </Text>
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
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    padding: 24,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    backgroundColor: '#6366f1',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  profileGreeting: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    backgroundColor: '#22c55e',
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#16a34a',
  },
  settingsButton: {
    alignItems: 'center',
  },
  settingsIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    color: '#374151',
  },
  menuCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  versionSection: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#9ca3af',
  },
});

export default MenuScreen;