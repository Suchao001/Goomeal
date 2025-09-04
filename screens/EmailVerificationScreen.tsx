import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTypedNavigation } from '../hooks/Navigation';
import { useAuth } from '../AuthContext';
import { apiClient } from '../utils/apiClient';

const PRIMARY = '#ffb800';

const EmailVerificationScreen = () => {
  const [loading, setLoading] = useState(false);
  const navigation = useTypedNavigation();
  const { user, reloadUser } = useAuth();

  const isVerified = user?.is_verified || false;
  const userEmail = user?.email || '';
  const userName = user?.username || '';

  

  const resendVerificationEmail = async () => {
    if (!userEmail) {
      Alert.alert('ข้อผิดพลาด', 'ไม่พบข้อมูลอีเมล');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/user/resend-verification', {
        email: userEmail
      });

      if (response.data.success) {
        Alert.alert(
          'ส่งอีเมลสำเร็จ',
          'เราได้ส่งลิงก์ยืนยันไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบอีเมลและกดยืนยัน',
          [{ text: 'ตกลง' }]
        );
        // Reload user data after successful resend to check for any updates
        setTimeout(() => {
          reloadUser();
        }, 1000);
      } else {
        Alert.alert('ข้อผิดพลาด', response.data.message || 'ไม่สามารถส่งอีเมลได้');
      }
    } catch (error: any) {
      console.error('Error resending verification email:', error);
      Alert.alert(
        'ข้อผิดพลาด',
        error.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งอีเมล'
      );
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  if (isVerified) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />
        <LinearGradient colors={[PRIMARY, '#e6a600']} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ยืนยันอีเมล</Text>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={80} color={PRIMARY} />
            </View>
            
            <Text style={styles.successTitle}>✅ ยืนยันเรียบร้อย!</Text>
            <Text style={styles.successMessage}>
              อีเมลของคุณได้รับการยืนยันแล้ว{'\n'}
              ตอนนี้คุณสามารถใช้งานได้เต็มรูปแบบ
            </Text>

            <View style={styles.emailInfo}>
              <Ionicons name="mail" size={20} color="#666" />
              <Text style={styles.emailText}>{userEmail}</Text>
            </View>

            <TouchableOpacity style={styles.backToMenuButton} onPress={goBack}>
              <LinearGradient colors={[PRIMARY, '#e6a600']} style={styles.buttonGradient}>
                <Text style={styles.buttonText}>กลับสู่เมนูหลัก</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />
      <LinearGradient colors={[PRIMARY, '#e6a600']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ยืนยันอีเมล</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.verificationContainer}>
          <View style={styles.warningIcon}>
            <Ionicons name="mail-unread" size={80} color={PRIMARY} />
          </View>
          
          <Text style={styles.warningTitle}>⚠️ ยังไม่ได้ยืนยันอีเมล</Text>
          <Text style={styles.warningMessage}>
            กรุณายืนยันอีเมลเพื่อใช้งานฟีเจอร์ทั้งหมด{'\n'}
            ของ GoodMeal อย่างเต็มรูปแบบ
          </Text>

          <View style={styles.emailInfo}>
            <Ionicons name="mail" size={20} color="#666" />
            <Text style={styles.emailText}>{userEmail}</Text>
          </View>

          <View style={styles.instructionBox}>
            <Text style={styles.instructionTitle}>📧 วิธีการยืนยัน:</Text>
            <Text style={styles.instructionText}>
              1. กดปุ่ม "ส่งอีเมลยืนยัน" ด้านล่าง{'\n'}
              2. ตรวจสอบอีเมลของคุณ{'\n'}
              3. กดลิงก์ยืนยันในอีเมล{'\n'}
              4. กลับมาที่แอปนี้
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.resendButton} 
            onPress={resendVerificationEmail}
            disabled={loading}
          >
            <LinearGradient colors={[PRIMARY, '#e6a600']} style={styles.buttonGradient}>
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons name="mail" size={20} color="white" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>ส่งอีเมลยืนยัน</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backToMenuButton} onPress={goBack}>
            <Text style={styles.backButtonText}>กลับสู่เมนูหลัก</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  successContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  verificationContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successIcon: {
    marginBottom: 20,
  },
  warningIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PRIMARY,
    marginBottom: 15,
    textAlign: 'center',
  },
  warningTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PRIMARY,
    marginBottom: 15,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  warningMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  emailInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  emailText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  instructionBox: {
    backgroundColor: '#fff3cd',
    padding: 20,
    borderRadius: 10,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  resendButton: {
    width: '100%',
    marginBottom: 15,
  },
  backToMenuButton: {
    width: '100%',
    marginTop: 10,
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    padding: 15,
    textDecorationLine: 'underline',
  },
});

export default EmailVerificationScreen;
