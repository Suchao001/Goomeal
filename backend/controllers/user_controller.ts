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

export {register};