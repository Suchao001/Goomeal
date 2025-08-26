import express from 'express';
import {
  getDailyNutritionSummary,
  getDailyNutritionSummariesByRange,
  updateDailyRecommendation
} from '../controllers/dailyNutritionSummary_controller';
import authenticateToken from '../middlewares/authenticateToken';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/daily-summary/range
 * @desc    Get daily nutrition summaries by date range
 * @access  Private
 * @query   start_date, end_date (YYYY-MM-DD format)
 */
router.get('/range', getDailyNutritionSummariesByRange);

/**
 * @route   GET /api/daily-summary/:date
 * @desc    Get daily nutrition summary for specific date
 * @access  Private
 * @params  date (YYYY-MM-DD format)
 */
router.get('/:date', getDailyNutritionSummary);

/**
 * @route   PUT /api/daily-summary/:date/weight
 * @desc    Update weight for specific date
 * @access  Private
 * @params  date (YYYY-MM-DD format)
 * @body    { weight: number }
 */

/**
 * @route   PUT /api/daily-summary/:date/recommendation
 * @desc    Update recommendation for specific date
 * @access  Private
 * @params  date (YYYY-MM-DD format)
 * @body    { recommendation: string }
 */
router.put('/:date/recommendation', updateDailyRecommendation);

export default router;
