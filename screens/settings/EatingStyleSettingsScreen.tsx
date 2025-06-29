import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TouchableHighlight, TextInput, Image, Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../../hooks/Navigation';
import Header from '../material/Header';
import Menu from '../material/Menu';

const EatingStyleSettingsScreen = () => {
  const navigation = useTypedNavigation<'EatingStyleSettings'>();

  const imageMap: Record<string, any> = {
    foodtype1: require('../../assets/images/Foodtype_1.png'),
    foodtype2: require('../../assets/images/Foodtype_2.png'),
    foodtype3: require('../../assets/images/Foodtype_3.png'),
    foodtype4: require('../../assets/images/Foodtype_4.png'),
  };

  const foodTypeItems = [ 
    { label: 'อะไรก็ได้', content: 'กินได้ทุกอย่าง', value: 'omnivore', image: imageMap['foodtype1'] },
    { label: 'คีโต', content: 'ไม่กิน ธัญพืช,พืชตระกูลถั่ว,ผักที่เป็นแป้ง', value: 'keto', image: imageMap['foodtype2'] },
    { label: 'มังสวิรัติ', content: 'ไม่กิน เนื้อสัตว์', value: 'vegetarian', image: imageMap['foodtype3'] },
    { label: 'วีแกน', content: 'ไม่กิน ผลิตภัณฑ์ที่ทำจากสัตว์', value: 'vegan', image: imageMap['foodtype4'] },
  ];

  const allergicItems = ['กลูเตน', 'ถั่ว', 'ไข่', 'ปลา', 'ถั่วเหลือง', 'ถั่วต้นไม้', 'หอย', 'กุ้ง'];

  const [foodType, setFoodType] = useState(0);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [additional, setAdditional] = useState<string>('');

  const handleFoodType = (type: number) => {
    setFoodType(type);
  };

  const handleAddAllergic = (item: string) => {
    if (!allergies.includes(item)) {
      setAllergies((prevAllergies) => [...prevAllergies, item]);
    } else {
      setAllergies((prevAllergies) => prevAllergies.filter(allergy => allergy !== item));
    }
  };

  const handleAdditional = (item: string) => {
    setAdditional(item);
  };

  const handleSave = () => {
    Alert.alert(
      'บันทึกการตั้งค่า',
      'คุณต้องการบันทึกการเปลี่ยนแปลงหรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'บันทึก', 
          onPress: () => {
            Alert.alert('สำเร็จ', 'บันทึกการตั้งค่าเรียบร้อยแล้ว');
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-100">
   
      <KeyboardAwareScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={20}
      >
        <View className="flex-row items-center px-4 py-8 bg-white border-b border-gray-200">
          <TouchableOpacity className="mr-4 mt-5" onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text className="text-xl mt-5 font-bold text-gray-800">ตั้งค่ารูปแบบการกิน</Text>
        </View>

        <View className="bg-white mx-4 my-2 rounded-xl p-5 shadow-lg shadow-slate-800">
          <Text className="text-xl font-promptSemiBold text-gray-800 mb-2">รูปแบบการกิน</Text>
          <Text className="text-sm text-gray-600 mb-5 leading-5">เลือกรูปแบบการกินที่เหมาะกับคุณ</Text>
          
          <View className="gap-2">
            {foodTypeItems.map((item, index) => (
              <TouchableHighlight 
                key={index} 
                className="rounded-xl shadow-lg shadow-slate-800 bg-white mt-2"
                onPress={() => handleFoodType(index + 1)}
                underlayColor="#facc15"
                activeOpacity={1}
              >
                <View className={`w-full p-5 rounded-xl flex-row items-center gap-4 ${foodType === index + 1 ? 'border border-primary' : 'border border-transparent'}`}>
                  <Image source={item.image} className="w-8 h-8 rounded-lg" resizeMode="cover" />
                  <View className="flex-1">
                    <Text className="text-gray-800 text-lg font-promptMedium">{item.label}</Text>
                    <Text className="text-gray-600 text-sm font-promptLight">{item.content}</Text>
                  </View>
                </View>
              </TouchableHighlight>
            ))}
          </View>
        </View>

        <View className="bg-white mx-4 my-2 rounded-xl p-5 shadow-lg shadow-slate-800">
          <Text className="text-xl font-promptSemiBold text-gray-800 mb-2">รายการอาหารที่แพ้</Text>
          <Text className="text-sm text-gray-600 mb-5 leading-5">เลือกอาหารที่คุณแพ้หรือไม่สามารถกินได้</Text>
          
          <View className="flex-row flex-wrap justify-between gap-1">
            {allergicItems.map((item, index) => (
              <TouchableHighlight
                key={index}
                className={`rounded-3xl p-3 ${allergies.includes(item) ? 'border border-primary bg-white' : 'border border-transparent bg-gray-100'} min-w-[5rem]`}
                onPress={() => handleAddAllergic(item)}
                underlayColor="#e5e5e5"
              >
                <Text className="text-gray-800 text-lg font-promptLight text-center">{item}</Text>
              </TouchableHighlight>
            ))}
            <TouchableHighlight
              className="rounded-3xl p-3 bg-gray-100 shadow-sm min-w-[5rem]"
              onPress={() => {}}
              underlayColor="#e5e5e5"
            >
              <Text className="text-gray-800 text-lg font-promptLight text-center">+ เพิ่มเติม</Text>
            </TouchableHighlight>
          </View>
        </View>

        <View className="bg-white mx-4 my-2 rounded-xl p-5 shadow-lg shadow-slate-800">
          <Text className="text-xl font-promptSemiBold text-gray-800 mb-2">ความต้องการเพิ่มเติม</Text>
          <Text className="text-sm text-gray-600 mb-5 leading-5">ระบุความต้องการพิเศษเพิ่มเติม</Text>
          
          <View className="w-full bg-gray-100 rounded-xl p-4 h-40">
            <TextInput
              className="text-gray-800 text-lg font-promptLight"
              placeholder="พิมพ์ข้อความที่นี่..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={additional}
              onChangeText={handleAdditional}
            />
          </View>
        </View>

        <TouchableOpacity
          className="w-[95%] bg-primary rounded-xl p-4 justify-center items-center mx-auto mt-6 mb-6"
          onPress={handleSave}
        >
          <Text className="text-white text-lg font-promptBold">บันทึกการตั้งค่า</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>

    
    </View>
  );
};

export default EatingStyleSettingsScreen;
