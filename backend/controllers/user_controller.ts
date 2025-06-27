import db from '../db_config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user_model';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Generate password reset token (reuse from forgotpassword.ts)
const generateResetToken = (userId: number): string => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error('JWT_SECRET not configured');
    }
    
    // Token expires in 1 hour
    return jwt.sign({ userId, type: 'password_reset' }, jwtSecret, { expiresIn: '1h' });
};

// Send account change notification email
const sendAccountChangeNotification = async (
    oldEmail: string, 
    userId: number,
    changes: {
        username?: { old: string; new: string };
        email?: { old: string; new: string };
        passwordChanged?: boolean;
    }
) => {
    try {
        let changesText = '';
        const changesList = [];

        if (changes.username) {
            changesList.push(`ชื่อผู้ใช้: จาก "${changes.username.old}" เป็น "${changes.username.new}"`);
        }
        
        if (changes.email) {
            changesList.push(`อีเมล: จาก "${changes.email.old}" เป็น "${changes.email.new}"`);
        }
        
        if (changes.passwordChanged) {
            changesList.push('รหัสผ่าน: ได้รับการเปลี่ยนแปลง');
        }

        changesText = changesList.join('<br>');

        // Generate reset token for emergency reset
        const resetToken = generateResetToken(userId);
        const resetUrl = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;

        const { data, error } = await resend.emails.send({
            from: 'GoodMeal Security <security@resend.dev>',
            to: oldEmail,
            subject: 'GoodMeal - แจ้งเตือนการเปลี่ยนแปลงข้อมูลบัญชี',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #4CAF50; margin: 0;">🍽️ GoodMeal</h1>
                    </div>
                    
                    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
                        <h2 style="color: #856404; margin-top: 0;">🔒 แจ้งเตือนความปลอดภัย</h2>
                        <p style="color: #856404; line-height: 1.6; margin: 0;">
                            มีการเปลี่ยนแปลงข้อมูลในบัญชี GoodMeal ของคุณ
                        </p>
                    </div>
                    
                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
                        <h3 style="color: #333; margin-top: 0;">รายการการเปลี่ยนแปลง:</h3>
                        <div style="background-color: white; padding: 15px; border-radius: 5px; border-left: 4px solid #4CAF50;">
                            <p style="color: #666; line-height: 1.8; margin: 0;">
                                ${changesText}
                            </p>
                        </div>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
                        <h3 style="color: #333; margin-top: 0;">📅 เวลาที่เปลี่ยนแปลง:</h3>
                        <p style="color: #666; margin: 0;">
                            ${new Date().toLocaleString('th-TH', { 
                                timeZone: 'Asia/Bangkok',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                            })}
                        </p>
                    </div>
                    
                    <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
                        <h3 style="color: #721c24; margin-top: 0;">⚠️ หากไม่ใช่คุณที่ทำการเปลี่ยนแปลง</h3>
                        <p style="color: #721c24; line-height: 1.6; margin-bottom: 15px;">
                            กรุณาติดต่อทีมสนับสนุนของเราทันที และเปลี่ยนรหัสผ่านของคุณ
                        </p>
                        <div style="text-align: center;">
                            <a href="${resetUrl}" 
                               style="background-color: #dc3545; color: white; padding: 12px 25px; 
                                      text-decoration: none; border-radius: 8px; display: inline-block;
                                      font-weight: bold; font-size: 14px;">
                                รีเซ็ตรหัสผ่านทันที
                            </a>
                        </div>
                        <p style="color: #721c24; font-size: 12px; text-align: center; margin-top: 10px; margin-bottom: 0;">
                            ⏰ ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง
                        </p>
                    </div>
                    
                    <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 0; color: #0c5460; font-size: 14px;">
                            <strong>💡 เคล็ดลับความปลอดภัย:</strong><br>
                            • ใช้รหัสผ่านที่แข็งแกร่งและไม่เหมือนกับเว็บไซต์อื่น<br>
                            • อย่าแชร์ข้อมูลการเข้าสู่ระบบกับผู้อื่น<br>
                            • ออกจากระบบเมื่อใช้งานเสร็จ
                        </p>
                    </div>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    
                    <div style="text-align: center;">
                        <p style="color: #999; font-size: 12px; margin: 0;">
                            อีเมลนี้ส่งโดยระบบรักษาความปลอดภัย GoodMeal<br>
                            หากคุณมีคำถาม กรุณาติดต่อทีมสนับสนุน<br>
                            📧 support@goodmeal.app | 📞 02-xxx-xxxx
                        </p>
                    </div>
                </div>
            `
        });

        if (error) {
            console.error('❌ Resend error:', error);
            throw new Error(error.message || 'Failed to send notification email');
        }

        console.log('✅ ส่งอีเมลแจ้งเตือนการเปลี่ยนแปลงสำเร็จ');
        console.log('📧 อีเมลที่ส่งถึง:', oldEmail);
        console.log('🔗 Reset URL:', resetUrl);
        console.log('🆔 Resend email ID:', data?.id);
        
        return {
            success: true,
            message: 'ส่งอีเมลแจ้งเตือนเรียบร้อยแล้ว',
            email: oldEmail,
            emailId: data?.id,
            resetUrl: resetUrl
        };
        
    } catch (error: any) {
        console.error('❌ เกิดข้อผิดพลาดในการส่งอีเมลแจ้งเตือน:', error.message);
        // Don't throw error - notification email failure shouldn't break the main process
        return {
            success: false,
            message: 'ไม่สามารถส่งอีเมลแจ้งเตือนได้',
            error: error.message
        };
    }
};


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
        
        // Track changes for notification email
        const changes: {
            username?: { old: string; new: string };
            email?: { old: string; new: string };
            passwordChanged?: boolean;
        } = {};
        
        // Check if username is being changed and if it already exists
        if (username && username !== currentUser.username) {
            const existingUsername = await db('users').where({ username }).first();
            if (existingUsername) {
                throw new Error('Username already exists');
            }
            changes.username = { old: currentUser.username, new: username };
        }
        
        // Check if email is being changed and if it already exists
        if (email && email !== currentUser.email) {
            const existingEmail = await db('users').where({ email }).first();
            if (existingEmail) {
                throw new Error('Email already exists');
            }
            changes.email = { old: currentUser.email, new: email };
        }
        
        // Check if password is being changed
        if (newPassword) {
            changes.passwordChanged = true;
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
        
        // Send notification email to old email if there are changes
        if (Object.keys(changes).length > 0) {
            try {
                await sendAccountChangeNotification(currentUser.email, userId, changes);
            } catch (emailError) {
                console.error('Warning: Failed to send notification email:', emailError);
                // Continue with the process even if email fails
            }
        }
        
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

export {register, login, getUserProfile, updateUserProfile, sendAccountChangeNotification};
