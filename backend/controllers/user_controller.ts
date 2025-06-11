import db from '../db_config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
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

export {register,login};
