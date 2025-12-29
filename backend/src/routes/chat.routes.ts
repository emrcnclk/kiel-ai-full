import { Router } from 'express';
import { getConversations, getMessages, sendMessage, markAsRead } from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/conversations', authenticate, getConversations);
router.get('/messages/:partnerId', authenticate, getMessages);
router.post('/send', authenticate, sendMessage);
router.patch('/:messageId/read', authenticate, markAsRead);

export default router;

