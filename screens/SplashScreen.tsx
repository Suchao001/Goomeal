import React, { useEffect } from 'react';
import { View, Image, Pressable } from 'react-native';
import { useTypedNavigation } from '../hooks/Navigation';

const SplashScreen = () => {
    const navigation = useTypedNavigation<'Splash'>();

    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         navigation.navigate('Slides');
    //     }, 3000); 

    //     return () => clearTimeout(timer); 
    // }, [navigation]);

    const handleNavigate = () => {
        navigation.navigate('Slides');
    };

    return (
        <Pressable 
            onPress={handleNavigate} 
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}
        >
            <Image 
                source={require('../assets/images/app_logo.png')} 
                style={{ width: 208, height: 208, marginBottom: 32 }}
                resizeMode="contain"
            />
        </Pressable>
    );
};

export default SplashScreen;
