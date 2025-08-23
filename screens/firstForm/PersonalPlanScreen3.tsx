import { View, Text, TouchableOpacity,TouchableHighlight ,Image} from 'react-native';
import { useTypedNavigation} from '../../hooks/Navigation';
import { ArrowLeft } from '../../components/GeneralMaterial';
import { useState } from 'react';
import { usePersonalSetup } from '../../contexts/PersonalSetupContext';


const PersonalPlanScreen3 = () => {
  const navigation =useTypedNavigation<'PersonalPlan3'>(); 
  const { updateSetupData } = usePersonalSetup();

  const imageMap: Record<string, any> = {
    foodtype1: require('../../assets/images/Foodtype_1.png'),
    foodtype2: require('../../assets/images/Foodtype_2.png'),
    foodtype3: require('../../assets/images/Foodtype_3.png'),
    foodtype4: require('../../assets/images/Foodtype_4.png'),
  };

  const foodTypeItems = [ 
    { label: 'อะไรก็ได้',content:'กินได้ทุกอย่าง', value: 'omnivore' ,image:imageMap['foodtype1']},
    { label: 'คีโต',content:'ไม่กิน ธัญพืช,พืชตระกูลถั่ว,ผักที่เป็นแป้ง', value: 'keto',image:imageMap['foodtype2']},
    { label: 'มังสวิรัติ ',content:'ไม่กิน เนื้อสัตว์', value: 'vegetarian' ,image:imageMap['foodtype3']},
    { label: 'วีแกน',content:'ไม่กิน ผลิตภัณฑ์ที่ทำจากสัตว์', value: 'vegan' ,image:imageMap['foodtype4']},
  ];

  const [foodType,setFoodType] =useState(0);

  const handleFoodType=(type:number)=>{
    setFoodType(type);
  }

  const handleContinue = () => {
    // ตรวจสอบว่าได้เลือกประเภทการกินแล้วหรือไม่
    if (foodType === 0) {
      alert('กรุณาเลือกประเภทการกินของคุณ');
      return;
    }

    // บันทึกข้อมูลลง Context
    updateSetupData({
      eating_type: foodTypeItems[foodType - 1].value as 'omnivore' | 'keto' | 'vegetarian' | 'vegan' | 'other'
    });
    
    navigation.navigate('PersonalPlan4');
  };

  return (
    <View className="flex-1 items-center bg-white p-6 relative  ">
      {/* Back Arrow */}
      <ArrowLeft />

      {/* Header Text */}
      <Text className="text-3xl text-gray-800 mb-5 mt-20 font-promptSemiBold text-center w-5/6">
      กรอกข้อมูลในการสร้าง 
      แพลนในการกินอาหาร
      </Text>
      <Text className="text-gray-600 mb-6 font-promptMedium text-[20px] text-center ">
        การกินของคุณ
      </Text>

      <View className="w-full mb-6 flex gap-1 p-4">
  {foodTypeItems.map((item, index) => (
   <TouchableHighlight 
   key={index} 
   className="rounded-xl shadow-lg shadow-slate-800 bg-white mt-2"
   onPress={() => handleFoodType(index + 1)}
   underlayColor="#facc15"
   activeOpacity={1}
 >
   <View className={`w-full p-5 rounded-xl flex-row items-center gap-4  ${foodType == index + 1 ? 'border-2 border-primary' : 'border border-transparent'}`}>
     
     {/* รูปภาพด้านซ้าย */}
     <Image
       source={item.image}
       className="w-8 h-8 rounded-lg"
       resizeMode="cover"
     />
 
     {/* ข้อความด้านขวา */}
     <View className="flex-1">
       <Text className="text-gray-800 text-lg font-promptMedium">{item.label}</Text>
       <Text className="text-gray-600 text-sm font-promptLight">{item.content}</Text>
     </View>

   </View>
 </TouchableHighlight>
 
  ))}
</View>

      <TouchableOpacity
        className={`w-[95%] rounded-xl p-4 justify-center items-center absolute bottom-8 ${
          foodType > 0 ? 'bg-primary' : 'bg-gray-400'
        }`}
        onPress={handleContinue}
        disabled={foodType === 0}
      >
        <Text className="text-white text-lg font-promptBold">ต่อไป</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PersonalPlanScreen3;