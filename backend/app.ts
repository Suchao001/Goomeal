import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import user from './routes/user_route';
import { verifyResetToken } from './controllers/forgotpassword';
import { generateResetPasswordForm, generateErrorPage } from './utils/htmlTemplates';

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
const port = 3000;

const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};

app.use(cors(corsOptions));
app.use('/user',user);

app.get('/reset-password', async (req, res) => {
    try {
        const { token } = req.query;
        
        if (!token || typeof token !== 'string') {
            return res.status(400).send(`
                <html>
                    <head>
                        <title>GoodMeal - Reset Password Error</title>
                        <meta charset="utf-8">
                        <style>
                            body { font-family: Arial, sans-serif; max-widmth: 600px; margin: 50px auto; padding: 20px; }
                            .error { color: #d32f2f; background: #ffebee; padding: 20px; border-radius: 8px; }
                        </style>
                    </head>
                    <body>
                        <h1>🍽️ GoodMeal</h1>
                        <div class="error">
                            <h2>ข้อผิดพลาด</h2>
                            <p>ไม่พบ token สำหรับรีเซ็ตรหัสผ่าน</p>
                        </div>
                    </body>
                </html>
            `);
        }        // Verify token
        try {
            await verifyResetToken(token);
            
            // Token is valid, show reset password form
            const resetFormHTML = generateResetPasswordForm(token);
            res.send(resetFormHTML);
            
        } catch (error: any) {
            // Token is invalid or expired
            const errorHTML = generateErrorPage(error.message);
            res.status(400).send(errorHTML);
        }
        
    } catch (error: any) {
        console.error("Reset password page error:", error);
        res.status(500).send(`
            <html>
                <head>
                    <title>GoodMeal - Server Error</title>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
                        .error { color: #d32f2f; background: #ffebee; padding: 20px; border-radius: 8px; }
                    </style>
                </head>
                <body>
                    <h1>🍽️ GoodMeal</h1>
                    <div class="error">
                        <h2>เกิดข้อผิดพลาดของเซิร์ฟเวอร์</h2>
                        <p>กรุณาลองใหม่อีกครั้งในภายหลัง</p>
                    </div>
                </body>
            </html>
        `);
    }
});

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the backend API!' });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


