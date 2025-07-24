import express from 'express';
import { getGlobalFoodPlans } from '../controllers/globalFoodPlanController';

const router = express.Router();

// GET /api/global-food-plans - Fetch all global food plans
router.get('/global-food-plans', getGlobalFoodPlans);

export default router;
