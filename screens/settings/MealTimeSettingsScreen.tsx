import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Switch, Platform } from 'react-native';
import DateTimePicker, { AndroidNativeProps, IOSNativeProps } from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTypedNavigation } from '../../hooks/Navigation';
import { ApiClient } from 'utils/apiClient';
import { scheduleMealRemindersForTimes } from '../../utils/autoNotifications';
import { useMealPlanStore } from '../../stores/mealPlanStore';
import { useMealPlanStoreEdit } from '../../stores/mealPlanStoreEdit';

type MealRow = {
  id?: number;
  meal_name: string;
  meal_time: string;   // 'HH:mm'
  sort_order: number;
  is_active: boolean;
  is_custom?: boolean;
};

const DEFAULT_MEALS: MealRow[] = [
  { meal_name: 'มื้อเช้า',    meal_time: '07:30', sort_order: 1, is_active: true },
  { meal_name: 'มื้อกลางวัน',  meal_time: '12:30', sort_order: 2, is_active: true },
  { meal_name: 'มื้อเย็น',    meal_time: '18:30', sort_order: 3, is_active: true },
];

// utils
const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const hhmmToDate = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
};
const dateToHHMM = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

const MealTimeSettingsScreen = () => {
  const navigation = useTypedNavigation<'MealTimeSettings'>();
  const apiClient = new ApiClient();
  const { fetchAndApplyMealTimes: refreshMealTimes } = useMealPlanStore();
  const { fetchAndApplyMealTimes: refreshMealTimesEdit } = useMealPlanStoreEdit();

  const [meals, setMeals] = useState<MealRow[]>(DEFAULT_MEALS);
  const [notifyOnTime, setNotifyOnTime] = useState<boolean>(true);

  // edit name แบบเดิม (ยังมีปุ่มบันทึกชื่อเฉพาะ เพราะโจทย์เน้นให้เอาปุ่มบันทึก "เวลา" ออก)
  const [editingNameIndex, setEditingNameIndex] = useState<number | null>(null);
  const [tempName, setTempName] = useState('');

  // time picker (ต่อรายการ)
  const [showPicker, setShowPicker] = useState(false);
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [pickerDate, setPickerDate] = useState<Date>(hhmmToDate('18:30'));

  // เพิ่มรายการใหม่
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTimeDate, setNewTimeDate] = useState<Date>(hhmmToDate('18:30'));
  const [showNewPicker, setShowNewPicker] = useState(false);

  useEffect(() => {
    getMealTimes();
  }, []);

  const getMealTimes = async () => {
    try {
      const res = await apiClient.getMealTimes();
      // คาดหวังรูปแบบ: { success: true, data: { data: { meals: [...], notify_on_time: boolean } } }
      if (res?.success && res?.data?.data) {
        const { meals: serverMeals, notify_on_time } = res.data.data;
        if (Array.isArray(serverMeals) && serverMeals.length) {
          const normalized: MealRow[] = serverMeals
            .map((m: any, idx: number) => ({
              id: m.id,
              meal_name: String(m.meal_name ?? ''),
              meal_time: String(m.meal_time ?? '00:00'),
              sort_order: Number(m.sort_order ?? idx + 1),
              is_active: Boolean(m.is_active ?? true),
              is_custom: !['มื้อเช้า','มื้อกลางวัน','มื้อเย็น'].includes(String(m.meal_name ?? '')),
            }))
            .sort((a, b) => a.sort_order - b.sort_order);
          setMeals(normalized);
        } else {
          setMeals(DEFAULT_MEALS);
        }
        setNotifyOnTime(Boolean(notify_on_time));
      } else {
        setMeals(DEFAULT_MEALS);
      }
    } catch (e) {
      console.error('Error fetching meal times:', e);
      setMeals(DEFAULT_MEALS);
    }
  };

  const nextSortOrder = useMemo(
    () => (meals.length ? Math.max(...meals.map(m => m.sort_order)) + 1 : 1),
    [meals]
  );

  // ---- name editing ----
  const startEditName = (index: number) => {
    setEditingNameIndex(index);
    setTempName(meals[index].meal_name);
  };
  const cancelEditName = () => {
    setEditingNameIndex(null);
    setTempName('');
  };
  const saveEditName = () => {
    if (editingNameIndex === null) return;
    const name = (tempName || '').trim();
    if (!name) {
      Alert.alert('กรอกไม่ครบ', 'กรุณากรอกชื่อมื้ออาหาร');
      return;
    }
    setMeals(prev => {
      const next = [...prev];
      next[editingNameIndex] = { ...next[editingNameIndex], meal_name: name };
      return next;
    });
    cancelEditName();
  };

  // ---- active toggle ----
  const toggleActive = (index: number) => {
    setMeals(prev => {
      const next = [...prev];
      next[index] = { ...next[index], is_active: !next[index].is_active };
      return next;
    });
  };

  // ---- remove ----
  const removeMeal = (index: number) => {
    setMeals(prev => {
      const next = [...prev];
      next.splice(index, 1);
      return next.map((m, i) => ({ ...m, sort_order: i + 1 }));
    });
  };

  // ---- time picker open/confirm (per row) ----
  const openTimePickerForRow = (index: number) => {
    setPickerIndex(index);
    setPickerDate(hhmmToDate(meals[index].meal_time));
    setShowPicker(true);
  };

  const onChangeTime = (_: any, selected?: Date) => {
    // Android: กด cancel จะได้ undefined, กด OK ได้ date
    // iOS (display inline/modal) จะยิงบ่อย ให้อัปเดตทันที
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selected && pickerIndex !== null) {
        const hhmm = dateToHHMM(selected);
        setMeals(prev => {
          const next = [...prev];
          next[pickerIndex] = { ...next[pickerIndex], meal_time: hhmm };
          return next;
        });
    }
  };

  // ---- add new ----
  const startAddNew = () => {
    setAddingNew(true);
    setNewName('');
    setNewTimeDate(hhmmToDate('18:30'));
  };
  const cancelAddNew = () => {
    setAddingNew(false);
    setNewName('');
    setNewTimeDate(hhmmToDate('18:30'));
    setShowNewPicker(false);
  };
  const confirmAddNew = () => {
    const name = (newName || '').trim();
    if (!name) {
      Alert.alert('กรอกไม่ครบ', 'กรุณากรอกชื่อมื้ออาหาร');
      return;
    }
    setMeals(prev => [
      ...prev,
      {
        meal_name: name,
        meal_time: dateToHHMM(newTimeDate),
        sort_order: nextSortOrder,
        is_active: true,
        is_custom: true,
      },
    ]);
    cancelAddNew();
  };

  // ---- submit ----
  const handleConfirm = async () => {
    // ตรวจเวลาคร่าว ๆ (HH:mm)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    for (const m of meals) {
      if (!timeRegex.test(m.meal_time)) {
        Alert.alert('รูปแบบเวลาไม่ถูกต้อง', `มื้อ "${m.meal_name}" กรุณากรอกเวลา HH:mm`);
        return;
      }
    }

    Alert.alert(
      'ยืนยันการตั้งค่า',
      'คุณต้องการบันทึกการตั้งค่าเวลามื้ออาหารหรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ยืนยัน',
          onPress: async () => {
            try {
              const payload = {
                notify_on_time: notifyOnTime,
                meals: meals
                  .map((m, i) => ({
                    id: m.id,
                    meal_name: m.meal_name,
                    meal_time: m.meal_time,
                    sort_order: m.sort_order ?? i + 1,
                    is_active: m.is_active ? 1 : 0,
                  }))
                  .sort((a, b) => a.sort_order - b.sort_order),
              };
              const resp = await apiClient.setMealTimes(payload);
              if (resp?.success) {
                try {
                  // Refresh meal times in both normal and edit stores
                  await Promise.all([
                    refreshMealTimes?.(),
                    refreshMealTimesEdit?.(),
                  ]);

                  const activeMeals = meals.filter((m) => m.is_active);
                  const times = activeMeals.map((m) => m.meal_time);
                  const names = activeMeals.map((m) => m.meal_name || 'มื้ออาหาร');
                  console.log('🕒 rescheduling after meal time save', { times, names });
                  await scheduleMealRemindersForTimes(times, { names, baseTag: 'server' });
                } catch (e) {
                  // Silent error; UI already saved
                }
                Alert.alert('สำเร็จ', 'บันทึกการตั้งค่าเวลาเรียบร้อยแล้ว');
              } else {
                Alert.alert('ผิดพลาด', resp?.error || 'บันทึกล้มเหลว');
              }
            } catch (e) {
              console.error('Error updating meal times:', e);
              Alert.alert('ผิดพลาด', 'ไม่สามารถบันทึกการตั้งค่าได้');
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-100">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-12 pb-4 bg-white">
          <TouchableOpacity
            className="w-10 h-10 rounded-full items-center justify-center"
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#9ca3af" />
          </TouchableOpacity>

          <View className="flex-row items-center gap-2">
            <Icon name="time" size={32} color="#9ca3af" />
            <Text className="text-lg font-semibold text-gray-800">ตั้งค่าเวลามื้ออาหาร</Text>
          </View>

          <Text className="text-base font-semibold text-gray-800" />
        </View>

        {/* กล่องตั้งค่าเวลามื้ออาหาร */}
        <View className="bg-white mx-4 my-4 rounded-xl p-5 shadow-lg shadow-slate-800">
          <Text className="text-xl font-promptSemiBold text-gray-800 mb-6">เลือกเวลามื้ออาหาร</Text>

          {meals
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((m, idx) => (
              <View key={`${m.meal_name}-${idx}`} className="py-4 border-b border-gray-100 last:border-b-0">
                <View className="flex-row items-center">
                  {/* toggle active */}
                  <TouchableOpacity onPress={() => toggleActive(idx)} className="mr-4">
                    <View
                      className={`w-6 h-6 border-2 rounded items-center justify-center ${
                        m.is_active ? 'border-primary bg-primary' : 'border-gray-300 bg-white'
                      }`}
                    >
                      {m.is_active && <Icon name="checkmark" size={16} color="white" />}
                    </View>
                  </TouchableOpacity>

                  <View className="flex-1">
                    {editingNameIndex === idx ? (
                      <>
                        <View className="flex-row items-center">
                          <View className="border border-primary rounded px-3 py-1 mr-2">
                            <TextInput
                              className="text-sm font-promptMedium text-gray-800 w-40"
                              value={tempName}
                              onChangeText={setTempName}
                              placeholder="ชื่อมื้อ เช่น มื้อว่างบ่าย"
                              autoFocus
                            />
                          </View>
                        </View>
                        <View className="flex-row mt-2">
                          <TouchableOpacity className="bg-primary rounded px-3 py-1 mr-2" onPress={saveEditName}>
                            <Text className="text-white text-xs font-promptMedium">บันทึก</Text>
                          </TouchableOpacity>
                          <TouchableOpacity className="bg-gray-300 rounded px-3 py-1" onPress={cancelEditName}>
                            <Text className="text-gray-700 text-xs font-promptMedium">ยกเลิก</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    ) : (
                      <View className="flex-row items-center justify-between">
                        <TouchableOpacity onPress={() => startEditName(idx)} className="flex-1 mr-3">
                          <Text className="text-base font-promptMedium text-gray-800">{m.meal_name}</Text>
                        </TouchableOpacity>

                        {/* เวลาที่แตะแล้วเปิด time picker */}
                        <TouchableOpacity
                          onPress={() => openTimePickerForRow(idx)}
                          className="px-3 py-1 rounded border border-primary"
                        >
                          <Text className="text-sm font-promptMedium text-primary">{m.meal_time} น.</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  {/* ปุ่มลบเฉพาะ custom และไม่ได้กำลังแก้ชื่อ */}
                  {m.is_custom && editingNameIndex !== idx && (
                    <TouchableOpacity className="ml-2 p-2" onPress={() => removeMeal(idx)}>
                      <Icon name="trash-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

          {/* เพิ่มเวลาใหม่ */}
          {addingNew ? (
            <View className="mt-4">
              <View className="flex-row items-center">
                <View className="border border-primary rounded px-3 py-1 mr-2">
                  <TextInput
                    className="text-sm font-promptMedium text-gray-800 w-40"
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="ชื่อมื้อ เช่น มื้อว่างบ่าย"
                    autoFocus
                  />
                </View>

                <TouchableOpacity
                  onPress={() => setShowNewPicker(true)}
                  className="border border-primary rounded px-3 py-1"
                >
                  <Text className="text-sm font-promptMedium text-primary">{dateToHHMM(newTimeDate)} น.</Text>
                </TouchableOpacity>
              </View>

              {/* time picker สำหรับเพิ่มใหม่ */}
              {showNewPicker && (
                <DateTimePicker
                  value={newTimeDate}
                  mode="time"
                  is24Hour
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(_, selected) => {
                    if (Platform.OS === 'android') setShowNewPicker(false);
                    if (selected) setNewTimeDate(selected);
                  }}
                />
              )}

              <View className="flex-row mt-3">
                <TouchableOpacity className="bg-primary rounded px-3 py-2 mr-2" onPress={confirmAddNew}>
                  <Text className="text-white text-xs font-promptMedium">เพิ่ม</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-gray-300 rounded px-3 py-2" onPress={cancelAddNew}>
                  <Text className="text-gray-700 text-xs font-promptMedium">ยกเลิก</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              className="flex-row items-center py-4 mt-4 border border-gray-200 rounded-lg px-4"
              onPress={startAddNew}
            >
              <View className="w-6 h-6 border-2 border-gray-300 rounded mr-4 items-center justify-center">
                <Icon name="add" size={16} color="#6b7280" />
              </View>
              <Text className="text-lg font-promptMedium text-gray-600">เพิ่มเวลาใหม่</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            className="w-full bg-primary rounded-xl p-4 justify-center items-center mt-6"
            onPress={handleConfirm}
          >
            <Text className="text-white text-lg font-promptBold">ยืนยันการตั้งค่า</Text>
          </TouchableOpacity>
        </View>

        {/* แจ้งเตือนเมื่อถึงเวลามื้ออาหาร */}
        {/* <View className="bg-white mx-4 my-2 rounded-xl p-5 shadow-lg shadow-slate-800">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-promptSemiBold text-gray-800">แจ้งเตือนเมื่อถึงเวลามื้ออาหาร</Text>
            <Switch value={notifyOnTime} onValueChange={setNotifyOnTime} />
          </View>

          <TouchableOpacity
            className="w-full bg-primary rounded-xl p-4 justify-center items-center mt-6"
            onPress={handleConfirm}
          >
            <Text className="text-white text-lg font-promptBold">ยืนยันการตั้งค่า</Text>
          </TouchableOpacity>
        </View> */}
      </ScrollView>

      {/* time picker สำหรับแก้รายการเดิม */}
      {showPicker && pickerIndex !== null && (
        <DateTimePicker
          value={pickerDate}
          mode="time"
          is24Hour
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeTime}
        />
      )}
    </View>
  );
};

export default MealTimeSettingsScreen;
