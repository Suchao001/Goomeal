import express from 'express';
import {
  createUserFoodPlan,
  getUserFoodPlans,
  getUserFoodPlanById,
  updateUserFoodPlan,
  deleteUserFoodPlan,
  setCurrentFoodPlan,
  getCurrentFoodPlan,
  knowCurrentFoodPlan
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

// Get a specific user food plan by ID
router.get('/:id', getUserFoodPlanById);

// Update a user food plan
router.put('/:id', uploadUserFoodPlan.single('image'), updateUserFoodPlan);

// Delete a user food plan
router.delete('/:id', deleteUserFoodPlan);

export default router;
