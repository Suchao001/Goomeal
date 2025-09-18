import db from '../db_config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user_model';
import {ageToYearOfBirth, yearOfBirthToAge, isValidYearOfBirth} from '../utils/ageCal';


type MealRow = {
  id: number;
  user_id: number;
  meal_name: string;
  meal_time: string;    
  sort_order: number | null;
  is_active: number | boolean | null;
  created_at?: any;
  updated_at?: any;
};

const initMealTimeSetting = async (userId: number) => {
  try {
    const defaultMeals = [
      {
        user_id: userId,
        meal_name: 'มื้อเช้า',
        meal_time: '08:00',
        sort_order: 1,
        is_active: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: userId,
        meal_name: 'มื้อกลางวัน',
        meal_time: '12:00',
        sort_order: 2,
        is_active: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: userId,
        meal_name: 'มื้อเย็น',
        meal_time: '18:00',
        sort_order: 3,
        is_active: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await db('user_meal_time').insert(defaultMeals);
    console.log(`✅ Initialized default meal times for user ${userId}`);
  } catch (error) {
    console.error('❌ Error initializing meal times:', error);
    throw error;
  }
};


const register = async ({username, email, password}: Pick<User, 'username' | 'email' | 'password'>) => {
    try {
        const existingUsername = await db('users').where({ username }).first();
        if (existingUsername) {
            return { success: false, message: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' };
        }
        
        
        const existingEmail = await db('users').where({ email }).first();
        if (existingEmail) {
            return { success: false, message: 'อีเมลนี้ถูกใช้งานแล้ว' };
        }

        
        

        const hashedPassword = await bcrypt.hash(password, 10);
        
        
        const newUser = {
            username,
            email,
            password: hashedPassword,
            created_date: new Date(), 
            account_status: 'active' 
        };

        
        const [insertId] = await db('users').insert(newUser);
        
        
        const createdUser = await db('users').where({ id: insertId }).first();
        
        
        try {
            await initMealTimeSetting(insertId);
        } catch (mealTimeError) {
            console.error('❌ Failed to initialize meal times for user:', insertId, mealTimeError);
            
        }
        
        return {
            success: true,
            data: {
                id: createdUser.id,
                username: createdUser.username,
                email: createdUser.email,
                created_date: createdUser.created_date
            }
        };
    } catch (error: any) {
        console.error('Registration error details:', error); 
        return { success: false, message: 'เกิดข้อผิดพลาดในการลงทะเบียน' };
    }
}

const login = async (username: string, password: string) => {
    try {
        const userData = await db('users').where({ username }).first();
        if (!userData) {
            return { success: false, message: 'ไม่พบผู้ใช้งาน' };
        }
        const {account_status,suspend_reason} = userData;
        if(account_status === 'suspended'){
            return { success: false, message: 'บัญชีผู้ใช้งานถูกระงับการใช้งาน หมายเหตุ: ' + suspend_reason };
        }

        const isPasswordValid = await bcrypt.compare(password, userData.password);

        if (!isPasswordValid) {
            return { success: false, message: 'รหัสผ่านไม่ถูกต้อง' };
        }
        
        const accessToken = jwt.sign({ id: userData.id }, process.env.JWT_SECRET || '', { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: userData.id }, process.env.JWT_SECRET || '', { expiresIn: '7d' });
        const user = {username: userData.username, email: userData.email, id: userData.id};
        
        return { 
            success: true, 
            data: { accessToken, refreshToken, user }
        };

    } catch (error: any) {
        console.error('Login error details:', error); 
        return { success: false, message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' };
    }
}


const getUserProfile = async (userId: number) => {
    try {
        const user = await db('users').where({ id: userId }).first();
        
        if (!user) {
            throw new Error('User not found');
        }

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            age: user.age ? yearOfBirthToAge(user.age) : null, 
            weight: user.weight,
            last_updated_weight: user.last_updated_weight,
            height: user.height,
            gender: user.gender,
            body_fat: user.body_fat === "unknown" ? "don't know" : user.body_fat, 
            target_goal: user.target_goal,
            target_weight: user.target_weight,
            activity_level: user.activity_level,
            eating_type: user.eating_type,
            dietary_restrictions: user.dietary_restrictions,
            additional_requirements: user.additional_requirements,
            account_status: user.account_status,
            suspend_reason: user.suspend_reason,
            created_date: user.created_date,
            first_time_setting: user.first_time_setting,
            is_verified: user.is_verified
        };
    } catch (error: any) {
        console.error('Get profile error details:', error);
        throw new Error(error.message || 'Error getting user profile');
    }
};


const updateUserProfile = async (userId: number, updateData: {
    username?: string;
    email?: string;
    currentPassword: string;
    newPassword?: string;
}) => {
    try {
        const { username, email, currentPassword, newPassword } = updateData;
        
        
        const currentUser = await db('users').where({ id: userId }).first();
        if (!currentUser) {
            throw new Error('ไม่พบผู้ใช้');
        }
        
        
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);
        if (!isCurrentPasswordValid) {
            throw new Error('รหัสผ่านปัจจุบันไม่ถูกต้อง');
        }
        
        
        if (username && username !== currentUser.username) {
            const existingUsername = await db('users').where({ username }).first();
            if (existingUsername) {
                throw new Error('ชื่อผู้ใช้มีอยู่แล้ว');
            }
        }
        
        
        if (email && email !== currentUser.email) {
            const existingEmail = await db('users').where({ email }).first();
            if (existingEmail) {
                throw new Error('Email already exists');
            }
        }
        
        
        const updateObj: any = {};
        if (username) updateObj.username = username;
        if (email) updateObj.email = email;
        if (newPassword) {
            updateObj.password = await bcrypt.hash(newPassword, 10);
        }
        
        
        await db('users').where({ id: userId }).update(updateObj);
        
        
        const updatedUser = await db('users').where({ id: userId }).first();
        
        return {
            id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            age: updatedUser.age,
            weight: updatedUser.weight,
            height: updatedUser.height,
            gender: updatedUser.gender,
            target_goal: updatedUser.target_goal,
            target_weight: updatedUser.target_weight,
            activity_level: updatedUser.activity_level,
            eating_type: updatedUser.eating_type,
            account_status: updatedUser.account_status,
            created_date: updatedUser.created_date
        };
    } catch (error: any) {
        console.error('Update profile error details:', error);
        throw new Error(error.message || 'Error updating user profile');
    }
}

const updatePersonalData = async (userId: number, personalData: {
    age?: number;
    weight?: number;
    last_updated_weight?: number;
    height?: number;
    gender?: 'male' | 'female' | 'other';
    body_fat?: 'high' | 'low' | 'normal' | 'don\'t know' | 'unknown';
    target_goal?: 'decrease' | 'increase' | 'healthy';
    target_weight?: number ;
    activity_level?: 'low' | 'moderate' | 'high' | 'very high';
    eating_type?: 'vegan' | 'vegetarian' | 'omnivore' | 'keto' | 'other';
    dietary_restrictions?: string;
    additional_requirements?: string;
    first_time_setting?: boolean;
}) => {
    try {
        
        const currentUser = await db('users').where({ id: userId }).first();
        if (!currentUser) {
            throw new Error('User not found');
        }

        
        const updateObj: any = {
            updated_at: new Date(),
            first_time_setting: personalData.first_time_setting !== undefined ? personalData.first_time_setting : true
        };

        if (personalData.age !== undefined) {
            const birthYear = ageToYearOfBirth(personalData.age);
            if (!isValidYearOfBirth(birthYear)) {
                throw new Error('Invalid age provided. Age must be between 10 and 120.');
            }
            updateObj.age = birthYear; 
        }
        if (personalData.weight !== undefined) {
            updateObj.weight = personalData.weight;
            updateObj.last_updated_weight = personalData.weight; 
        }
        if (personalData.last_updated_weight !== undefined) updateObj.last_updated_weight = personalData.last_updated_weight;
        if (personalData.height !== undefined) updateObj.height = personalData.height;
        if (personalData.gender !== undefined) updateObj.gender = personalData.gender;
        if (personalData.body_fat !== undefined) {
            
            updateObj.body_fat = personalData.body_fat === "don't know" ? "unknown" : personalData.body_fat;
        }
        if (personalData.target_goal !== undefined) updateObj.target_goal = personalData.target_goal;
        
        
        if (personalData.target_weight !== undefined) {
            updateObj.target_weight = personalData.target_weight;
        } else if (personalData.weight !== undefined) {
            
            updateObj.target_weight = personalData.weight;
        } else if (personalData.target_goal === 'healthy') {
            
            updateObj.target_weight = updateObj.weight || currentUser.weight;
        }
        if (personalData.activity_level !== undefined) updateObj.activity_level = personalData.activity_level;
        if (personalData.eating_type !== undefined) updateObj.eating_type = personalData.eating_type;
        if (personalData.dietary_restrictions !== undefined) updateObj.dietary_restrictions = personalData.dietary_restrictions;
        if (personalData.additional_requirements !== undefined) updateObj.additional_requirements = personalData.additional_requirements;

        
        await db('users').where({ id: userId }).update(updateObj);

        console.log('✅ อัปเดตข้อมูลส่วนตัวสำเร็จสำหรับ user ID:', userId);

        
        const updatedUser = await db('users').where({ id: userId }).first();
        
        return {
            id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            age: updatedUser.age,
            weight: updatedUser.weight,
            last_updated_weight: updatedUser.last_updated_weight,
            height: updatedUser.height,
            gender: updatedUser.gender,
            body_fat: updatedUser.body_fat === "unknown" ? "don't know" : updatedUser.body_fat, 
            target_goal: updatedUser.target_goal,
            target_weight: updatedUser.target_weight,
            activity_level: updatedUser.activity_level,
            eating_type: updatedUser.eating_type,
            dietary_restrictions: updatedUser.dietary_restrictions,
            additional_requirements: updatedUser.additional_requirements,
            account_status: updatedUser.account_status,
            suspend_reason: updatedUser.suspend_reason,
            created_date: updatedUser.created_date,
            first_time_setting: updatedUser.first_time_setting
        };
    } catch (error: any) {
        console.error('❌ เกิดข้อผิดพลาดในการอัปเดตข้อมูลส่วนตัว:', error.message);
        throw new Error(error.message || 'ไม่สามารถอัปเดตข้อมูลส่วนตัวได้');
    }
};

const updatePersonalWeight = async (userId: number, newWeight: number) => {
    try {
        
        const currentUser = await db('users').where({ id: userId }).first();
        if (!currentUser) {
            throw new Error('User not found');
        }

        
        if (!newWeight || newWeight <= 0) {
            throw new Error('Invalid weight value');
        }

        
        const result = await db.transaction(async (trx) => {
            
            await trx('user_weight_logs').insert({
                user_id: userId,
                weight: newWeight,
                logged_at: new Date()
            });

            
            await trx('users').where({ id: userId }).update({
                weight: newWeight,
                last_updated_weight: newWeight,
                updated_at: new Date()
            });

            
            const updatedUser = await trx('users').where({ id: userId }).first();
            
             return { success: true, newWeight };
        });

        console.log('✅ Weight updated successfully for user ID:', userId, 'New weight:', newWeight);
        return result;

    } catch (error: any) {
        console.error('❌ Error updating weight:', error.message);
        throw new Error(error.message || 'Unable to update weight');
    }
}

export {register, login, getUserProfile, updatePersonalData, updateUserProfile, updatePersonalWeight};
