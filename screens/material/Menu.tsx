import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  RecordFood: undefined;
  Calendar: undefined;
  PersonalPlan1: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Menu = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View className="absolute bottom-0 w-full bg-primary flex-row justify-around py-4 rounded-t-[25px]">
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Text className="text-white text-2xl">🏠</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('RecordFood')}>
        <Text className="text-white text-2xl">+</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
        <Text className="text-white text-2xl">📅</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Menu;
