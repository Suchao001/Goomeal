import { View, Text, TouchableOpacity } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useTypedNavigation } from '../../hooks/Navigation';
import { ArrowLeft } from '../../components/GeneralMaterial';
import { useState, useMemo } from 'react';
import { usePersonalSetup } from '../../contexts/PersonalSetupContext';
import { useEffect } from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import {RootStackParamList} from '../../types/navigation';

const PersonalPlanScreen1 = () => {
  const navigation = useTypedNavigation<'PersonalPlan1'>();
  const { updateSetupData } = usePersonalSetup();
  const route = useRoute<RouteProp<RootStackParamList, 'PersonalPlan1'>>();
  const [planDuration, setPlanDuration] = useState('7');
  const [isCustomPlan, setIsCustomPlan] = useState(false);
  const [openWeight, setOpenWeight] = useState(false);
  const [openDuration, setOpenDuration] = useState(false);
  const [weightChangeValue, setWeightChangeValue] = useState('1'); // เปลี่ยนจาก weightValue เป็น weightChangeValue
  const [selectedTarget, setSelectedTarget] = useState<'decrease' | 'increase' | 'healthy'>('decrease');


   useEffect(() => {
    const isForAiFromNav = route.params?.isForAi;
    if (isForAiFromNav !== undefined) {
      updateSetupData({ isForAi: isForAiFromNav });
      console.log(`Saved 'isForAi: ${isForAiFromNav}' to context.`);
    }
    console.log('Screen : PersonalPlanScreen1');
  }, [route.params?.isForAi, updateSetupData]); // <-- ให้ effect นี้ทำงานเมื่อค่า isForAi ที่ส่งมาเปลี่ยนไป


  
  // เปลี่ยน weightItems เป็น weightChangeItems สำหรับการเพิ่ม/ลดน้ำหนัก (1-5 กิโล)
  const weightChangeItems = useMemo(
    () =>
      [...Array(30).keys()].map((weight) => ({
        label: `${weight + 1} กิโลกรัม`,
        value: `${weight + 1}`,
      })),
    []
  );

  // Memoized duration items (1 to 30 days)
  const durationItems = useMemo(
    () =>
      [...Array(30).keys()].map((day) => ({
        label: `${day + 1} วัน`,
        value: `${day + 1}`,
      })),
    []
  );

  const handlePlanDuration = (rate: string) => {
    setPlanDuration(rate);
    setIsCustomPlan(false);
  };

  const handleCustomPlan = () => {
    setIsCustomPlan(true);
    setOpenDuration(true); // Open the dropdown for custom duration
  };

  const handleContinue = () => {
    // บันทึกข้อมูลลง Context
    updateSetupData({
      target_goal: selectedTarget,
      target_weight: selectedTarget === 'healthy' ? undefined : weightChangeValue, // ถ้าเป็น healthy ไม่ต้องส่งน้ำหนัก
      plan_duration: planDuration
    });
    
    navigation.navigate('PersonalPlan2');
  };

  return (
    <View className="flex-1 items-center bg-white p-6">
      {/* Back Arrow */}
      <ArrowLeft />

      {/* Header Text */}
      <Text className="text-3xl text-gray-800 mb-2 mt-20 font-promptSemiBold text-center w-5/6">
        กรอกข้อมูลในการสร้าง
        แพลนในการกินอาหาร
      </Text>
      <Text className="text-myBlack mb-6 font-promptMedium text-[20px] text-center">
        เป้าหมายของคุณ
      </Text>

      {/* Target Selection */}
      <View className="w-full mb-4 p-3">
          {[
            { key: 'decrease', label: 'ลดน้ำหนัก' },
            { key: 'healthy', label: 'สุขภาพดี' },
            { key: 'increase', label: 'เพิ่มน้ำหนัก' }
          ].map((target) => (
            <TouchableOpacity
              key={target.key}
              className={`w-full rounded-xl p-3 items-center mb-2   ${
                selectedTarget === target.key ? 'bg-white  border-primary border-2' : 'bg-gray-100 border border-transparent'
              }`}
              onPress={() => setSelectedTarget(target.key as 'decrease' | 'increase' | 'healthy')}
              accessibilityLabel={`เลือกเป้าหมาย ${target.label}`}
            >
              <Text className="font-prompt text-myBlack">
                {target.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

       


      {/* Plan Duration Selection */}
      <View className="w-5/6 mb-4 hidden">
        <Text className="text-myBlack mb-6 font-promptMedium text-center text-[20px]">
          ระยะเวลาของแพลนอาหาร
        </Text>
        <View className="flex-row gap-1">
          {['7', '30'].map((duration) => (
            <TouchableOpacity
              key={duration}
              className={`w-1/4 rounded-xl p-3 items-center ${
                planDuration === duration && !isCustomPlan
                  ? 'border border-primary bg-white'
                  : 'bg-gray-100'
              }`}
              onPress={() => handlePlanDuration(duration)}
              accessibilityLabel={`เลือกระยะเวลา ${duration} วัน`}
            >
              <Text className="font-prompt">{duration} วัน</Text>
            </TouchableOpacity>
          ))}
          {isCustomPlan ? (
            <DropDownPicker
              open={openDuration}
              value={planDuration}
              items={durationItems}
              setOpen={setOpenDuration}
              setValue={(callback) => {
                const value = callback(planDuration);
                setPlanDuration(value);
                setIsCustomPlan(true);
              }}
              placeholder="เลือกจำนวนวัน"
              containerStyle={{ width: '50%', height: 50 }}
              style={{
                backgroundColor: '#ffff',
                borderRadius: 14,
                borderWidth: 1,
                paddingHorizontal: 12,
                borderColor: planDuration ? '#ffb800' : '#d1d5db', // Add border color based on selection
              }}
              dropDownContainerStyle={{
                backgroundColor: '#fff',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#ffb800', // Add border color for dropdown container
              }}
              textStyle={{
                fontFamily: 'Prompt-Regular',
                fontSize: 16,
              }}
              zIndex={2000} // Higher zIndex for duration dropdown
              zIndexInverse={1000}
            />
          ) : (
            <TouchableOpacity
              className="w-2/4 rounded-xl p-3 items-center bg-gray-100"
              onPress={handleCustomPlan}
              accessibilityLabel="กำหนดระยะเวลาเอง"
            >
              <Text className="font-prompt">กำหนดเอง</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Target Weight Dropdown - แสดงเฉพาะเมื่อเลือก เพิ่ม หรือ ลดน้ำหนัก */}
      {selectedTarget !== 'healthy' && (
        <View className="w-full mb-6">
          <Text className="text-myBlack mb-2 font-promptMedium text-center text-[20px]">
            {selectedTarget === 'increase' ? 'น้ำหนักที่ต้องการเพิ่ม' : 'น้ำหนักที่ต้องการลด'}
          </Text>
         
          <DropDownPicker
            open={openWeight}
            value={weightChangeValue}
            items={weightChangeItems}
            setOpen={setOpenWeight}
            setValue={setWeightChangeValue}
            placeholder={`เลือกจำนวนกิโลกรัมที่จะ${selectedTarget === 'increase' ? 'เพิ่ม' : 'ลด'}`}
            containerStyle={{ height: 50 }}
          
            style={{
              backgroundColor: '#F3F4F6',
              borderRadius: 14,
              borderWidth: 0,
              paddingHorizontal: 12,
              
            }}
            dropDownContainerStyle={{
              backgroundColor: '#F3F4F6',
              borderRadius: 8,
              borderWidth: 0,
            }}
            textStyle={{
              fontFamily: 'Prompt-Regular',
              fontSize: 16,
            }}
            zIndex={1000} // Lower zIndex for weight dropdown
            zIndexInverse={2000}
          />
        </View>
      )}

      {/* Next Button */}
      <TouchableOpacity
        className="w-[95%] bg-primary rounded-xl p-4 justify-center items-center absolute bottom-8"
        onPress={handleContinue} 
        accessibilityLabel="ไปยังหน้าถัดไป"
      >
        <Text className="text-white text-lg font-promptBold">ต่อไป</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PersonalPlanScreen1;