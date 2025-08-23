import { View, Text, TouchableOpacity,TouchableHighlight } from 'react-native';
import { useTypedNavigation} from '../../hooks/Navigation';
import { ArrowLeft } from '../../components/GeneralMaterial';
import { useState } from 'react';
import { usePersonalSetup } from '../../contexts/PersonalSetupContext';


const PersonalPlanScreen2 = () => {
 
  // Navigation hook used but not assigned
  const navigation = useTypedNavigation<'PersonalPlan2'>(); 
  const { updateSetupData } = usePersonalSetup();
  
  const activityItems = [ // Spell-checker: disable
    { label: 'ไม่ออกกำลังกาย',content:'ไม่ค่อยได้ใช้กำลัง ทำงานอยู่กับโต๊ะเป็นส่วนมาก', value: 'low' },
    { label: 'ได้ออกกำลังกายบ้างนิดหน่อย',content:'ได้ออกไปใช้แรงออกกำลังกาย เล็กน้อย 3 วันต่อสัปดาห์', value: 'moderate' },
    { label: 'ออกกำลังกาย ระดับปานกลาง ',content:'ได้ออกไปออกกำลังกาย หรือ ใช้แรง อยู่เป็นประจำ', value: 'high' },
    { label: 'ออกกำลังกายเป็นหลัก',content:'ได้ออกกำลังกาย หรือเล่นกีฬาอยู่แทบทุกวัน', value: 'very high' },
    { label: 'ใช้ร่างกายอย่างหนัก',content:'ออกกำลังอย่างหนัก ไม่ว่าจะเป็นงาน กีฬา หรือ เป็นการเทรนร่างกาย', value: 'very high' }
  ];

  const [actLevel,setActLevel] =useState(0);
  
  const handleActLevel=(level:number)=>{
    setActLevel(level);
  }

  const handleContinue = () => {
    // ตรวจสอบว่าได้เลือกระดับกิจกรรมแล้วหรือไม่
    if (actLevel === 0) {
      alert('กรุณาเลือกระดับการทำกิจกรรมของคุณ');
      return;
    }

    // บันทึกข้อมูลลง Context
    updateSetupData({
      activity_level: activityItems[actLevel - 1].value as 'low' | 'moderate' | 'high' | 'very high'
    });
    
    navigation.navigate('PersonalPlan3');
  };

  return (
    <View className="flex-1 items-center bg-white p-6">
      {/* Back Arrow */}
      <ArrowLeft />

      {/* Header Text */}
      <Text className="text-3xl text-gray-800 mb-5 mt-20 font-promptSemiBold text-center w-5/6">
      กรอกข้อมูลในการสร้าง 
      แพลนในการกินอาหาร
      </Text>
      <Text className="text-gray-600 mb-6 font-promptMedium text-[20px] text-center ">
        ระดับการทำกิจกรรมของคุณ
      </Text>

      <View className="w-full mb-6 flex gap-3 p-4">
  {activityItems.map((item, index) => (
    <TouchableHighlight 
      key={index} 
      className='rounded-xl shadow-lg shadow-slate-800 bg-white' // Changed shadow-md to shadow-lg for stronger shadow
      onPress={() => handleActLevel(index + 1)}
      underlayColor="#facc15"
      activeOpacity={1}
    >
      <View className={`w-full p-5 rounded-xl  ${actLevel == index + 1 ? 'border-2 border-primary' : 'border border-transparent'}`}>
        <Text className="text-gray-800 text-lg font-promptMedium">{item.label}</Text>
        <Text className="text-gray-600 text-sm font-promptLight">{item.content}</Text>
      </View>
    </TouchableHighlight>
  ))}
</View>

      <TouchableOpacity
        className={`w-[95%] rounded-xl p-4 justify-center items-center absolute bottom-8 ${
          actLevel > 0 ? 'bg-primary' : 'bg-gray-400'
        }`}
        onPress={handleContinue}
        disabled={actLevel === 0}
      >
        <Text className="text-white text-lg font-promptBold">ต่อไป</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PersonalPlanScreen2;