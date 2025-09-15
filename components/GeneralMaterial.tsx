import { View, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTypedNavigation } from '../hooks/Navigation';
import { RootStackParamList } from '../types/navigation'; 

type Props = {
  goto?: keyof RootStackParamList; // ✅ ป้องกันพิมพ์ชื่อ route ผิด
};

export const ArrowLeft = ({ goto }: Props) => {
  const navigation = useTypedNavigation<keyof RootStackParamList>();

  return (
    <View className="flex-row items-start w-full relative">
      <TouchableOpacity
        onPress={() => (goto ? (navigation as any).navigate(goto as any) : (navigation as any).goBack())}
        className="absolute top-3 left-1 z-10 w-12 h-12 items-center justify-center"
      >
        <FontAwesome
          name="angle-left"
          size={20}
          color="#999"
        />
      </TouchableOpacity>
    </View>
  );
};
