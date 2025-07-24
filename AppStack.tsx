
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen, ChatScreen, CalendarScreen } from './screens/home';
import { RecordFoodScreen, EatingBlogScreen, FoodMenuScreen, SuggestionMenuScreen, MealPlanScreen,MealPlanEditScreen, SearchFoodForAdd, AddNewFoodScreen } from './screens/food';
import MenuScreen from './screens/MenuScreen';
import { ProfileDetailScreen, EditProfileScreen, EditAccountSettingsScreen } from './screens/profile';
import PersonalSetupScreen from './screens/firstForm/PersonalSetupScreen';
import PersonalPlanScreen1 from './screens/firstForm/PersonalPlanScreen1';
import PersonalPlanScreen2 from './screens/firstForm/PersonalPlanScreen2';
import PersonalPlanScreen3 from './screens/firstForm/PersonalPlanScreen3';
import PersonalPlanScreen4 from './screens/firstForm/PersonalPlanScreen4';
import PersonalDataSummaryScreen from './screens/firstForm/PersonalDataSummaryScreen';
import { FirstTimeSetupScreen, PlanSelectionScreen } from './screens/setup';
import { EatingReportScreen ,WeeklyReportScreen} from './screens/reports';
import { EatingStyleSettingsScreen, NotificationSettingsScreen, RecordSettingsScreen, MealTimeSettingsScreen } from './screens/settings';
import OptionPlanScreen from './screens/OptionPlanScreen';
import SelectGlobalPlan from './screens/SelectGlobalPlan';
import SeeMoreGlobalPlans from './screens/SeeMoreGlobalPlans';
import GlobalPlanMeal from './screens/GlobalPlanMeal';

const Stack = createNativeStackNavigator();
export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main App Screens */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="RecordFood" component={RecordFoodScreen} />
      <Stack.Screen name="Calendar" component={CalendarScreen} />      
      <Stack.Screen name="Menu" component={MenuScreen} />      
      <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />    
      <Stack.Screen name="EditAccountSettings" component={EditAccountSettingsScreen} />     
      <Stack.Screen name="EatingBlog" component={EatingBlogScreen} />        
      <Stack.Screen name="FoodMenu" component={FoodMenuScreen} />
      <Stack.Screen name="SuggestionMenu" component={SuggestionMenuScreen} />
      <Stack.Screen name="MealPlan" component={MealPlanScreen} />
      <Stack.Screen name="MealPlanEdit" component={MealPlanEditScreen} />
      <Stack.Screen name="SearchFoodForAdd" component={SearchFoodForAdd} /> 
      <Stack.Screen name="AddNewFood" component={AddNewFoodScreen} />
        {/* Menu Sub-screens */}
      <Stack.Screen name="FirstTimeSetup" component={FirstTimeSetupScreen} />
      <Stack.Screen name="PlanSelection" component={PlanSelectionScreen} />
      <Stack.Screen name="EatingReport" component={EatingReportScreen} />
      <Stack.Screen name="WeeklyReport" component={WeeklyReportScreen} />
      
      {/* Settings Screens */}
      <Stack.Screen name="EatingStyleSettings" component={EatingStyleSettingsScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="RecordSettings" component={RecordSettingsScreen} />
      <Stack.Screen name="MealTimeSettings" component={MealTimeSettingsScreen} />
      
      {/* Personal Setup Screens */}
      <Stack.Screen name="PersonalSetup" component={PersonalSetupScreen} />
      <Stack.Screen name="PersonalPlan1" component={PersonalPlanScreen1} />
      <Stack.Screen name="PersonalPlan2" component={PersonalPlanScreen2} />
      <Stack.Screen name="PersonalPlan3" component={PersonalPlanScreen3} />
      <Stack.Screen name="PersonalPlan4" component={PersonalPlanScreen4} />
      <Stack.Screen name="PersonalDataSummary" component={PersonalDataSummaryScreen} />

      <Stack.Screen name="OptionPlan" component={OptionPlanScreen} />
      <Stack.Screen name="SelectGlobalPlan" component={SelectGlobalPlan} />
      <Stack.Screen name="SeeMoreGlobalPlans" component={SeeMoreGlobalPlans} />
      <Stack.Screen name="GlobalPlanMeal" component={GlobalPlanMeal} />
    </Stack.Navigator>
  );
}
