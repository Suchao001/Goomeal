import { View, Text, TouchableOpacity, TextInput, Image } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker'; 
import { useTypedNavigation } from '../../hooks/Navigation';
import { ArrowLeft } from '../../components/GeneralMaterial';
import { useState } from 'react'; 

const PersonalSetupScreen = () => {
    const navigation = useTypedNavigation<'PersonalSetup'>();

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('20'); 
    const [gender, setGender] = useState('male');
    const [activityLevel, setActivityLevel] = useState('low'); // Added state for activity level
    const [items, setItems] = useState(
        [...Array(100).keys()].map((age) => ({
            label: `${age}`,
            value: `${age}`,
        }))
    );

    const handleGenderChange = (selectedGender: string) => {
        setGender(selectedGender);
    };

    const handleActivityLevelChange = (level: string) => {
        setActivityLevel(level);
    };

    return (
        <View className="flex-1 items-center bg-white p-6">
            {/* Back Arrow */}
            <ArrowLeft />

            {/* Logo (Assuming a placeholder for the logo) */}
            <View className="w-32 h-32 rounded-full items-center justify-center mt-16 border border-gray-200 border-2">
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
            <View className="w-full mb-4">
                <Text className="text-base text-gray-800 font-prompt mb-2">ชื่อ</Text>
                <TextInput
                    className="w-full bg-gray-100 rounded-lg p-3 font-prompt"
                    placeholder="ชื่อคุณ"
                    keyboardType="default"
                />
            </View>

            {/* Height and Weight Inputs */}
            <View className="w-full flex-row justify-between mb-4">
                <View className="w-[48%]">
                    <Text className="text-base text-gray-800 font-prompt mb-2">ส่วนสูง</Text>
                    <TextInput
                        className="w-full bg-gray-100 rounded-lg p-3 font-prompt"
                        placeholder="ส่วนสูง cm"
                        keyboardType="numeric"
                    />
                </View>
                <View className="w-[48%]">
                    <Text className="text-base text-gray-800 font-prompt mb-2">น้ำหนัก</Text>
                    <TextInput
                        className="w-full bg-gray-100 rounded-lg p-3 font-prompt"
                        placeholder="น้ำหนัก kg"
                        keyboardType="numeric"
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
                        className={`w-[48%]  rounded-2xl p-3 items-center ${gender === 'male' ? 'border border-primary bg-white' : 'bg-gray-100'}`}
                        onPress={() => handleGenderChange('male')}
                    >
                        <Text className={`font-prompt`}>ชาย</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`w-[48%]  rounded-2xl p-3 items-center ${gender === 'female' ? 'border border-primary bg-white' : 'bg-gray-100'}`}
                        onPress={() => handleGenderChange('female')}
                    >
                        <Text className={`font-prompt`}>หญิง</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Activity Level Selection */}
            <View className="w-full mb-6">
                <Text className="text-base text-gray-800 font-prompt mb-2">ระดับไขมันในร่างกาย</Text>
                <View className="flex-row flex-wrap justify-between">
                    {['low', 'medium', 'high', 'unknow'].map((level) => (
                        <TouchableOpacity
                            key={level}
                            className={`w-[23%] rounded-xl p-2 items-center ${activityLevel === level ? 'border border-primary bg-white' : 'bg-gray-100'}`}
                            onPress={() => handleActivityLevelChange(level)}
                        >
                            <Text className="font-prompt">
                                {level === 'low' ? 'ต่ำ' : level === 'medium' ? 'ปานกลาง' : level === 'high' ? 'สูง' : 'ไม่ทราบ'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
                className="w-[95%] bg-primary rounded-2xl p-4 justify-center items-center"
                onPress={() => navigation.navigate('PersonalPlan1')} 
            >
                <Text className="text-white text-lg font-promptBold">ดำเนินการต่อ</Text>
            </TouchableOpacity>
        </View>
    );
};

export default PersonalSetupScreen;