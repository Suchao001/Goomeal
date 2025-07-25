export type RootStackParamList = {
    Splash: undefined;
    Slides: undefined;
    Login: undefined;
    Register: undefined;

    ForgotPassword: undefined;
    ForgotPassword_after: undefined;

    PersonalSetup: undefined;
    PersonalPlan1: undefined;
    PersonalPlan2: undefined;
    PersonalPlan3: undefined;
    PersonalPlan4: undefined;

    PlanSelection: undefined;
    Menu: undefined;

    EditProfile: undefined;
    ProfileDetail: undefined;

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

  };
