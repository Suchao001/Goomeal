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
    EatingStyleSettings: undefined;
    NotificationSettings: undefined;
    RecordSettings: undefined;
    MealTimeSettings: undefined;

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
    } | undefined;

    MealPlanEdit: {
        selectedFood?: any;
        mealId?: string;
        selectedDay?: number;
        mode?: 'add' | 'edit';
        foodPlanId?: number;
        planData?: any;
    } | undefined;

    SearchFoodForAdd: {
        foodPlanId?: number;
        hideRecommended?: boolean;
        mealId?: string;
        source?: string;
        selectedDay?: number;
    } | undefined;
    AddNewFood: undefined;

    OptionPlan: undefined;
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

  };
