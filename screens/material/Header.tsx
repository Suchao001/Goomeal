import React from 'react';
import { View, Text } from 'react-native';

const Header = () => {
  return (
    <View className="w-full bg-primary p-4 items-center">
      <Text className="text-2xl mt-5 font-bold text-white">GoodMeal</Text>
    </View>
  );
};

export default Header;
