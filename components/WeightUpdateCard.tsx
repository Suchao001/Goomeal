import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { apiClient } from '../utils/apiClient';

type WeightGoal = 'increase' | 'decrease' | 'healthy' | null | undefined;

type WeightLike = number | string | null | undefined;

interface WeightUpdateCardProps {
  currentWeight?: WeightLike;
  lastRecordedWeight?: WeightLike;
  targetWeight?: WeightLike;
  targetGoal?: WeightGoal;
  onWeightUpdated?: (newWeight: number) => Promise<void> | void;
}

const toNumberOrNull = (value: WeightLike): number | null => {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === 'number' ? value : parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : null;
};

const formatWeight = (value?: WeightLike) => {
  const numeric = toNumberOrNull(value);
  return numeric && numeric > 0 ? `${numeric.toFixed(1)} kg` : 'ไม่ระบุ';
};

const WeightUpdateCard: React.FC<WeightUpdateCardProps> = ({
  currentWeight,
  lastRecordedWeight,
  targetWeight,
  targetGoal,
  onWeightUpdated,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizedCurrentWeight = useMemo(() => toNumberOrNull(currentWeight), [currentWeight]);
  const normalizedLastRecordedWeight = useMemo(
    () => toNumberOrNull(lastRecordedWeight),
    [lastRecordedWeight],
  );
  const normalizedTargetWeight = useMemo(() => toNumberOrNull(targetWeight), [targetWeight]);

  const targetInsight = useMemo(() => {
    if (!normalizedTargetWeight || !normalizedCurrentWeight || targetGoal === 'healthy') {
      return null;
    }

    const diff = normalizedTargetWeight - normalizedCurrentWeight;
    const absDiff = Math.abs(diff).toFixed(1);

    if (targetGoal === 'decrease') {
      if (diff >= 0) return `เหลืออีก ${absDiff} kg ถึงเป้าหมาย`; // still need to reduce
      return `เกินเป้าหมาย ${absDiff} kg`; // below target
    }

    if (targetGoal === 'increase') {
      if (diff <= 0) return `ถึงเป้าหมายแล้ว`;
      return `เพิ่มอีก ${absDiff} kg เพื่อถึงเป้าหมาย`;
    }

    return null;
  }, [normalizedCurrentWeight, targetGoal, normalizedTargetWeight]);

  const weightChangeText = useMemo(() => {
    if (!normalizedLastRecordedWeight || !normalizedCurrentWeight) return null;

    const change = normalizedCurrentWeight - normalizedLastRecordedWeight;
    if (Math.abs(change) < 0.1) {
      return 'น้ำหนักคงที่จากครั้งก่อน';
    }

    const changeText = `${Math.abs(change).toFixed(1)} kg`;
    return change > 0 ? `เพิ่มขึ้น ${changeText}` : `ลดลง ${changeText}`;
  }, [normalizedCurrentWeight, normalizedLastRecordedWeight]);

  const openModal = () => {
    const base = normalizedCurrentWeight ?? normalizedLastRecordedWeight ?? 0;
    setNewWeight(base ? base.toFixed(1) : '');
    setShowModal(true);
  };

  const closeModal = useCallback(() => {
    setShowModal(false);
    setNewWeight('');
  }, []);

  const adjustWeight = (delta: number) => {
    const fallback = normalizedCurrentWeight ?? normalizedLastRecordedWeight ?? 0;
    const currentValue = parseFloat(newWeight) || fallback || 0;
    const updated = Math.max(0, currentValue + delta);
    setNewWeight(updated.toFixed(1));
  };

  const handleWeightUpdate = async () => {
    const parsedWeight = parseFloat(newWeight);

    if (!parsedWeight || parsedWeight <= 0) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกน้ำหนักที่ถูกต้อง');
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.updateWeight(parsedWeight);
      Alert.alert('สำเร็จ', 'อัพเดทน้ำหนักเรียบร้อยแล้ว');
      closeModal();
      if (onWeightUpdated) {
        await onWeightUpdated(parsedWeight);
      }
    } catch (error) {
      console.error('❌ [WeightUpdateCard] Error updating weight:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถอัพเดทน้ำหนักได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="bg-white mx-4 mt-4 rounded-xl p-5 shadow-sm">
      <View className="flex-row justify-between items-center mb-5">
        <View>
          <Text className="text-sm text-gray-500 mb-1 font-prompt">น้ำหนักปัจจุบัน</Text>
          <Text className="text-3xl font-promptBold text-gray-800">
            {normalizedCurrentWeight && normalizedCurrentWeight > 0
              ? `${normalizedCurrentWeight.toFixed(1)} kg`
              : 'ยังไม่มีข้อมูล'}
          </Text>
          {weightChangeText && (
            <Text className="text-xs text-gray-500 mt-1 font-prompt">
              {weightChangeText}
            </Text>
          )}
        </View>
        <TouchableOpacity
          className="bg-primary px-4 py-2 rounded-full flex-row items-center"
          onPress={openModal}
        >
          <Icon name="create" size={18} color="white" />
          <Text className="text-white font-promptSemiBold text-sm ml-2">อัพเดท</Text>
        </TouchableOpacity>
      </View>

      {normalizedTargetWeight && normalizedTargetWeight > 0 && (
        <View className="bg-orange-50 rounded-xl p-3 flex-row items-center">
          <View className="w-8 h-8 bg-orange-400 rounded-full items-center justify-center mr-3">
            <Icon name="flag" size={18} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-sm text-gray-600 font-prompt">เป้าหมายน้ำหนัก</Text>
            <Text className="text-base font-promptSemiBold text-gray-800">
              {formatWeight(normalizedTargetWeight)}
            </Text>
            {targetInsight && (
              <Text className="text-xs text-orange-600 mt-1 font-prompt">
                {targetInsight}
              </Text>
            )}
          </View>
        </View>
      )}

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white mx-6 rounded-2xl p-6 w-80">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-promptBold text-gray-800">อัพเดทน้ำหนัก</Text>
              <TouchableOpacity onPress={closeModal} disabled={isSubmitting}>
                <Icon name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View className="bg-blue-50 rounded-xl p-3 mb-6">
              <View className="flex-row items-center mb-1">
                <Icon name="information-circle" size={16} color="#3b82f6" />
                <Text className="text-sm font-promptMedium text-blue-700 ml-2">
                  เกี่ยวกับการอัพเดทน้ำหนัก
                </Text>
              </View>
              <Text className="text-xs text-blue-600 font-prompt leading-4">
                การบันทึกน้ำหนักจะถูกเก็บไว้ในระบบเพื่อติดตามสถิติและความเปลี่ยนแปลงของคุณเมื่อเวลาผ่านไป
              </Text>
            </View>

            <View className="mb-6">
              <Text className="text-base font-promptMedium text-gray-700 mb-2">น้ำหนักใหม่</Text>
              <View className="flex-row items-center">
                <View className="flex-1 bg-gray-50 rounded-xl px-4 py-3 flex-row items-center">
                  <TextInput
                    className="flex-1 text-lg font-promptMedium text-gray-800"
                    value={newWeight}
                    onChangeText={setNewWeight}
                    placeholder="กรอกน้ำหนักใหม่"
                    keyboardType="numeric"
                    autoFocus
                    editable={!isSubmitting}
                  />
                  <Text className="text-gray-500 font-prompt ml-2">kg</Text>
                </View>

                <View className="ml-3 items-center">
                  <TouchableOpacity
                    className="bg-primary w-10 h-10 rounded-lg items-center justify-center mb-2"
                    onPress={() => adjustWeight(0.1)}
                    disabled={isSubmitting}
                  >
                    <Icon name="add" size={20} color="white" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-gray-400 w-10 h-10 rounded-lg items-center justify-center"
                    onPress={() => adjustWeight(-0.1)}
                    disabled={isSubmitting}
                  >
                    <Icon name="remove" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {newWeight && !isNaN(parseFloat(newWeight)) && normalizedCurrentWeight && (
              <View className="mb-6">
                {(() => {
                  const parsedValue = parseFloat(newWeight);
                  const diff = parsedValue - normalizedCurrentWeight;

                  if (Math.abs(diff) < 0.1) {
                    return (
                      <View className="bg-gray-50 rounded-xl p-3">
                        <Text className="text-center text-gray-600 font-prompt">
                          ไม่มีการเปลี่ยนแปลงน้ำหนัก
                        </Text>
                      </View>
                    );
                  }

                  const isIncrease = diff > 0;
                  return (
                    <View className={`rounded-xl p-3 ${isIncrease ? 'bg-orange-50' : 'bg-green-50'}`}>
                      <View className="flex-row items-center justify-center">
                        <Icon
                          name={isIncrease ? 'trending-up' : 'trending-down'}
                          size={16}
                          color={isIncrease ? '#f97316' : '#22c55e'}
                        />
                        <Text
                          className={`ml-2 font-promptMedium ${
                            isIncrease ? 'text-orange-600' : 'text-green-600'
                          }`}
                        >
                          {isIncrease ? 'เพิ่มขึ้น' : 'ลดลง'} {Math.abs(diff).toFixed(1)} kg
                        </Text>
                      </View>
                    </View>
                  );
                })()}
              </View>
            )}

            <View className="flex-row space-x-3 gap-1">
              <TouchableOpacity
                className="flex-1 bg-gray-200 rounded-xl py-3 items-center"
                onPress={closeModal}
                disabled={isSubmitting}
              >
                <Text className="text-gray-700 font-promptMedium">ยกเลิก</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 rounded-xl py-3 items-center ${
                  newWeight && !isNaN(parseFloat(newWeight)) ? 'bg-primary' : 'bg-gray-300'
                }`}
                onPress={handleWeightUpdate}
                disabled={!newWeight || isNaN(parseFloat(newWeight)) || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text
                    className={`font-promptMedium ${
                      newWeight && !isNaN(parseFloat(newWeight)) ? 'text-white' : 'text-gray-500'
                    }`}
                  >
                    บันทึก
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default WeightUpdateCard;
