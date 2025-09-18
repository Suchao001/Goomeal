import { View, Text, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker'; 
import { useTypedNavigation } from '../../hooks/Navigation';
import { ArrowLeft } from '../../components/GeneralMaterial';
import { useState } from 'react'; 
import { usePersonalSetup } from '../../contexts/PersonalSetupContext'; 

const PersonalSetupScreen = () => {
    const navigation = useTypedNavigation<'PersonalSetup'>();
    const { updateSetupData } = usePersonalSetup();

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('20'); 
    const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
    const [bodyFat, setBodyFat] = useState<'low' | 'normal' | 'high' | 'don\'t know'>('don\'t know');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [items, setItems] = useState(
        [...Array(100).keys()].map((age) => ({
            label: `${age}`,
            value: `${age}`,
        }))
    );

    const handleGenderChange = (selectedGender: 'male' | 'female' | 'other') => {
        setGender(selectedGender);
    };

    const handleBodyFatChange = (level: 'low' | 'normal' | 'high' | 'don\'t know') => {
        setBodyFat(level);
    };

    const handleContinue = () => {
        // Validation: ตรวจสอบความครบถ้วนของข้อมูล
        if (!height || !weight) {
            Alert.alert(
                'ข้อมูลไม่ครบถ้วน',
                'กรุณากรอกส่วนสูงและน้ำหนักให้ครบถ้วน',
                [{ text: 'ตกลง' }]
            );
            return;
        }

        // Validation: ตรวจสอบค่าที่เป็นตัวเลข
        const heightNum = parseFloat(height);
        const weightNum = parseFloat(weight);
        
        if (isNaN(heightNum) || heightNum <= 0 || heightNum > 300) {
            Alert.alert(
                'ข้อมูลไม่ถูกต้อง',
                'กรุณากรอกส่วนสูงที่ถูกต้อง (1-300 ซม.)',
                [{ text: 'ตกลง' }]
            );
            return;
        }

        if (isNaN(weightNum) || weightNum <= 0 || weightNum > 500) {
            Alert.alert(
                'ข้อมูลไม่ถูกต้อง',
                'กรุณากรอกน้ำหนักที่ถูกต้อง (1-500 กก.)',
                [{ text: 'ตกลง' }]
            );
            return;
        }

        // บันทึกข้อมูลลง Context
        updateSetupData({
            height,
            weight,
            age: value,
            gender,
            body_fat: bodyFat
        });
        
        navigation.navigate('PersonalPlan1');
    };

    return (
        <View className="flex-1 items-center bg-white p-6">
            {/* Back Arrow */}
            <ArrowLeft />

            {/* Logo (Assuming a placeholder for the logo) */}
            <View className="w-32 h-32 rounded-full items-center justify-center mt-16  border-gray-50 border-2">
                <Image
                    className="w-22 h-22 "
                    source={require('../../assets/images/forknife.png')}
                ></Image>
            </View>

            {/* Header Text */}
            <Text className="text-3xl text-gray-800 mb-2 mt-6 font-promptSemiBold">
                ข้อมูลส่วนตัวของคุณ
            </Text>
            <Text className="text-base text-gray-600 mb-6 font-promptLight text-center w-4/6">
                กรุณากรอกข้อมูลเบื้องต้นเพพื่อใช้ในการวิเคราะห์ข้อมูลต่างๆ
            </Text>

            {/* Name Input */}
            {/* <View className="w-full mb-4">
                <Text className="text-base text-gray-800 font-prompt mb-2">ชื่อ</Text>
                <TextInput
                    className="w-full bg-gray-100 rounded-lg p-3 font-prompt"
                    placeholder="ชื่อคุณ"
                    keyboardType="default"
                />
            </View> */}

            {/* Height and Weight Inputs */}
            <View className="w-full flex-row justify-between mb-4">
                <View className="w-[48%]">
                    <Text className="text-base text-gray-800 font-prompt mb-2">
                        ส่วนสูง <Text className="text-red-500">*</Text>
                    </Text>
                    <TextInput
                        className={`w-full rounded-lg p-3 font-prompt border ${
                            !height ? 'bg-red-50 border-red-200' : 'bg-gray-100 border-transparent'
                        }`}
                        placeholder="ส่วนสูง cm"
                        keyboardType="numeric"
                        value={height}
                        onChangeText={setHeight}
                    />
                </View>
                <View className="w-[48%]">
                    <Text className="text-base text-gray-800 font-prompt mb-2">
                        น้ำหนัก <Text className="text-red-500">*</Text>
                    </Text>
                    <TextInput
                        className={`w-full rounded-lg p-3 font-prompt border ${
                            !weight ? 'bg-red-50 border-red-200' : 'bg-gray-100 border-transparent'
                        }`}
                        placeholder="น้ำหนัก kg"
                        keyboardType="numeric"
                        value={weight}
                        onChangeText={setWeight}
                    />
                </View>
            </View>

            {/* Age Dropdown */}
            <View className="w-full mb-4">
                <Text className="text-base text-gray-800 font-prompt mb-2">อายุ</Text>
                <DropDownPicker
                    open={open}
                    value={value}
                    items={items}
                    setOpen={setOpen}
                    setValue={setValue}
                    setItems={setItems}
                    placeholder="เลือกอายุ"
                    containerStyle={{ height: 50 }}
                    style={{
                        backgroundColor: '#F3F4F6', // Matches bg-gray-100
                        borderRadius: 8,
                        borderWidth: 0,
                        paddingHorizontal: 12,
                    }}
                    dropDownContainerStyle={{
                        backgroundColor: '#F3F4F6',
                        borderRadius: 8,
                        borderWidth: 0,
                    }}
                    textStyle={{
                        fontFamily: 'Prompt-Regular', // Matches font-prompt
                        fontSize: 16,
                    }}
                    zIndex={1000} // Ensures dropdown appears above other elements
                />
            </View>

            {/* Gender Selection */}
            <View className="w-full mb-4">
                <Text className="text-base text-gray-800 font-prompt mb-2">เพศ</Text>
                <View className="flex-row justify-between">
                    <TouchableOpacity
                        className={`w-[48%]  rounded-xl p-3 items-center ${gender === 'male' ? 'border border-primary bg-white' : 'bg-gray-100'}`}
                        onPress={() => handleGenderChange('male')}
                    >
                        <Text className={`font-prompt`}>ชาย</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`w-[48%]  rounded-xl p-3 items-center ${gender === 'female' ? 'border border-primary bg-white' : 'bg-gray-100'}`}
                        onPress={() => handleGenderChange('female')}
                    >
                        <Text className={`font-prompt`}>หญิง</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Body Fat Level Selection */}
            <View className="w-full mb-6">
                <Text className="text-base text-gray-800 font-prompt mb-2">ระดับไขมันในร่างกาย</Text>
                <Text className="text-sm text-gray-600 font-prompt mb-4">
                    ข้อมูลระดับไขมันในร่างกายเป็นข้อมูลละเอียดอ่อน ควรผ่านการวัดด้วยมาตรการที่ถูกต้องเท่านั้น หากไม่แน่ใจ กรุณาเลือก "ไม่ทราบ"
                </Text>
                <View className="flex-row flex-wrap justify-between">
                    {[
                        { key: 'low', label: 'ต่ำ' },
                        { key: 'normal', label: 'ปานกลาง' },
                        { key: 'high', label: 'สูง' },
                        { key: 'don\'t know', label: 'ไม่ทราบ' }
                    ].map((level) => (
                        <TouchableOpacity
                            key={level.key}
                            className={`w-[23%] rounded-xl p-2 items-center ${bodyFat === level.key ? 'border border-primary bg-white' : 'bg-gray-100'}`}
                            onPress={() => handleBodyFatChange(level.key as 'low' | 'normal' | 'high' | 'don\'t know')}
                        >
                            <Text className="font-prompt">{level.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
                className="w-[95%] bg-primary rounded-xl p-4 justify-center items-center"
                onPress={handleContinue}
            >
                <Text className="text-white text-lg font-promptBold">ดำเนินการต่อ</Text>
            </TouchableOpacity>
        </View>
    );
};

export default PersonalSetupScreen;