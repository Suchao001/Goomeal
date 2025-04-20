import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

// Hook สำหรับ Navigation
export function useTypedNavigation<T extends keyof RootStackParamList>() {
    return useNavigation<NativeStackNavigationProp<RootStackParamList, T>>();
}
export function useTypedRoute<T extends keyof RootStackParamList>() {
    return useRoute<RouteProp<RootStackParamList, T>>();
}


export function useNavigationHelpers() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    
    return {
        // goToHome: () => navigation.navigate('Home'),
        goBack: () => navigation.goBack(),
        goToScreen: <T extends keyof RootStackParamList>(
            screen: T, 
            params?: RootStackParamList[T]
        ) => {
            navigation.navigate(screen, params);
        },
        resetToScreen: <T extends keyof RootStackParamList>(
            screen: T,
            params?: RootStackParamList[T]
        ) => {
            navigation.reset({
                index: 0,
                routes: [{ name: screen, params }],
            });
        }
    };
}