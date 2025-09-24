import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';


interface TextInputProps {
    title: string;
    placeholder: string;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'decimal-pad' | 'url' ;
    secureTextEntry?: boolean;
    value: string;
    onChangeText: (text: string) => void;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    showPasswordToggle?: boolean;
}

export const Text_input = ({ title, placeholder,keyboardType,secureTextEntry, value, onChangeText, autoCapitalize, showPasswordToggle }: TextInputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const animatedLabel = useState(new Animated.Value(value ? 1 : 0))[0];
    const [isSecure, setIsSecure] = useState<boolean>(!!secureTextEntry);

    useEffect(() => {
        setIsSecure(!!secureTextEntry);
    }, [secureTextEntry]);

    const toggleSecureEntry = () => {
        setIsSecure(prev => !prev);
    };

    const handleFocus = () => {
        setIsFocused(true);
        Animated.timing(animatedLabel, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const handleBlur = () => {
        setIsFocused(false);
        if (!value) {
            Animated.timing(animatedLabel, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    };

    const labelStyle = {
        transform: [
            {
                translateY: animatedLabel.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, -20],
                }),
            },
            {
                translateX: animatedLabel.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -10],
                }),
            },
            {
                scale: animatedLabel.interpolate({
                    inputRange: [0, 2],
                    outputRange: [1, 0.8],
                }),
            },
        ],
        opacity: animatedLabel.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
        }),
    };

    return (
        <View className="w-full my-3">
            <View style={styles.inputContainer}>
                <Animated.Text
                    style={[styles.label, labelStyle]}
                    className={`font-prompt text-gray-700 ${!isFocused && !value ? 'hidden' : ''}`}
                    
                >
                    {title}
                </Animated.Text>
                <TextInput
                className="w-full h-14 bg-[#f3f3f3] rounded-xl p-3 border border-transparent font-prompt"
                    style={[styles.input, showPasswordToggle ? styles.inputWithToggle : null]}
                    placeholder={isFocused || value ? '' : placeholder}
                    keyboardType={keyboardType}
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    secureTextEntry={isSecure}
                    autoCapitalize={autoCapitalize}
                />
                {showPasswordToggle && (
                    <TouchableOpacity
                        onPress={toggleSecureEntry}
                        style={styles.toggleButton}
                        accessibilityRole="button"
                        accessibilityLabel={isSecure ? 'แสดงรหัสผ่าน' : 'ซ่อนรหัสผ่าน'}
                    >
                        <FontAwesome name={isSecure ? 'eye-slash' : 'eye'} size={18} color="#666" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    input: {
        fontSize: 16,
    },
    inputWithToggle: {
        paddingRight: 42,
    },
    label: {
        fontFamily: 'Prompt-Regular',
        color: '#999',
        position: 'absolute',
        left: 12,
        fontSize: 14,
        zIndex: 10,
    },
    toggleButton: {
        position: 'absolute',
        right: 12,
        top: 18,
    },
});
