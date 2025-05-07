import React from 'react';
import { View, Text } from 'react-native';

const Header = () => {
  return (
    <View className="w-full bg-orange-400 p-4 items-center">
      <Text className="text-2xl font-bold text-white">GoodMeal</Text>
    </View>
  );
};

export default Header;