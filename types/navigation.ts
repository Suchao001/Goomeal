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
   
    Home: undefined;
    SearchFoodForAdd: {
        hideRecommended?: boolean;
        mealId?: string;
        source?: string;
    } | undefined;
    AddNewFood: undefined;

  };
