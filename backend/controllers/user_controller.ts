import db from '../db_config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user_model';



const register = async ({username, email, password}: Pick<User, 'username' | 'email' | 'password'>) => {
    try {
        // Check if user already exists
        const existingUser = await db('users').where({ email }).first();
        if (existingUser) {
            throw new Error('Email already exists');
        }

        // Check if username already exists
        const existingUsername = await db('users').where({ username }).first();
        if (existingUsername) {
            throw new Error('Username already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user object with required fields only
        const newUser = {
            username,
            email,
            password: hashedPassword,
            created_date: new Date(), // Add this required field
            account_status: 'active' // Add default status
        };

        // Insert without .returning() for MySQL
        const [insertId] = await db('users').insert(newUser);
        
        // Get the created user
        const createdUser = await db('users').where({ id: insertId }).first();
        
        return {
            id: createdUser.id,
            username: createdUser.username,
            email: createdUser.email,
            created_date: createdUser.created_date
        };
    } catch (error: any) {
        console.error('Registration error details:', error); // Add detailed logging
        throw new Error(error.message || 'Error registering user');
    }
}

const login = async (username: string, password: string) => {
    try {
        const userData = await db('users').where({ username }).first();
        if (!userData) {
            throw new Error('User not found');
        }
        const isPasswordValid = await bcrypt.compare(password, userData.password);
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }
        const accessToken = jwt.sign({ id: userData.id }, process.env.JWT_SECRET || '', { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: userData.id }, process.env.JWT_SECRET || '', { expiresIn: '7d' });
        const user = {username: userData.username, email: userData.email, id: userData.id};
        return { accessToken, refreshToken, user };

    } catch (error: any) {
        console.error('Login error details:', error); // Add detailed logging
        throw new Error(error.message || 'Error logging in user');
    }
}

// Get user profile
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
            age: user.age,
            weight: user.weight,
            last_updated_weight: user.last_updated_weight,
            height: user.height,
            gender: user.gender,
            body_fat: user.body_fat,
            target_goal: user.target_goal,
            target_weight: user.target_weight,
            activity_level: user.activity_level,
            eating_type: user.eating_type,
            dietary_restrictions: user.dietary_restrictions,
            additional_requirements: user.additional_requirements,
            account_status: user.account_status,
            suspend_reason: user.suspend_reason,
            created_date: user.created_date,
            first_time_setting: user.first_time_setting
        };
    } catch (error: any) {
        console.error('Get profile error details:', error);
        throw new Error(error.message || 'Error getting user profile');
    }
};

//update user account 
const updateUserProfile = async (userId: number, updateData: {
    username?: string;
    email?: string;
    currentPassword: string;
    newPassword?: string;
}) => {
    try {
        const { username, email, currentPassword, newPassword } = updateData;
        
        // Get current user data
        const currentUser = await db('users').where({ id: userId }).first();
        if (!currentUser) {
            throw new Error('User not found');
        }
        
        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);
        if (!isCurrentPasswordValid) {
            throw new Error('Current password is incorrect');
        }
        
        // Check if username is being changed and if it already exists
        if (username && username !== currentUser.username) {
            const existingUsername = await db('users').where({ username }).first();
            if (existingUsername) {
                throw new Error('Username already exists');
            }
        }
        
        // Check if email is being changed and if it already exists
        if (email && email !== currentUser.email) {
            const existingEmail = await db('users').where({ email }).first();
            if (existingEmail) {
                throw new Error('Email already exists');
            }
        }
        
        // Prepare update object
        const updateObj: any = {};
        if (username) updateObj.username = username;
        if (email) updateObj.email = email;
        if (newPassword) {
            updateObj.password = await bcrypt.hash(newPassword, 10);
        }
        
        // Update user
        await db('users').where({ id: userId }).update(updateObj);
        
        // Get updated user data
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

// Update personal data from setup screens
const updatePersonalData = async (userId: number, personalData: {
    age?: number;
    weight?: number;
    last_updated_weight?: number;
    height?: number;
    gender?: 'male' | 'female' | 'other';
    body_fat?: 'high' | 'low' | 'normal' | 'don\'t know';
    target_goal?: 'decrease' | 'increase' | 'healthy';
    target_weight?: number;
    activity_level?: 'low' | 'moderate' | 'high' | 'very high';
    eating_type?: 'vegan' | 'vegetarian' | 'omnivore' | 'keto' | 'other';
    dietary_restrictions?: string;
    additional_requirements?: string;
    first_time_setting?: boolean;
}) => {
    try {
        // Check if user exists
        const currentUser = await db('users').where({ id: userId }).first();
        if (!currentUser) {
            throw new Error('User not found');
        }

        // Prepare update object with only provided fields
        const updateObj: any = {
            updated_at: new Date()
        };

        if (personalData.age !== undefined) updateObj.age = personalData.age;
        if (personalData.weight !== undefined) {
            updateObj.weight = personalData.weight;
            updateObj.last_updated_weight = personalData.weight; // Auto-update last_updated_weight when weight changes
        }
        if (personalData.last_updated_weight !== undefined) updateObj.last_updated_weight = personalData.last_updated_weight;
        if (personalData.height !== undefined) updateObj.height = personalData.height;
        if (personalData.gender !== undefined) updateObj.gender = personalData.gender;
        if (personalData.body_fat !== undefined) updateObj.body_fat = personalData.body_fat;
        if (personalData.target_goal !== undefined) updateObj.target_goal = personalData.target_goal;
        if (personalData.target_weight !== undefined) updateObj.target_weight = personalData.target_weight;
        if (personalData.activity_level !== undefined) updateObj.activity_level = personalData.activity_level;
        if (personalData.eating_type !== undefined) updateObj.eating_type = personalData.eating_type;
        if (personalData.dietary_restrictions !== undefined) updateObj.dietary_restrictions = personalData.dietary_restrictions;
        if (personalData.additional_requirements !== undefined) updateObj.additional_requirements = personalData.additional_requirements;

        // Update user personal data
        await db('users').where({ id: userId }).update(updateObj);

        console.log('✅ อัปเดตข้อมูลส่วนตัวสำเร็จสำหรับ user ID:', userId);

        // Get updated user data
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
            body_fat: updatedUser.body_fat,
            target_goal: updatedUser.target_goal,
            target_weight: updatedUser.target_weight,
            activity_level: updatedUser.activity_level,
            eating_type: updatedUser.eating_type,
            dietary_restrictions: updatedUser.dietary_restrictions,
            additional_requirements: updatedUser.additional_requirements,
            account_status: updatedUser.account_status,
            suspend_reason: updatedUser.suspend_reason,
            created_date: updatedUser.created_date,
            first_time_setting: true
        };
    } catch (error: any) {
        console.error('❌ เกิดข้อผิดพลาดในการอัปเดตข้อมูลส่วนตัว:', error.message);
        throw new Error(error.message || 'ไม่สามารถอัปเดตข้อมูลส่วนตัวได้');
    }
};

export {register, login, getUserProfile, updatePersonalData,updateUserProfile};
