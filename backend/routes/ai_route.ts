import express from 'express';
const router = express.Router();
import { suggestFood } from '../controllers/ai_api_controller';


router.post('/suggest-food', async (req, res) => {
  try {
    const payload = req.body || {};
    const answer = await suggestFood(payload);
    console.log('AI response:', answer);
    res.json({
      success: true,
      answer,
      input: req.body || null
    });
  } catch (error) {
    console.error('Error in /ask route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.post('/suggest-plan', async (req, res) => {
  try {
    const payload = req.body || {};
    const answer = await suggestFood(payload);
    console.log('AI response:', answer);
    res.json({
      success: true,
      answer,
      input: req.body || null
    });
  } catch (error) {
    console.error('Error in /suggest-plan route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;


