import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useTypedNavigation } from '../../hooks/Navigation';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Menu from '../material/Menu';
import { fetchTodayMeals, TodayMealData, TodayMealItem } from '../../utils/todayMealApi';
import { createEatingRecord, EatingRecord, getEatingRecordsByDate, deleteEatingRecord, checkSavedPlanItems, generateUniqueId } from '../../utils/api/eatingRecordApi';
import { AddMealModal } from '../../components/AddMealModal';

interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  carbs?: number;
  fat?: number;
  protein?: number;
  confirmed: boolean;
  fromPlan?: boolean; // Indicates if this food is from meal plan
  saved?: boolean; // Indicates if already saved to backend
  recordId?: number; // Backend record id for deletion
  uniqueId?: string; // Unique ID สำหรับอาหารตามแผน
}

interface MealTime {
  time: string;
  label: string;
  mealType: string; // For API mapping
  entries: FoodEntry[];
}

const RecordFoodScreen = () => {
  const navigation = useTypedNavigation();
  const route = useRoute();
  const params = route.params as any;

  // Get current day for limiting navigation and initial state
  const getCurrentDay = () => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const bangkokTime = new Date(utc + (7 * 3600000)); // UTC+7 for Bangkok
    return bangkokTime.getDate();
  };
  const getDefaultMeals = (): MealTime[] => [
    {
      time: '7:30',
      label: 'มื้อเช้า', 
      mealType: 'breakfast',
      entries: []
    },
    {
      time: '12:30',
      label: 'มื้อกลางวัน',
      mealType: 'lunch',
      entries: []
    },
    {
      time: '18:30',
      label: 'มื้อเย็น',
      mealType: 'dinner',
      entries: []
    }
  ];

  // Always start with today's date
  const [selectedDay, setSelectedDay] = useState(() => getCurrentDay());
  const [mealTimes, setMealTimes] = useState<MealTime[]>(() => getDefaultMeals());
  const [todayMealData, setTodayMealData] = useState<TodayMealData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSavedToday, setHasSavedToday] = useState(false);
  const [savedRecords, setSavedRecords] = useState<EatingRecord[]>([]);
  const [showAddMealModal, setShowAddMealModal] = useState(false);

  // Load appropriate data when selected day changes
  useEffect(() => {
    const currentDay = getCurrentDay();
    const isTodaySelected = selectedDay === currentDay;
    if (isTodaySelected) {
      loadTodayMeals();
    } else {
      setMealTimes(getDefaultMeals());
      setTodayMealData(null);
    }
    setHasSavedToday(false);
   
  }, [selectedDay]);


  // Ensure we start with today's date when component mounts
  useEffect(() => {
    const currentDay = getCurrentDay();
    if (selectedDay !== currentDay) {
      setSelectedDay(currentDay);
    }
  }, []);

  // Load today's meals from API
  const loadTodayMeals = useCallback(async () => {
    try {
      setIsLoading(true);
      const todayMeals = await fetchTodayMeals();
      setTodayMealData(todayMeals);
      console.log(todayMeals);
      if (todayMeals) {
        // Convert API data to MealTime format but preserve any manually added (non-plan) entries
        setMealTimes(prev => {
          const preserved = prev.map(mt => mt.entries.filter(e => !e.fromPlan));
          const next = [...prev];

          next[0] = {
            ...next[0],
            entries: [
              ...todayMeals.breakfast.map((meal, index) => ({
                id: `breakfast-${index}`,
                name: meal.name,
                calories: meal.calories,
                carbs: meal.carb,
                fat: meal.fat,
                protein: meal.protein,
                confirmed: true,
                fromPlan: true,
                uniqueId: generateUniqueId(selectedDay, 0, index)
              })),
              ...preserved[0]
            ]
          };

          next[1] = {
            ...next[1],
            entries: [
              ...todayMeals.lunch.map((meal, index) => ({
                id: `lunch-${index}`,
                name: meal.name,
                calories: meal.calories,
                carbs: meal.carb,
                fat: meal.fat,
                protein: meal.protein,
                confirmed: true,
                fromPlan: true,
                uniqueId: generateUniqueId(selectedDay, 1, index)
              })),
              ...preserved[1]
            ]
          };

          next[2] = {
            ...next[2],
            entries: [
              ...todayMeals.dinner.map((meal, index) => ({
                id: `dinner-${index}`,
                name: meal.name,
                calories: meal.calories,
                carbs: meal.carb,
                fat: meal.fat,
                protein: meal.protein,
                confirmed: true,
                fromPlan: true,
                uniqueId: generateUniqueId(selectedDay, 2, index)
              })),
              ...preserved[2]
            ]
          };

          return next;
        });

        // Check which plan items are already saved
        await checkPlanItemsSavedStatus();
      }
    } catch (error) {
      console.error('❌ [RecordFoodScreen] Error loading today\'s meals:', error);
      // Keep empty meals if API fails
      setTodayMealData(null);
    } finally {
      setIsLoading(false);
    }
  }, []); // ลบ selectedDay dependency เพื่อหลีกเลี่ยงการ re-call ซ้ำ

  const getIsoDateForDay = (day: number) => {

  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const bangkokTime = new Date(utc + (7 * 3600000)); // UTC+7 for Bangkok
  const targetDate = new Date(bangkokTime.getFullYear(), bangkokTime.getMonth(), day);
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const dayStr = String(targetDate.getDate()).padStart(2, '0');
  
  const isoDate = `${year}-${month}-${dayStr}`;
  console.log(`📅 [RecordFood] Converting day ${day} to ISO date: ${isoDate} (Bangkok timezone)`);
  
  return isoDate;
};

  // Check which plan items are already saved using unique_id
  const checkPlanItemsSavedStatus = async () => {
    try {
      const uniqueIds: string[] = [];
      
      mealTimes.forEach((meal, mealIndex) => {
        meal.entries.forEach((entry, itemIndex) => {
          if (entry.fromPlan && entry.uniqueId) {
            uniqueIds.push(entry.uniqueId);
          }
        });
      });
      
      if (uniqueIds.length > 0) {
        const savedStatus = await checkSavedPlanItems(uniqueIds) as Record<string, { saved: boolean; recordId?: number }>;

        // Update meal times with saved status and recordId
        setMealTimes(prev => prev.map(meal => ({
          ...meal,
          entries: meal.entries.map(entry => {
            if (entry.fromPlan && entry.uniqueId) {
              const status = savedStatus[entry.uniqueId];
              return {
                ...entry,
                saved: !!status?.saved,
                recordId: status?.recordId ?? entry.recordId,
              };
            }
            return entry;
          })
        })));
      }
    } catch (error) {
      console.error('Failed to check saved status:', error);
    }
  };

  const loadSavedRecords = useCallback(async () => {
    try {
      const date = getIsoDateForDay(selectedDay);
      console.log(`🔍 [LoadSaved] Requesting date: ${date} for selectedDay: ${selectedDay}`);
      
      const res = await getEatingRecordsByDate(date);
      console.log(`📥 [LoadSaved] API Response records count: ${res.data?.records?.length || 0}`);
      console.log(JSON.stringify(res, null, 2));
      
      if (res.success) {
        const records = res.data.records || [];
        console.log(`✅ [LoadSaved] Found ${records.length} records for ${date}`);
        
        setSavedRecords(records);
        setHasSavedToday(records.length > 0);
        
        // Log each record for debugging
        records.forEach((record, idx) => {
          console.log(`📋 [LoadSaved] Record ${idx + 1}: ${record.food_name} (${record.meal_type}) - ${record.calories} cal - ID: ${record.id}`);
        });
        
        // Add custom meals from saved records that don't match default meal types
        const defaultMealLabels = new Set(['มื้อเช้า', 'มื้อกลางวัน', 'มื้อเย็น']);
        const customMealTypes = [...new Set(
          records
            .map(r => r.meal_type)
            .filter(mt => mt && !defaultMealLabels.has(mt))
        )];
        
        console.log(`🍽️ [LoadSaved] Custom meal types found:`, customMealTypes);
        
        if (customMealTypes.length > 0) {
          setMealTimes(prev => {
            const existing = new Set(prev.map(m => m.label));
            const newMeals: MealTime[] = customMealTypes
              .filter((mt): mt is string => mt !== undefined && !existing.has(mt))
              .map((mt, idx) => ({
                time: `${12 + idx * 2}:00`, // Generate times for custom meals
                label: mt,
                mealType: mt.toLowerCase(),
                entries: []
              }));
            console.log(`➕ [LoadSaved] Adding ${newMeals.length} custom meals:`, newMeals.map(m => m.label));
            return [...prev, ...newMeals];
          });
        }
      }
    } catch (e) {
      console.error('❌ [RecordFood] loadSavedRecords failed:', e);
    }
  }, [selectedDay]);

  // Refresh data when screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      const currentDay = getCurrentDay();
      const isTodaySelected = selectedDay === currentDay;
      
      console.log(`🔄 [Focus] selectedDay: ${selectedDay}, currentDay: ${currentDay}, isTodaySelected: ${isTodaySelected}`);
      
      if (isTodaySelected) {
        console.log('📅 [Focus] Loading today meals...');
        loadTodayMeals();
      } else {
        console.log('📅 [Focus] Loading saved records for past day...');
        // For past days, just load saved records
        setTodayMealData(null);
        setMealTimes(getDefaultMeals());
      }
      // Always refresh saved records when focused
      loadSavedRecords();
    }, [loadTodayMeals, loadSavedRecords, selectedDay])
  );

  const { isToday } = (() => {
    const currentDay = getCurrentDay();
    const isTodaySelected = selectedDay === currentDay;
    console.log(`📅 [IsToday] selectedDay: ${selectedDay}, currentDay: ${currentDay}, isToday: ${isTodaySelected}`);
    return { isToday: isTodaySelected };
  })();
  const totalCaloriesToday = mealTimes.reduce((total, meal) =>
    total + meal.entries.reduce((mealTotal, entry) => mealTotal + entry.calories, 0), 0
  );
  const totalCaloriesSaved = savedRecords.reduce((sum, r) => sum + (r.calories || 0), 0);
  const totalCalories = isToday ? totalCaloriesToday : totalCaloriesSaved;
  const targetCalories = todayMealData?.totalCalories || 0;
  // Helpers for header UI
  const progressPercent = targetCalories > 0
    ? Math.min(Math.round((totalCaloriesSaved / targetCalories) * 100), 100)
    : 0;
  const isUnderTarget = totalCaloriesSaved < targetCalories;
  const isAtTarget = totalCaloriesSaved === targetCalories;
  const isOverTarget = totalCaloriesSaved > targetCalories;
  const remainingCalories = Math.max(targetCalories - totalCaloriesSaved, 0);
  const overCalories = Math.max(totalCaloriesSaved - targetCalories, 0);
  const barColor = isUnderTarget ? 'bg-blue-500' : isAtTarget ? 'bg-green-500' : 'bg-red-500';
  const chipBg = isUnderTarget ? 'bg-blue-100' : isAtTarget ? 'bg-green-100' : 'bg-red-100';
  const chipText = isUnderTarget ? 'text-blue-700' : isAtTarget ? 'text-green-700' : 'text-red-700';
  const iconColor = isUnderTarget ? '#3b82f6' : isAtTarget ? '#22c55e' : '#ef4444';

  const getCurrentDate = () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear() + 543; // Convert to Buddhist Era
    const currentDay = today.getDate();

    return {
      dayName: selectedDay === currentDay ? 'วันนี้' : `วันที่ ${selectedDay}`,
      fullDate: `${selectedDay}/${month}/${year}`,
      isToday: selectedDay === currentDay
    };
  };

  const { dayName } = getCurrentDate();

  // Function to go back to today
  const goToToday = () => {
    setSelectedDay(getCurrentDay());
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    const currentDay = getCurrentDay();
    
    if (direction === 'prev' && selectedDay > 1) {
      setSelectedDay(selectedDay - 1);
    } else if (direction === 'next') {
      if (selectedDay < currentDay) {
        setSelectedDay(selectedDay + 1);
      } else {
        // Show alert when trying to go to future days
        Alert.alert(
          'ไม่สามารถดูข้อมูลได้', 
          'ไม่สามารถดูหรือบันทึกข้อมูลของวันอนาคตได้',
          [{ text: 'ตกลง', style: 'default' }]
        );
      }
    }
  };

  const handleAddFood = (timeIndex: number) => {
    const meal = mealTimes[timeIndex];
    navigation.navigate('SearchFoodForAdd', {
      selectedDay: selectedDay,
      source: meal.label, // Use label as source identifier
      timeIndex,
      mealLabel: meal.label, // Pass actual meal label
      mealTime: meal.time    // Pass actual meal time
    });
  };

  const handleRemoveFood = (timeIndex: number, entryId: string) => {
    const updatedMealTimes = [...mealTimes];
    updatedMealTimes[timeIndex].entries = updatedMealTimes[timeIndex].entries.filter(
      entry => entry.id !== entryId
    );
    setMealTimes(updatedMealTimes);
  };

  const handleConfirmAll = async () => {
    const totalMeals = mealTimes.reduce((total, meal) => total + meal.entries.length, 0);
    
    if (totalMeals === 0) {
      Alert.alert('ไม่มีอาหารที่จะบันทึก', 'กรุณาเพิ่มอาหารก่อนทำการยืนยัน');
      return;
    }
    
    // Only allow saving for today
    if (!isToday) {
      Alert.alert('ไม่สามารถบันทึกได้', 'สามารถบันทึกอาหารได้เฉพาะวันนี้เท่านั้น');
      return;
    }

    // Check if already saving
    if (isSaving) {
      return;
    }

    // Check if already saved today
    if (hasSavedToday) {
      Alert.alert(
        'เคยบันทึกแล้ว',
        'คุณได้บันทึกอาหารวันนี้ไปแล้ว ต้องการบันทึกเพิ่มหรือไม่?',
        [
          { text: 'ยกเลิก', style: 'cancel' },
          { 
            text: 'บันทึกเพิ่ม', 
            onPress: async () => {
              await saveAllMealsToDatabase();
            }
          }
        ]
      );
      return;
    }

    // Show plan information in confirmation
    const planInfo = todayMealData?.planName ? `\nตามแผน: ${todayMealData.planName}` : '';
    
    Alert.alert(
      'ยืนยันการบันทึก', 
      `คุณต้องการบันทึกอาหาร ${totalMeals} รายการหรือไม่?${planInfo}`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'ยืนยัน', 
          onPress: async () => {
            await saveAllMealsToDatabase();
          }
        }
      ]
    );
  };

  const saveAllMealsToDatabase = async () => {
    try {
      setIsSaving(true);
      
      // ใช้ timezone ไทยในการสร้างวันที่สำหรับบันทึก
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const bangkokTime = new Date(utc + (7 * 3600000)); // UTC+7 for Bangkok
      const logDate = bangkokTime.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      let savedCount = 0;
      let errorCount = 0;

      for (const meal of mealTimes) {
        for (const entry of meal.entries) {
          try {
            const recordData: Omit<EatingRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
              log_date: logDate,
              food_name: entry.name,
              meal_type: meal.label,
              calories: entry.calories || 0,
              carbs: entry.carbs || 0,
              fat: entry.fat || 0,
              protein: entry.protein || 0,
              meal_time: meal.time + ':00', // Convert to HH:MM:SS format
              image: undefined // No image for now
            };

            await createEatingRecord(recordData);
            savedCount++;
            console.log(`✅ [RecordFood] Saved: ${entry.name} for ${meal.label}`);
          } catch (error) {
            console.error(`❌ [RecordFood] Failed to save: ${entry.name}`, error);
            errorCount++;
          }
        }
      }

      // Mark as saved if at least some records were saved
      if (savedCount > 0) {
        setHasSavedToday(true);
      }

      // Show result
      if (errorCount === 0) {
        Alert.alert(
          'สำเร็จ!', 
          `บันทึกอาหาร ${savedCount} รายการเรียบร้อยแล้ว`,
          [
            {
              text: 'ตกลง',
              onPress: () => {
                // Optionally navigate back or refresh
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'บันทึกเสร็จสิ้น', 
          `บันทึกสำเร็จ ${savedCount} รายการ\nไม่สำเร็จ ${errorCount} รายการ`,
          [{ text: 'ตกลง' }]
        );
      }

    } catch (error) {
      console.error('❌ [RecordFood] Error in saveAllMealsToDatabase:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSaving(false);
    }
  };

  const FoodEntryCard = ({ entry, onRemove, onSave, onDelete }: { entry: FoodEntry; onRemove?: () => void; onSave?: () => void; onDelete?: () => void }) => (
    <View className={`${entry.fromPlan ? 'bg-blue-50 border border-blue-200' : 'bg-green-100'} rounded-lg p-3 mb-2`}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <Icon 
            name={entry.fromPlan ? "calendar" : "checkmark-circle"} 
            size={20} 
            color={entry.fromPlan ? "#3b82f6" : "#22c55e"} 
          />
          <View className="ml-3 flex-1">
            <View className="flex-row items-center">
              <Text className="font-semibold text-gray-800">{entry.name}</Text>
              {entry.fromPlan && (
                <View className="ml-2 px-2 py-1 bg-blue-100 rounded-full">
                  <Text className="text-blue-600 text-xs font-medium">ตามแผน</Text>
                </View>
              )}
              {entry.saved && (
                <View className="ml-2 px-2 py-1 bg-green-100 rounded-full">
                  <Text className="text-green-700 text-xs font-medium">บันทึกแล้ว</Text>
                </View>
              )}
            </View>
            <View className="flex-row items-center mt-1">
              <Text className="text-gray-600 text-sm">{entry.calories} แคลอรี่</Text>
              {entry.carbs && entry.fat && entry.protein && (
                <Text className="text-gray-500 text-xs ml-2">
                  • คาร์บ {entry.carbs}g • ไขมัน {entry.fat}g • โปรตีน {entry.protein}g
                </Text>
              )}
            </View>
          </View>
        </View>
        <View className="flex-row items-center">
          {entry.fromPlan && !entry.saved && onSave && (
            <TouchableOpacity onPress={onSave} className="ml-2 bg-primary p-2 rounded-full">
              <Icon name="save" size={16} color="white" />
            </TouchableOpacity>
          )}
          {entry.saved && onDelete && (
            <TouchableOpacity onPress={onDelete} className="ml-2 bg-red-500 p-2 rounded-full">
              <Icon name="trash" size={16} color="white" />
            </TouchableOpacity>
          )}
          {!entry.saved && !entry.fromPlan && onRemove && (
            <TouchableOpacity onPress={onRemove} className="ml-2">
              <Icon name="remove-circle" size={20} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const handleAddNewMeal = (name: string, time: string) => {
    const newMeal: MealTime = {
      time,
      label: name,
      mealType: name.toLowerCase(),
      entries: []
    };
    setMealTimes(prev => [...prev, newMeal]);
    setShowAddMealModal(false);
  };

  const renderMealCard = (meal: MealTime, timeIndex: number) => {
    console.log(`🔍 [RenderMeal] Rendering ${meal.label}...`);
    
    const currentDay = getCurrentDay();
    const isTodaySelected = selectedDay === currentDay;
    
  
    // สำหรับวันก่อนหน้า: แสดงเฉพาะ savedRecords
    if (!isTodaySelected) {
      const savedForMeal = savedRecords.filter(r => r.meal_type === meal.label);
     
      const savedEntries: FoodEntry[] = savedForMeal.map((r, idx) => ({
        id: `saved-${timeIndex}-${idx}`,
        name: r.food_name,
        calories: r.calories || 0,
        carbs: r.carbs || 0,
        fat: r.fat || 0,
        protein: r.protein || 0,
        confirmed: true,
        fromPlan: false,
        saved: true,
        recordId: r.id,
      }));

      const handleDeleteSavedItem = async (entry: FoodEntry) => {
        if (!entry.recordId) return;
        
        Alert.alert(
          'ยืนยันการลบ',
          `ต้องการลบ "${entry.name}" หรือไม่?`,
          [
            { text: 'ยกเลิก', style: 'cancel' },
            {
              text: 'ลบ',
              style: 'destructive',
              onPress: async () => {
                try {
                  await deleteEatingRecord(entry.recordId!);
                  await loadSavedRecords();
                  console.log('✅ [RecordFood] Successfully deleted record:', entry.recordId);
                } catch (e) {
                  console.error('❌ [RecordFood] Failed to delete record:', e);
                  Alert.alert('ลบไม่สำเร็จ', 'กรุณาลองใหม่อีกครั้ง');
                }
              }
            }
          ]
        );
      };

      return (
        <View key={timeIndex} className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-primary/20 rounded-full items-center justify-center mr-3">
                <Icon
                  name={timeIndex === 0 ? 'sunny' : timeIndex === 1 ? 'partly-sunny' : 'moon'}
                  size={24}
                  color="#eab308"
                />
              </View>
              <View>
                <Text className="text-lg font-semibold text-gray-800">{meal.label}</Text>
                <Text className="text-sm text-gray-500">{meal.time}</Text>
              </View>
            </View>
            <View className={`px-3 py-1 rounded-full ${savedEntries.length > 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Text className={`text-xs font-medium ${savedEntries.length > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                {savedEntries.length > 0 ? `${savedEntries.length} รายการ` : 'ไม่มีข้อมูล'}
              </Text>
            </View>
          </View>
          
          {savedEntries.length > 0 ? (
            <View className="mb-3">
              {savedEntries.map((entry) => (
                <FoodEntryCard
                  key={entry.id}
                  entry={entry}
                  onDelete={() => handleDeleteSavedItem(entry)}
                />
              ))}
            </View>
          ) : (
            <View className="border-2 border-dashed border-gray-200 rounded-lg p-4 items-center mb-3">
              <Icon name="restaurant-outline" size={32} color="#9ca3af" />
              <Text className="text-gray-500 mt-2 text-center">ไม่มีข้อมูลการกิน</Text>
            </View>
          )}
          
          <TouchableOpacity
            onPress={() => handleAddFood(timeIndex)}
            className="bg-primary rounded-lg py-3 flex-row items-center justify-center"
          >
            <Icon name="add" size={20} color="white" />
            <Text className="text-white font-medium ml-2">เพิ่มอาหาร</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // สำหรับวันนี้: แสดง plan + saved records
    console.log(`📋 [RenderMeal] Today - ${meal.label}: Processing plan items...`);
    
    const namesInPlan = new Set(meal.entries.map(e => e.name));
    const savedForMeal = savedRecords.filter(r => r.meal_type === meal.label);
    const savedMap = new Map(savedForMeal.map(r => [r.food_name, r] as const));
    const planEntriesWithSaved: FoodEntry[] = meal.entries.map(e => {
      const sr = savedMap.get(e.name);
      return { ...e, saved: !!sr, recordId: sr?.id };
    });
    const savedManualEntries: FoodEntry[] = savedForMeal
      .filter(r => !namesInPlan.has(r.food_name))
      .map((r, idx) => ({
        id: `saved-${timeIndex}-${idx}`,
        name: r.food_name,
        calories: r.calories || 0,
        carbs: r.carbs || 0,
        fat: r.fat || 0,
        protein: r.protein || 0,
        confirmed: true,
        fromPlan: false,
        saved: true,
        recordId: r.id,
      }));

    const allEntries = [...planEntriesWithSaved, ...savedManualEntries];
    
    console.log(`📋 [RenderMeal] ${meal.label} - Plan: ${planEntriesWithSaved.length}, Manual: ${savedManualEntries.length}, Total: ${allEntries.length}`);

    const handleSavePlanItem = async (entry: FoodEntry) => {
      try {
        setIsSaving(true);
        // ใช้ timezone ไทยในการสร้างวันที่สำหรับบันทึก
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const bangkokTime = new Date(utc + (7 * 3600000)); // UTC+7 for Bangkok
        const logDate = bangkokTime.toISOString().split('T')[0];
        
        const recordData: Omit<EatingRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
          log_date: logDate,
          food_name: entry.name,
          meal_type: meal.label,
          calories: entry.calories || 0,
          carbs: entry.carbs || 0,
          fat: entry.fat || 0,
          protein: entry.protein || 0,
          meal_time: meal.time + ':00',
          image: undefined,
          unique_id: entry.uniqueId
        };
        await createEatingRecord(recordData);
        
        // Update the entry as saved in state
        setMealTimes(prev => prev.map(mealTime => ({
          ...mealTime,
          entries: mealTime.entries.map(e => 
            e.uniqueId === entry.uniqueId ? { ...e, saved: true } : e
          )
        })));
        
        await loadSavedRecords();
      } catch (e) {
        Alert.alert('บันทึกไม่สำเร็จ', 'กรุณาลองใหม่อีกครั้ง');
      } finally {
        setIsSaving(false);
      }
    };

    const handleDeleteSavedItem = async (entry: FoodEntry) => {
      if (!entry.recordId) return;
      try {
        await deleteEatingRecord(entry.recordId);
        await loadSavedRecords();
      } catch (e) {
        Alert.alert('ลบไม่สำเร็จ', 'กรุณาลองใหม่อีกครั้ง');
      }
    };

    return (
      <View key={timeIndex} className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-primary/20 rounded-full items-center justify-center mr-3">
              <Icon
                name={timeIndex === 0 ? 'sunny' : timeIndex === 1 ? 'partly-sunny' : 'moon'}
                size={24}
                color="#eab308"
              />
            </View>
            <View>
              <Text className="text-lg font-semibold text-gray-800">{meal.label}</Text>
              <Text className="text-sm text-gray-500">{meal.time}</Text>
            </View>
          </View>
          <View className={`px-3 py-1 rounded-full ${allEntries.length > 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Text className={`text-xs font-medium ${allEntries.length > 0 ? 'text-green-600' : 'text-gray-600'}`}>
              {allEntries.length > 0 ? `${allEntries.length} รายการ` : 'ยังไม่มีอาหาร'}
            </Text>
          </View>
        </View>
        {allEntries.length > 0 ? (
          <View className="mb-3">
            {allEntries.map((entry) => (
              <FoodEntryCard
                key={entry.id}
                entry={entry}
                onSave={entry.fromPlan && !entry.saved && isTodaySelected ? () => handleSavePlanItem(entry) : undefined}
                onDelete={entry.saved ? () => handleDeleteSavedItem(entry) : undefined}
              />
            ))}
          </View>
        ) : (
          <View className="border-2 border-dashed border-gray-200 rounded-lg p-4 items-center mb-3">
            <Icon name="add-circle-outline" size={32} color="#9ca3af" />
            <Text className="text-gray-500 mt-2 text-center">ยังไม่มีอาหาร</Text>
          </View>
        )}
        <TouchableOpacity
          onPress={() => handleAddFood(timeIndex)}
          className="bg-primary rounded-lg py-3 flex-row items-center justify-center"
        >
          <Icon name="add" size={20} color="white" />
          <Text className="text-white font-medium ml-2">เพิ่มอาหาร</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-primary px-4 py-4 mt-6 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity
          className="w-10 h-10 rounded-lg items-center justify-center"
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">บันทึก/ยืนยันอาหาร</Text>
        <TouchableOpacity 
          className="w-10 h-10 rounded-lg items-center justify-center"
          onPress={goToToday}
        >
          <Icon name={isToday ? "calendar" : "today"} size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity
          className={`w-8 h-8 items-center justify-center ${selectedDay <= 1 ? 'opacity-50' : ''}`}
          onPress={() => navigateDay('prev')}
          disabled={selectedDay <= 1}
        >
          <Icon name="chevron-back" size={20} color="#374151" />
        </TouchableOpacity>
        <Text className={`text-lg font-medium ${isToday ? 'text-primary font-bold' : 'text-gray-800'}`}>
          {dayName}
        </Text>
        {!isToday && (
          <TouchableOpacity 
            onPress={goToToday}
            className="absolute right-16 bg-primary/10 px-2 py-1 rounded-full"
          >
            <Text className="text-primary text-xs font-medium">กลับวันนี้</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className={`w-8 h-8 items-center justify-center ${selectedDay >= getCurrentDay() ? 'opacity-50' : ''}`}
          onPress={() => navigateDay('next')}
          disabled={selectedDay >= getCurrentDay()}
        >
          <Icon name="chevron-forward" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <View className={`w-8 h-8 rounded-full items-center justify-center ${chipBg}`}>
              <Icon name="flame" size={18} color={iconColor} />
            </View>
            <Text className="font-medium text-gray-700 ml-2">
              {isToday ? 'แคลอรี่ที่บันทึก' : `แคลอรี่ที่บันทึกวันที่ ${selectedDay} แล้ว`}
            </Text>
          </View>
          {isLoading ? (
            <Text className="font-semibold text-gray-400">กำลังโหลด...</Text>
          ) : (
            <View className="items-end">
              <Text className={`font-bold text-md ${isOverTarget ? 'text-red-600' : isAtTarget ? 'text-green-600' : 'text-blue-600'}`}>
                {totalCaloriesSaved.toLocaleString()} แคลอรี่ / {(todayMealData?.totalCalories?.toLocaleString?.() as string) || '0'} แคลอรี่
              </Text>
              <View className={`px-2 py-0.5 rounded-full mt-1 ${chipBg}`}>
                <Text className={`text-xs font-medium ${chipText}`}>{progressPercent}% ของเป้าหมาย</Text>
              </View>
            </View>
          )}
        </View>
        <View className="bg-gray-200 rounded-full h-3 overflow-hidden">
          <View
            className={`h-3 ${barColor}`}
            style={{ width: `${progressPercent}%` }}
          />
        </View>
        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-xs text-gray-500">0</Text>
          <Text className="text-xs text-gray-500">{targetCalories.toLocaleString()} แคลอรี่</Text>
        </View>
        {!isLoading && (
          <View className="flex-row items-center justify-between mt-2">
            <Text className={`text-xs ${isUnderTarget ? 'text-orange-600' : isAtTarget ? 'text-green-600' : 'text-red-600'}`}>
              {isUnderTarget && `เหลืออีก ${remainingCalories.toLocaleString()} แคลอรี่`}
              {isAtTarget && 'ครบเป้าหมายแล้ว'}
              {isOverTarget && `เกิน ${overCalories.toLocaleString()} แคลอรี่`}
            </Text>
            {isToday && totalCaloriesSaved > 0 && (
              <Text className="text-xs text-gray-500">
                จากการบันทึก {savedRecords.length} รายการ
              </Text>
            )}
          </View>
        )}
       
      </View>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <Icon name="restaurant" size={48} color="#9ca3af" />
            <Text className="text-gray-500 mt-4 text-lg">กำลังโหลดเมนูอาหาร...</Text>
            <Text className="text-gray-400 mt-2 text-center">
              กำลังดึงข้อมูลแผนการกินของคุณ
            </Text>
          </View>
        ) : !isToday ? (
          // For past days: Show saved records or default meals with saved data
          <>
            
            {mealTimes.map((meal, timeIndex) => renderMealCard(meal, timeIndex))}
          </>
        ) : !todayMealData || (!todayMealData.breakfast.length && !todayMealData.lunch.length && !todayMealData.dinner.length) ? (
          <View className="flex-1 items-center justify-center py-20">
            <Icon name="calendar-outline" size={48} color="#9ca3af" />
            <Text className="text-gray-500 mt-4 text-lg">ไม่มีแผนการกินวันนี้</Text>
            <Text className="text-gray-400 mt-2 text-center">
              คุณสามารถเพิ่มอาหารด้วยตนเองได้
            </Text>
            <TouchableOpacity 
              className="bg-primary rounded-lg px-6 py-3 mt-6"
              onPress={() => navigation.navigate('SelectGlobalPlan')}
            >
              <View className="flex-row items-center">
                <Icon name="add" size={20} color="white" />
                <Text className="text-white font-medium ml-2">เลือกแผนการกิน</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          // For today: Show plan data
          <>
            
            {mealTimes.map((meal, timeIndex) => renderMealCard(meal, timeIndex))}
          </>
        )}
        <TouchableOpacity
          className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 items-center justify-center mb-4"
          onPress={() => setShowAddMealModal(true)}
        >
          <Icon name="add-circle" size={22} color="#9ca3af" />
          <Text className="text-gray-600 font-medium mt-2">เพิ่มมื้อเพิ่มเติม</Text>
        </TouchableOpacity>
      </ScrollView>

  {/* Removed bottom summary and group save to simplify UI as requested */}
  <View className='h-4' />

      <AddMealModal
        visible={showAddMealModal}
        onClose={() => setShowAddMealModal(false)}
        onAddMeal={handleAddNewMeal}
      />

      <Menu />
    </SafeAreaView>
  );
};

export default RecordFoodScreen;
