// Export all screen modules
export * from './auth';
export * from './home';
export * from './food';
export * from './profile';
export * from './settings';
export * from './setup';
export * from './reports';

// Export individual screens
export { default as MenuScreen } from './MenuScreen';
export { default as OptionPlanScreen } from './OptionPlanScreen';
export { default as SelectGlobalPlan } from './SelectGlobalPlan';

// FirstForm screens
export { default as PersonalSetupScreen } from './firstForm/PersonalSetupScreen';
export { default as PersonalPlanScreen1 } from './firstForm/PersonalPlanScreen1';
export { default as PersonalPlanScreen2 } from './firstForm/PersonalPlanScreen2';
export { default as PersonalPlanScreen3 } from './firstForm/PersonalPlanScreen3';
export { default as PersonalPlanScreen4 } from './firstForm/PersonalPlanScreen4';

// Material components
export { default as Header } from './material/Header';
export { default as Menu } from './material/Menu';
