import express from 'express';
import { addUserFood, searchFoods, getUserFoods, deleteUserFood, updateUserFood } from '../controllers/food_controller';
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
 * @route GET /food/user
 * @desc Get user's own foods only
 * @access Private
 * @query {
 *   query?: string - search term,
 *   limit?: number - max results (default: 50)
 * }
 */
router.get('/user', getUserFoods);

/**
 * @route DELETE /food/user/:id
 * @desc Delete user food by ID
 * @access Private
 */
router.delete('/user/:id', deleteUserFood);

/**
 * @route PUT /food/user/:id
 * @desc Update user food by ID
 * @access Private
 * @body multipart/form-data {
 *   name?: string,
 *   calories?: number,
 *   carbs?: number,
 *   fat?: number,
 *   protein?: number,
 *   ingredient?: string,
 *   img?: File
 * }
 */
router.put('/user/:id', upload.single('img'), updateUserFood);

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
