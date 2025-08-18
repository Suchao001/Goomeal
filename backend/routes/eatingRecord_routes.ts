import express from 'express';
import {
  createEatingRecord,
  getEatingRecordsByDate,
  getEatingRecordsByDateRange,
  updateEatingRecord,
  deleteEatingRecord,
  getEatingStats
} from '../controllers/eatingRecord_controller';
import authenticateToken from '../middlewares/authenticateToken';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/eating-records
 * @desc    Create new eating record
 * @access  Private
 * @body    { log_date, food_name, meal_type?, calories?, carbs?, fat?, protein?, meal_time?, image? }
 */
router.post('/', createEatingRecord);

/**
 * @route   GET /api/eating-records/date/:date
 * @desc    Get eating records by specific date
 * @access  Private
 * @params  date (YYYY-MM-DD format)
 */
router.get('/date/:date', getEatingRecordsByDate);

/**
 * @route   GET /api/eating-records/range
 * @desc    Get eating records by date range
 * @access  Private
 * @query   start_date, end_date (YYYY-MM-DD format)
 */
router.get('/range', getEatingRecordsByDateRange);

/**
 * @route   GET /api/eating-records/stats
 * @desc    Get eating statistics
 * @access  Private
 * @query   period (number of days, default: 7)
 */
router.get('/stats', getEatingStats);

/**
 * @route   PUT /api/eating-records/:id
 * @desc    Update eating record
 * @access  Private
 * @params  id (record ID)
 * @body    { log_date?, food_name?, meal_type?, calories?, carbs?, fat?, protein?, meal_time?, image? }
 */
router.put('/:id', updateEatingRecord);

/**
 * @route   DELETE /api/eating-records/:id
 * @desc    Delete eating record
 * @access  Private
 * @params  id (record ID)
 */
router.delete('/:id', deleteEatingRecord);

export default router;
