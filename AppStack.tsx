
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './screens/home/HomeScreen';
import PersonalSetupScreen from './screens/firstForm/PersonalSetupScreen';
import PersonalPlanScreen1 from './screens/firstForm/PersonalPlanScreen1';
import PersonalPlanScreen2 from './screens/firstForm/PersonalPlanScreen2';
import PersonalPlanScreen3 from './screens/firstForm/PersonalPlanScreen3';
import PersonalPlanScreen4 from './screens/firstForm/PersonalPlanScreen4';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="PersonalSetup" component={PersonalSetupScreen} />
      <Stack.Screen name="PersonalPlan1" component={PersonalPlanScreen1} />
      <Stack.Screen name="PersonalPlan2" component={PersonalPlanScreen2} />
      <Stack.Screen name="PersonalPlan3" component={PersonalPlanScreen3} />
      <Stack.Screen name="PersonalPlan4" component={PersonalPlanScreen4} />
    </Stack.Navigator>
  );
}
