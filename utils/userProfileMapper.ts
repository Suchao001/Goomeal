// User Profile Mapper Utility
// แปลง User data จาก AuthContext เป็น UserProfileData สำหรับ nutrition calculator

import { UserProfileData } from './nutritionCalculator';

export interface AuthUser {
  id?: string;
  email?: string;
  name?: string;
  username?: string;
  age?: number;
  weight?: number;
  last_updated_weight?: number;
  height?: number;
  gender?: 'male' | 'female' | 'other';
  body_fat?: 'high' | 'low' | 'normal' | "don't know";
  target_goal?: 'decrease' | 'increase' | 'healthy';
  target_weight?: number;
  activity_level?: 'low' | 'moderate' | 'high' | 'very high';
  additional_requirements?: string;
  dietary_restrictions?: string;
  eating_type?: 'vegan' | 'vegetarian' | 'omnivore' | 'keto' | 'other';
  account_status?: 'active' | 'suspended' | 'deactivated';
  suspend_reason?: string;
  created_date?: string;
  first_time_setting?: boolean;
}

export function mapAuthUserToUserProfile(authUser: AuthUser | null): UserProfileData | null {
  if (!authUser) {
    console.log('❌ [UserProfileMapper] No auth user provided');
    return null;
  }

  // Validate required fields
  const requiredFields = ['age', 'weight', 'height', 'gender', 'target_goal', 'target_weight', 'activity_level'];
  const missingFields = requiredFields.filter(field => {
    const value = authUser[field as keyof AuthUser];
    return value === undefined || value === null || value === '';
  });

  if (missingFields.length > 0) {
    console.log('❌ [UserProfileMapper] Missing required fields:', missingFields);
    return null;
  }

  // Convert to UserProfileData format
  const userProfile: UserProfileData = {
    age: String(authUser.age!),
    weight: String(authUser.weight!),
    height: String(authUser.height!),
    gender: authUser.gender!,
    body_fat: authUser.body_fat!,
    target_goal: authUser.target_goal!,
    target_weight: String(authUser.target_weight!),
    activity_level: authUser.activity_level!
  };

  console.log('✅ [UserProfileMapper] Successfully mapped auth user to profile');

  return userProfile;
}

// Helper function to check if user profile is complete
export function isUserProfileComplete(authUser: AuthUser | null): boolean {
  return mapAuthUserToUserProfile(authUser) !== null;
}

// Helper function to get default/fallback nutrition data
export function getDefaultNutritionData() {
  return {
    cal: 2000,
    carb: 250,
    protein: 100,
    fat: 67,
    bmr: 1600,
    tdee: 2000
  };
}
