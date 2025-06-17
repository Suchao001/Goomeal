import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { register, login } from "../controllers/user_controller";
import { sendPasswordResetEmail, resetPassword, verifyResetToken } from "../controllers/forgotpassword";

const router = express.Router();

router.post("/register", async (req: Request, res: Response) => {
    try {
     const { username, email, password } = req.body;
        
        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Missing required fields",
                error: "Username, email, and password are required"
            });
        }
        
        const user = await register({ username, email, password });
        
        res.status(201).json({
            message: "User registered successfully",
            user,
        });
    } catch (error: any) {
        console.error("Registration error:", error); // Add this line
        res.status(500).json({
            message: "Error registering user",
            error: error.message,
        });
    }
});

router.post("/login", async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const loginResult = await login(username, password);

        res.status(200).json({
            message: "User logged in successfully",
            user: loginResult.user,
            accessToken: loginResult.accessToken, 
            refreshToken: loginResult.refreshToken,
        });
    } catch (error: any) {
        console.error("Login error:", error); // Add this line
        res.status(500).json({
            message: "Error logging in user",
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
                return res.status(403).json({ message: "Invalid refresh token" });
            }
            const accessToken = jwt.sign({ id: decoded.id }, jwtSecret, { expiresIn: '15m' });
            res.status(200).json({ accessToken });
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

// Forgot password route
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
            message: "Error sending password reset email",
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


export default router;
