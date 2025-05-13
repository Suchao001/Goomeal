import express, {  Request, Response } from "express";
import {register} from "../controllers/user_controller";

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

export default router;