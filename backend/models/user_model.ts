export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  created_date: string; // or Date if using JS Date object

  age?: number | null;
  weight?: number | null;
  last_updated_weight?: number | null;
  height?: number | null;
  gender?: 'male' | 'female' | 'other' | null;
  body_fat?: 'high' | 'low' | 'normal' | 'don’t know' | null;
  target_goal?: 'decrease' | 'increase' | 'healthy' | null;
  target_weight?: number | null;

  activity_level?: 'low' | 'moderate' | 'high' | null;
  additional_requirements?: string | null;
  dietary_restrictions?: string | null;
  eating_type?: 'omnivore' | 'vegetarian' | 'vegan' | 'other' | null;

  account_status?: 'active' | 'suspended' | 'deactivated' | null;
  suspension_reason?: string | null;
}
