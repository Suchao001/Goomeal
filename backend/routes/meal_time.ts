import express from 'express';
import authenticateToken from '../middlewares/authenticateToken';
import { getMealTime,setMealTime } from '../controllers/meal_time_controller';


const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  const userId = (req as any).user?.id;
  try {
    const mealTimes = await getMealTime(userId);
    res.json(mealTimes);
  } catch (error) {
    console.error('Error fetching meal times:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  const userId = (req as any).user?.id;
   if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { meals, notify_on_time } = req.body || {};
  try {
    await setMealTime(userId, { meals, notify_on_time });
    res.status(204).send();
  } catch (error) {
    console.error('Error setting meal times:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;