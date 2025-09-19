import express from 'express';
import { addUserFood, searchFoods, getUserFoods, deleteUserFood, updateUserFood } from '../controllers/food_controller';
import authenticateToken from '../middlewares/authenticateToken';
import upload from '../middlewares/uploadMiddleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/search', searchFoods);

router.get('/user', getUserFoods);

router.delete('/user/:id', deleteUserFood);

router.put('/user/:id', upload.single('img'), updateUserFood);

router.post('/', upload.single('image'), addUserFood);

export default router;
