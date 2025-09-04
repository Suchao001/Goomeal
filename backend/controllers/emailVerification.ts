import db from '../db_config';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { generateEmailVerificationTemplate, generateWelcomeEmailTemplate } from '../utils/emailTemplates';

dotenv.config();

// Get email config from env
const sender = process.env.EMAIL_SENDER;
const app_password = process.env.APP_PASSWORD;

// Generate email verification token
const generateVerificationToken = (userId: number, email: string): string => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error('JWT_SECRET not configured');
    }
    
    // Token expires in 24 hours
    return jwt.sign({ 
        userId, 
        email,
        type: 'email_verification',
        timestamp: Date.now()
    }, jwtSecret, { expiresIn: '24h' });
};

// Send email verification
export const sendEmailVerification = async (email: string, userId: number, username: string) => {
    try {
        const verificationToken = generateVerificationToken(userId, email);
        const verificationUrl = `${process.env.BASE_URL}/verify-email?token=${verificationToken}`;
        
        // Create nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: sender,
                pass: app_password,
            },
        });

        const mailOptions = {
            from: `"GoodMeal" <${sender}>`,
            to: email,
            subject: 'GoodMeal - ยืนยันอีเมลของคุณ',
            html: generateEmailVerificationTemplate(username, verificationUrl)
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('✅ ส่งอีเมลยืนยันสำเร็จ');
        console.log('📧 อีเมลที่ส่งถึง:', email);
        console.log('🆔 Message ID:', info.messageId);
        
        return {
            success: true,
            message: 'ส่งอีเมลยืนยันเรียบร้อยแล้ว',
            email: email,
            messageId: info.messageId
        };
        
    } catch (error: any) {
        console.error('❌ เกิดข้อผิดพลาดในการส่งอีเมลยืนยัน:', error.message);
        throw new Error(error.message || 'ไม่สามารถส่งอีเมลยืนยันได้');
    }
};

// Verify email token
export const verifyEmailToken = async (token: string) => {
    try {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET not configured');
        }

        // Verify token
        const decoded = jwt.verify(token, jwtSecret) as any;
        
        if (decoded.type !== 'email_verification') {
            throw new Error('Invalid token type');
        }

        const userId = decoded.userId;
        const email = decoded.email;
        
        // Check if user exists
        const user = await db('users').where({ id: userId, email: email }).first();
        if (!user) {
            throw new Error('User not found');
        }

        // Check if email is already verified
        if (user.is_verified) {
            throw new Error('อีเมลได้รับการยืนยันแล้ว');
        }

        // Update user email verification status
        await db('users')
            .where({ id: userId })
            .update({ 
                is_verified: true,
                updated_at: new Date()
            });

        console.log('✅ ยืนยันอีเมลสำเร็จสำหรับ user ID:', userId);

        return {
            success: true,
            message: 'ยืนยันอีเมลสำเร็จ',
            userId: userId,
            email: email
        };
        
    } catch (error: any) {
        console.error('❌ Token ไม่ถูกต้อง:', error.message);
        
        if (error.name === 'TokenExpiredError') {
            throw new Error('ลิงก์ยืนยันอีเมลหมดอายุแล้ว');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('ลิงก์ยืนยันอีเมลไม่ถูกต้อง');
        }
        
        throw new Error(error.message || 'Token ไม่ถูกต้อง');
    }
};

// Send welcome email after verification
export const sendWelcomeEmail = async (email: string, username: string) => {
    try {
        // Create nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: sender,
                pass: app_password,
            },
        });

        const mailOptions = {
            from: `"GoodMeal" <${sender}>`,
            to: email,
            subject: 'GoodMeal - ยินดีต้อนรับเข้าสู่ครอบครัว GoodMeal!',
            html: generateWelcomeEmailTemplate(username)
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('✅ ส่งอีเมลต้อนรับสำเร็จ');
        console.log('📧 อีเมลที่ส่งถึง:', email);
        
        return {
            success: true,
            message: 'ส่งอีเมลต้อนรับเรียบร้อยแล้ว',
            messageId: info.messageId
        };
        
    } catch (error: any) {
        console.error('❌ เกิดข้อผิดพลาดในการส่งอีเมลต้อนรับ:', error.message);
        // Don't throw error here as it's not critical
        return {
            success: false,
            message: 'ไม่สามารถส่งอีเมลต้อนรับได้'
        };
    }
};
