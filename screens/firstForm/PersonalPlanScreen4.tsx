import { View, Text, TouchableOpacity, TouchableHighlight, TextInput, Platform, Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useTypedNavigation } from '../../hooks/Navigation';
import { ArrowLeft } from '../../components/GeneralMaterial';
import { useState } from 'react';
import { usePersonalSetup } from '../../contexts/PersonalSetupContext';

const PersonalPlanScreen4 = () => {
  const navigation = useTypedNavigation<'PersonalPlan4'>();
  const { updateSetupData, getSummary } = usePersonalSetup();
  
  const [allergicItems, setAllergicItems] = useState(['กลูเตน', 'ถั่ว', 'ไข่', 'ปลา', 'ถั่วเหลือง', 'ถั่วต้นไม้', 'หอย', 'กุ้ง']);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [additional, setAdditional] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [customAllergy, setCustomAllergy] = useState<string>('');

  const handleAdditional = (item: string) => {
    setAdditional(item);
  }

  const handleAddAllergic = (item: string) => {
    if (!allergies.includes(item)) {
      setAllergies((prevAllergies) => [...prevAllergies, item]);
    } else {
      setAllergies((prevAllergies) => prevAllergies.filter(allergy => allergy !== item));
    }
  };

  const handleAddMoreAllergy = () => {
    setShowCustomInput(true);
  };

  const handleAddCustomAllergy = () => {
    if (customAllergy.trim() && !allergicItems.includes(customAllergy.trim())) {
      setAllergicItems((prevItems) => [...prevItems, customAllergy.trim()]);
      setCustomAllergy('');
      setShowCustomInput(false);
    } else if (allergicItems.includes(customAllergy.trim())) {
      Alert.alert('แจ้งเตือน', 'รายการอาหารนี้มีอยู่แล้ว');
    } else {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกชื่ออาหารที่แพ้');
    }
  };

  const handleCancelCustomInput = () => {
    setCustomAllergy('');
    setShowCustomInput(false);
  };

  const handleContinue = () => {
    // บันทึกข้อมูลลง Context
    updateSetupData({
      dietary_restrictions: allergies,
      additional_requirements: additional
    });

    // ไปยังหน้าสรุปข้อมูล
    navigation.navigate('PersonalDataSummary');
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
            onPress={handleAddMoreAllergy}
            underlayColor="#e5e5e5"
          >
            <Text className="text-gray-800 text-lg font-promptLight text-center">
              + เพิ่มเติม
            </Text>
          </TouchableHighlight>
        </View>

        {/* Custom Allergy Input */}
        {showCustomInput && (
          <View className="w-full mb-6 p-4">
            <Text className="text-gray-700 mb-3 font-promptMedium text-lg">
              เพิ่มอาหารที่แพ้
            </Text>
            <View className="flex-row items-center space-x-2 gap-1">
              <TextInput
                className="flex-1 bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-promptLight"
                placeholder="กรอกชื่ออาหารที่แพ้..."
                value={customAllergy}
                onChangeText={setCustomAllergy}
                autoFocus={true}
              />
              <TouchableOpacity
                className="bg-primary rounded-lg px-4 py-3"
                onPress={handleAddCustomAllergy}
              >
                <Text className="text-white font-promptMedium">เพิ่ม</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-gray-300 rounded-lg px-4 py-3"
                onPress={handleCancelCustomInput}
              >
                <Text className="text-gray-700 font-promptMedium">ยกเลิก</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Selected Allergies Display */}
     

        <Text className="text-gray-600 mb-6 font-promptMedium text-[20px] text-center">
          ความต้องการเพิ่มเติม
        </Text>

        <View className="w-full bg-gray-100 rounded-xl p-4 h-40 mb-10">
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
          className="w-[95%] bg-primary rounded-xl p-4 justify-center items-center mt-[6.5rem]"
          onPress={handleContinue}
        >
          <Text className="text-white text-lg font-promptBold">ต่อไป</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default PersonalPlanScreen4;