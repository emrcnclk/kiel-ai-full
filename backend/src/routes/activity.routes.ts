import { Router } from 'express';
import {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
  completeActivity,
  getCompletedActivities,
} from '../controllers/activity.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User.model';

const router = Router();

router.post('/', authenticate, authorize(UserRole.EXPERT, UserRole.ADMIN), createActivity);
router.get('/', authenticate, getActivities);
router.get('/completed', authenticate, getCompletedActivities);
router.get('/:id', authenticate, getActivityById);
router.put('/:id', authenticate, authorize(UserRole.EXPERT, UserRole.ADMIN), updateActivity);
router.delete('/:id', authenticate, authorize(UserRole.EXPERT, UserRole.ADMIN), deleteActivity);
router.post('/:id/complete', authenticate, authorize(UserRole.CLIENT), completeActivity);

export default router;

