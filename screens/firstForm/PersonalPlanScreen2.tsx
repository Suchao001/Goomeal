import { View, Text, TouchableOpacity,TouchableHighlight } from 'react-native';
import { useTypedNavigation} from '../../hooks/Navigation';
import { ArrowLeft } from '../../components/GeneralMaterial';
import { useState } from 'react';


const PersonalPlanScreen2 = () => {
 
  // Navigation hook used but not assigned
  const navigation = useTypedNavigation<'PersonalPlan2'>(); 
  const activityItems = [ // Spell-checker: disable
    { label: 'ไม่ออกกำลังกาย',content:'ไม่ค่อยได้ใช้กำลัง ทำงานอยู่กับโต๊ะเป็นส่วนมาก', value: 'none' },
    { label: 'ได้ออกกำลังกายบ้างนิดหน่อย',content:'ได้ออกไปใช้แรงออกกำลังกาย เล็กน้อย 3 วันต่อสัปดาห์', value: 'none' },
    { label: 'ออกกำลังกาย ระดับปานกลาง ',content:'ได้ออกไปออกกำลังกาย หรือ ใช้แรง อยู่เป็นประจำ', value: 'none' },
    { label: 'ออกกำลังกายเป็นหลัก',content:'ได้ออกกำลังกาย หรือเล่นกีฬาอยู่แทบทุกวัน', value: 'none' },
    { label: 'ใช้ร่างกายอย่างหนัก',content:'ออกกำลังอย่างหนัก ไม่ว่าจะเป็นงาน กีฬา หรือ เป็นการเทรนร่างกาย', value: 'none' }
  ];

  const [actLevel,setActLevel] =useState(1);
  
  const handleActLevel=(level:number)=>{
    setActLevel(level);
  }

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

      <View className="w-full mb-6 flex gap-1 p-4">
  {activityItems.map((item, index) => (
    <TouchableHighlight 
      key={index} 
      className='rounded-2xl shadow-lg shadow-slate-800 bg-white' // Changed shadow-md to shadow-lg for stronger shadow
      onPress={() => handleActLevel(index + 1)}
      underlayColor="#facc15"
      activeOpacity={1}
    >
      <View className={`w-full p-5 rounded-2xl  ${actLevel == index + 1 ? 'border border-yellow-400' : 'border border-transparent'}`}>
        <Text className="text-gray-800 text-lg font-promptMedium">{item.label}</Text>
        <Text className="text-gray-600 text-sm">{item.content}</Text>
      </View>
    </TouchableHighlight>
  ))}
</View>

      <TouchableOpacity
        className="w-[95%] bg-yellow-500 rounded-lg p-4 justify-center items-center"
        onPress={()=>navigation.navigate('PersonalPlan3')}
      >
        <Text className="text-white text-lg font-promptBold">ต่อไป</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PersonalPlanScreen2;