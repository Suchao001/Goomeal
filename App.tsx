import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from 'AuthContext';
import { PersonalSetupProvider } from './contexts/PersonalSetupContext';
import FontWrapper from './components/FontWraper';
import AuthStack from 'AuthStack';
import AppStack from 'AppStack';
import { Platform, View, ActivityIndicator } from 'react-native';
import * as Notifications from 'expo-notifications';
import './global.css';
import { LogBox } from 'react-native';

// Ignore specific log notifications

// LogBox.ignoreLogs(['Setting a timer']);
// console.error = () => {};
// console.warn = () => {}; 

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const ANDROID_CHANNEL_ID = 'general-noti';


function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <FontWrapper>
        {user ? <AppStack /> : <AuthStack />}
      </FontWrapper>
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    const setupNoti = async () => {
      if (Platform.OS === 'android') {
        // Android 13+ จะมี prompt ขอสิทธิ์ (ตัวนี้โอเคสำหรับ Android ด้วย)
        await Notifications.requestPermissionsAsync();

        // สร้าง/อัปเดต Notification Channel (ต้องมีสำหรับ Android)
        await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
          name: 'General',
          importance: Notifications.AndroidImportance.HIGH,
          sound: 'default',
          enableVibrate: true,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#ffb800',
        });
      }
    };
    setupNoti();
    
    // Notification scheduling disabled temporarily for testing
    // let sub: Notifications.Subscription | undefined;
    // const boot = async () => {
    //   sub = initMealReminderRescheduler();
    //   await scheduleMealRemindersFromServer();
    // };
    // boot();
    // return () => {
    //   try { sub?.remove?.(); } catch {}
    // };

  }, []);

  return (
    <AuthProvider>
      <PersonalSetupProvider>
        <RootNavigator />
      </PersonalSetupProvider>
    </AuthProvider>
  );
}
