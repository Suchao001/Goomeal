import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, TouchableHighlight, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../../hooks/Navigation';
import { useAuth } from '../../AuthContext';
import { apiClient } from '../../utils/apiClient';

const EatingStyleSettingsScreen = () => {
  const navigation = useTypedNavigation<'EatingStyleSettings'>();
  const { user, fetchUserProfile, loading: authLoading } = useAuth();

  // map index <-> eating_type
  const typeToIndex = useMemo(() => ({ omnivore: 1, keto: 2, vegetarian: 3, vegan: 4 }), []);
  const indexToType = useMemo(() => ({ 1: 'omnivore', 2: 'keto', 3: 'vegetarian', 4: 'vegan' }), []);

  const parseCSV = (text?: string | null): string[] =>
    (text ?? '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

  const toCSV = (arr: string[]): string =>
    arr.map(s => s.trim()).filter(Boolean).join(', ');

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

  // ----- state -----
  const [allergicItems, setAllergicItems] = useState([
    'กลูเตน', 'ถั่ว', 'ไข่', 'ปลา', 'ถั่วเหลือง', 'ถั่วต้นไม้', 'หอย', 'กุ้ง'
  ]);
  const [foodType, setFoodType] = useState(0);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [additional, setAdditional] = useState<string>('');
  const [customAllergy, setCustomAllergy] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

  const [saving, setSaving] = useState(false);
  const [hydrating, setHydrating] = useState(true);

  // ----- hydrate from user -----
  useEffect(() => {
    const hydrate = async () => {
      try {
        // ถ้า user ยังไม่มี ให้ดึงล่าสุด
        if (!user) await fetchUserProfile?.();

        const u = user ?? null;
        const idx = u?.eating_type ? (typeToIndex as any)[u.eating_type] ?? 0 : 0;
        setFoodType(idx);

        const parsed = parseCSV(u?.dietary_restrictions);
        setAllergies(parsed);

        setAdditional(u?.additional_requirements ?? '');

        if (parsed.length) {
          setAllergicItems(prev => Array.from(new Set([...prev, ...parsed])));
        }
      } finally {
        setHydrating(false);
      }
    };
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ----- handlers -----
  const handleFoodType = (type: number) => setFoodType(type);

  const handleAddAllergic = (item: string) => {
    setAllergies(prev => prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]);
  };

  const handleAdditional = (txt: string) => setAdditional(txt);

  const handleAddMoreAllergy = () => setShowCustomInput(true);

  const handleAddCustomAllergy = () => {
    const name = customAllergy.trim();
    if (!name) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกชื่ออาหารที่แพ้');
      return;
    }
    if (allergicItems.includes(name)) {
      Alert.alert('แจ้งเตือน', 'รายการอาหารนี้มีอยู่แล้ว');
      return;
    }
    setAllergicItems(prev => [...prev, name]);
    setAllergies(prev => [...prev, name]); // เลือกทันที
    setCustomAllergy('');
    setShowCustomInput(false);
  };

  const handleCancelCustomInput = () => {
    setCustomAllergy('');
    setShowCustomInput(false);
  };

  const handleSave = async () => {
    if (!foodType) {
      Alert.alert('แจ้งเตือน', 'กรุณาเลือกรูปแบบการกิน');
      return;
    }

    const payload = {
      eating_type: (indexToType as any)[foodType],
      dietary_restrictions: toCSV(allergies),
      additional_requirements: additional || null,
    };

    try {
      setSaving(true);

      const response = await apiClient.put('/user/update-personal-data', payload);
      if (response.data.success) {
              // Refresh user profile in AuthContext
              await fetchUserProfile();
            } else {
              Alert.alert('ข้อผิดพลาด', response.data.message || 'ไม่สามารถบันทึกข้อมูลได้');
            }
      navigation.goBack();
    } catch (e: any) {
      console.error('update profile error:', e);
      Alert.alert('ข้อผิดพลาด', e?.message || 'บันทึกไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setSaving(false);
    }
  };

  // ----- UI -----
  if (authLoading || hydrating) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
        <Text className="text-gray-600 mt-3 font-prompt">กำลังโหลด…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={20}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-12 pb-4 bg-white">
          <TouchableOpacity
            className="w-10 h-10 rounded-full items-center justify-center"
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#9ca3af" />
          </TouchableOpacity>
          <View className="flex-row items-center gap-2">
            <Icon name="restaurant" size={32} color="#9ca3af" />
            <Text className="text-lg font-semibold text-gray-800">ตั้งค่ารูปแบบการกิน</Text>
          </View>
          <Text className="text-base font-semibold text-gray-800"></Text>
        </View>

        {/* รูปแบบการกิน */}
        <View className="bg-white mx-4 my-2 rounded-xl p-5 shadow-lg shadow-slate-800">
          <Text className="text-xl font-promptSemiBold text-gray-800 mb-2">รูปแบบการกิน</Text>
          <Text className="text-sm text-gray-600 mb-5 leading-5">เลือกรูปแบบการกินที่เหมาะกับคุณ</Text>

          <View className="gap-2">
            {foodTypeItems.map((item, index) => (
              <TouchableHighlight
                key={index}
                className="rounded-xl mt-2"
                onPress={() => handleFoodType(index + 1)}
                underlayColor="#ffb800"
                activeOpacity={1}
              >
                <View className={`w-full p-5 rounded-xl flex-row items-center gap-4 ${foodType === index + 1 ? 'bg-primary' : 'bg-gray-100 border-2 border-gray-200'}`}>
                  <Image source={item.image} className="w-8 h-8 rounded-lg" resizeMode="cover" />
                  <View className="flex-1">
                    <Text className={`${foodType===index +1? 'text-white' : 'text-gray-800'} text-lg font-promptMedium`}>{item.label}</Text>
                    <Text className={`${foodType===index +1? 'text-white' : 'text-gray-800'} text-sm font-promptLight`}>{item.content}</Text>
                  </View>
                </View>
              </TouchableHighlight>
            ))}
          </View>
        </View>

        {/* รายการอาหารที่แพ้ */}
        <View className="bg-white mx-4 my-2 rounded-xl p-5 shadow-lg shadow-slate-800">
          <Text className="text-xl font-promptSemiBold text-gray-800 mb-2">รายการอาหารที่แพ้</Text>
          <Text className="text-sm text-gray-600 mb-5 leading-5">เลือกอาหารที่คุณแพ้หรือไม่สามารถกินได้</Text>

          <View className="flex-row flex-wrap justify-between gap-1">
            {allergicItems.map((item, index) => (
              <TouchableHighlight
                key={index}
                className={`rounded-3xl p-3 ${allergies.includes(item) ? ' bg-primary' : 'border border-transparent bg-gray-100'} min-w-[5rem]`}
                onPress={() => handleAddAllergic(item)}
                underlayColor="#e5e5e5"
              >
                <Text className={`${allergies.includes(item) ? 'text-white' : 'text-gray-600'} text-lg font-promptLight text-center`}>{item}</Text>
              </TouchableHighlight>
            ))}
            <TouchableHighlight
              className="rounded-3xl p-3 bg-gray-100 shadow-sm min-w-[5rem]"
              onPress={handleAddMoreAllergy}
              underlayColor="#e5e5e5"
            >
              <Text className="text-gray-800 text-lg font-promptLight text-center">+ เพิ่มเติม</Text>
            </TouchableHighlight>
          </View>

          {/* Custom Input */}
          {showCustomInput && (
            <View className="w-full mt-4">
              <Text className="text-gray-700 mb-2 font-promptMedium text-lg">เพิ่มอาหารที่แพ้</Text>
              <View className="flex-row items-center gap-2">
                <TextInput
                  className="flex-1 bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-promptLight"
                  placeholder="กรอกชื่ออาหารที่แพ้..."
                  value={customAllergy}
                  onChangeText={setCustomAllergy}
                  autoFocus
                />
                <TouchableOpacity className="bg-primary rounded-lg px-4 py-3" onPress={handleAddCustomAllergy}>
                  <Text className="text-white font-promptMedium">เพิ่ม</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-gray-300 rounded-lg px-4 py-3" onPress={handleCancelCustomInput}>
                  <Text className="text-gray-700 font-promptMedium">ยกเลิก</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* ความต้องการเพิ่มเติม */}
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

        {/* Save */}
        <TouchableOpacity
          className="w-[95%] bg-primary rounded-xl p-4 justify-center items-center mx-auto mt-6 mb-6 disabled:opacity-60"
          onPress={handleSave}
          disabled={saving}
        >
          <Text className="text-white text-lg font-promptBold">
            {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
          </Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default EatingStyleSettingsScreen;
