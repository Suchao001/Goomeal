import React from 'react';
import { useNavigation, useRoute, RouteProp, NavigationContext } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

// Hook สำหรับ Navigation (ปลอดภัยเมื่อไม่มี NavigationContainer)
// Lightweight debug deduper to avoid log spam
const loggedStacks = new Set<string>();

export function useTypedNavigation<T extends keyof RootStackParamList>() {
    // Try to read Navigation context directly so it doesn't throw when absent
    const ctx = React.useContext(NavigationContext) as any;
    if (ctx) {
        // console.debug('[useTypedNavigation] Using real navigation context');
        return ctx as NativeStackNavigationProp<RootStackParamList, T>;
    }
    // Fallback mock navigation to prevent crashes in standalone renders
    const mock = React.useMemo(() => {
        const noop = () => {};
        const addListener = (_: string, __: any) => ({ remove: noop });
        return {
            navigate: noop,
            goBack: noop,
            reset: noop,
            addListener,
            removeListener: noop,
            canGoBack: () => false,
            setParams: noop,
            setOptions: noop,
            dispatch: noop,
          } as unknown as NativeStackNavigationProp<RootStackParamList, T>;
    }, []);
    // Debug: log once per callsite if NavigationContainer is missing
    try {
        const stack = new Error('[NAV_DEBUG] useTypedNavigation without NavigationContainer').stack || '';
        const key = stack.split('\n').slice(2, 5).join(' | ');
        if (key && !loggedStacks.has(key)) {
            loggedStacks.add(key);
            console.warn('[NAV_DEBUG] Missing navigation context; returning mock.\nStack:', stack);
        }
    } catch {}
    return mock;
}
export function useTypedRoute<T extends keyof RootStackParamList>() {
    try {
        // Note: useRoute throws if no NavigationContainer. Guard with try/catch.
        const r = useRoute<RouteProp<RootStackParamList, T>>();
        // console.debug('[useTypedRoute] Using real route context', r?.name);
        return r;
    } catch {
        // Provide a minimal mock route for standalone renders
        const mock = {
            key: 'mock',
            name: '' as T,
            params: undefined,
        } as unknown as RouteProp<RootStackParamList, T>;
        // Debug: log once to help locate callsites
        try {
            const stack = new Error('[NAV_DEBUG] useTypedRoute without NavigationContainer').stack || '';
            const key = stack.split('\n').slice(2, 5).join(' | ');
            if (key && !loggedStacks.has(key)) {
                loggedStacks.add(key);
                console.warn('[NAV_DEBUG] Missing route context; returning mock.\nStack:', stack);
            }
        } catch {}
        return mock;
    }
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
