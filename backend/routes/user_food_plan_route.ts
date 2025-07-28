import express from 'express';
import {
  createUserFoodPlan,
  getUserFoodPlans,
  getUserFoodPlanById,
  updateUserFoodPlan,
  deleteUserFoodPlan,
  setCurrentFoodPlan,
  getCurrentFoodPlan,
  knowCurrentFoodPlan,
  setPlanSettings,
  getPlanSettings
} from '../controllers/user_food_plan_controller';
import authenticateToken from '../middlewares/authenticateToken';
import { uploadUserFoodPlan } from '../middlewares/uploadMiddleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create a new user food plan
router.post('/', uploadUserFoodPlan.single('image'), createUserFoodPlan);

// Get all user food plans for the authenticated user
router.get('/', getUserFoodPlans);

// Set current food plan for user
router.post('/set-current', setCurrentFoodPlan);

// Get current food plan for user
router.get('/current', getCurrentFoodPlan);

// Get active current food plan ID only
router.get('/know-current', knowCurrentFoodPlan);

// ✅ [แก้ไข] ย้าย Route ที่เป็น Static ขึ้นมาไว้ก่อน Dynamic Route
// Set plan settings (start date and auto loop)
router.post('/set-plan-settings', setPlanSettings);

// ✅ [แก้ไข] Route ที่คุณต้องการให้ทำงาน
router.get('/plan-settings', (req, res) => {
  console.log('🎯 GET /plan-settings route handler called!');
  getPlanSettings(req, res);
});

// ✅ [แก้ไข] Route เก่าที่อาจจะไม่ได้ใช้แล้ว ก็ควรอยู่ก่อน dynamic route เช่นกัน
router.get('/get-plan-settings', (req, res) => {
  console.log('🎯 GET /get-plan-settings route handler called!');
  getPlanSettings(req, res);
});


// ⛔️ [แก้ไข] ย้าย Dynamic Route ลงไปไว้ด้านล่างสุดของกลุ่ม GET
// Get a specific user food plan by ID
router.get('/:id', getUserFoodPlanById);

// Update a user food plan
router.put('/:id', uploadUserFoodPlan.single('image'), updateUserFoodPlan);

// Delete a user food plan
router.delete('/:id', deleteUserFoodPlan);

export default router;