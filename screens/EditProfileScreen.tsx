import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import DropDownPicker from 'react-native-dropdown-picker';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * EditProfileScreen Component
 * หน้าแก้ไขโปรไฟล์ - แก้ไขข้อมูลส่วนตัว
 */
const EditProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  
  // State for form data
  const [height, setHeight] = useState('180');
  const [weight, setWeight] = useState('75');
  const [age, setAge] = useState('20');
  const [gender, setGender] = useState('ชาย');
  const [bmiReference, setBmiReference] = useState('ชาย');
  const [username, setUsername] = useState('suchao');
  
  // Dropdown states
  const [openHeight, setOpenHeight] = useState(false);
  const [openWeight, setOpenWeight] = useState(false);
  const [openAge, setOpenAge] = useState(false);

  // Height options (100-250 cm)
  const heightItems = Array.from({ length: 151 }, (_, i) => ({
    label: `${100 + i} cm`,
    value: `${100 + i}`,
  }));

  // Weight options (30-150 kg)
  const weightItems = Array.from({ length: 121 }, (_, i) => ({
    label: `${30 + i} kg`,
    value: `${30 + i}`,
  }));

  // Age options (10-100 years)
  const ageItems = Array.from({ length: 91 }, (_, i) => ({
    label: `${10 + i} ปี`,
    value: `${10 + i}`,
  }));

  const handleSave = () => {
    // Here you would typically save the data to your backend
    console.log('Saving profile data:', {
      height,
      weight,
      age,
      gender,
      bmiReference,
      username
    });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fbbf24" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Icon name="person-circle" size={32} color="#9ca3af" />
          <Text style={styles.headerTitle}>แก้ไขโปรไฟล์</Text>
        </View>
        
        <Text style={styles.timeText}>9:41</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Form Container */}
        <View style={styles.formContainer}>
          
          {/* Height Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ส่วนสูง</Text>
            <DropDownPicker
              open={openHeight}
              value={height}
              items={heightItems}
              setOpen={setOpenHeight}
              setValue={setHeight}
              placeholder="เลือกส่วนสูง"
              containerStyle={styles.dropdownContainer}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownList}
              textStyle={styles.dropdownText}
              zIndex={3000}
              zIndexInverse={1000}
            />
          </View>

          {/* Weight Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>น้ำหนัก</Text>
            <DropDownPicker
              open={openWeight}
              value={weight}
              items={weightItems}
              setOpen={setOpenWeight}
              setValue={setWeight}
              placeholder="เลือกน้ำหนัก"
              containerStyle={styles.dropdownContainer}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownList}
              textStyle={styles.dropdownText}
              zIndex={2000}
              zIndexInverse={2000}
            />
          </View>

          {/* Age Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>อายุ</Text>
            <DropDownPicker
              open={openAge}
              value={age}
              items={ageItems}
              setOpen={setOpenAge}
              setValue={setAge}
              placeholder="เลือกอายุ"
              containerStyle={styles.dropdownContainer}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownList}
              textStyle={styles.dropdownText}
              zIndex={1000}
              zIndexInverse={3000}
            />
          </View>

          {/* Gender Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>เพศ</Text>
            <View style={styles.genderContainer}>
              {['ชาย', 'หญิง', 'อื่นๆ'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.genderButton,
                    gender === option && styles.genderButtonSelected
                  ]}
                  onPress={() => setGender(option)}
                >
                  <Text style={[
                    styles.genderButtonText,
                    gender === option && styles.genderButtonTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* BMI Reference Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ดัชนีมวลกาย</Text>
            <View style={styles.genderContainer}>
              {['ชาย', 'หญิง', 'อื่นๆ'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.genderButton,
                    bmiReference === option && styles.genderButtonSelected
                  ]}
                  onPress={() => setBmiReference(option)}
                >
                  <Text style={[
                    styles.genderButtonText,
                    bmiReference === option && styles.genderButtonTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Username Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ชื่อผู้ใช้</Text>
            <View style={styles.usernameContainer}>
              <TextInput
                style={styles.usernameInput}
                value={username}
                onChangeText={setUsername}
                placeholder="ชื่อผู้ใช้"
                placeholderTextColor="#9ca3af"
              />
              <Icon name="chevron-forward" size={20} color="#fbbf24" />
            </View>
          </View>

          {/* Note */}
          <View style={styles.noteContainer}>
            <Text style={styles.noteTitle}>หมายเหตุ: แก้ไขข้อมูลส่วนตัว</Text>
            <Text style={styles.noteSubtitle}>แก้ไขข้อมูลส่วนตัว</Text>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>บันทึก</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'white',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  formContainer: {
    backgroundColor: 'white',
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  dropdownContainer: {
    height: 50,
  },
  dropdown: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
  },
  dropdownList: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dropdownText: {
    fontSize: 16,
    color: '#374151',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
  },
  genderButtonSelected: {
    backgroundColor: '#fbbf24',
  },
  genderButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  genderButtonTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  usernameInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  noteContainer: {
    marginTop: 10,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  noteSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  saveButton: {
    backgroundColor: '#fbbf24',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;