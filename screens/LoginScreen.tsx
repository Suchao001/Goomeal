import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

const LoginScreen = () => {
    return (
        <View className="flex-1 justify-center items-center bg-white p-4">
            {/* Title */}
            <Text className="text-3xl font-bold text-gray-800 mb-2">
                เข้าสู่ระบบ
            </Text>
            {/* Subtitle */}
            <Text className="text-base text-gray-600 mb-6">
                กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ
            </Text>

            {/* Email Input */}
            <View className="w-full mb-4">
                <Text className="text-sm text-gray-700 mb-1">อีเมล</Text>
                <TextInput
                    className="w-full bg-white rounded-lg p-3 border border-gray-300"
                    placeholder="อีเมล"
                    keyboardType="email-address"
                />
            </View>

            {/* Password Input */}
            <View className="w-full mb-4">
                <Text className="text-sm text-gray-700 mb-1">รหัสผ่าน</Text>
                <TextInput
                    className="w-full bg-white rounded-lg p-3 border border-gray-300"
                    placeholder="รหัสผ่าน"
                    secureTextEntry
                />
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity>
                <Text className="text-blue-500 text-sm mb-6">
                    ลืมรหัสผ่าน ?
                </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity className="w-full bg-yellow-500 rounded-lg p-4 justify-center items-center">
                <Text className="text-white text-lg font-semibold">
                    เข้าสู่ระบบ
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default LoginScreen;
