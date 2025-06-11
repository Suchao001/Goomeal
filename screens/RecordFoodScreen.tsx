import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from './material/Header';
import Menu from './material/Menu';

/**
 * RecordFoodScreen Component
 * หน้าบันทึกอาหาร - อยู่ระหว่างการพัฒนา
 */
const RecordFoodScreen = () => {
  return (
    <View style={styles.container}>
      <Header />
      
      <View style={styles.content}>
        <Text style={styles.title}>
          ✏️ บันทึกอาหาร
        </Text>
        <Text style={styles.subtitle}>
          ฟีเจอร์บันทึกอาหารอยู่ระหว่างการพัฒนา
        </Text>
      </View>

      <Menu />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
  },
});



export default RecordFoodScreen;
