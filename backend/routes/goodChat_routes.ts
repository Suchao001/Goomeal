import express from 'express';
import {
  getChatSession,
  getChatMessages,
  sendMessage,
  clearChatHistory
} from '../controllers/goodChat_controller';
import authenticateToken from '../middlewares/authenticateToken';

const router = express.Router();

// Apply auth middleware to all chat routes
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
