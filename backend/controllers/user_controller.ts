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

const getUserProfile = async (userId: number) => {
    try {
        const userData = await db('users').where({ id: userId }).first();
        if (!userData) {
            throw new Error('User not found');
        }
        
        // Return user data without sensitive information
        return {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            age: userData.age,
            weight: userData.weight,
            height: userData.height,
            gender: userData.gender,
            target_goal: userData.target_goal,
            target_weight: userData.target_weight,
            activity_level: userData.activity_level,
            eating_type: userData.eating_type,
            account_status: userData.account_status,
            created_date: userData.created_date
        };
    } catch (error: any) {
        console.error('Get profile error details:', error);
        throw new Error(error.message || 'Error getting user profile');
    }
}

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

export {register, login, getUserProfile, updateUserProfile};
