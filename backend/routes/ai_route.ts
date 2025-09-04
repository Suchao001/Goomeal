import express from 'express';
const router = express.Router();
import { suggestFood,getFoodPlanSuggestions, getFoodPlanSuggestionsByPrompt } from '../controllers/ai_api_controller';
import authenticateToken from '../middlewares/authenticateToken';

router.use(authenticateToken);

router.post('/suggest-food', async (req, res) => {
  try {
    const payload = req.body || {};
    const userId = (req as any).user?.id;
    console.log('Request body keys:', Object.keys(req.body || {}));
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found'
      });
    }
    
    const answer = await suggestFood(userId, payload);
    console.log('AI response:', answer);
    res.json({
      success: true,
      answer,
      input: req.body || null
    });
  } catch (error) {
    console.error('Error in /suggest-food route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.post('/suggest-plan', async (req, res) => {
  try {
    const payload = req.body || {};
    const userId = (req as any).user?.id;
    const message = await getFoodPlanSuggestions(userId, payload);

    console.log('AI response:', JSON.stringify(message, null, 2));
    res.json({
      success: true,
      message,
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

router.post('/suggest-plan-prompt', async (req, res) => {
  try {
    const payload = req.body || {};
    const userId = (req as any).user?.id;
    
    console.log('📝 Prompt Form Data Received:');
    console.log('User ID:', userId);
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    const message = await getFoodPlanSuggestionsByPrompt(userId, payload);
    
    res.json({
      success: true,
      message,
      input: req.body || null
    });
  } catch (error) {
    console.error('Error in /suggest-plan-prompt route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;


