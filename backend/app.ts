import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import user from './routes/user_route';
import article from './routes/article_route';
import food from './routes/food_route';
import userFoodPlan from './routes/user_food_plan_route';
import globalFoodPlan from './routes/globalFoodPlan';
import mealPlanDetail from './routes/mealPlanDetail';
import aiRoute from './routes/ai_route';
import goodChatRoute from './routes/goodChat_routes';
import eatingRecordRoute from './routes/eatingRecord_routes';
import { verifyResetToken, resetPassword } from './controllers/forgotpassword';
import { generateResetPasswordForm, generateErrorPage } from './utils/htmlTemplates';

// Load environment variables
dotenv.config();

// Set timezone to Thailand
process.env.TZ = 'Asia/Bangkok';

const app = express();
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`📥 [${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📄 Request body keys:', Object.keys(req.body));
  }
  next();
});

const port = 3001;

const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};

app.use(cors(corsOptions));

// Serve static files for uploaded images
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/user',user);
app.use('/api', article);
app.use('/food', food);
app.use('/user-food-plans', userFoodPlan);
app.use('/api', globalFoodPlan);
app.use('/api', mealPlanDetail);

// Register AI mock route
app.use('/api/ai', aiRoute);

// Register goodChat route
app.use('/api/goodchat', goodChatRoute);

// Register eating record route
app.use('/api/eating-records', eatingRecordRoute);

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

app.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            const errorHTML = generateErrorPage('Token และรหัสผ่านใหม่จำเป็นต้องระบุ');
            return res.status(400).send(errorHTML);
        }

        if (newPassword.length < 6) {
            const errorHTML = generateErrorPage('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            return res.status(400).send(errorHTML);
        }

        try {
            const result = await resetPassword(token, newPassword);
            
            // Success page
            const successHTML = `
                <html>
                    <head>
                        <title>GoodMeal - รีเซ็ตรหัสผ่านสำเร็จ</title>
                        <meta charset="utf-8">
                        <style>
                            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
                            .success { color: #2e7d32; background: #e8f5e8; padding: 20px; border-radius: 8px; text-align: center; }
                            .button { background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px; }
                        </style>
                    </head>
                    <body>
                        <h1>🍽️ GoodMeal</h1>
                        <div class="success">
                            <h2>✅ รีเซ็ตรหัสผ่านสำเร็จ!</h2>
                            <p>รหัสผ่านของคุณได้รับการเปลี่ยนแปลงเรียบร้อยแล้ว</p>
                            <p>คุณสามารถใช้รหัสผ่านใหม่เพื่อเข้าสู่ระบบได้ทันที</p>
                            <a href="#" class="button" onclick="window.close()">ปิดหน้าต่าง</a>
                        </div>
                    </body>
                </html>
            `;
            res.send(successHTML);
            
        } catch (error: any) {
            const errorHTML = generateErrorPage(error.message);
            res.status(400).send(errorHTML);
        }
        
    } catch (error: any) {
        console.error("Reset password submission error:", error);
        const errorHTML = generateErrorPage('เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน');
        res.status(500).send(errorHTML);
    }
});

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the backend API!' });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


