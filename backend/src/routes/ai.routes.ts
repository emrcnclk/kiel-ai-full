import { Router } from 'express';
import { chat, getChatHistory, getChatById, summarize, getRecommendations } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/chat', authenticate, chat);
router.get('/chat/history', authenticate, getChatHistory);
router.get('/chat/:id', authenticate, getChatById);
router.post('/summarize', authenticate, summarize);
router.get('/recommendations', authenticate, getRecommendations);

export default router;

