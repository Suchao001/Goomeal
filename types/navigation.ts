export type RootStackParamList = {
    Splash: undefined;
    Slides: undefined;
    Login: undefined;
    Register: undefined;

    ForgotPassword: undefined;
    ForgotPassword_after: undefined;

    PersonalSetup: undefined;
    PersonalPlan1: {isForAi?: boolean};
    PersonalPlan2: undefined;
    PersonalPlan3: undefined;
    PersonalPlan4: undefined;
    FoodMenu: undefined;
    EatingBlog: undefined;
    EatingReport: undefined;
    WeeklyReport: undefined;
    EatingStyleSettings: undefined;
    NotificationSettings: undefined;
    RecordSettings: undefined;
    MealTimeSettings: undefined;
    ChatScreen: undefined;
    SuggestionMenu: undefined;
    MyFood: undefined;
   

    Calendar: undefined;
    RecordFood: {
      selectedFood?: any;
      timeIndex?: number;
      fromSearch?: boolean;
      selectedDay?: number;
      timestamp?: number;
    } | undefined;
    PlanSelection: undefined;
    Menu: undefined;
    EditAccountSettings: undefined;
    EditProfile: undefined;
    ProfileDetail: undefined;
    FoodSuggestion: { suggestion: string };
    Home: undefined;
    MealPlan: {
        selectedFood?: any;
        mealId?: string;
        selectedDay?: number;
        mode?: 'add' | 'edit';
        foodPlanId?: number;
        planData?: any;
        fromSearch?: boolean;
        from?: string;
    } | undefined;

    MealPlanEdit: {
        selectedFood?: any;
        mealId?: string;
        selectedDay?: number;
        mode?: 'add' | 'edit';
        foodPlanId?: number;
        planData?: any;
        from?: string;
    } | undefined;

  SearchFoodForAdd: {
        foodPlanId?: number;
        hideRecommended?: boolean;
        mealId?: string;
        source?: string;
        selectedDay?: number;
        timeIndex?: number;
        mealLabel?: string;
        mealTime?: string;
    } | undefined;
    AddNewFood: {
        selectedDay?: number;
        timeIndex?: number;
        mealLabel?: string;
        mealTime?: string;
    } | undefined;
    EditFood: { foodId: string; food?: any };

    OptionPlan: {
      from?: string;
    };
    SelectGlobalPlan: undefined;
    SeeMoreGlobalPlans: undefined;
    GlobalPlanMeal: { planId: number };
    GlobalPlanDayDetail: { 
      planId: number; 
      day: number;
      dayData: any;
      originalDayData: any;
      planInfo: any;
      maxDays: number;
    };
    AiPlanMealScreen: { aiPlanData: any };
    AiPlanDayDetail: { 
      day: number;
      dayData: any;
      originalDayData: any;
      maxDays: number;
      aiPlanData: any;
    };

  };
