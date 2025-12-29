import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, getNotifications);
router.get('/unread-count', authenticate, getUnreadCount);
router.patch('/:id/read', authenticate, markAsRead);
router.patch('/read-all', authenticate, markAllAsRead);

export default router;

