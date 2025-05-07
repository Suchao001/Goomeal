import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import './global.css';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types/navigation';
import SplashScreen from './screens/SplashScreen';
import SlideScreen from './screens/SlideScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import FontWrapper from 'components/FontWraper';
import {ForgotPasswordScreen,ForgotPasswordScreen_after} from 'screens/ForgotPasswordScreen'
import PersonalSetupScreen from './screens/firstForm/PersonalSetupScreen';
import PersonalPlanScreen1 from './screens/firstForm/PersonalPlanScreen1';
import PersonalPlanScreen2 from './screens/firstForm/PersonalPlanScreen2';
import PersonalPlanScreen3 from './screens/firstForm/PersonalPlanScreen3';
import PersonalPlanScreen4 from './screens/firstForm/PersonalPlanScreen4';
import Home from './screens/home/HomeScreen';



const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {

  
  return (
    <NavigationContainer>
    
      <FontWrapper>
      <Stack.Navigator 
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Slides" component={SlideScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ForgotPassword_after" component={ForgotPasswordScreen_after} />
        <Stack.Screen name="PersonalSetup" component={PersonalSetupScreen} />
        <Stack.Screen name="PersonalPlan1" component={PersonalPlanScreen1} />
        <Stack.Screen name="PersonalPlan2" component={PersonalPlanScreen2} />
        <Stack.Screen name="PersonalPlan3" component={PersonalPlanScreen3} />
        <Stack.Screen name="PersonalPlan4" component={PersonalPlanScreen4} />
        <Stack.Screen name="Home" component={Home} />
        
      </Stack.Navigator>
    </FontWrapper>
    </NavigationContainer>
  );
}