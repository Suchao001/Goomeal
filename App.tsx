import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import './global.css';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types/navigation';
import SplashScreen from './screens/SplashScreen';
import SlideScreen from './screens/SlideScreen';
import LoginScreen from './screens/LoginScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Slides" component={SlideScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        {/* <Stack.Screen name="Home" component={HomeScreen} /> */}
        {/* <Stack.Screen name="Profile" component={ProfileScreen} /> */}
        {/* <Stack.Screen name="Settings" component={SettingsScreen} /> */}

      </Stack.Navigator>
    </NavigationContainer>
  );
}