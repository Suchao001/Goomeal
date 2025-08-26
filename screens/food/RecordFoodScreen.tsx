import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useTypedNavigation } from '../../hooks/Navigation';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Menu from '../material/Menu';
import { fetchTodayMeals, TodayMealData, TodayMealItem } from '../../utils/todayMealApi';
import { createEatingRecord, EatingRecord, getEatingRecordsByDate, deleteEatingRecord, updateEatingRecord, checkSavedPlanItems, generateUniqueId } from '../../utils/api/eatingRecordApi';
import { getDailyNutritionSummary, type DailyNutritionSummary } from '../../utils/api/dailyNutritionApi';
import { AddMealModal } from '../../components/AddMealModal';
import { EditFoodModal } from '../../components/EditFoodModal';
import { FoodEntryMenuModal } from '../../components/FoodEntryMenuModal';
import { getBangkokTime, getBangkokDateForDay, getCurrentBangkokDay, getTodayBangkokDate } from '../../utils/bangkokTime';
import { type FoodItem } from '../../stores/mealPlanStore';

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
  const getCurrentDay = () => getCurrentBangkokDay();
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

  // Always start with today's date, but use params.selectedDay if coming from search
  const [selectedDay, setSelectedDayRaw] = useState(() => {
    if (params?.selectedDay) {
      return params.selectedDay;
    }
    const currentDay = getCurrentDay();
    return currentDay;
  });

  // Wrapper function to log state changes
  const setSelectedDay = (newDay: number | ((prev: number) => number)) => {
    const actualNewDay = typeof newDay === 'function' ? newDay(selectedDay) : newDay;
    setSelectedDayRaw(actualNewDay);
  };
  const [mealTimes, setMealTimes] = useState<MealTime[]>(() => getDefaultMeals());
  const [todayMealData, setTodayMealData] = useState<TodayMealData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSavedToday, setHasSavedToday] = useState(false);
  const [savedRecords, setSavedRecords] = useState<EatingRecord[]>([]);
  const [dailyNutritionSummary, setDailyNutritionSummary] = useState<DailyNutritionSummary | null>(null);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  
  // Edit food modal states
  const [showEditFoodModal, setShowEditFoodModal] = useState(false);
  const [editingFood, setEditingFood] = useState<{
    food: FoodItem;
    mealIndex: number;
    entryId: string;
  } | null>(null);

  // Menu modal states
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedEntry, setSelectedEntry] = useState<{
    timeIndex: number;
    entryId: string;
  } | null>(null);

  // Handle selectedDay from navigation params
  useFocusEffect(
    useCallback(() => {
      
      // Handle returning from the search screen
      if (params?.fromSearch && params?.selectedDay !== undefined) {
        
        // Update selectedDay to match the day user was viewing before search
        if (selectedDay !== params.selectedDay) {
          setSelectedDay(params.selectedDay);
        } else {
        }
        // Clean up params to prevent re-triggering
        navigation.setParams({ fromSearch: false, selectedDay: undefined, timestamp: undefined } as any);
      } else {
      }
    }, [params?.fromSearch, params?.selectedDay, params?.timestamp, selectedDay, navigation]) 
  );

  // Load appropriate data when selected day changes
  useEffect(() => {
    const currentDay = getCurrentDay();
    const isTodaySelected = selectedDay === currentDay;

    setMealTimes(getDefaultMeals()); 

    if (isTodaySelected) {
      loadTodayMeals();
    } else {
      setTodayMealData(null);    
    }
    setHasSavedToday(false);

    loadSavedRecords();
    loadDailyNutritionSummary();
    const loadSummary = async () => {
      try {
        if (!isTodaySelected) {
          const date = getIsoDateForDay(selectedDay);
          const res = await getDailyNutritionSummary(date);
          
          if (res.success && res.data) {
            setDailyNutritionSummary(res.data);
          } else {
            setDailyNutritionSummary(null);
          }
        } else {
          setDailyNutritionSummary(null);
        }
      } catch (e) {
        console.error('❌ [RecordFood] Failed to load daily nutrition summary:', e);
        setDailyNutritionSummary(null);
      }
    };
    loadSummary();
  }, [selectedDay]);

  // Load today's meals from API
  // Helper functions for meal processing
  const convertMealToFoodEntry = (meal: TodayMealItem, mealIndex: number, itemIndex: number): FoodEntry => ({
    id: `${['breakfast', 'lunch', 'dinner'][mealIndex]}-${itemIndex}`,
    name: meal.name,
    calories: meal.calories,
    carbs: meal.carb,
    fat: meal.fat,
    protein: meal.protein,
    confirmed: true,
    fromPlan: true,
    uniqueId: generateUniqueId(selectedDay, mealIndex, itemIndex)
  });

  const preserveNonPlanEntries = (mealTimes: MealTime[]): FoodEntry[][] => {
    return mealTimes.map(mt => mt.entries.filter(e => !e.fromPlan));
  };

  const createMealTimeWithPlanItems = (
    originalMeal: MealTime, 
    planMeals: TodayMealItem[], 
    preservedEntries: FoodEntry[], 
    mealIndex: number
  ): MealTime => ({
    ...originalMeal,
    entries: [
      ...planMeals.map((meal, index) => convertMealToFoodEntry(meal, mealIndex, index)),
      ...preservedEntries
    ]
  });

  const loadTodayMeals = useCallback(async () => {
    try {
      setIsLoading(true);
      const todayMeals = await fetchTodayMeals();
      setTodayMealData(todayMeals);
      
      if (todayMeals) {
        // Convert API data to MealTime format but preserve any manually added (non-plan) entries
        setMealTimes(prev => {
          const preserved = preserveNonPlanEntries(prev);
          const next = [...prev];

          next[0] = createMealTimeWithPlanItems(next[0], todayMeals.breakfast, preserved[0], 0);
          next[1] = createMealTimeWithPlanItems(next[1], todayMeals.lunch, preserved[1], 1);
          next[2] = createMealTimeWithPlanItems(next[2], todayMeals.dinner, preserved[2], 2);

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

  const getIsoDateForDay = (day: number) => getBangkokDateForDay(day);

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

  // Helper functions for saved records processing
  const createCustomMealTime = (mealType: string, index: number): MealTime => ({
    time: `${12 + index * 2}:00`, // Generate times for custom meals
    label: mealType,
    mealType: mealType.toLowerCase(),
    entries: []
  });

  const getCustomMealTypes = (records: EatingRecord[]): string[] => {
    const defaultMealLabels = new Set(['มื้อเช้า', 'มื้อกลางวัน', 'มื้อเย็น']);
    return [...new Set(
      records
        .map(r => r.meal_type)
        .filter((mt): mt is string => mt !== undefined && mt !== null && !defaultMealLabels.has(mt))
    )];
  };

  const addCustomMealsToState = (customMealTypes: string[]) => {
    if (customMealTypes.length > 0) {
      setMealTimes(prev => {
        const existing = new Set(prev.map(m => m.label));
        const newMeals: MealTime[] = customMealTypes
          .filter((mt): mt is string => mt !== undefined && !existing.has(mt))
          .map((mt, idx) => createCustomMealTime(mt, idx));
        
        return [...prev, ...newMeals];
      });
    }
  };

  const loadSavedRecords = useCallback(async () => {
    try {
      const date = getIsoDateForDay(selectedDay);
      const res = await getEatingRecordsByDate(date);
    
      if (res.success) {
        const records = res.data.records || [];
        setSavedRecords(records);
        setHasSavedToday(records.length > 0);
        
        // Add custom meals from saved records that don't match default meal types
        const customMealTypes = getCustomMealTypes(records);
        addCustomMealsToState(customMealTypes);
      }
    } catch (e) {
      console.error('❌ [RecordFood] loadSavedRecords failed:', e);
    }
  }, [selectedDay]);

  const loadDailyNutritionSummary = useCallback(async () => {
    try {
      const currentDay = getCurrentDay();
      const isTodaySelected = selectedDay === currentDay;
      
      // Only load daily nutrition summary for past days
      if (!isTodaySelected) {
        const date = getIsoDateForDay(selectedDay);
        const res = await getDailyNutritionSummary(date);
        
        if (res.success && res.data) {
          setDailyNutritionSummary(res.data);
        } else {
          setDailyNutritionSummary(null);
        }
      } else {
        // For today, clear the daily nutrition summary
        setDailyNutritionSummary(null);
      }
    } catch (e) {
      console.error('❌ [RecordFood] loadDailyNutritionSummary failed:', e);
      setDailyNutritionSummary(null);
    }
  }, [selectedDay]);

  // Refresh data when screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      
      // Skip if we just returned from search - let the first useFocusEffect handle it
      if (params?.fromSearch) {
        return;
      }
      
      const currentDay = getCurrentDay();
      const isTodaySelected = selectedDay === currentDay;
      
      if (isTodaySelected) {
        loadTodayMeals();
      } else {
        setTodayMealData(null);
        setMealTimes(getDefaultMeals());
      }
      loadSavedRecords();
      loadDailyNutritionSummary();
    }, [selectedDay, params?.fromSearch])
  );

  const { isToday } = (() => {
    const currentDay = getCurrentDay();
    const isTodaySelected = selectedDay === currentDay;
   
    return { isToday: isTodaySelected };
  })();
  const totalCaloriesToday = mealTimes.reduce((total, meal) =>
    total + meal.entries.reduce((mealTotal, entry) => mealTotal + entry.calories, 0), 0
  );
  const totalCaloriesSaved = savedRecords.reduce((sum, r) => sum + (r.calories || 0), 0);
  const totalCalories = isToday ? totalCaloriesToday : totalCaloriesSaved;
  
  // Get target calories based on whether it's today or a past day
  const getTargetCalories = () => {
    const currentDay = getCurrentDay();
    const isTodaySelected = selectedDay === currentDay;
    
    if (isTodaySelected) {
      // For today, use todayMealData
      return todayMealData?.totalCalories || 0;
    } else {
      // For past days, use dailyNutritionSummary if available, otherwise fallback to todayMealData
      if (dailyNutritionSummary?.target_cal) {
        return dailyNutritionSummary.target_cal;
      }
      // Fallback to today's target if no specific target is set for this day
      return todayMealData?.totalCalories || 0;
    }
  };
  
  const targetCalories = getTargetCalories();
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

  // Menu modal handlers
  const handleMenuPress = (event: any, timeIndex: number, entryId: string) => {
    const { pageX, pageY } = event.nativeEvent;

    setMenuPosition({ x: pageX - 30, y: pageY - 22 });
    setSelectedEntry({ timeIndex, entryId });
    setShowMenuModal(true);
  };

  const handleMenuEdit = () => {
    if (selectedEntry) {
      handleEditFood(selectedEntry.timeIndex, selectedEntry.entryId);
    }
  };

  const handleMenuDelete = () => {
    if (selectedEntry) {
      handleDeleteFood(selectedEntry.timeIndex, selectedEntry.entryId);
    }
  };

  const handleCloseMenu = () => {
    setShowMenuModal(false);
    setSelectedEntry(null);
  };

  // Edit food functions
  const handleEditFood = (timeIndex: number, entryId: string) => {
    let entry: FoodEntry | undefined;
    
    // Get the current day info to determine which entries to search
    const currentDay = getCurrentDay();
    const isTodaySelected = selectedDay === currentDay;
    const meal = mealTimes[timeIndex];
    
    if (!isTodaySelected) {
      // For past days, search in savedEntries (displayed entries)
      const savedForMeal = savedRecords.filter(r => r.meal_type === meal.label);
      const savedEntries: FoodEntry[] = savedForMeal.map((r, idx) => ({
        id: r.id?.toString() || `saved-${timeIndex}-${idx}`,
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
      entry = savedEntries.find(e => e.id === entryId);
    } else {
      // For today, search in allEntries (plan + manual saved entries)
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
      entry = allEntries.find(e => e.id === entryId);
    }
    
    if (!entry) {
      console.error('❌ [EditFood] Entry not found!');
      Alert.alert('ไม่พบข้อมูล', 'ไม่สามารถหาอาหารที่ต้องการแก้ไขได้');
      return;
    }

    if (!entry.saved && (!entry.confirmed || entry.fromPlan)) {
      Alert.alert('ไม่สามารถแก้ไขได้', 'สามารถแก้ไขได้เฉพาะอาหารที่บันทึกแล้วหรืออาหารที่เพิ่มแล้วเท่านั้น');
      return;
    }

    // Convert FoodEntry to FoodItem format for EditFoodModal
    const foodItem: FoodItem = {
      id: entry.id,
      name: entry.name,
      cal: entry.calories,
      carb: entry.carbs || 0,
      protein: entry.protein || 0,
      fat: entry.fat || 0,
      img: '',
      ingredient: '',
      source: 'user_food',
      isUserFood: true
    };

    setEditingFood({
      food: foodItem,
      mealIndex: timeIndex,
      entryId: entry.id
    });
    setShowEditFoodModal(true);
  };

  const handleSaveEditedFood = async (updatedFood: FoodItem) => {
    if (!editingFood) return;

    try {
      // Find the entry to get recordId
      let entry: FoodEntry | undefined;
      let recordId: number | undefined;

      // Get the current day info to determine search strategy
      const currentDay = getCurrentDay();
      const isTodaySelected = selectedDay === currentDay;
      const meal = mealTimes[editingFood.mealIndex];
      
      if (!isTodaySelected) {
        // For past days, search in savedEntries
        const savedForMeal = savedRecords.filter(r => r.meal_type === meal.label);
        const savedEntries: FoodEntry[] = savedForMeal.map((r, idx) => ({
          id: r.id?.toString() || `saved-${editingFood.mealIndex}-${idx}`,
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
        entry = savedEntries.find(e => e.id === editingFood.entryId);
        recordId = entry?.recordId;
      } else {
        // For today, search in allEntries
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
            id: `saved-${editingFood.mealIndex}-${idx}`,
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
        entry = allEntries.find(e => e.id === editingFood.entryId);
        recordId = entry?.recordId;
      }

      if (!recordId) {
        Alert.alert('ไม่สามารถแก้ไขได้', 'ไม่พบข้อมูลการบันทึกในฐานข้อมูล');
        return;
      }

      // Call update API
      const updateData = {
        food_name: updatedFood.name,
        calories: updatedFood.cal,
        carbs: updatedFood.carb,
        protein: updatedFood.protein,
        fat: updatedFood.fat
      };

      await updateEatingRecord(recordId, updateData);

      // Refresh data from server
      await loadSavedRecords();
      
      if (isTodaySelected) {
        await loadTodayMeals();
      }

      setShowEditFoodModal(false);
      setEditingFood(null);
      
      Alert.alert('สำเร็จ', 'แก้ไขข้อมูลอาหารเรียบร้อยแล้ว');

    } catch (error) {
      console.error('❌ [SaveEditedFood] Error:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถแก้ไขข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleCloseEditFood = () => {
    setShowEditFoodModal(false);
    setEditingFood(null);
  };

  // Delete food function
  const handleDeleteFood = async (timeIndex: number, entryId: string) => {
    let entry: FoodEntry | undefined;
    let recordId: number | undefined;
    
    // Get the current day info to determine search strategy
    const currentDay = getCurrentDay();
    const isTodaySelected = selectedDay === currentDay;
    const meal = mealTimes[timeIndex];
    
    if (!isTodaySelected) {
      // For past days, search in savedEntries
      const savedForMeal = savedRecords.filter(r => r.meal_type === meal.label);
      const savedEntries: FoodEntry[] = savedForMeal.map((r, idx) => ({
        id: r.id?.toString() || `saved-${timeIndex}-${idx}`,
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
      entry = savedEntries.find(e => e.id === entryId);
      recordId = entry?.recordId;
    } else {
      // For today, search in allEntries (plan + manual saved entries)
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
      entry = allEntries.find(e => e.id === entryId);
      recordId = entry?.recordId;
    }

 
    if (!entry) {
      Alert.alert('ไม่พบข้อมูล', 'ไม่สามารถหาอาหารที่ต้องการลบได้');
      return;
    }

    const entryName = entry.name;

    Alert.alert(
      'ยืนยันการลบ',
      `ต้องการลบ "${entryName}" หรือไม่?`,
      [
        {
          text: 'ยกเลิก',
          style: 'cancel',
        },
        {
          text: 'ลบ',
          style: 'destructive',
          onPress: async () => {
            try {
              // If it has recordId, delete from backend
              if (recordId) {
                await deleteEatingRecord(recordId);
                
                // Update savedRecords state locally instead of reloading
                setSavedRecords(prev => prev.filter(r => r.id !== recordId));
                
                // If it's a plan item for today, change status to unsaved instead of removing
                if (isTodaySelected && entry.fromPlan) {
                  setMealTimes(prev => prev.map(mealTime => ({
                    ...mealTime,
                    entries: mealTime.entries.map(e => 
                      e.id === entryId ? { ...e, saved: false, recordId: undefined } : e
                    )
                  })));
                } else {
                  // For non-plan items or past days, remove from mealTimes
                  const updatedEntries = meal?.entries.filter(e => e.id !== entryId) || [];
                  const updatedMealTimes = [...mealTimes];
                  updatedMealTimes[timeIndex] = {
                    ...meal,
                    entries: updatedEntries
                  };
                  setMealTimes(updatedMealTimes);
                }
              } else {
                // Remove from mealTimes if it exists there
                const updatedEntries = meal?.entries.filter(e => e.id !== entryId) || [];
                const updatedMealTimes = [...mealTimes];
                updatedMealTimes[timeIndex] = {
                  ...meal,
                  entries: updatedEntries
                };
                setMealTimes(updatedMealTimes);
              }
            } catch (e) {
              console.error('❌ [DeleteFood] Failed to delete:', e);
              Alert.alert('ลบไม่สำเร็จ', 'กรุณาลองใหม่อีกครั้ง');
            }
          },
        },
      ],
    );
  };

  // Helper functions for confirming and saving all meals
  const validateSaveConditions = (totalMeals: number): string | null => {
    if (totalMeals === 0) {
      return 'ไม่มีอาหารที่จะบันทึก';
    }
    
    if (!isToday) {
      return 'ไม่สามารถบันทึกได้ สามารถบันทึกอาหารได้เฉพาะวันนี้เท่านั้น';
    }
    
    if (isSaving) {
      return 'กำลังบันทึกอยู่';
    }
    
    return null;
  };

  const showSaveConfirmation = (totalMeals: number, planInfo: string) => {
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

  const showAlreadySavedConfirmation = () => {
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
  };

  const handleConfirmAll = async () => {
    const totalMeals = mealTimes.reduce((total, meal) => total + meal.entries.length, 0);
    
    // Validate save conditions
    const errorMessage = validateSaveConditions(totalMeals);
    if (errorMessage) {
      if (errorMessage !== 'กำลังบันทึกอยู่') {
        Alert.alert('ไม่สามารถบันทึกได้', errorMessage);
      }
      return;
    }

    // Check if already saved today
    if (hasSavedToday) {
      showAlreadySavedConfirmation();
      return;
    }

    // Show plan information in confirmation
    const planInfo = todayMealData?.planName ? `\nตามแผน: ${todayMealData.planName}` : '';
    showSaveConfirmation(totalMeals, planInfo);
  };

  // Helper functions for saving meals to database
  const createEatingRecordData = (entry: FoodEntry, meal: MealTime, logDate: string): Omit<EatingRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'> => ({
    log_date: logDate,
    food_name: entry.name,
    meal_type: meal.label,
    calories: entry.calories || 0,
    carbs: entry.carbs || 0,
    fat: entry.fat || 0,
    protein: entry.protein || 0,
    meal_time: meal.time + ':00', // Convert to HH:MM:SS format
    image: undefined // No image for now
  });

  const showSaveResult = (savedCount: number, errorCount: number) => {
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
  };

  const saveAllMealsToDatabase = async () => {
    try {
      setIsSaving(true);
      
      // ใช้ Bangkok timezone utility function
      const logDate = getTodayBangkokDate();
      
      let savedCount = 0;
      let errorCount = 0;

      for (const meal of mealTimes) {
        for (const entry of meal.entries) {
          try {
            const recordData = createEatingRecordData(entry, meal, logDate);
            await createEatingRecord(recordData);
            savedCount++;
           
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
      showSaveResult(savedCount, errorCount);

    } catch (error) {
      console.error('❌ [RecordFood] Error in saveAllMealsToDatabase:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSaving(false);
    }
  };

    const FoodEntryCard = ({ entry, onRemove, onSave, onDelete, onEdit, onMenuPress }: { 
    entry: FoodEntry; 
    onRemove?: () => void; 
    onSave?: () => void; 
    onDelete?: () => void;
    onEdit?: () => void;
    onMenuPress?: (event: any) => void;
  }) => (
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
          {entry.saved && onMenuPress && (
            <TouchableOpacity onPress={onMenuPress} className="ml-2 p-2">
              <Icon name="ellipsis-vertical" size={20} color="#6b7280" />
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
    
    
    const currentDay = getCurrentDay();
    const isTodaySelected = selectedDay === currentDay;
    
  
    // สำหรับวันก่อนหน้า: แสดงเฉพาะ savedRecords
    if (!isTodaySelected) {
      const savedForMeal = savedRecords.filter(r => r.meal_type === meal.label);
     
      const savedEntries: FoodEntry[] = savedForMeal.map((r, idx) => ({
        id: r.id?.toString() || `saved-${timeIndex}-${idx}`,
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
                  onMenuPress={(event) => handleMenuPress(event, timeIndex, entry.id)}
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
    

    const handleSavePlanItem = async (entry: FoodEntry) => {
      try {
        setIsSaving(true);
        // ใช้ Bangkok timezone utility function
        const logDate = getTodayBangkokDate();
        
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
                onRemove={!entry.saved && !entry.fromPlan ? () => handleRemoveFood(timeIndex, entry.id) : undefined}
                onMenuPress={(entry.saved || (!entry.fromPlan && entry.confirmed)) ? (event) => handleMenuPress(event, timeIndex, entry.id) : undefined}
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
       <View>

       </View>
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
              <Text className={`font-bold text-sm ${isOverTarget ? 'text-red-600' : isAtTarget ? 'text-green-600' : 'text-blue-600'}`}>
                {totalCaloriesSaved.toLocaleString()} แคลอรี่ / {(todayMealData?.totalCalories?.toLocaleString?.() as string) || dailyNutritionSummary?.target_cal} แคลอรี่
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

        <View className='h-24' />
      </ScrollView>

  {/* Removed bottom summary and group save to simplify UI as requested */}
  <View className='h-4' />

      <AddMealModal
        visible={showAddMealModal}
        onClose={() => setShowAddMealModal(false)}
        onAddMeal={handleAddNewMeal}
      />

      <EditFoodModal
        visible={showEditFoodModal}
        food={editingFood?.food || null}
        onClose={handleCloseEditFood}
        onSave={handleSaveEditedFood}
      />

      <FoodEntryMenuModal
        visible={showMenuModal}
        onClose={handleCloseMenu}
        onEdit={handleMenuEdit}
        onDelete={handleMenuDelete}
        position={menuPosition}
      />

      <Menu />
    </SafeAreaView>
  );
};

export default RecordFoodScreen;
