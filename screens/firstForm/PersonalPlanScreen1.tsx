import { View, Text, TouchableOpacity } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useTypedNavigation } from '../../hooks/Navigation';
import { ArrowLeft } from '../../components/GeneralMaterial';
import { useState, useMemo } from 'react';

const PersonalPlanScreen1 = () => {
  const navigation = useTypedNavigation<'PersonalPlan1'>();
  const [planDuration, setPlanDuration] = useState('7');
  const [isCustomPlan, setIsCustomPlan] = useState(false);
  const [openWeight, setOpenWeight] = useState(false);
  const [openDuration, setOpenDuration] = useState(false);
  const [weightValue, setWeightValue] = useState('70');
  const [selectedTarget, setSelectedTarget] = useState('ลดน้ำหนัก');

  

  // Memoized weight items (30 to 150 kg)
  const weightItems = useMemo(
    () =>
      [...Array(151).keys()].slice(30).map((weight) => ({
        label: `${weight} กิโล`,
        value: `${weight}`,
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

  return (
    <View className="flex-1 items-center bg-white p-6">
      {/* Back Arrow */}
      <ArrowLeft />

      {/* Header Text */}
      <Text className="text-3xl text-gray-800 mb-2 mt-20 font-promptSemiBold text-center w-5/6">
        กรอกข้อมูลในการสร้างแพลนในการกินอาหาร
      </Text>
      <Text className="text-gray-600 mb-6 font-promptMedium text-[20px] text-center">
        เป้าหมายของคุณ
      </Text>

      {/* Target Selection */}
      <View className="w-full mb-4 p-3">
          {['ลดน้ำหนัก', 'สุขภาพดี', 'เพิ่มน้ำหนัก'].map((target) => (
            <TouchableOpacity
              key={target}
              className={`w-full rounded-xl p-3 items-center mb-2 shadow-lg shadow-slate-800 ${
                selectedTarget === target ? 'bg-white border border-primary' : 'bg-white border border-transparent'
              }`}
              onPress={() => setSelectedTarget(target)}
              accessibilityLabel={`เลือกเป้าหมาย ${target}`}
            >
              <Text className="font-prompt text-black">
                {target}
              </Text>
            </TouchableOpacity>
          ))}
        </View>


      {/* Plan Duration Selection */}
      <View className="w-5/6 mb-4">
        <Text className="text-gray-600 mb-6 font-promptMedium text-center text-[20px]">
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

      {/* Target Weight Dropdown */}
      <View className="w-full mb-6">
      <Text className="text-gray-600 mb-6 font-promptMedium text-center text-[20px]">
          น้ำหนักเป้าหมาย
        </Text>
        <DropDownPicker
          open={openWeight}
          value={weightValue}
          items={weightItems}
          setOpen={setOpenWeight}
          setValue={setWeightValue}
          placeholder="เลือกน้ำหนักเป้าหมาย"
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

      {/* Next Button */}
      <TouchableOpacity
        className="w-[95%] bg-primary rounded-xl p-4 justify-center items-center absolute bottom-8"
        onPress={() => navigation.navigate('PersonalPlan2')} 
        accessibilityLabel="ไปยังหน้าถัดไป"
      >
        <Text className="text-white text-lg font-promptBold">ต่อไป</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PersonalPlanScreen1;