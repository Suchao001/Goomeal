import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useTypedNavigation } from '../../hooks/Navigation';
import { ArrowLeft } from '../../components/GeneralMaterial';
import { useState, useMemo } from 'react';
import { useEffect } from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';

const PromptForm1 = () => {
  const navigation = useTypedNavigation();
  const route = useRoute();
  
  // Duration state
  const [planDuration, setPlanDuration] = useState('7');
  const [isCustomPlan, setIsCustomPlan] = useState(false);
  const [openDuration, setOpenDuration] = useState(false);
  
  // Food category state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Budget state
  const [selectedBudget, setSelectedBudget] = useState<'low' | 'medium' | 'high' | 'flexible' | ''>('');
  
  useEffect(() => {
    console.log('Screen: PromptForm1');
  }, []);

  // Memoized duration items (1 to 30 days)
  const durationItems = useMemo(
    () =>
      [...Array(30).keys()].map((day) => ({
        label: `${day + 1} วัน`,
        value: `${day + 1}`,
      })),
    []
  );

  // Food categories mockup
  const foodCategories = [
    { key: 'thai', label: 'อาหารไทย', icon: '🍛' },
    { key: 'chinese', label: 'อาหารจีน', icon: '🥢' },
    { key: 'japanese', label: 'อาหารญี่ปุ่น', icon: '🍱' },
    { key: 'western', label: 'อาหารตะวันตก', icon: '🍝' },
    { key: 'healthy', label: 'อาหารสุขภาพ', icon: '🥗' },
    { key: 'vegetarian', label: 'อาหารเจ', icon: '🥬' },
    { key: 'street', label: 'อาหารข้างทาง', icon: '🍢' },
    { key: 'dessert', label: 'ของหวาน', icon: '🍰' }
  ];

  // Budget options
  const budgetOptions = [
    { key: 'low', label: 'ประหยัด', desc: '50-150 บาท/มื้อ', icon: '💰' },
    { key: 'medium', label: 'ปานกลาง', desc: '150-300 บาท/มื้อ', icon: '💰💰' },
    { key: 'high', label: 'หรูหรา', desc: '300+ บาท/มื้อ', icon: '💰💰💰' },
    { key: 'flexible', label: 'งบยืดหยุ่น', desc: 'ปรับตามสถานการณ์', icon: '🎯' }
  ];

  const handlePlanDuration = (duration: string) => {
    setPlanDuration(duration);
    setIsCustomPlan(false);
  };

  const handleCustomPlan = () => {
    setIsCustomPlan(true);
    setOpenDuration(true);
  };

  const handleCategoryToggle = (categoryKey: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryKey) 
        ? prev.filter(key => key !== categoryKey)
        : [...prev, categoryKey]
    );
  };

    const handleContinue = () => {
    if (!planDuration || !selectedBudget) {
      Alert.alert(
        'ข้อมูลไม่ครบถ้วน',
        'กรุณาเลือกระยะเวลาแผนและงบประมาณก่อนดำเนินการต่อ',
        [{ text: 'ตกลง', style: 'default' }]
      );
      return;
    }

    navigation.navigate('PromptForm2', {
      data: {
        planDuration,
        selectedCategories,
        selectedBudget
      }
    });
  };

  return (
    <ScrollView className="flex-1 bg-white p-6">
      {/* Back Arrow */}
      <ArrowLeft />

      {/* Header Text */}
      <View className="px-6 mt-20 mb-8">
        <Text className="text-3xl text-gray-800 mb-2 font-promptSemiBold text-center">
          สร้างแผนการกิน
          จาก Prompt
        </Text>
        <Text className="text-myBlack mb-2 font-promptMedium text-lg text-center">
          กรอกข้อมูลเพื่อสร้างแผนที่เหมาะกับคุณ
        </Text>
      </View>

      <View className="px-6">
        {/* Plan Duration Selection */}
        <View className="mb-8">
          <Text className="text-gray-800 mb-4 font-promptSemiBold text-lg">
            📅 ระยะเวลาของแผน
          </Text>
          <View className="flex-row gap-2 mb-4">
            {['7', '14', '30'].map((duration) => (
              <TouchableOpacity
                key={duration}
                className={`flex-1 rounded-xl p-3 items-center ${
                  planDuration === duration && !isCustomPlan
                    ? 'border-2 border-primary '
                    : 'bg-gray-100 border border-transparent'    
                }`}
                onPress={() => handlePlanDuration(duration)}
              >
                <Text className={`font-promptMedium ${
                  planDuration === duration && !isCustomPlan ? 'text-primary' : 'text-gray-700'
                }`}>
                  {duration} วัน
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Custom Duration */}
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
              containerStyle={{ height: 50 }}
              style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                borderWidth: 2,
                paddingHorizontal: 12,
                borderColor: '#ffb800',
              }}
              dropDownContainerStyle={{
                backgroundColor: '#fff',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#ffb800',
                maxHeight: 200, // Limit height to make it scrollable
              }}
              textStyle={{
                fontFamily: 'Prompt-Regular',
                fontSize: 16,
              }}
              listMode="SCROLLVIEW"
              scrollViewProps={{
                nestedScrollEnabled: true,
                showsVerticalScrollIndicator: true,
              }}
              zIndex={3000}
              zIndexInverse={1000}
            />
          ) : (
            <TouchableOpacity
              className="w-full rounded-xl p-3 items-center bg-gray-100 border border-transparent"
              onPress={handleCustomPlan}
            >
              <Text className="font-promptMedium text-gray-700">กำหนดเอง</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Food Category Selection */}
        <View className="mb-8">
          <Text className="text-gray-800 mb-4 font-promptSemiBold text-lg">
            🍽️ ประเภทอาหารที่ชอบ (เลือกได้หลายรายการ)
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {foodCategories.map((category) => (
              <TouchableOpacity
                key={category.key}
                className={`rounded-full px-4 py-2 mr-2 mb-1 flex-row items-center ${
                  selectedCategories.includes(category.key)
                    ? 'bg-primary border-2 border-primary'
                    : 'bg-gray-100 border border-transparent'
                }`}
                onPress={() => handleCategoryToggle(category.key)}
              >
                <Text className="mr-1">{category.icon}</Text>
                <Text className={`font-promptMedium ${
                  selectedCategories.includes(category.key) ? 'text-white' : 'text-gray-700'
                }`}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {selectedCategories.length > 0 && (
            <Text className="text-[#77dd77] font-promptLight text-sm mt-2">
              ✓ เลือกแล้ว {selectedCategories.length} ประเภท
            </Text>
          )}
        </View>

        {/* Budget Selection */}
        <View className="mb-8">
          <Text className="text-gray-800 mb-4 font-promptSemiBold text-lg">
            💰 งบต่อมื้อ
          </Text>
          <View className="flex flex-col gap-1">
            {budgetOptions.map((budget) => (
              <TouchableOpacity
            key={budget.key}
            className={`rounded-xl p-4 border-2 ${
              selectedBudget === budget.key
                ? 'border-primary'
                : ' bg-gray-100 border-transparent'
            }`}
            onPress={() => setSelectedBudget(budget.key as 'low' | 'medium' | 'high')}
              >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="text-xl mr-3">{budget.icon}</Text>
                <View>
                  <Text className={`font-promptSemiBold text-base ${
                selectedBudget === budget.key ? 'text-primary' : 'text-gray-800'
                  }`}>
                {budget.label}
                  </Text>
                  <Text className="text-myBlack font-promptLight text-sm">
                {budget.desc}
                  </Text>
                </View>
              </View>
              {selectedBudget === budget.key && (
                <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                  <Text className="text-white text-xs">✓</Text>
                </View>
              )}
            </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
          </View>

      {/* Next Button */}
      <View className="px-6 pb-8">
        <TouchableOpacity
          className={`w-full rounded-xl p-4 justify-center items-center ${
            planDuration && selectedBudget
              ? 'bg-primary'
              : 'bg-gray-300'
          }`}
          onPress={handleContinue}
          disabled={!planDuration || !selectedBudget}
        >
          <Text className={`text-lg font-promptBold ${
            planDuration && selectedBudget
              ? 'text-white'
              : 'text-gray-500'
          }`}>
            ต่อไป
          </Text>
        </TouchableOpacity>
        
        {/* Progress indicator */}
        <View className="flex-row justify-center mt-4 space-x-2 gap-1">
          <View className="w-8 h-2 bg-primary rounded-full" />
          <View className="w-8 h-2 bg-gray-300 rounded-full" />
          <View className="w-8 h-2 bg-gray-300 rounded-full" />
        </View>
      </View>
    </ScrollView>
  );
};

export default PromptForm1;
