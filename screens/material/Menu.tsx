import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

type RootStackParamList = {
  Home: undefined;
  Chat: undefined;
  RecordFood: undefined;
  Calendar: undefined;
  Menu: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;


const Menu = () => {
  const navigation = useNavigation<NavigationProp>();
  return (
    <View style={styles.container}>
      {/* Home Icon */}
      <TouchableOpacity 
        onPress={() => navigation.navigate('Home')}
        style={styles.menuItem}
      >
        <Icon name="home" size={24} color="white" />
      </TouchableOpacity>

      {/* Chat Icon */}
      <TouchableOpacity 
        onPress={() => navigation.navigate('Chat')}
        style={styles.menuItem}
      >
        <Icon name="chatbubble" size={24} color="white" />
      </TouchableOpacity>

      {/* Record Food / Save Edit Icon */}
      <TouchableOpacity 
        onPress={() => navigation.navigate('RecordFood')}
        style={styles.menuItem}
      >
        <Icon name="create" size={24} color="white" />
      </TouchableOpacity>

      {/* Calendar Icon */}
      <TouchableOpacity 
        onPress={() => navigation.navigate('Calendar')}
        style={styles.menuItem}
      >
        <Icon name="calendar" size={24} color="white" />
      </TouchableOpacity>

      {/* Profile / Person Icon */}
      <TouchableOpacity 
        onPress={() => navigation.navigate('Menu')}
        style={styles.menuItem}
      >
        <Icon name="person" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffb800', // primary color
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingBottom: 20, // Add extra padding for safe area
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5, // For Android shadow
  },  menuItem: {
    alignItems: 'center',
  },
});

export default Menu;
