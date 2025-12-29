import { Router } from 'express';
import { createOrUpdateSchedule, getSchedule, getAvailableSlots } from '../controllers/schedule.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User.model';

const router = Router();

router.post('/', authenticate, authorize(UserRole.EXPERT, UserRole.ADMIN), createOrUpdateSchedule);
router.get('/expert/:expertId', authenticate, getSchedule);
router.get('/my-schedule', authenticate, authorize(UserRole.EXPERT, UserRole.ADMIN), getSchedule);
router.get('/available-slots', authenticate, getAvailableSlots);

export default router;

