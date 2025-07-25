import db from '../db_config';
import { Resend } from 'resend';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Generate password reset token
const generateResetToken = (userId: number): string => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error('JWT_SECRET not configured');
    }
    
    // Include current timestamp to make token unique
    const tokenTimestamp = Date.now();
    
    // Token expires in 1 hour
    return jwt.sign({ 
        userId, 
        type: 'password_reset', 
        tokenTimestamp 
    }, jwtSecret, { expiresIn: '1h' });
};

// Send password reset email using Resend
export const sendPasswordResetEmail = async (email: string) => {
    try {
        // Check if user exists
        const user = await db('users').where({ email }).first();
        if (!user) {
            throw new Error('No user found with this email address');
        }

        const resetToken = generateResetToken(user.id);
        
        // For React Native app - use deep link
        const resetUrl = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;
        
        const { data, error } = await resend.emails.send({
            from: 'GoodMeal <onboarding@resend.dev>',
            to: email,
            subject: 'GoodMeal - Password Reset Request',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #4CAF50; margin: 0;">🍽️ GoodMeal</h1>
                    </div>
                    
                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
                        <h2 style="color: #333; margin-top: 0;">รีเซ็ตรหัสผ่าน</h2>
                        <p style="color: #666; line-height: 1.6;">สวัสดีครับ/ค่ะ</p>
                        <p style="color: #666; line-height: 1.6;">
                            คุณได้ขอรีเซ็ตรหัสผ่านสำหรับบัญชี GoodMeal ของคุณ
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background-color: #4CAF50; color: white; padding: 15px 30px; 
                                  text-decoration: none; border-radius: 8px; display: inline-block;
                                  font-weight: bold; font-size: 16px;">
                            รีเซ็ตรหัสผ่าน
                        </a>
                    </div>
                    
                    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 0; color: #856404;">
                            <strong>⚠️ สำคัญ:</strong> ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง
                        </p>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 0; color: #6c757d; font-size: 14px;">
                            หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน โปรดเพิกเฉยต่ออีเมลนี้
                        </p>
                    </div>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    
                    <div style="text-align: center;">
                        <p style="color: #999; font-size: 12px; margin: 0;">
                            อีเมลนี้ส่งโดยระบบ GoodMeal โปรดอย่าตอบกลับอีเมลนี้
                        </p>
                    </div>
                </div>
            `
        });

        if (error) {
            console.error('❌ Resend error:', error);
            throw new Error(error.message || 'Failed to send email via Resend');
        }

        console.log('✅ ส่งอีเมลรีเซ็ตรหัสผ่านสำเร็จ');
        console.log('📧 อีเมลที่ส่งถึง:', email);
        console.log('🆔 Resend email ID:', data?.id);
        
        return {
            success: true,
            message: 'ส่งอีเมลรีเซ็ตรหัสผ่านเรียบร้อยแล้ว',
            email: email,
            emailId: data?.id
        };
        
    } catch (error: any) {
        console.error('❌ เกิดข้อผิดพลาดในการส่งอีเมล:', error.message);
        throw new Error(error.message || 'ไม่สามารถส่งอีเมลรีเซ็ตรหัสผ่านได้');
    }
};


export const verifyResetToken = async (token: string) => {
    try {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET not configured');
        }

        // Verify token
        const decoded = jwt.verify(token, jwtSecret) as any;
        
        if (decoded.type !== 'password_reset') {
            throw new Error('Invalid token type');
        }

        const userId = decoded.userId;
        const tokenTimestamp = decoded.tokenTimestamp;
        
        // Check if user exists
        const user = await db('users').where({ id: userId }).first();
        if (!user) {
            throw new Error('User not found');
        }

        // Check if token has already been used
        if (user.last_password_reset && tokenTimestamp <= new Date(user.last_password_reset).getTime()) {
            throw new Error('ลิงก์รีเซ็ตรหัสผ่านนี้ถูกใช้งานไปแล้ว');
        }

        console.log('✅ Token ถูกต้อง สำหรับ user ID:', userId);

        return {
            success: true,
            message: 'Token ถูกต้อง',
            userId: userId,
            userEmail: user.email
        };
        
    } catch (error: any) {
        console.error('❌ Token ไม่ถูกต้อง:', error.message);
        
        if (error.name === 'TokenExpiredError') {
            throw new Error('ลิงก์รีเซ็ตรหัสผ่านหมดอายุแล้ว');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้อง');
        }
        
        throw new Error(error.message || 'Token ไม่ถูกต้อง');
    }
};


export const resetPassword = async (token: string, newPassword: string) => {
    try {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET not configured');
        }

        // Verify token
        const decoded = jwt.verify(token, jwtSecret) as any;
        
        if (decoded.type !== 'password_reset') {
            throw new Error('Invalid token type');
        }

        const userId = decoded.userId;
        const tokenTimestamp = decoded.tokenTimestamp;
        
        const user = await db('users').where({ id: userId }).first();
        if (!user) {
            throw new Error('User not found');
        }

        // Check if token has already been used by comparing with last password reset timestamp
        if (user.last_password_reset && tokenTimestamp <= new Date(user.last_password_reset).getTime()) {
            throw new Error('ลิงก์รีเซ็ตรหัสผ่านนี้ถูกใช้งานไปแล้ว');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password and set last password reset timestamp
        await db('users')
            .where({ id: userId })
            .update({ 
                password: hashedPassword,
                last_password_reset: new Date(),
                updated_at: new Date()
            });

        console.log('✅ รีเซ็ตรหัสผ่านสำเร็จสำหรับ user ID:', userId);

        return {
            success: true,
            message: 'รีเซ็ตรหัสผ่านสำเร็จ',
            userId: userId
        };
        
    } catch (error: any) {
        console.error('❌ เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน:', error.message);
        
        if (error.name === 'TokenExpiredError') {
            throw new Error('ลิงก์รีเซ็ตรหัสผ่านหมดอายุแล้ว');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้อง');
        }
        
        throw new Error(error.message || 'ไม่สามารถรีเซ็ตรหัสผ่านได้');
    }
};