import express from 'express';
import { getWeeklyNutritionSummary, getWeeklyInsights } from '../controllers/weeklyReport_controller';
import authenticateToken from '../middlewares/authenticateToken';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route GET /api/weekly-report/summary
 * @desc Get weekly nutrition summary
 * @access Private
 * @param {number} weekOffset - Offset from current week (0 = current week, -1 = last week, 1 = next week)
 */
router.get('/summary', getWeeklyNutritionSummary);

/**
 * @route GET /api/weekly-report/insights  
 * @desc Get weekly insights and recommendations
 * @access Private
 * @param {number} weekOffset - Offset from current week (0 = current week, -1 = last week, 1 = next week)
 */
router.get('/insights', getWeeklyInsights);

export default router;
