import db from '../db_config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/user_model';


const register =async ({username,email,password}:Pick<User,'username'| 'email' | 'password'>) => {
    try{
        const existingUser = await db('users').where({ username }).first();
        if (existingUser) {
            throw new Error('Username already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser: Omit<User, 'id' | 'created_date'> = {
            username,
            email,
            password: hashedPassword,
        };
        await db('users').insert(newUser).returning('*');
        return  true;
    }catch (error) {
        throw new Error('Error checking existing user');
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
        return { accessToken,refreshToken, user };

    }catch (error) {
        throw new Error('Error logging in user' + error);
    }
}

export {register,login};
