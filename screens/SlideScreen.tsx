import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';
import {useTypedNavigation} from '../hooks/Navigation';




const SlidesScreen = () => {

    const navigation = useTypedNavigation<'Slides'>();

    const contents = [
        { image: require('../assets/images/logo_1.png'), textColor: 'text-yellow-400', color: 'bg-yellow-400', title: 'วางแพลนอาหารด้วย AI' },
        { image: require('../assets/images/logo_2.png'), textColor: 'text-green-400', color: 'bg-green-400', title: 'ช่วยคิดว่ามื้อนี้ควรทานอะไรดี' },
        { image: require('../assets/images/logo_3.png'), textColor: 'text-yellow-400', color: 'bg-yellow-400', title: 'ช่วยเเนะนำเเละวิเคราะห์าการกินของคุณ' },
    ];

    return (
        <Swiper loop={false} showsPagination={true}
        dotStyle={{ backgroundColor: 'rgba(255,255,255,0.4)', width: 13, height: 13, borderRadius: 10 }}
            activeDotStyle={{ backgroundColor: 'white' , width: 13, height: 13, borderRadius: 10 }}
            paginationStyle={{ bottom: 50 }}
           
        >
            {contents.map((content, index) => (
                <View
                    key={index}
                    className={`flex-1 ${content.color} p-5`}
                >
                    <View className="flex-1 flex-col justify-start items-center mt-12 mx-2">
                        <Text className="text-2xl font-bold text-center text-white mb-8 font-prompt">
                            {content.title}
                        </Text>
                        
                        <Image 
                            source={content.image} 
                            className="w-60 h-60 mt-20"
                            resizeMode="contain"
                        />
                    </View>
                    
                    <View className="w-full flex items-end ">
                        <TouchableOpacity
                            className="bg-white rounded-full py-2 px-5 items-center mb-7 mr-7"
                            onPress={() => {
                               navigation.navigate('Login');
                            }}
                        >
                            <Text className={`${content.textColor} font-bold font-promptBold`}>Skip</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ))}
        </Swiper>
    );
};

export default SlidesScreen;