import React, { useEffect } from 'react';
import { View, Image } from 'react-native';
import { useTypedNavigation } from '../hooks/Navigation';


const SplashScreen = () => {
    const navigation = useTypedNavigation<'Splash'>();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.navigate('Slides');
        }, 3000); 

        return () => clearTimeout(timer); 
    }, [navigation]);

    return (
        <View className="flex-1 justify-center items-center bg-white">
            
            <Image 
                source={require('../images/app_logo.png')} 
                className="w-52 h-52 mb-8"
                resizeMode="contain"
            />
        </View>
    );
};

export default SplashScreen;
