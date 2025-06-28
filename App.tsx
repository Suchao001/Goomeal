import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from 'AuthContext';
import { PersonalSetupProvider } from './contexts/PersonalSetupContext';
import FontWrapper from './components/FontWraper';
import AuthStack from 'AuthStack';
import AppStack from 'AppStack';

import { View, ActivityIndicator } from 'react-native';
import './global.css';

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
  return (
    <AuthProvider>
      <PersonalSetupProvider>
        <RootNavigator />
      </PersonalSetupProvider>
    </AuthProvider>
  );
}
