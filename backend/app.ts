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
import dailyNutritionSummaryRoute from './routes/dailyNutritionSummary_routes';
import weeklyReportRoute from './routes/weeklyReport_routes';
import { verifyResetToken, resetPassword } from './controllers/forgotpassword';
import resetPasswordRoute from './routes/reset_password_route';
import nodemailer from 'nodemailer';
import mealTimeRoute from './routes/meal_time';
import { verifyEmailToken, sendWelcomeEmail } from './controllers/emailVerification';
import db from './db_config';
import { generateEmailVerificationSuccessPage, generateEmailVerificationErrorPage } from './utils/emailVerificationPages';

// Load environment variables
dotenv.config();

// Set timezone to Thailand
process.env.TZ = 'Asia/Bangkok';

const app = express();
app.use(express.json());

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

// Register daily nutrition summary route
app.use('/api/daily-summary', dailyNutritionSummaryRoute);

// Register weekly report route
app.use('/api/weekly-report', weeklyReportRoute);

app.use('/api/meal-time', mealTimeRoute);

// Mount reset-password router for clean code
app.use('/reset-password', resetPasswordRoute);

// Email verification endpoint
app.get('/verify-email', async (req: any, res: any) => {
  try {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      return res.status(400).send(generateEmailVerificationErrorPage('Token is required'));
    }
    
    const result = await verifyEmailToken(token);
    
    // Send welcome email after successful verification
    try {
      const user = await db('users').where({ id: result.userId }).first();
      if (user) {
        await sendWelcomeEmail(result.email, user.username);
        
        // Return beautiful success page instead of JSON
        res.send(generateEmailVerificationSuccessPage(user.username));
      } else {
        res.send(generateEmailVerificationSuccessPage('ผู้ใช้'));
      }
    } catch (emailError: any) {
      console.error('Welcome email sending failed:', emailError.message);
      // Still show success page even if welcome email fails
      const user = await db('users').where({ id: result.userId }).first();
      res.send(generateEmailVerificationSuccessPage(user?.username || 'ผู้ใช้'));
    }
    
  } catch (error: any) {
    console.error("Email verification error:", error);
    // Return beautiful error page instead of JSON
    res.status(400).send(generateEmailVerificationErrorPage(error.message));
  }
});

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the backend API!' });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});