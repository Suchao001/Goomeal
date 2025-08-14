import express from 'express';
import {
  getChatSession,
  getChatMessages,
  sendMessage,
  clearChatHistory,
  checkAiHealth
} from '../controllers/goodChat_controller';
import authenticateToken from '../middlewares/authenticateToken';

const router = express.Router();

// Health check route (no auth required)
router.get('/health', checkAiHealth);

// Apply auth middleware to all other chat routes
router.use(authenticateToken);

// Get or create chat session
router.get('/session', getChatSession);

// Get chat messages history
router.get('/messages', getChatMessages);

// Send message to chat
router.post('/message', sendMessage);

// Clear chat history
router.delete('/history', clearChatHistory);

export default router;
