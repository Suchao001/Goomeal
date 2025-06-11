import { View, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation'; 

type Props = {
  goto?: keyof RootStackParamList; // ✅ ป้องกันพิมพ์ชื่อ route ผิด
};

export const ArrowLeft = ({ goto }: Props) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View className="flex-row items-start w-full relative">
      <TouchableOpacity
        onPress={() => (goto ? navigation.navigate(goto) : navigation.goBack())}
        className="absolute top-5 left-2 z-10"
      >
        <FontAwesome
          name="angle-left"
          size={20}
          color="#999"
          style={{ marginTop: 12, marginLeft: 4 }}
        />
      </TouchableOpacity>
    </View>
  );
};
