import { Router } from 'express';
import {
  createFeedback,
  getFeedbacks,
  getFeedbackById,
  updateFeedbackStatus,
  getFeedbackStats,
} from '../controllers/feedback.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, createFeedback);
router.get('/', authenticate, getFeedbacks);
router.get('/stats', authenticate, getFeedbackStats);
router.get('/:id', authenticate, getFeedbackById);
router.patch('/:id/status', authenticate, updateFeedbackStatus);

export default router;

