import express from 'express';
import { getMealPlanWithDetails, getAllMealPlansWithDetails } from '../controllers/mealPlanDetailController';

const router = express.Router();

// GET /api/meal-plan-details/:planId - Fetch specific meal plan with details transformed to JSON
router.get('/meal-plan-details/:planId', getMealPlanWithDetails);

// GET /api/meal-plan-details - Fetch all meal plans with details transformed to JSON
router.get('/meal-plan-details', getAllMealPlansWithDetails);

export default router;
