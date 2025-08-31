import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert, Modal } from 'react-native';
import { useTypedNavigation, useTypedRoute } from '../../hooks/Navigation';
import { useFocusEffect } from '@react-navigation/native';
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
  const route = useTypedRoute<any>();
  const params = route.params as any;

  // Date helpers: use full date string to support any past day
  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const parseDate = (s: string) => {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };

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

  // Selected date (full ISO yyyy-mm-dd). Start from params.timestamp, params.selectedDay (legacy), else today
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (params?.timestamp) {
      const d = new Date(params.timestamp);
      d.setHours(0, 0, 0, 0);
      return formatDate(d);
    }
    if (params?.selectedDay) {
      const today = new Date();
      const d = new Date(today.getFullYear(), today.getMonth(), params.selectedDay);
      return formatDate(d);
    }
    return getTodayBangkokDate();
  });
  // Helper day number from selectedDate for legacy needs (labels, uniqueId)
  const selectedDay = parseDate(selectedDate).getDate();
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

  // Date picker modal state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempSelectedDate, setTempSelectedDate] = useState(new Date());

  // Handle params from navigation (support timestamp or legacy selectedDay)
  useFocusEffect(
    useCallback(() => {
      if (params?.fromSearch) {
        let next: string | null = null;
        if (typeof params?.timestamp === 'number') {
          const d = new Date(params.timestamp);
          d.setHours(0, 0, 0, 0);
          next = formatDate(d);
        } else if (typeof params?.selectedDay === 'number') {
          const base = new Date();
          const d = new Date(base.getFullYear(), base.getMonth(), params.selectedDay);
          next = formatDate(d);
        }
        if (next && next !== selectedDate) {
          setSelectedDate(next);
        }
        navigation.setParams({ fromSearch: false, selectedDay: undefined, timestamp: undefined } as any);
      }
    }, [params?.fromSearch, params?.selectedDay, params?.timestamp, selectedDate, navigation]) 
  );

  // Load appropriate data when selected date changes
  useEffect(() => {
    const isTodaySelected = selectedDate === getTodayBangkokDate();

    // Reset meal times and state
    setMealTimes(getDefaultMeals()); 
    setHasSavedToday(false);

    if (isTodaySelected) {
      loadTodayMenus();
    } else {
      loadHistoricalMenus();
    }
  }, [selectedDate]);

  // Load menus for today (using meal plan + saved status)
  const loadTodayMenus = useCallback(async () => {
    try {
      setIsLoading(true);
      setTodayMealData(null);
      await loadTodayMeals();
      await loadSavedRecords();
      // For today, nutrition summary comes from today meals calculation
      setDailyNutritionSummary(null);
    } catch (error) {
      console.error('❌ [RecordFood] Error loading today menus:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load menus for historical days (from saved records only)  
  const loadHistoricalMenus = useCallback(async () => {
    try {
      setIsLoading(true);
      setTodayMealData(null);
      await loadSavedRecords();
      
      // Load daily nutrition summary for historical days
      const date = selectedDate;
      const res = await getDailyNutritionSummary(date);
      
      if (res.success && res.data) {
        setDailyNutritionSummary(res.data);
      } else {
        setDailyNutritionSummary(null);
      }
    } catch (error) {
      console.error('❌ [RecordFood] Error loading historical menus:', error);
      setDailyNutritionSummary(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

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
          // Rebuild from defaults to avoid duplicate customs across refreshes
          const defaults = ['breakfast','lunch','dinner'];
          const base = prev.filter(m => defaults.includes(m.mealType));
          // Ensure base has 3 in correct order if possible
          const ensureBase = (idx: number, key: string) => base.find(b => b.mealType === key) || base[idx] || {
            time: idx === 0 ? '07:00' : idx === 1 ? '12:00' : '18:00',
            label: key === 'breakfast' ? 'มื้อเช้า' : key === 'lunch' ? 'มื้อกลางวัน' : 'มื้อเย็น',
            mealType: key,
            entries: []
          };
          const next = [
            ensureBase(0,'breakfast'),
            ensureBase(1,'lunch'),
            ensureBase(2,'dinner')
          ];

          next[0] = createMealTimeWithPlanItems(next[0], todayMeals.breakfast, preserved[0] || [], 0);
          next[1] = createMealTimeWithPlanItems(next[1], todayMeals.lunch, preserved[1] || [], 1);
          next[2] = createMealTimeWithPlanItems(next[2], todayMeals.dinner, preserved[2] || [], 2);

          // Append custom meals dynamically (keys other than default)
          const defaultKeys = new Set(['breakfast','lunch','dinner']);
          const mealsMap = (todayMeals as any).mealsMap as Record<string, any[]> | undefined;
          const mealsMeta = (todayMeals as any).mealsMeta as Record<string, { time?: string; label?: string }> | undefined;
          if (mealsMap) {
            Object.keys(mealsMap)
              .filter(k => !defaultKeys.has(k))
              .forEach((k, idx) => {
                const items = mealsMap[k] || [];
                const label = mealsMeta?.[k]?.label || k;
                const time = mealsMeta?.[k]?.time || '12:00';
                // Create entries conversion manually
                const converted = items.map((meal, index) => ({
                  id: `${k}-${index}`,
                  name: meal.name,
                  calories: meal.calories,
                  carbs: meal.carb,
                  fat: meal.fat,
                  protein: meal.protein,
                  confirmed: true,
                  fromPlan: true,
                  uniqueId: generateUniqueId(selectedDay, 3 + idx, index)
                }));

                // Preserve existing non-plan entries for this custom meal if existed
                const existingIndex = next.findIndex(m => m.mealType === k);
                if (existingIndex >= 0) {
                  const preservedEntries = next[existingIndex].entries.filter(e => !e.fromPlan);
                  next[existingIndex] = {
                    ...next[existingIndex],
                    time: typeof time === 'string' ? time : '12:00',
                    label,
                    mealType: k,
                    entries: [...converted, ...preservedEntries]
                  };
                } else {
                  next.push({
                    time: typeof time === 'string' ? time : '12:00',
                    label,
                    mealType: k,
                    entries: converted
                  });
                }
              });
          }

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

  const getIsoDateForDay = (_day: number) => selectedDate;

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
      const date = getIsoDateForDay(0);
      
      const res = await getEatingRecordsByDate(date);
      
      if (res.success) {
        const records = res.data.records || [];
        setSavedRecords(records);
        setHasSavedToday(records.length > 0);
        
        // Add custom meals from saved records that don't match default meal types
        const customMealTypes = getCustomMealTypes(records);
        addCustomMealsToState(customMealTypes);
      } else {
        setSavedRecords([]);
      }
    } catch (e) {
      console.error('❌ [RecordFood] loadSavedRecords failed:', e);
      setSavedRecords([]);
    }
  }, [selectedDate]);

  const loadDailyNutritionSummary = useCallback(async () => {
    try {
      const isTodaySelected = selectedDate === getTodayBangkokDate();
      
      // Only load daily nutrition summary for past days
      if (!isTodaySelected) {
        const date = getIsoDateForDay(0);
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
  }, [selectedDate]);

  // Refresh data when screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      
      // When returning from search, we need to refresh saved records
      if (params?.fromSearch) {
        const refreshAfterSearch = async () => {
          setIsLoading(true);
          await loadSavedRecords();
          setIsLoading(false);
        };
        refreshAfterSearch();
        return;
      }
      
      const isTodaySelected = selectedDate === getTodayBangkokDate();
      
      if (isTodaySelected) {
        loadTodayMenus();
      } else {
        loadHistoricalMenus();
      }

    }, [selectedDate, params?.fromSearch, loadTodayMenus, loadHistoricalMenus, loadSavedRecords])
);

  // Debug: Log savedRecords changes
  useEffect(() => {
  }, [savedRecords]);

  const { isToday } = (() => {
    const isTodaySelected = selectedDate === getTodayBangkokDate();
   
    return { isToday: isTodaySelected };
  })();
  const totalCaloriesToday = mealTimes.reduce((total, meal) =>
    total + meal.entries.reduce((mealTotal, entry) => mealTotal + entry.calories, 0), 0
  );
  const totalCaloriesSaved = savedRecords.reduce((sum, r) => sum + (r.calories || 0), 0);
  const totalCalories = isToday ? totalCaloriesToday : totalCaloriesSaved;
  
  // Get target calories based on whether it's today or a past day
  const getTargetCalories = () => {
    const isTodaySelected = selectedDate === getTodayBangkokDate();
    
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

  const getHeaderLabel = () => {
    const todayStr = getTodayBangkokDate();
    if (selectedDate === todayStr) return 'วันนี้';
    const d = parseDate(selectedDate);
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
  };
  const dayName = getHeaderLabel();

  // Date picker functions
  const openDatePicker = () => {
    const current = parseDate(selectedDate);
    setTempSelectedDate(current);
    setShowDatePicker(true);
  };

  const handleDateSelect = (newDate: Date) => {
    const today = new Date();
    newDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    if (newDate.getTime() > today.getTime()) return;
    setSelectedDate(formatDate(newDate));
    setShowDatePicker(false);
  };

  // Function to go back to today
  const goToToday = () => {
    setSelectedDate(getTodayBangkokDate());
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    const current = parseDate(selectedDate);
    const next = new Date(current);
    next.setDate(current.getDate() + (direction === 'prev' ? -1 : 1));
    const today = new Date();
    next.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    if (direction === 'next' && next > today) {
      Alert.alert('ไม่สามารถดูข้อมูลได้', 'ไม่สามารถดูหรือบันทึกข้อมูลของวันอนาคตได้', [{ text: 'ตกลง', style: 'default' }]);
      return;
    }
    setSelectedDate(formatDate(next));
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
    const isTodaySelected = selectedDate === getTodayBangkokDate();
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
      const isTodaySelected = selectedDate === getTodayBangkokDate();
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
    const isTodaySelected = selectedDate === getTodayBangkokDate();
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
    <View className={`${entry.fromPlan && entry.saved ? 'bg-green-100 border border-green-200' : entry.fromPlan ? 'bg-blue-50 border border-blue-200' : 'bg-green-100 border border-green-200'} rounded-lg p-3 mb-2`}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <Icon 
            name={entry.fromPlan ? "calendar" : "checkmark-circle"} 
            size={20} 
            color={entry.fromPlan ? "#3b82f6" : "#22c55e"} 
          />
          <View className="ml-3 flex-1">
            <View className="flex-row items-center">
              <Text className="font-promptSemiBold text-gray-800">{entry.name}</Text>
              {entry.fromPlan && (
                <View className="ml-2 px-2 py-1 rounded-full">
                  <Text className="text-blue-600 text-xs font-promptMedium">ตามแผน</Text>
                </View>
              )}
              {entry.saved && entry.fromPlan && (
                <View className="ml-2 px-2 py-1 ">
                  <Icon name="checkmark-circle" size={16} color="#22c55e" />
                </View>
              )}
            </View>
            <View className="flex-row items-center mt-1">
              <Text className="text-gray-600 text-sm font-prompt">{entry.calories} แคลอรี่</Text>
              {entry.carbs && entry.fat && entry.protein && (
                <Text className="text-gray-500 text-xs font-prompt ml-2">
                  • คาร์บ {entry.carbs}g • ไขมัน {entry.fat}g • โปรตีน {entry.protein}g
                </Text>
              )}
            </View>
          </View>
        </View>
        <View className="flex-row items-center">
          {entry.fromPlan && !entry.saved && onSave && (
            <TouchableOpacity onPress={onSave} className="ml-2 rounded-full bg-primary p-2">
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
    
    
    const isTodaySelected = selectedDate === getTodayBangkokDate();
    
  
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
        <View key={timeIndex} className="bg-white rounded-xl p-4 mb-4 shadow-md shadow-slate-600">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="w-12 h-12  rounded-full items-center justify-center mr-3">
                <Icon
                  name={timeIndex === 0 ? 'sunny' : timeIndex === 1 ? 'partly-sunny' : 'moon'}
                  size={24}
                  color="#ffb800"
                />
              </View>
              <View>
                <Text className="text-lg font-promptSemiBold text-gray-800">{meal.label}</Text>
                <Text className="text-sm text-gray-500">{meal.time}</Text>
              </View>
            </View>
            <View className={`px-3 py-1 rounded-full ${savedEntries.length > 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Text className={`text-xs font-promptMedium ${savedEntries.length > 0 ? 'text-green-600' : 'text-gray-600'}`}>
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
            <Text className="text-white font-promptMedium ml-2">เพิ่มอาหาร</Text>
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
      <View key={timeIndex} className="bg-white rounded-xl p-4 mb-4 shadow-md shadow-slate-600">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="w-12 h-12  rounded-full items-center justify-center mr-3">
              <Icon
                name={timeIndex === 0 ? 'sunny' : timeIndex === 1 ? 'partly-sunny' : 'moon'}
                size={24}
                color="#ffb800"
              />
            </View>
            <View>
              <Text className="text-lg font-promptSemiBold text-gray-800">{meal.label}</Text>
              <Text className="text-sm text-gray-500">{meal.time}</Text>
            </View>
          </View>
          <View className={`px-3 py-1 `}>
            <Text className={`text-xs font-promptMedium ${allEntries.length > 0 ? 'text-green-600' : 'text-gray-600'}`}>
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
          <Text className="text-white font-promptMedium ml-2">เพิ่มอาหาร</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-primary px-4 py-4 mt-6 flex-row items-center justify-between border-b border-gray-100">
       <View>

       </View>
        <Text className="text-xl font-promptBold text-white">บันทึก/ยืนยันอาหาร</Text>
        <TouchableOpacity 
          className="w-10 h-10 rounded-lg items-center justify-center"
          onPress={openDatePicker}
        >
          <Icon name={isToday ? "calendar" : "today"} size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity
          className={`w-8 h-8 items-center justify-center`}
          onPress={() => navigateDay('prev')}
          disabled={false}
        >
          <Icon name="chevron-back" size={20} color="#374151" />
        </TouchableOpacity>
        <Text className={`text-lg font-promptMedium ${isToday ? 'text-primary font-promptBold' : 'text-gray-800'}`}>
          {dayName}
        </Text>
        {!isToday && (
          <TouchableOpacity 
            onPress={goToToday}
            className="absolute right-16 bg-primary/10 px-2 py-1 rounded-full"
          >
            <Text className="text-primary text-xs font-promptMedium">กลับสู่วันปัจจุบัน</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className={`w-8 h-8 items-center justify-center ${selectedDate === getTodayBangkokDate() ? 'opacity-50' : ''}`}
          onPress={() => navigateDay('next')}
          disabled={selectedDate === getTodayBangkokDate()}
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
            <Text className="font-promptMedium text-gray-700 ml-2">
                {isToday ? 'แคลอรี่ที่บันทึก' : `แคลอรี่ที่บันทึกวันที่ ${parseDate(selectedDate).getDate()} แล้ว`}
            </Text>
          </View>
          {isLoading ? (
            <Text className="font-promptSemiBold text-gray-400">กำลังโหลด...</Text>
          ) : (
            <View className="items-end">
              <Text className={`font-promptBold text-sm ${isOverTarget ? 'text-red-600' : isAtTarget ? 'text-green-600' : 'text-blue-600'}`}>
                {totalCaloriesSaved.toLocaleString()} แคลอรี่ / {(todayMealData?.totalCalories?.toLocaleString?.() as string) || dailyNutritionSummary?.target_cal} แคลอรี่
              </Text>
              <View className={`px-2 py-0.5 rounded-full mt-1 ${chipBg}`}>
                <Text className={`text-xs font-promptMedium ${chipText}`}>{progressPercent}% ของเป้าหมาย</Text>
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
          <Text className="text-xs text-gray-500 font-prompt">{targetCalories.toLocaleString()} แคลอรี่</Text>
        </View>
        {!isLoading && (
          <View className="flex-row items-center justify-between mt-2 font-prompt">
            <Text className={`text-xs ${isUnderTarget ? 'text-orange-600 font-prompt' : isAtTarget ? 'text-green-600 font-prompt' : 'text-red-600 font-prompt'}`}>
              {isUnderTarget && `เหลืออีก ${remainingCalories.toLocaleString()} แคลอรี่`}
              {isAtTarget && 'ครบเป้าหมายแล้ว'}
              {isOverTarget && `เกิน ${overCalories.toLocaleString()} แคลอรี่`}
            </Text>
            {isToday && totalCaloriesSaved > 0 && (
              <Text className="text-xs text-gray-500 font-prompt">
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
        ) : (
          // For today: always show meal cards. If no plan, show an info banner first
          <>
            {(!todayMealData || (!todayMealData.breakfast.length && !todayMealData.lunch.length && !todayMealData.dinner.length)) && (
              <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                <View className="flex-row items-center">
                  <Icon name="information-circle-outline" size={20} color="#eab308" />
                  <Text className="ml-2 text-yellow-800 font-promptMedium">ไม่มีแผนการกินวันนี้</Text>
                </View>
                <Text className="text-yellow-700 mt-1 font-prompt">ระบบได้สร้างมื้อว่างสำหรับมื้อเช้า กลางวัน และเย็น ให้คุณเพิ่มอาหารได้ทันที</Text>
                <TouchableOpacity 
                  className="self-start bg-primary rounded-lg px-4 py-2 mt-3"
                  onPress={() => navigation.navigate('SelectGlobalPlan')}
                >
                  <View className="flex-row items-center">
                    <Icon name="add" size={18} color="white" />
                    <Text className="text-white font-promptMedium ml-2">เลือกแผนการกิน</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {mealTimes.map((meal, timeIndex) => renderMealCard(meal, timeIndex))}
          </>
        )}
        <TouchableOpacity
          className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 items-center justify-center mb-4"
          onPress={() => setShowAddMealModal(true)}
        >
          <Icon name="add-circle" size={22} color="#9ca3af" />
          <Text className="text-gray-600 font-promptMedium mt-2">เพิ่มมื้อเพิ่มเติม</Text>
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

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View className="flex-1 bg-black bg-opacity-10 justify-start items-center pt-20">
          <View className="bg-white rounded-2xl p-6 mx-4 shadow-2xl" style={{ minWidth: 320, maxWidth: 350 }}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-promptBold text-gray-800">เลือกวันที่</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Icon name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            {/* Calendar Grid */}
            <View className="mb-4">
              {/* Current Month/Year */}
              <View className="flex-row items-center justify-between mb-4">
                <TouchableOpacity
                  onPress={() => {
                    const newDate = new Date(tempSelectedDate);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setTempSelectedDate(newDate);
                  }}
                  className="w-10 h-10 items-center justify-center"
                >
                  <Icon name="chevron-back" size={20} color="#374151" />
                </TouchableOpacity>
                
                <Text className="text-lg font-promptBold text-gray-800">
                  {tempSelectedDate.toLocaleDateString('th-TH', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </Text>
                
                <TouchableOpacity
                  onPress={() => {
                    const newDate = new Date(tempSelectedDate);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setTempSelectedDate(newDate);
                  }}
                  className="w-10 h-10 items-center justify-center"
                >
                  <Icon name="chevron-forward" size={20} color="#374151" />
                </TouchableOpacity>
              </View>
              
              {/* Week days header */}
              <View className="flex-row mb-2">
                {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day, index) => (
                  <View key={index} className="flex-1 items-center py-2">
                    <Text className="text-sm font-promptMedium text-gray-600">{day}</Text>
                  </View>
                ))}
              </View>
              
              {/* Calendar days */}
              <View>
                {(() => {
                  const year = tempSelectedDate.getFullYear();
                  const month = tempSelectedDate.getMonth();
                  const firstDay = new Date(year, month, 1);
                  const startDate = new Date(firstDay);
                  startDate.setDate(startDate.getDate() - firstDay.getDay());
                  
                  const weeks = [];
                  const currentWeek = [];
                  
                  for (let i = 0; i < 42; i++) {
                    const date = new Date(startDate);
                    date.setDate(startDate.getDate() + i);
                    
                    if (currentWeek.length === 7) {
                      weeks.push([...currentWeek]);
                      currentWeek.length = 0;
                    }
                    
                    currentWeek.push(date);
                  }
                  
                  if (currentWeek.length > 0) {
                    weeks.push(currentWeek);
                  }
                  
                  const today = new Date();
                  today.setHours(0,0,0,0);
                  const selectedVar = parseDate(selectedDate);
                  selectedVar.setHours(0,0,0,0);
                  
                  return weeks.map((week, weekIndex) => (
                    <View key={weekIndex} className="flex-row">
                      {week.map((date, dayIndex) => {
                        const isCurrentMonth = date.getMonth() === month;
                        const dayNumber = date.getDate();
                        const compare = new Date(date);
                        compare.setHours(0,0,0,0);
                        const isSelected = compare.getTime() === selectedVar.getTime();
                        const isToday = compare.getTime() === today.getTime();
                        const isSelectable = compare.getTime() <= today.getTime();
                        
                        return (
                          <TouchableOpacity
                            key={dayIndex}
                            className="flex-1 items-center py-3"
                            onPress={() => {
                              if (!isSelectable) return;
                              handleDateSelect(new Date(compare));
                            }}
                            disabled={!isSelectable}
                          >
                            <View 
                              className={`w-8 h-8 rounded-full items-center justify-center ${
                                isSelected 
                                  ? 'bg-primary' 
                                  : isToday 
                                    ? 'bg-blue-100' 
                                    : ''
                              }`}
                            >
                              <Text 
                                className={`text-sm ${
                                  isSelected 
                                    ? 'text-white font-promptBold' 
                                    : isToday 
                                      ? 'text-blue-600 font-promptBold'
                                      : isSelectable ? 'text-gray-800' : 'text-gray-300'
                                }`}
                              >
                                {dayNumber}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ));
                })()}
              </View>
            </View>
            
            {/* Quick select buttons */}
            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() => {
                  handleDateSelect(new Date());
                }}
                className="flex-1 bg-gray-100 rounded-lg py-3 mr-2"
              >
                <Text className="text-center text-gray-700 font-promptMedium">วันนี้</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  handleDateSelect(yesterday);
                }}
                className="flex-1 bg-gray-100 rounded-lg py-3 ml-2"
              >
                <Text className="text-center text-gray-700 font-promptMedium">เมื่อวาน</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Menu />
    </SafeAreaView>
  );
};

export default RecordFoodScreen;
