import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { getUserBadges, getBadgeStats, checkBadges } from '../controllers/badge.controller';
import { UserRole } from '../models/User.model';

const router = Router();

// Get user's badges
router.get('/', authenticate, authorize(UserRole.CLIENT), getUserBadges);

// Get badge statistics
router.get('/stats', authenticate, authorize(UserRole.CLIENT), getBadgeStats);

// Manually check for new badges
router.post('/check', authenticate, authorize(UserRole.CLIENT), checkBadges);

export default router;

