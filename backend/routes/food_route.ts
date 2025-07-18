import express from 'express';
import { addUserFood, searchFoods } from '../controllers/food_controller';
import authenticateToken from '../middlewares/authenticateToken';
import upload from '../middlewares/uploadMiddleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route GET /food/search
 * @desc Search foods from both user_food and foods tables
 * @access Private
 * @query {
 *   query?: string - search term,
 *   limit?: number - max results (default: 20)
 * }
 */
router.get('/search', searchFoods);

/**
 * @route POST /food
 * @desc Add new user food
 * @access Private
 * @body multipart/form-data {
 *   name: string,
 *   calories: number,
 *   carbs: number,
 *   fat: number,
 *   protein: number,
 *   ingredient?: string,
 *   image?: File
 * }
 */
router.post('/', upload.single('image'), addUserFood);

export default router;
