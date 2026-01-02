import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { getClientStats, getExpertStats, getAdminStats } from '../controllers/stats.controller';
import { UserRole } from '../models/User.model';

const router = Router();

// Client statistics
router.get('/client', authenticate, authorize(UserRole.CLIENT), getClientStats);

// Expert statistics
router.get('/expert', authenticate, authorize(UserRole.EXPERT, UserRole.ADMIN), getExpertStats);

// Admin statistics
router.get('/admin', authenticate, authorize(UserRole.ADMIN), getAdminStats);

export default router;

