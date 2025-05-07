import { View, Text, TouchableOpacity, TouchableHighlight, TextInput, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useTypedNavigation } from '../../hooks/Navigation';
import { ArrowLeft } from '../../components/GeneralMaterial';
import { useState } from 'react';

const PersonalPlanScreen4 = () => {
  const navigation = useTypedNavigation<'PersonalPlan4'>();
  const allergicItems = ['กลูเตน', 'ถั่ว', 'ไข่', 'ปลา', 'ถั่วเหลือง', 'ถั่วต้นไม้', 'หอย', 'กุ้ง'];
  const [allergies, setAllergies] = useState<string[]>([]);
  const [additional, setAdditional] = useState<string | undefined>('');

  const handleAdditional = (item :string) =>{
    setAdditional(item);
  }

  const handleAddAllergic = (item: string) => {
    if (!allergies.includes(item)) {
      setAllergies((prevAllergies) => [...prevAllergies, item]);
    } else {
      setAllergies((prevAllergies) => prevAllergies.filter(allergy => allergy !== item));
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={20}
      style={{ flex: 1, backgroundColor: 'white' }}
    >
      <View className="flex-1 items-center bg-white p-6">
        <ArrowLeft />
        <Text className="text-3xl text-gray-800 mb-5 mt-20 font-promptSemiBold text-center w-5/6">
          กรอกข้อมูลในการสร้าง แพลนในการกินอาหาร
        </Text>
        <Text className="text-gray-600 mb-6 font-promptMedium text-[20px] text-center">
          รายการอาหารที่คุณแพ้
        </Text>

        <View className="w-full mb-6 flex-row flex-wrap justify-between gap-1 p-4">
          {allergicItems.map((item, index) => (
            <TouchableHighlight
              key={index}
              className={`rounded-3xl p-3 ${allergies.includes(item) ? 'border border-primary bg-white' : 'border border-transparent bg-gray-100'} min-w-[5rem]`}
              onPress={() => handleAddAllergic(item)}
              underlayColor="#e5e5e5"
            >
              <Text className="text-gray-800 text-lg font-promptLight text-center">
                {item}
              </Text>
            </TouchableHighlight>
          ))}
          <TouchableHighlight
            className="rounded-3xl p-3 bg-gray-100 shadow-sm min-w-[5rem]"
            onPress={() => {/* Handle add more */}}
            underlayColor="#e5e5e5"
          >
            <Text className="text-gray-800 text-lg font-promptLight text-center">
              + เพิ่มเติม
            </Text>
          </TouchableHighlight>
        </View>

        <Text className="text-gray-600 mb-6 font-promptMedium text-[20px] text-center">
          ความต้องการเพิ่มเติม
        </Text>

        <View className="w-full bg-gray-100 rounded-2xl p-4 h-40 mb-10">
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

        <TouchableOpacity
          className="w-[95%] bg-primary rounded-2xl p-4 justify-center items-center mt-[6.5rem]"
          onPress={() => navigation.navigate('Home')}
        >
          <Text className="text-white text-lg font-promptBold">ต่อไป</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default PersonalPlanScreen4;