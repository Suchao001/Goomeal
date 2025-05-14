import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { register, login } from "../controllers/user_controller";

const router = express.Router();

router.post("/register", async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;
        const user = await register({ username, email, password });
        
        res.status(201).json({
            message: "User registered successfully",
            user,
        });
    } catch (error: any) {
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
        res.status(500).json({
            message: "Error logging in user",
            error: error.message,
        });
    }
});

router.post("/refresh", async (req: Request, res: Response) => {

  const {refreshToken} = req.body;
  if(!refreshToken) {
    return res.status(401).json({message: "Refresh token is required"});
  }
  jwt.verify(refreshToken, process.env.JWT_SECRET || '', (err: any, decoded: any) => {
    if(err) {
      return res.status(403).json({message: "Invalid refresh token"});
    }
    const accessToken = jwt.sign({id: decoded.id}, process.env.JWT_SECRET || '', {expiresIn: '15m'});
    res.status(200).json({accessToken});
  });
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

export default router;
