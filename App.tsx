import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from 'AuthContext';
import { PersonalSetupProvider } from './contexts/PersonalSetupContext';
import FontWrapper from './components/FontWraper'; // ตรวจสะกดให้ตรงไฟล์
import AuthStack from 'AuthStack';
import AppStack from 'AppStack';
import { View, ActivityIndicator, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { LogBox } from 'react-native';
import { scheduleMealRemindersFromServer,initMealReminderRescheduler } from './utils/autoNotifications';
import './global.css';

// Handler พื้นฐาน
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function RootNavigator() {
  const { user, loading } = useAuth();


  useEffect(() => {
    if (!user) return;
    let booted = false;
    (async () => {
      try {
        if (booted) return;
        booted = true;
        await scheduleMealRemindersFromServer(); // ตั้ง “หลายเวลา/ทุกวัน” ที่นี่ที่เดียว
      } catch (err) {
        console.warn('Failed to boot meal reminders', err);
      }
    })();
    return () => { booted = true; };
  }, [user]);

    useEffect(() => {
  const sub = initMealReminderRescheduler(); 
  return () => { try { sub?.remove?.(); } catch {} };
}, []);


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
  
  return (
    <AuthProvider>
      <PersonalSetupProvider>
        <RootNavigator />
      </PersonalSetupProvider>
    </AuthProvider>
  );
}
