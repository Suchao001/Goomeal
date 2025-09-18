import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { register, login, getUserProfile, updatePersonalData, updateUserProfile, updatePersonalWeight } from "../controllers/user_controller";
import authenticateToken from "../middlewares/authenticateToken";
import { sendPasswordResetEmail, resetPassword, verifyResetToken } from "../controllers/forgotpassword";
import { sendEmailVerification, verifyEmailToken, sendWelcomeEmail } from "../controllers/emailVerification";
import db from "../db_config";



// Define interface for authenticated requests
interface AuthenticatedRequest extends Request {
    user?: any;
}

const router = express.Router();

router.post("/register", async (req: Request, res: Response) => {
    try {
     const { username, email, password } = req.body;
        
        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "กรุณากรอกข้อมูลให้ครบถ้วน",
                error: "Username, email, and password are required"
            });
        }
        
        const result = await register({ username, email, password });
        
        if (!result.success) {
            return res.status(400).json({
                message: result.message 
            });
        }

        // Send email verification after successful registration
        try {
            if (result.data) {
                await sendEmailVerification(email, result.data.id, username);
            }
        } catch (emailError: any) {
            console.error('Email verification sending failed:', emailError.message);
            // Don't fail registration if email fails, just log it
        }
        
        res.status(201).json({
            message: "ลงทะเบียนสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี",
            user: result.data,
            emailSent: true
        });
    } catch (error: any) {
        console.error("Registration error:", error); // Add this line
        res.status(500).json({
            message: "เกิดข้อผิดพลาดในการลงทะเบียน",
            error: error.message,
        });
    }
});

router.post("/login", async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const loginResult = await login(username, password);
        
        if (!loginResult.success) {
            return res.status(400).json({
                message: loginResult.message
            });
        }

        res.status(200).json({
            message: "เข้าสู่ระบบสำเร็จ",
            user: loginResult.data!.user,
            accessToken: loginResult.data!.accessToken, 
            refreshToken: loginResult.data!.refreshToken,
        });
    } catch (error: any) {
        console.error("Login error:", error); // Add this line
        res.status(500).json({
            message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
            error: error.message,
        });
    }
});

router.post("/refresh", async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token is required" });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({ message: "Server configuration error" });
        }

        jwt.verify(refreshToken, jwtSecret, (err: any, decoded: any) => {
            if (err) {
                return res.status(403).json({ 
                    success: false, 
                    message: "Invalid refresh token" 
                });
            }
            const accessToken = jwt.sign({ id: decoded.id }, jwtSecret, { expiresIn: '15m' });
            res.status(200).json({ 
                success: true,
                accessToken,
                message: "Token refreshed successfully"
            });
        });
    } catch (error: any) {
        res.status(500).json({
            message: "Error refreshing token",
            error: error.message,
        });
    }
});

router.post("/logout", async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: "Refresh token is required" });
        }
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error: any) {
        res.status(500).json({
            message: "Error logging out user",
            error: error.message,
        });
    }
});

// Get user profile endpoint
router.get("/profile", authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            res.status(401).json({
                message: "User ID not found in token",
                success: false
            });
            return;
        }
        
        const userProfile = await getUserProfile(userId);
        
        res.status(200).json({
            message: "User profile retrieved successfully",
            user: userProfile,
            success: true
        });
        
    } catch (error: any) {
        console.error("Get profile error:", error);     
        res.status(500).json({
            message: "Error getting user profile",
            error: error.message,
            success: false
        });
    }
});

// Update user profile endpoint
router.put("/update-profile", authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { username, email, currentPassword, newPassword } = req.body;
        
        if (!userId) {
            res.status(401).json({
                message: "User ID not found in token",
                success: false
            });
            return;
        }
        
        if (!currentPassword) {
            res.status(400).json({
                message: "Current password is required",
                success: false
            });
            return;
        }
        
        const updateData = {
            username,
            email,
            currentPassword,
            newPassword
        };
        
        const updatedUser = await updateUserProfile(userId, updateData);
        
        res.status(200).json({
            message: "User profile updated successfully",
            user: updatedUser,
            success: true
        });
        
    } catch (error: any) {
        console.error("Update profile error:", error);
        res.status(400).json({
            message: error.message,
            success: false
        });
    }
});

