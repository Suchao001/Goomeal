import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const Header = () => {
  return (
    <LinearGradient
      colors={['#ffb800', '#ff9a33']}
       start={{ x: 0, y: 0 }}   
      end={{ x: 0, y: 1.5}}     
      style={styles.container}
    >
      <Text className="text-2xl mt-5 font-bold text-white font-promptRegular">GoodMeal</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,
    alignItems: 'center',
  },
});

export default Header;
