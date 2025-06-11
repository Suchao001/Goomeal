import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
// import { AuthProvider, useAuth } from 'AuthContext'; // ปิดการใช้งาน Auth ชั่วคราวเพื่อพัฒนา UI
import FontWrapper from './components/FontWraper';
// import AuthStack from 'AuthStack'; // ปิดการใช้งาน AuthStack ชั่วคราว
import AppStack from 'AppStack';

import { View, ActivityIndicator } from 'react-native';
import './global.css';

// ปิดการทำงานของ Authentication ชั่วคราวเพื่อพัฒนา UI
function RootNavigator() {
  // const { user, loading } = useAuth(); // ปิดการใช้งาน useAuth ชั่วคราว

  // ปิดการแสดง loading screen ชั่วคราว
  // if (loading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <ActivityIndicator size="large" />
  //     </View>
  //   );
  // }

  return (
    <NavigationContainer>
      <FontWrapper>
        {/* ปิดการเช็ค authentication ชั่วคราว - แสดงหน้า AppStack (Home) โดยตรง */}
        <AppStack />
        {/* {user ? <AppStack /> : <AuthStack />} */}
      </FontWrapper>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    // ปิดการใช้งาน AuthProvider ชั่วคราวเพื่อพัฒนา UI
    // <AuthProvider>
      <RootNavigator />
    // </AuthProvider>
  );
}