// Update personal data endpoint (for setup screens)
router.put("/update-personal-data", authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const {
            age,
            weight,
            last_updated_weight,
            height,
            gender,
            body_fat,
            target_goal,
            target_weight,
            activity_level,
            eating_type,
            dietary_restrictions,
            additional_requirements
        } = req.body;
        
        if (!userId) {
            res.status(401).json({
                message: "User ID not found in token",
                success: false
            });
            return;
        }
        
        const personalData = {
            age: age ? parseInt(age) : undefined,
            weight: weight ? parseFloat(weight) : undefined,
            last_updated_weight: last_updated_weight ? parseFloat(last_updated_weight) : undefined,
            height: height ? parseFloat(height) : undefined,
            gender,
            body_fat,
            target_goal,
            target_weight: target_weight ? parseFloat(target_weight) : undefined,
            activity_level,
            eating_type,
            dietary_restrictions,
            additional_requirements
        };
        
        const updatedUser = await updatePersonalData(userId, personalData);
        
        res.status(200).json({
            message: "Personal data updated successfully",
            user: updatedUser,
            success: true
        });
        
    } catch (error: any) {
        console.error("Update personal data error:", error);
        res.status(400).json({
            message: error.message,
            success: false
        });
    }
});

// forgot password endpoints
router.post("/forgot-password", async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }
       
        const result = await sendPasswordResetEmail(email);
        
        res.status(200).json({
            message: result.message,
            success: true
        });
        
    } catch (error: any) {
        console.error("Forgot password error:", error);
        res.status(500).json({
            message: "เกิดข้อผิดพลาดในการส่งอีเมลรีเซ็ตรหัสผ่าน ตรวจสอบอีเมลอีกครั้ง",
            error: error.message,
            success: false
        });
    }
});

// Reset password route
router.post("/reset-password", async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            return res.status(400).json({
                message: "Token and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long"
            });
        }

        const result = await resetPassword(token, newPassword);
        
        res.status(200).json({
            message: result.message,
            success: true
        });
        
    } catch (error: any) {
        console.error("Reset password error:", error);
        res.status(400).json({
            message: error.message,
            success: false
        });
    }
});

// Verify reset token endpoint
router.get("/verify-reset-token", async (req: Request, res: Response) => {
    try {
        const { token } = req.query;
        
        if (!token || typeof token !== 'string') {
            return res.status(400).json({
                message: "Token is required",
                success: false
            });
        }

        const result = await verifyResetToken(token);
        
        res.status(200).json({
            message: result.message,
            success: true,
            userId: result.userId,
            userEmail: result.userEmail
        });
        
    } catch (error: any) {
        console.error("Verify token error:", error);
        res.status(400).json({
            message: error.message,
            success: false
        });
    }
});

// Email verification endpoint
router.get("/verify-email", async (req: any, res: any) => {
    try {
        const { token } = req.query;
        
        if (!token) {
            return res.status(400).json({
                message: "Token is required",
                success: false
            });
        }
        
        const result = await verifyEmailToken(token);
        
        // Send welcome email after successful verification
        try {
            const user = await db('users').where({ id: result.userId }).first();
            if (user) {
                await sendWelcomeEmail(result.email, user.username);
            }
        } catch (emailError: any) {
            console.error('Welcome email sending failed:', emailError.message);
        }
        
        res.status(200).json({
            message: "อีเมลได้รับการยืนยันเรียบร้อยแล้ว",
            success: true,
            userId: result.userId,
            email: result.email
        });
        
    } catch (error: any) {
        console.error("Email verification error:", error);
        res.status(400).json({
            message: error.message,
            success: false
        });
    }
});

// Resend email verification
router.post("/resend-verification", async (req: any, res: any) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                message: "Email is required",
                success: false
            });
        }
        
        // Check if user exists and is not already verified
        const user = await db('users').where({ email }).first();
        if (!user) {
            return res.status(404).json({
                message: "ไม่พบผู้ใช้งานที่มีอีเมลนี้",
                success: false
            });
        }
        
        if (user.is_verified) {
            return res.status(400).json({
                message: "อีเมลได้รับการยืนยันแล้ว",
                success: false
            });
        }
        
        await sendEmailVerification(email, user.id, user.username);
        
        res.status(200).json({
            message: "ส่งอีเมลยืนยันใหม่เรียบร้อยแล้ว",
            success: true
        });
        
    } catch (error: any) {
        console.error("Resend verification error:", error);
        res.status(500).json({
            message: "เกิดข้อผิดพลาดในการส่งอีเมลยืนยัน",
            success: false
        });
    }
});

// Update weight endpoint
router.put("/update-weight", authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { weight } = req.body;
        
        if (!userId) {
            res.status(401).json({
                message: "User ID not found in token",
                success: false
            });
            return;
        }
        
        if (!weight || weight <= 0) {
            res.status(400).json({
                message: "Valid weight value is required",
                success: false
            });
            return;
        }
        
        const updatedUser = await updatePersonalWeight(userId, parseFloat(weight));
        
        res.status(200).json({
            message: "Weight updated successfully",
            user: updatedUser,
            success: true
        });
        
    } catch (error: any) {
        console.error("Update weight error:", error);
        res.status(400).json({
            message: error.message,
            success: false
        });
    }
});

export default router;
