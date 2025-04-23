import React from 'react';
import * as Font from 'expo-font';
import { useFonts } from 'expo-font';
import { View, Text } from 'react-native';

type FontWrapperProps = {
  children: React.ReactNode;
};

export default function FontWrapper({ children }: FontWrapperProps) {
  const [fontsLoaded] = useFonts({
    'Prompt-Light': require('../assets/fonts/Prompt-Light.ttf'),
    'Prompt-Regular': require('../assets/fonts/Prompt-Regular.ttf'),
    'Prompt-Medium': require('../assets/fonts/Prompt-Medium.ttf'),
    'Prompt-SemiBold': require('../assets/fonts/Prompt-SemiBold.ttf'),
    'Prompt-Bold': require('../assets/fonts/Prompt-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading fonts...</Text>
      </View>
    );
  }

  return <>{children}</>;
}
