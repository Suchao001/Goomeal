import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTypedNavigation, useTypedRoute } from '../../hooks/Navigation';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const Menu = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<any>();
  
  const getIconColor = (routeName: string) => {
    return route.name === routeName ? '#4a4a4a' : '#fff';
  };
  
  const getIconStyle = (routeName: string) => {
    return route.name === routeName ? styles.activeMenuItem : styles.menuItem;
  };
  
  return (
    <LinearGradient
      colors={['#ffb800', '#ff9a33']}
      start={{ x: 0, y: 0 }}   
      end={{ x: 0, y: 1.5 }}     
      style={styles.container}
    >
      {/* Home Icon */}
      <TouchableOpacity 
        onPress={() => navigation.navigate('Home')}
        style={getIconStyle('Home')}
      >
        <Icon name="home" size={24} color={getIconColor('Home')} />
      </TouchableOpacity>

      {/* Chat Icon */}
      <TouchableOpacity 
        onPress={() => navigation.navigate('ChatScreen')}
        style={getIconStyle('ChatScreen')}
      >
        <Icon name="chatbubble" size={24} color={getIconColor('ChatScreen')} />
      </TouchableOpacity>

      {/* Record Food / Save Edit Icon */}
      <TouchableOpacity 
        onPress={() => navigation.navigate('RecordFood')}
        style={getIconStyle('RecordFood')}
      >
        <Icon name="create" size={24} color={getIconColor('RecordFood')} />
      </TouchableOpacity>

      {/* Calendar Icon */}
      <TouchableOpacity 
        onPress={() => navigation.navigate('Calendar')}
        style={getIconStyle('Calendar')}
      >
        <Icon name="calendar" size={24} color={getIconColor('Calendar')} />
      </TouchableOpacity>

      {/* Profile / Person Icon */}
      <TouchableOpacity 
        onPress={() => navigation.navigate('Menu')}
        style={getIconStyle('Menu')}
      >
        <Icon name="person" size={24} color={getIconColor('Menu')} />
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 5, 
  },  
  menuItem: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
  },
  activeMenuItem: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
   
    transform: [{ scale: 1.1 }],
  },
});

export default Menu;
